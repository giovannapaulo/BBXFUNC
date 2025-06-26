import React, { useEffect, useState } from 'react';
import './usuario.css';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [bio, setBio] = useState('');
  const [name, setName] = useState('');
  const [headerUrl, setHeaderUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [listasUsuario, setListasUsuario] = useState([]);
  const [listasCurtidas, setListasCurtidas] = useState([]);
  const [popupAberto, setPopupAberto] = useState(false);
  const [listaEditando, setListaEditando] = useState(null);
  const [form, setForm] = useState({ nomeLista: '', fotos: '' });
  const [escolhaImagemCampo, setEscolhaImagemCampo] = useState(null);
  const [numComentarios, setNumComentarios] = useState(0);
  const [numCurtidas, setNumCurtidas] = useState(0);

  const [popupLivroAberto, setPopupLivroAberto] = useState(false);
  const [formLivro, setFormLivro] = useState({
    titulo: '',
    autor: '',
    descricao: '',
    nota: '',
    ano: '',
    capaUrl: '',
    idSubgenero: '',
    sinopse: '',
  });
  const [livroAdicionado, setLivroAdicionado] = useState(null);
  const [erroLivro, setErroLivro] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/usuario/logado', { withCredentials: true })
      .then(res => {
        const data = res.data;
        setUser(data);
        setBio(data.bio ?? '');
        setName(data.nomeUsuario ?? '');
        setHeaderUrl(data.header || '');
        setAvatarUrl(data.avatar || '');

        return Promise.all([
          api.get(`/listas/usuario/${data.idUsuario}`),
          api.get(`/listas/curtidas/${data.idUsuario}`),
        ]).then(([listasRes, curtidasRes]) => {
          setListasUsuario(listasRes.data);
          setListasCurtidas(curtidasRes.data);
        });
      })
      .catch(err => {
        console.error(err);
        alert('Você precisa estar logado para acessar o perfil.');
        navigate('/login');
      });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      setUser(prevUser => ({ ...prevUser, bio, nomeUsuario: name, header: headerUrl, avatar: avatarUrl }));
    }
  }, [headerUrl, avatarUrl, name, bio]);

  useEffect(() => {
    if (!user) return;
    const id = user.idUsuario;

    api.get(`/usuario/${id}/comentarios/count`, { withCredentials: true })
      .then(res => {
        setNumComentarios(res.data.count ?? 0);
      })
      .catch(err => {
        console.warn('Erro ao buscar contagem de comentários:', err);
        setNumComentarios(0);
      });

    api.get(`/usuario/${id}/curtidas/count`, { withCredentials: true })
      .then(curtidasRes => {
        const curtidasComentarios = curtidasRes.data.count ?? 0;
        const curtidasListasCount = listasCurtidas.length ?? 0;
        setNumCurtidas(curtidasComentarios);
      })
      .catch(err => {
        console.warn('Erro ao buscar contagem de curtidas:', err);
        setNumCurtidas(listasCurtidas.length ?? 0);
      });
  }, [user, listasCurtidas]);

  const salvarImagemEscolhida = (campo, url) => {
    if (!user) return;
    api.put(`/usuario/${user.idUsuario}`, { [campo]: url })
      .then(() => {
        if (campo === 'avatar') setAvatarUrl(url);
        if (campo === 'header') setHeaderUrl(url);
        setPopupAberto(false);
        setEscolhaImagemCampo(null);
      })
      .catch(err => console.error(`Erro ao salvar ${campo}:`, err));
  };

  const abrirPopupEscolhaImagem = (campo) => {
    setEscolhaImagemCampo(campo);
    setPopupAberto(true);
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/logout', {}, { withCredentials: true });
      localStorage.removeItem('user_session');
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao sair da conta');
    }
  };

  const salvarBio = () => {
    if (!user) return;
    api.put(`/usuario/${user.idUsuario}`, { bio })
      .then(() => {
        setEditingBio(false);
        setUser(prev => ({ ...prev, bio }));
      })
      .catch(err => console.error('Erro ao salvar bio:', err));
  };

  const salvarNome = () => {
    if (!user) return;
    api.put(`/usuario/${user.idUsuario}`, { nome: name })
      .then(() => {
        setEditingName(false);
        setUser(prev => ({ ...prev, nomeUsuario: name }));
      })
      .catch(err => console.error('Erro ao salvar nome:', err));
  };

  const abrirPopup = (lista) => {
    setListaEditando(lista);
    setForm({ nomeLista: lista.nomeLista, fotos: lista.fotos.join('\n') });
    setPopupAberto(true);
  };

  const fecharPopup = () => {
    setPopupAberto(false);
    setListaEditando(null);
    setEscolhaImagemCampo(null);
  };

  const salvarEdicao = () => {
    if (!user || !listaEditando) return;
    api.put(`/listas/${listaEditando.idLista}`, {
      nomeLista: form.nomeLista,
      idUsuario: user.idUsuario,
    })
      .then(() => {
        setListasUsuario((prev) =>
          prev.map((l) =>
            l.idLista === listaEditando.idLista
              ? { ...l, nomeLista: form.nomeLista, fotos: form.fotos.split('\n').map(f => f.trim()) }
              : l
          )
        );
        fecharPopup();
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao salvar lista');
      });
  };

  const excluirLista = (idLista) => {
    if (!user) return;
    if (!window.confirm('Deseja realmente excluir esta lista?')) return;
    api.delete(`/listas/${idLista}`, {
      data: { idUsuario: user.idUsuario }
    })
      .then(() => {
        setListasUsuario((prev) => prev.filter(l => l.idLista !== idLista));
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao excluir lista');
      });
  };

  const removerCurtida = (idCurtida) => {
    if (!window.confirm('Deseja remover a curtida desta lista?')) return;
    api.delete(`/curtidas/${idCurtida}`)
      .then(() => {
        setListasCurtidas((prev) => prev.filter(l => l.idCurtida !== idCurtida));
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao remover curtida');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const imagensUsuario = user
    ? ['ImgUm', 'ImgDois', 'ImgTres', 'ImgQuatro', 'ImgCinco', 'ImgSeis', 'ImgSete', 'ImgOito']
        .map(key => user[key])
        .filter(Boolean)
    : [];

  const abrirPopupLivro = () => {
    setFormLivro({
      titulo: '',
      autor: '',
      descricao: '',
      nota: '',
      ano: '',
      capaUrl: '',
      idSubgenero: '',
      sinopse: '',
    });
    setLivroAdicionado(null);
    setErroLivro('');
    setPopupLivroAberto(true);
  };

  const fecharPopupLivro = () => {
    setPopupLivroAberto(false);
    setLivroAdicionado(null);
    setErroLivro('');
  };

  const handleChangeLivro = (e) => {
    const { name, value } = e.target;
    setFormLivro(prev => ({ ...prev, [name]: value }));
  };

  const enviarLivro = async () => {
    setErroLivro('');
    const { titulo, autor, descricao, nota, ano, capaUrl } = formLivro;

    if (!titulo || !autor || !descricao || !nota || !ano || !capaUrl) {
      setErroLivro('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const res = await api.post('/api/livros', {
        titulo,
        autor,
        descricao,
        nota: parseFloat(nota),
        ano: parseInt(ano, 10),
        capaUrl,
        idSubgenero: formLivro.idSubgenero || null,
        sinopse: formLivro.sinopse || '',
      });
      setLivroAdicionado(res.data);
    } catch (err) {
      console.error('Erro ao adicionar livro:', err);
      setErroLivro('Erro ao adicionar livro. Tente novamente.');
    }
  };

  if (!user) return <p>Carregando usuário...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        {headerUrl ? (
          <img
            src={headerUrl}
            alt="Header"
            className="header-img"
            style={{ cursor: 'pointer' }}
            onClick={() => abrirPopupEscolhaImagem('header')}
            title="Clique para escolher imagem do Header"
          />
        ) : (
          <div
            className="header-placeholder"
            style={{ cursor: 'pointer' }}
            onClick={() => abrirPopupEscolhaImagem('header')}
            title="Clique para escolher imagem do Header"
          >
            Sem imagem de header
          </div>
        )}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="profile-avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => abrirPopupEscolhaImagem('avatar')}
            title="Clique para escolher imagem do Avatar"
          />
        ) : (
          <div
            className="avatar-placeholder"
            style={{ cursor: 'pointer' }}
            onClick={() => abrirPopupEscolhaImagem('avatar')}
            title="Clique para escolher imagem do Avatar"
          >
            Sem avatar
          </div>
        )}
      </div>

      <div className="profile-card">
        {editingName ? (
          <>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="name-edit"
            />
            <button className="btn-save" onClick={salvarNome}>
              Salvar
            </button>
            <button className="btn-cancel" onClick={() => setEditingName(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <h2 className="username-title">
            {name}
            <i
              className="fa-solid fa-pen bio-edit-icon"
              title="Editar nome"
              onClick={() => setEditingName(true)}
              style={{ marginLeft: '10px', cursor: 'pointer' }}
            />
          </h2>
        )}
        <p>{user?.email}</p>
        {editingBio ? (
          <>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="bio-edit"
            />
            <button className="btn-save" onClick={salvarBio}>
              Salvar
            </button>
            <button className="btn-cancel" onClick={() => setEditingBio(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <div className="bio">
            <span>{bio || 'Sem bio no momento.'}</span>
            <i
              className="fa-solid fa-pen bio-edit-icon"
              title="Editar bio"
              onClick={() => setEditingBio(true)}
              style={{ marginLeft: '10px', cursor: 'pointer' }}
            />
          </div>
        )}
        <div className="profile-stats-inline">
          <div className="stat-item">
            <span className="stat-number">{numComentarios}</span>
            <span className="stat-label">Comentários</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{numCurtidas}</span>
            <span className="stat-label">Curtidas</span>
          </div>
        </div>
      </div>

      {popupAberto && escolhaImagemCampo && (
        <div className="popup">
          <div className="popup-content escolha-imagem-popup">
            <h3>
              Escolha a imagem para {escolhaImagemCampo === 'avatar' ? 'Avatar' : 'Header'}
            </h3>
            <div className="imagens-grid">
              {imagensUsuario.length === 0 && <p>Você não tem imagens disponíveis.</p>}
              {imagensUsuario.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Imagem ${i + 1}`}
                  className="img-miniatura escolha-imagem"
                  onClick={() => salvarImagemEscolhida(escolhaImagemCampo, img)}
                  title={`Selecionar como ${escolhaImagemCampo}`}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
            <button className="btn-cancel" onClick={fecharPopup} style={{ marginTop: '1rem' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {}
      {popupLivroAberto && (
        <div className="popup">
          <div className="popup-content">
            <h3>Adicionar Novo Livro</h3>
            {livroAdicionado ? (
              <div className="sucesso-adicao">
                <p>{livroAdicionado.message || 'Livro adicionado com sucesso!'}</p>
                {livroAdicionado.capaUrl && (
                  <img
                    src={livroAdicionado.capaUrl}
                    alt="Capa do livro"
                    style={{ maxWidth: '150px', borderRadius: '8px' }}
                  />
                )}
                <button onClick={fecharPopupLivro} style={{ marginTop: '1rem' }}>
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <label>
                  Título*:
                  <input
                    type="text"
                    name="titulo"
                    value={formLivro.titulo}
                    onChange={handleChangeLivro}
                  />
                </label>
                <label>
                  Autor*:
                  <input
                    type="text"
                    name="autor"
                    value={formLivro.autor}
                    onChange={handleChangeLivro}
                  />
                </label>
                <label>
                  Descrição*:
                  <textarea
                    name="descricao"
                    value={formLivro.descricao}
                    onChange={handleChangeLivro}
                    rows={3}
                  />
                </label>
                <label>
                  Nota Média*:
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    name="nota"
                    value={formLivro.nota}
                    onChange={handleChangeLivro}
                  />
                </label>
                <label>
                  Ano de Publicação*:
                  <input
                    type="number"
                    name="ano"
                    value={formLivro.ano}
                    onChange={handleChangeLivro}
                  />
                </label>
                <label>
                  URL da Capa*:
                  <input
                    type="text"
                    name="capaUrl"
                    value={formLivro.capaUrl}
                    onChange={handleChangeLivro}
                  />
                </label>

                {erroLivro && <p style={{ color: 'red' }}>{erroLivro}</p>}

                <div className="popup-buttons">
                  <button onClick={enviarLivro}>Adicionar Livro</button>
                  <button onClick={fecharPopupLivro}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {imagensUsuario.map((img, index) => (
        <div key={index} className="card-imagem">
          <img
            src={img}
            alt={`Imagem ${index + 1}`}
            className="img-miniatura"
            style={{ cursor: 'pointer' }}
            title="Clique para definir como fundo da Comunidade"
            onClick={() => {
              api.put(`/usuario/${user.idUsuario}`, { background: img })
                .then(() => {
                  alert('Fundo da Comunidade atualizado com sucesso!');
                  setUser(prev => ({ ...prev, background: img }));
                })
                .catch(err => {
                  console.error('Erro ao salvar fundo:', err);
                  alert('Erro ao definir fundo.');
                });
            }}
          />
        </div>
      ))}

      <div className="lists-container">
        <h2 className="section-title">Minhas Listas</h2>
        {listasUsuario.length === 0 && <p>Você não possui listas ainda.</p>}
        {listasUsuario.map(lista => (
          <div key={lista.idLista} className="lista-section">
            <div className="lista-header">
              {lista.avatar ? (
                <img src={lista.avatar} alt="Avatar do usuário" className="lista-avatar" />
              ) : (
                <i className="bi bi-person-circle profile-icon"></i>
              )}
              <div className="profile-info">
                <h3>{lista.nomeLista}</h3>
              </div>
              <div className="lista-actions">
                <i
                  className="bi bi-trash delete-icon"
                  title="Excluir lista"
                  onClick={() => excluirLista(lista.idLista)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>
            <div className="lista-foto-grid">
              {lista.fotos.map((foto, idx) => (
                <img key={idx} src={foto} alt={`Foto ${idx + 1}`} className="lista-foto-item" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="lists-container">
        <h2 className="section-title">Listas Curtidas</h2>
        {listasCurtidas.length === 0 && <p>Você não curtiu nenhuma lista ainda.</p>}
        {listasCurtidas.map(curtida => (
          <div key={curtida.idCurtida} className="lista-section">
            <div className="lista-header">
              {curtida.avatar ? (
                <img src={curtida.avatar} alt="Avatar do usuário" className="lista-avatar" />
              ) : (
                <i className="bi bi-person-circle profile-icon"></i>
              )}
              <div className="profile-info">
                <h3>{curtida.nomeLista}</h3>
              </div>
              <div className="lista-actions">
                <i
                  className="bi bi-trash delete-icon"
                  title="Remover curtida"
                  onClick={() => removerCurtida(curtida.idCurtida)}
                />
              </div>
            </div>
            <div className="lista-foto-grid">
              {curtida.fotos.map((foto, idx) => (
                <img key={idx} src={foto} alt={`Foto ${idx + 1}`} className="lista-foto-item" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {popupAberto && listaEditando && (
        <div className="popup">
          <div className="popup-content">
            <h3>{listaEditando.idLista ? 'Editando Lista' : 'Nova Lista'}</h3>
            <label>
              Nome da Lista:
              <input type="text" name="nomeLista" value={form.nomeLista} onChange={handleChange} />
            </label>
            <label>
              URLs das Fotos (uma por linha):
              <textarea name="fotos" value={form.fotos} onChange={handleChange} rows={5} />
            </label>
            <div className="popup-buttons">
              <button onClick={salvarEdicao}>{listaEditando.idLista ? 'Salvar' : 'Criar'}</button>
              <button onClick={fecharPopup}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {}

      {}
      <div
        id="btnAdicionarLivro"
        className="botao-add-livro"
        style={{ bottom: '80px', right: '20px', backgroundColor: '#ca8f99' }}
        onClick={abrirPopupLivro}
        title="Adicionar novo livro"
      >
        <i className="bi bi-book"></i>
      </div>

      <button onClick={handleLogout} className="btn-logout-bottom">
        Sair
      </button>
    </div>
  );
}

export default UserDashboard;
