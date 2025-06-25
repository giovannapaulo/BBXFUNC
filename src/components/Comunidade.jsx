import React, { useState, useEffect } from "react";
import axios from "axios";
import "./comunidade.css";

const Comunidade = () => {
  const [livros, setLivros] = useState([]);
  const [livroSelecionado, setLivroSelecionado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [curtidas, setCurtidas] = useState({});
  const [formDataPost, setFormDataPost] = useState({ texto: "", idLivro: null });
  const [respostasAbertas, setRespostasAbertas] = useState({});
  const [formDataResposta, setFormDataResposta] = useState({});
  const [respostasVisiveis, setRespostasVisiveis] = useState({});
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8081/api/usuario/logado", { withCredentials: true })
      .then(res => setUsuarioLogado(res.data))
      .catch(() => setUsuarioLogado(null));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8081/livro")
      .then((res) => {
        setLivros(res.data);
        if (res.data.length > 0) {
          setLivroSelecionado(res.data[0]);
          setFormDataPost(f => ({ ...f, idLivro: res.data[0].IdLivro }));
        }
      });
  }, []);

  useEffect(() => {
    if (!formDataPost.idLivro) return;

    axios.get(`http://localhost:8081/comentario/${formDataPost.idLivro}`)
      .then((res) => {
        setComentarios(res.data);
        res.data.forEach((c) => {
          axios.get(`http://localhost:8081/curtida/${c.IdComentario}`)
            .then((res) => {
              setCurtidas((prev) => ({ ...prev, [c.IdComentario]: res.data.total }));
            });
        });
      });
  }, [formDataPost.idLivro]);

  const enviarPost = (e) => {
    e.preventDefault();
    if (!usuarioLogado) return alert("Você precisa estar logado para postar.");
    if (!formDataPost.texto.trim()) return;

    axios.post("http://localhost:8081/comentario", {
      texto: formDataPost.texto,
      idUsuario: usuarioLogado.idUsuario,
      idLivro: formDataPost.idLivro,
      imgBin: null,
      extensao: null,
      tamanho: null,
      nota: null,
      id_Comentario_Pai: null,
    })
      .then(() => {
        setFormDataPost((f) => ({ ...f, texto: "" }));
        return axios.get(`http://localhost:8081/comentario/${formDataPost.idLivro}`);
      })
      .then((res) => setComentarios(res.data));
  };

  const toggleCurtida = (idComentario) => {
    if (!usuarioLogado) return alert("Você precisa estar logado para curtir.");

    axios.post("http://localhost:8081/curtidaComentario", {
      idUsuario: usuarioLogado.idUsuario,
      idComentario,
      dataCurtidaComentario: new Date().toISOString().slice(0, 19).replace("T", " "),
    })
      .then(() => {
        setCurtidas((prev) => ({ ...prev, [idComentario]: (prev[idComentario] || 0) + 1 }));
      });
  };

  const toggleResposta = (idComentario) => {
    if (!usuarioLogado) return alert("Você precisa estar logado para responder.");
    setRespostasAbertas((prev) => ({ ...prev, [idComentario]: !prev[idComentario] }));
    setFormDataResposta((prev) => ({ ...prev, [idComentario]: "" }));
  };

  const enviarResposta = (e, idComentarioPai) => {
    e.preventDefault();
    const texto = formDataResposta[idComentarioPai];
    if (!usuarioLogado) return alert("Você precisa estar logado.");
    if (!texto || !texto.trim()) return;

    axios.post("http://localhost:8081/comentario", {
      texto,
      idUsuario: usuarioLogado.idUsuario,
      idLivro: formDataPost.idLivro,
      imgBin: null,
      extensao: null,
      tamanho: null,
      nota: null,
      id_Comentario_Pai: idComentarioPai,
    })
      .then(() => {
        setRespostasAbertas((prev) => ({ ...prev, [idComentarioPai]: false }));
        setFormDataResposta((prev) => ({ ...prev, [idComentarioPai]: "" }));
        return axios.get(`http://localhost:8081/comentario/${formDataPost.idLivro}`);
      })
      .then((res) => setComentarios(res.data));
  };

  const deletarComentario = (idComentario) => {
    if (!usuarioLogado) return;
    if (!window.confirm("Deseja deletar este comentário?")) return;

    axios.delete(`http://localhost:8081/comentario/${idComentario}`)
      .then(() => {
        setComentarios((prev) => prev.filter((c) => c.IdComentario !== idComentario));
      });
  };

  const tituloLivroDoComentario = (idLivro) => {
    const livro = livros.find((l) => l.IdLivro === idLivro);
    return livro ? livro.Titulo : "";
  };

  const renderComentarios = (lista, paiId = null, nivel = 0) =>
    lista.filter((c) => c.Id_Comentario_Pai === paiId).map((c) => {
      const temRespostas = lista.some((r) => r.Id_Comentario_Pai === c.IdComentario);
      return (
        <div
          key={c.IdComentario}
          className={paiId === null ? "post-card comentario-principal" : "post-card resposta"}
          style={{ marginLeft: nivel * 20 }}
        >
          <div className="post-header">
            <img
              src={c.avatar ? c.avatar : "https://i.pravatar.cc/40?u=anon"}
              alt="avatar"
              className="avatar"
            />
            <div style={{ flex: 1 }}>
              <div className="post-username">{c.nomeUsuario}</div>
              <div className="post-date">
                {new Date(c.Data).toLocaleDateString('pt-BR')} às {new Date(c.Data).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            {usuarioLogado && usuarioLogado.idUsuario === c.IdUsuario && (
              <button className="delete-btn" onClick={() => deletarComentario(c.IdComentario)}>
                <i className="fa fa-trash"></i>
              </button>
            )}
          </div>
          <div className="post-book-tag">Livro: {tituloLivroDoComentario(c.IdLivro)}</div>
          <div className="post-body"><p>{c.Texto}</p></div>
          <div className="post-actions">
            <button onClick={() => toggleCurtida(c.IdComentario)}>
              <i className="fa fa-heart" style={{ color: "#6b4c3b" }}></i> {curtidas[c.IdComentario] || 0}
            </button>
            <button onClick={() => toggleResposta(c.IdComentario)}>
              <i className="fa fa-reply" style={{ color: "#6b4c3b" }}></i> Responder
            </button>
            {temRespostas && (
              <button onClick={() => setRespostasVisiveis(p => ({ ...p, [c.IdComentario]: !p[c.IdComentario] }))}>
                <i className="fa fa-comments" style={{ color: "#6b4c3b" }}></i> Ver respostas
              </button>
            )}
          </div>
          {respostasAbertas[c.IdComentario] && (
            <form onSubmit={(e) => enviarResposta(e, c.IdComentario)} className="reply-form">
              <textarea
                rows={2}
                value={formDataResposta[c.IdComentario] || ""}
                onChange={(e) => setFormDataResposta((p) => ({ ...p, [c.IdComentario]: e.target.value }))}
                placeholder="Escreva sua resposta..."
                required
              />
              <button type="submit">Responder</button>
            </form>
          )}
          {respostasVisiveis[c.IdComentario] && renderComentarios(lista, c.IdComentario, nivel + 1)}
        </div>
      );
    });

  return (
    <div style={{ position: "relative", width: "100vw", minHeight: "100vh", overflowX: "hidden" }}>
      {}
      <div
        style={{
          backgroundImage: "url('https://i.ibb.co/cKQNq4jt/fundo.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -2,
        }}
      />
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />

      {}
      <div className="comunidade-container">
        <form onSubmit={enviarPost} className="new-post-form">
          <select
            value={formDataPost.idLivro || ""}
            onChange={(e) => {
              const livro = livros.find((l) => l.IdLivro === Number(e.target.value));
              setLivroSelecionado(livro);
              setFormDataPost((f) => ({ ...f, idLivro: Number(e.target.value) }));
            }}
            required
          >
            {livros.map((livro) => (
              <option key={livro.IdLivro} value={livro.IdLivro}>
                {livro.Titulo} - {livro.Autor}
              </option>
            ))}
          </select>
          <textarea
            rows={3}
            placeholder="O que você está pensando?"
            value={formDataPost.texto}
            onChange={(e) => setFormDataPost((f) => ({ ...f, texto: e.target.value }))}
            required
          />
          <button type="submit">Postar</button>
        </form>

        <div className="posts-list">
          {renderComentarios(comentarios)}
        </div>
      </div>
    </div>
  );
};

export default Comunidade;
