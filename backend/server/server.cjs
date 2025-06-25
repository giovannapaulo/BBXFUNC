const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const session = require('express-session');


const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));

app.use(session({
  secret: 'ilovelanadelrey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, 
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bookbox'
});


app.get('/api/usuario/logado', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Você precisa estar logado para acessar o perfil.' });
  }

  const sql = `
  SELECT idUsuario, nomeUsuario, email, bio, 
         avatar, header, 
         background,
         ImgUm, ImgDois, ImgTres, ImgQuatro,
         ImgCinco, ImgSeis, ImgSete, ImgOito
  FROM usuario
  WHERE idUsuario = ?
`;
  db.query(sql, [req.session.userId], (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário logado:', err);
      return res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json(result[0]);
  });
}); 

app.get('/check-auth', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, userId: req.session.userId });
  } else {
    res.status(401).json({ loggedIn: false });
  }
});

app.post('/usuario', (req, res) => {
  if (req.body.nomeUsuario) {
    const { email, senha, nomeUsuario } = req.body;

    const sqlCheckEmail = 'SELECT COUNT(*) AS count FROM usuario WHERE email = ?';
    db.query(sqlCheckEmail, [email], (err, result) => {
      if (err) {
        console.error('Erro ao verificar o email:', err);
        return res.status(500).json('Falha ao criar conta. Tente novamente.');
      }

      if (result[0].count > 0) {
        return res.status(409).json('Este email já está cadastrado.');
      } else {
        const sqlInsert = 'INSERT INTO usuario (email, senha, nomeUsuario) VALUES (?, ?, ?)';
        db.query(sqlInsert, [email, senha, nomeUsuario], (err, result) => {
          if (err) {
            console.error('Erro ao cadastrar usuário:', err);
            return res.status(500).json('Falha ao criar conta. Tente novamente.');
          }
          return res.status(201).json('Conta criada com sucesso!');
        });
      }
    });
  } else if (req.body.email && req.body.senha) {
    const sqlSelect = 'SELECT * FROM usuario WHERE email = ? AND senha = ?';
    db.query(sqlSelect, [req.body.email, req.body.senha], (err, data) => {
      if (err) {
        console.error('Erro ao realizar login:', err);
        return res.status(500).json('Falha na realização do Login. Tente Novamente.');
      }

      if (data.length > 0) {
        req.session.userId = data[0].idUsuario;

        return res.status(200).json({
          message: 'Login Realizado com Sucesso!',
          user: {
            idUsuario: data[0].idUsuario,
            nomeUsuario: data[0].nomeUsuario,
            email: data[0].email,
            avatar: data[0].avatar,
            header: data[0].header
          }
        });
      } else {
        return res.status(401).json('Credenciais inválidas. Tente novamente.');
      }
    });
  } else {
    return res.status(400).json('Requisição inválida.');
  }
});


app.post('/comentario', (req, res) => {
  const {
    texto, imgBin, extensao, tamanho,
    idUsuario, idLivro, nota, id_Comentario_Pai
  } = req.body;

  const sql = `
    INSERT INTO comentario
    (Texto, ImgBin, Extensao, Tamanho, IdUsuario, IdLivro, Nota, Id_Comentario_Pai, Data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(sql, [
    texto, imgBin, extensao, tamanho,
    idUsuario, idLivro, nota, id_Comentario_Pai
  ], (err, result) => {
    if (err) {
      console.error('Erro ao inserir comentário:', err);
      return res.status(500).json('Erro ao comentar.');
    }
    res.status(201).json('Comentário salvo!');
  });
});

app.post('/curtida', (req, res) => {
  const { idUsuario, idLista, dataCurtida } = req.body;

  const sql = `
    INSERT INTO curtida (IdUsuario, IdLista, DataCurtida)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [idUsuario, idLista, dataCurtida], (err, result) => {
    if (err) {
      console.error('Erro ao curtir:', err);
      return res.status(500).json('Erro ao curtir.');
    }
    res.status(201).json('Curtida registrada!');
  });
});

app.get('/comentario/:idLivro', (req, res) => {
  const sql = `
    SELECT c.IdComentario, c.Texto, c.Data, c.Id_Comentario_Pai,
       u.nomeUsuario, u.avatar, c.IdLivro, c.IdUsuario
       FROM comentario c
       INNER JOIN usuario u ON u.idUsuario = c.IdUsuario
       ORDER BY c.Data ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar comentários:', err);
      return res.status(500).json('Erro ao buscar comentários.');
    }
    res.json(result);
  });
});


app.get('/curtida/:idComentario', (req, res) => {
  const id = req.params.idComentario;
  db.query(
    'SELECT COUNT(*) AS total FROM curtida WHERE IdLista = ?',
    [id],
    (err, result) => {
      if (err) return res.status(500).json('Erro.');
      res.json(result[0]);
    }
  );
});

app.delete('/comentario/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM comentario WHERE IdComentario = ?', [id], (err) => {
    if (err) return res.status(500).json('Erro ao deletar.');
    res.status(200).json('Deletado com sucesso!');
  });
});

app.get('/livro', (req, res) => {
  const sql = `
    SELECT IdLivro, Titulo, Autor, Descricao, NotaMedia, 
           CapaImg, Extensao, Tamanho, AnoPublicacao, 
           IdSubgenero, Sinopse, ImgUrl 
    FROM livro
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar livros:', err);
      return res.status(500).json('Erro ao buscar livros.');
    }
    res.json(result);
  });
});

app.get('/genero-com-subgenero', (req, res) => {
  const sql = `
    SELECT g.IdGenero, g.NomeGenero, s.IdSubgenero, s.NomeSubgenero
    FROM genero g
    INNER JOIN subgenero s ON g.IdGenero = s.IdGenero
    ORDER BY g.NomeGenero, s.NomeSubgenero
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar gêneros e subgêneros:', err);
      return res.status(500).json('Erro ao buscar gêneros e subgêneros.');
    }
    res.json(result);
  });
});

app.get('/livro/subgenero/:idSubgenero', (req, res) => {
  const idSubgenero = req.params.idSubgenero;

  const sql = `
    SELECT 
        l.IdLivro, l.Titulo, l.Autor, l.Sinopse, l.NotaMedia, l.AnoPublicacao,
        l.ImgUrl, s.NomeSubgenero
    FROM livro l
    INNER JOIN subgenero s ON l.IdSubgenero = s.IdSubgenero
    WHERE l.IdSubgenero = ?
  `;

  db.query(sql, [idSubgenero], (err, result) => {
    if (err) {
      console.error('Erro ao buscar livros do subgênero:', err);
      return res.status(500).json('Erro ao buscar livros do subgênero.');
    }
    res.json(result);
  });
});

app.get('/livro/IdSubgenero/:id', (req, res) => {
  const idSubgenero = req.params.id;
  const sql = `
    SELECT * FROM livro
    WHERE IdSubgenero = ?
  `;

  db.query(sql, [idSubgenero], (err, result) => {
    if (err) {
      console.error('Erro ao buscar livros:', err);
      return res.status(500).json('Erro ao buscar livros.');
    }
    res.json(result);
  });
});

app.get('/evento', (req, res) => {
  const sql = `
    SELECT IdEvento AS idEvento,
           NomeEve AS nomeEvento,
           DescricaoEve AS descricao,
           Rua, Numero, Cidade, EstadoSigla AS regiao,
           Data, Hora, 
           Imagem
    FROM evento
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao buscar eventos:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    res.json(results);
  });
});

app.get('/api/usuarios/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM usuario WHERE idUsuario = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Erro ao buscar usuário:', err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result[0]);
  });
});

app.put('/usuario/:id', (req, res) => {
  const id = req.params.id;
  const { bio, nome, avatar, header, background } = req.body;
  const campos = [];
  const valores = [];

  if (bio !== undefined) {
    campos.push('Bio = ?');
    valores.push(bio);
  }
  if (nome !== undefined) {
    campos.push('NomeUsuario = ?');
    valores.push(nome);
  }
  if (avatar !== undefined) {
    campos.push('avatar = ?');
    valores.push(avatar);
  }
  if (header !== undefined) {
    campos.push('header = ?');
    valores.push(header);
  }
  if (background !== undefined) {
    campos.push('background = ?');   
    valores.push(background);
  }
  if (campos.length === 0) {
    return res.status(400).json('Nenhum campo para atualizar.');
  }

  valores.push(id);
  const sql = `UPDATE usuario SET ${campos.join(', ')} WHERE idUsuario = ?`;
  db.query(sql, valores, (err, result) => {
    if (err) {
      console.error('Erro no UPDATE:', err);
      return res.status(500).json('Erro ao atualizar.');
    }
    res.json('Atualização realizada.');
  });
});

app.get('/listas/usuario/:idUsuario', (req, res) => {
  const idUsuario = req.params.idUsuario;
  const sql = `
      SELECT l.IdLista, l.NomeLista, u.NomeUsuario, u.Avatar,
      GROUP_CONCAT(CONCAT(li.IdLivro, '|', IFNULL(liv.ImgUrl, ''))) AS fotos,
      GROUP_CONCAT(li.IdLivro) AS livrosIds
    FROM lista l
    LEFT JOIN usuario u ON l.IdUsuario = u.IdUsuario
    LEFT JOIN itenslista li ON l.IdLista = li.IdLista
    LEFT JOIN livro liv ON li.IdLivro = liv.IdLivro
    WHERE l.IdUsuario = ?
    GROUP BY l.IdLista
  `;


  db.query(sql, [idUsuario], (err, result) => {
    if (err) {
      console.error('Erro ao buscar listas do usuário:', err);
      return res.status(500).json('Erro ao buscar listas.');
    }

    const listas = result.map((lista) => {
  let fotos = [];
  if (lista.fotos) {
    fotos = lista.fotos.split(',').map((f) => {
      const [idLivro, url] = f.split('|');
      return url ? url : null;
    }).filter(Boolean);
  }

  let livrosIds = [];
  if (lista.livrosIds) {
    livrosIds = lista.livrosIds.split(',').map(id => Number(id));
  }

  return {
    idLista: lista.IdLista,
    nomeLista: lista.NomeLista,
    avatar: lista.Avatar,
    fotos,
    livrosIds
  };
});

    res.json(listas);
  });
});

app.get('/listas/curtidas/:idUsuario', (req, res) => {
  const idUsuario = req.params.idUsuario;
  const sql = `
    SELECT l.IdLista, l.NomeLista, c.IdCurtida,
    u.Avatar, u.NomeUsuario,
    GROUP_CONCAT(CONCAT(li.IdLivro, '|', IFNULL(liv.ImgUrl, '')) SEPARATOR ',') AS fotos
  FROM curtida c
  INNER JOIN lista l ON c.IdLista = l.IdLista
  INNER JOIN usuario u ON l.IdUsuario = u.IdUsuario
  LEFT JOIN itenslista li ON l.IdLista = li.IdLista
  LEFT JOIN livro liv ON li.IdLivro = liv.IdLivro
  WHERE c.IdUsuario = ?
  GROUP BY l.IdLista, c.IdCurtida, u.Avatar, u.NomeUsuario
`;

  db.query(sql, [idUsuario], (err, result) => {
    if (err) {
      console.error('Erro ao buscar listas curtidas:', err);
      return res.status(500).json('Erro ao buscar listas curtidas.');
    }

    const listas = result.map((lista) => {
      let fotos = [];
      if (lista.fotos) {
        fotos = lista.fotos.split(',').map((f) => {
          const [idLivro, url] = f.split('|');
          return url ? url : null;
        }).filter(Boolean);
      }
      return {
        idLista: lista.IdLista,
        nomeLista: lista.NomeLista,
        idCurtida: lista.IdCurtida,
        avatar: lista.Avatar,
        fotos
      };
    });

    res.json(listas);
  });
});

app.put('/listas/:idLista', (req, res) => {
  const idLista = req.params.idLista;
  const { nomeLista, idUsuario, livrosParaAdicionar = [], livrosParaRemover = [] } = req.body;

  if (!nomeLista || !idUsuario) {
    return res.status(400).json('nomeLista e idUsuario são obrigatórios.');
  }
  if (!Array.isArray(livrosParaAdicionar) || !Array.isArray(livrosParaRemover)) {
    return res.status(400).json('livrosParaAdicionar e livrosParaRemover devem ser arrays.');
  }

  const sqlCheck = 'SELECT IdUsuario FROM lista WHERE IdLista = ?';
  db.query(sqlCheck, [idLista], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json('Erro no servidor.');
    }
    if (result.length === 0) return res.status(404).json('Lista não encontrada.');
    if (result[0].IdUsuario != idUsuario) return res.status(403).json('Não autorizado.');

    const sqlUpdateNome = 'UPDATE lista SET NomeLista = ? WHERE IdLista = ?';
    db.query(sqlUpdateNome, [nomeLista, idLista], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json('Erro ao atualizar lista.');
      }

      if (livrosParaRemover.length > 0) {
        const sqlRemoverLivros = 'DELETE FROM itenslista WHERE IdLista = ? AND IdLivro IN (?)';
        db.query(sqlRemoverLivros, [idLista, livrosParaRemover], (err3) => {
          if (err3) {
            console.error(err3);
            return res.status(500).json('Erro ao remover livros da lista.');
          }
          adicionarLivros();
        });
      } else {
        adicionarLivros();
      }

      function adicionarLivros() {
        if (livrosParaAdicionar.length > 0) {
          const livrosValues = livrosParaAdicionar.map(idLivro => [idLista, idLivro]);
          const sqlAddLivros = 'INSERT IGNORE INTO itenslista (IdLista, IdLivro) VALUES ?';
          db.query(sqlAddLivros, [livrosValues], (err4) => {
            if (err4) {
              console.error(err4);
              return res.status(500).json('Erro ao adicionar livros na lista.');
            }
            return res.json('Lista atualizada com sucesso!');
          });
        } else {
          return res.json('Lista atualizada com sucesso!');
        }
      }
    });
  });
});

app.delete('/listas/:idLista', (req, res) => {
  const idLista = req.params.idLista;
  const { idUsuario } = req.body;

  const sqlCheck = 'SELECT IdUsuario FROM lista WHERE IdLista = ?';
  db.query(sqlCheck, [idLista], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json('Erro no servidor.');
    }
    if (result.length === 0) return res.status(404).json('Lista não encontrada.');
    if (result[0].IdUsuario != idUsuario) return res.status(403).json('Não autorizado.');

    const sqlDelete = 'DELETE FROM lista WHERE IdLista = ?';
    db.query(sqlDelete, [idLista], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json('Erro ao excluir lista.');
      }
      res.json('Lista excluída com sucesso!');
    });
  });
});


app.delete('/curtidas/:idCurtida', (req, res) => {
  const idCurtida = req.params.idCurtida;
  db.query('DELETE FROM curtida WHERE IdCurtida = ?', [idCurtida], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json('Erro ao remover curtida.');
    }
    res.json('Curtida removida com sucesso!');
  });
});

app.get("/respostas/:idPai", (req, res) => {
  const idPai = req.params.idPai;
  const sql = `
    SELECT c.*, u.nomeUsuario 
    FROM Comentario c 
    JOIN Usuario u ON u.IdUsuario = c.IdUsuario 
    WHERE c.Id_Comentario_Pai = ?
    ORDER BY c.Data
  `;

  db.query(sql, [idPai], (err, result) => {
    if (err) {
      console.error("Erro ao buscar respostas:", err);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
    res.json(result);
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir sessão:', err);
      return res.status(500).json({ message: 'Erro ao fazer logout' });
    }
    res.clearCookie('connect.sid'); 
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  });
});

app.get('/listas/comunidade', (req, res) => {
  const sql = `
     SELECT l.IdLista, l.NomeLista, u.nomeUsuario, u.avatar,
      GROUP_CONCAT(CONCAT(li.IdLivro, '|', IFNULL(liv.ImgUrl, ''))) AS fotos
    FROM lista l
    INNER JOIN usuario u ON l.IdUsuario = u.idUsuario
    LEFT JOIN itenslista li ON l.IdLista = li.IdLista
    LEFT JOIN livro liv ON li.IdLivro = liv.IdLivro
    GROUP BY l.IdLista, u.nomeUsuario, u.avatar
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erro ao buscar listas da comunidade:', err);
      return res.status(500).json('Erro ao buscar listas da comunidade.');
    }

    const listas = result.map(lista => {
      let fotos = [];
      if (lista.fotos) {
        fotos = lista.fotos.split(',').map(f => {
          const [idLivro, url] = f.split('|');
          return url ? url : null;
        }).filter(Boolean);
      }
      return {
        idLista: lista.IdLista,
        nomeLista: lista.NomeLista,
        nomeUsuario: lista.nomeUsuario,
        avatar: lista.avatar,
        fotos
      };
    });

    res.json(listas);
  });
});

app.post('/listas', (req, res) => {
  const { nomeLista, idUsuario, livros } = req.body;

  if (!nomeLista || !idUsuario || !Array.isArray(livros) || livros.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos para criar lista.' });
  }

  const sqlInsertLista = 'INSERT INTO lista (NomeLista, IdUsuario) VALUES (?, ?)';
  db.query(sqlInsertLista, [nomeLista, idUsuario], (err, result) => {
    if (err) {
      console.error('Erro ao inserir lista:', err);
      return res.status(500).json({ error: 'Erro ao criar lista.' });
    }

    const idLista = result.insertId;

    const livrosValues = livros.map(idLivro => [idLista, idLivro]);
    const sqlInsertItens = 'INSERT INTO itenslista (IdLista, IdLivro) VALUES ?';
    db.query(sqlInsertItens, [livrosValues], (err2) => {
      if (err2) {
        console.error('Erro ao inserir itens da lista:', err2);
        return res.status(500).json({ error: 'Erro ao adicionar livros na lista.' });
      }

      res.status(201).json({ message: 'Lista criada com sucesso!' });
    });
  });
});

app.post("/curtidacomentario", (req, res) => {
  const { idUsuario, idComentario } = req.body;

  if (!idUsuario || !idComentario) {
    return res.status(400).json({ erro: "Campos obrigatórios ausentes." });
  }

  const dataCurtida = new Date().toISOString().slice(0, 19).replace("T", " ");

  const sql = `
    INSERT INTO CurtidaComentario (IdUsuario, IdComentario, DataCurtidaComentario)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [idUsuario, idComentario, dataCurtida], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ erro: "Usuário já curtiu esse comentário." });
      }
      console.error("Erro ao registrar curtida:", err);
      return res.status(500).json({ erro: "Erro ao registrar curtida." });
    }

    res.status(201).json({ mensagem: "Curtida registrada com sucesso!" });
  });
});

app.get('/autores/subgenero/:id', (req, res) => {
  const id = req.params.id;
  const sql = `
    SELECT DISTINCT Autor 
    FROM livro 
    WHERE IdSubgenero = ? AND Autor IS NOT NULL AND Autor <> ''
    ORDER BY Autor
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Erro ao buscar autores:", err);
      return res.status(500).json("Erro ao buscar autores.");
    }
    res.json(result.map(row => row.Autor));
  });
});

app.get('/usuario/:idUsuario/comentarios/count', (req, res) => {
  const idUsuario = req.params.idUsuario;
  const sql = `SELECT COUNT(*) AS count FROM comentario WHERE IdUsuario = ?`;

  db.query(sql, [idUsuario], (err, result) => {
    if (err) {
      console.error('Erro ao contar comentários:', err);
      return res.status(500).json({ error: 'Erro ao contar comentários.' });
    }
    res.json({ count: result[0].count });
  });
});



app.get('/usuario/:idUsuario/curtidas/count', (req, res) => {
  const idUsuario = req.params.idUsuario;
  const sql = `SELECT COUNT(*) AS count FROM curtida WHERE IdUsuario = ?`;
  
  db.query(sql, [idUsuario], (err, result) => {
    if (err) {
      console.error('Erro ao contar curtidas:', err);
      return res.status(500).json({ error: 'Erro ao contar curtidas.' });
    }
    res.json({ count: result[0].count });
  });
});

app.post('/listas/:idLista/adicionarLivro', (req, res) => {
  const idLista = req.params.idLista;
  const { idLivro } = req.body;
  const idUsuario = req.session.userId;

  if (!idUsuario) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  if (!idLivro) {
    return res.status(400).json({ error: 'idLivro é obrigatório' });
  }

  const sqlCheck = 'SELECT IdUsuario FROM lista WHERE IdLista = ?';
  db.query(sqlCheck, [idLista], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erro no servidor' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Lista não encontrada' });
    }
    if (result[0].IdUsuario !== idUsuario) {
      return res.status(403).json({ error: 'Não autorizado a modificar essa lista' });
    }

    const sqlInsert = 'INSERT IGNORE INTO itenslista (IdLista, IdLivro) VALUES (?, ?)';
    db.query(sqlInsert, [idLista, idLivro], (err2) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: 'Erro ao adicionar livro na lista' });
      }
      return res.status(200).json({ message: 'Livro adicionado com sucesso' });
    });
  });
});

app.post('/api/livros', (req, res) => {
  const { titulo, autor, descricao, nota, ano, capaUrl, idSubgenero, sinopse } = req.body;

  if (!titulo || !autor || !descricao || !nota || !ano || !capaUrl) {
    return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
  }

  const sql = `
    INSERT INTO livro (Titulo, Autor, Descricao, NotaMedia, AnoPublicacao, IdSubgenero, Sinopse, ImgUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [titulo, autor, descricao, nota, ano, idSubgenero || null, sinopse || '', capaUrl], (err, result) => {
    if (err) {
      console.error('Erro ao adicionar livro:', err);
      return res.status(500).json({ error: 'Erro ao adicionar livro.' });
    }

    res.status(201).json({
      idLivro: result.insertId,
      titulo,
      capaUrl,
      message: 'Livro adicionado à nossa comunidade com sucesso!'
    });
  });
});



app.listen(8081, () => {
  console.log('Listening...');
});
