import { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./lists.css";
import { useNavigate } from "react-router-dom";

function Lists() {
  const [listas, setListas] = useState([]);
  const [minhasListas, setMinhasListas] = useState([]);
  const [livros, setLivros] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [listaSelecionada, setListaSelecionada] = useState(null);
  const [filtro, setFiltro] = useState("todas");
  const [usuario, setUsuario] = useState(null);

  const [livrosOriginais, setLivrosOriginais] = useState([]);

  const [formData, setFormData] = useState({ nomeLista: "", livrosSelecionados: [] });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:8081/api/usuario/logado", { withCredentials: true })
      .then(res => {
        setUsuario(res.data);
        buscarMinhasListas(res.data.idUsuario);
      })
      .catch(() => setUsuario(null));
  }, []);

  useEffect(() => {
    axios.get("http://localhost:8081/listas/comunidade")
      .then(res => setListas(res.data))
      .catch(err => console.error("Erro ao buscar listas da comunidade:", err));
  }, []);

  function buscarMinhasListas(idUsuario) {
    axios.get(`http://localhost:8081/listas/usuario/${idUsuario}`)
      .then(res => setMinhasListas(res.data))
      .catch(err => {
        console.error("Erro ao buscar minhas listas:", err);
        setMinhasListas([]);
      });
  }

  useEffect(() => {
    axios.get("http://localhost:8081/livro")
      .then(res => setLivros(res.data))
      .catch(err => console.error("Erro ao buscar livros:", err));
  }, []);

  const togglePopup = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setFormData({ nomeLista: "", livrosSelecionados: [] });
    }
  };

  const toggleEditPopup = () => {
    setIsEditOpen(!isEditOpen);
    setListaSelecionada(null);
    setFormData({ nomeLista: "", livrosSelecionados: [] });
    setLivrosOriginais([]);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLivroSelecionado = (e) => {
    const idLivro = Number(e.target.value);
    if (idLivro && !formData.livrosSelecionados.includes(idLivro)) {
      setFormData(prev => ({
        ...prev,
        livrosSelecionados: [...prev.livrosSelecionados, idLivro]
      }));
    }
  };

  const handleRemoverLivro = (idLivro) => {
    setFormData(prev => ({
      ...prev,
      livrosSelecionados: prev.livrosSelecionados.filter(id => id !== idLivro)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!usuario) {
      alert("Você precisa estar logado para criar uma lista.");
      navigate("/login");
      return;
    }

    if (!formData.nomeLista.trim() || formData.livrosSelecionados.length === 0) {
      alert("Preencha o nome da lista e escolha ao menos um livro.");
      return;
    }

    axios.post("http://localhost:8081/listas", {
      nomeLista: formData.nomeLista,
      idUsuario: usuario.idUsuario,
      livros: formData.livrosSelecionados
    }, { withCredentials: true })
      .then(() => {
        alert("Lista criada com sucesso!");
        togglePopup();
        buscarMinhasListas(usuario.idUsuario);
        axios.get("http://localhost:8081/listas/comunidade")
          .then(res => setListas(res.data));
      })
      .catch(err => {
        console.error("Erro ao criar lista:", err);
        alert("Erro ao criar lista. Tente novamente.");
      });
  };

  const handleSalvarEdicao = () => {
    if (!listaSelecionada || !formData.nomeLista.trim()) {
      alert("Preencha todos os campos.");
      return;
    }

    const livrosParaAdicionar = formData.livrosSelecionados.filter(id => !livrosOriginais.includes(id));
    const livrosParaRemover = livrosOriginais.filter(id => !formData.livrosSelecionados.includes(id));

    axios.put(`http://localhost:8081/listas/${listaSelecionada}`, {
      nomeLista: formData.nomeLista,
      idUsuario: usuario.idUsuario,
      livrosParaAdicionar,
      livrosParaRemover
    }, { withCredentials: true })
      .then(() => {
        alert("Lista atualizada com sucesso!");
        toggleEditPopup();
        buscarMinhasListas(usuario.idUsuario);
        axios.get("http://localhost:8081/listas/comunidade")
          .then(res => setListas(res.data));
      })
      .catch(err => {
        console.error("Erro ao editar lista:", err);
        alert("Erro ao editar lista.");
      });
  };

  const handleEditarLista = (lista) => {
    setListaSelecionada(lista.idLista);
    const livrosIds = lista.livrosIds || [];

    setFormData({
      nomeLista: lista.nomeLista,
      livrosSelecionados: livrosIds
    });
    setLivrosOriginais(livrosIds);
    setIsEditOpen(true);
  };

  const handleCurtir = (idLista) => {
    if (!usuario) {
      alert("Você precisa estar logado para curtir uma lista.");
      navigate("/login");
      return;
    }
    const dataCurtida = new Date().toISOString().slice(0, 19).replace("T", " ");

    axios.post("http://localhost:8081/curtida", {
      idUsuario: usuario.idUsuario,
      idLista,
      dataCurtida
    }, { withCredentials: true })
      .then(() => alert("Lista curtida!"))
      .catch(err => {
        console.error("Erro ao curtir lista:", err);
        alert("Erro ao curtir lista. Tente novamente.");
      });
  };

  const handleExcluirLista = (idLista) => {
    if (!window.confirm("Tem certeza que deseja excluir esta lista?")) return;

    axios.delete(`http://localhost:8081/listas/${idLista}`, {
      data: { idUsuario: usuario.idUsuario }
    })
      .then(() => {
        alert("Lista excluída com sucesso!");
        buscarMinhasListas(usuario.idUsuario);
        axios.get("http://localhost:8081/listas/comunidade")
          .then(res => setListas(res.data));
      })
      .catch(err => {
        console.error("Erro ao excluir lista:", err);
        alert("Erro ao excluir lista.");
      });
  };

  const listasExibidas = filtro === "todas" ? listas : (usuario ? minhasListas : []);

  return (
    <div className="lists-container">
      <h1 className="title">LISTAS</h1>

      <div className="filter-dropdown-container">
        <select
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          className="filter-dropdown"
        >
          <option value="todas">Todas as listas</option>
          <option value="minhas" disabled={!usuario}>Minhas listas</option>
        </select>
      </div>

      {listasExibidas.length === 0 && (
        <p className="empty-message">
          {filtro === "minhas" && !usuario
            ? "Faça login para ver suas listas."
            : "Nenhuma lista disponível."}
        </p>
      )}

      {listasExibidas.map(lista => (
        <div key={lista.idLista} className="profile-section">
          <div className="lista-header">
            <img
              src={lista.avatar || "https://i.pravatar.cc/40?u=anon"}
              alt="Avatar do usuário"
              className="avatar"
              style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 10 }}
            />
            <div className="profile-info">
              <h3>{lista.nomeUsuario || (usuario && usuario.nomeUsuario)}</h3>
              <h3 className="lista-nome">{lista.nomeLista}</h3>
            </div>
            <div className="btn-group-icons">
              {filtro !== "minhas" && (
                <button className="curtir-btn" onClick={() => handleCurtir(lista.idLista)} title="Curtir lista">
                  <i className="bi bi-hand-thumbs-up"></i>
                </button>
              )}
              {filtro === "minhas" && usuario && (
                <>
                  <button className="acao-btn" title="Editar lista" onClick={() => handleEditarLista(lista)}>
                    <i className="bi bi-pencil-square"></i>
                  </button>
                  <button className="acao-btn" onClick={() => handleExcluirLista(lista.idLista)} title="Excluir lista">
                    <i className="bi bi-trash3-fill"></i>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="photo-grid">
            {lista.fotos?.map((url, i) => (
              <img key={i} src={url} alt={`Livro ${i + 1}`} className="photo-item" />
            ))}
          </div>
        </div>
      ))}

      <div id="btnEvento" className="add-list-icon" onClick={togglePopup} title="Adicionar nova lista">
        <i className="bi bi-plus"></i>
      </div>

      {(isOpen || isEditOpen) && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={isOpen ? togglePopup : toggleEditPopup} title="Fechar">
              <i className="bi bi-x"></i>
            </button>
            <h2>{isEditOpen ? "Editar Lista" : "Adicione uma nova lista!"}</h2>
            <form onSubmit={isOpen ? handleSubmit : (e) => { e.preventDefault(); handleSalvarEdicao(); }}>
              <div className="form-group">
                <label htmlFor="nomeLista">Nome da Lista</label>
                <input
                  type="text"
                  id="nomeLista"
                  name="nomeLista"
                  value={formData.nomeLista}
                  onChange={handleChangeForm}
                  placeholder="Digite o nome da lista"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="livrosSelecionados">Escolha os livros</label>
                <select
                  id="livrosSelecionados"
                   className="filter-dropdown"
                  onChange={handleLivroSelecionado}
                  defaultValue=""
                >
                  <option value="" disabled>Selecione um livro</option>
                  {livros.map(livro => (
                    <option key={livro.IdLivro} value={livro.IdLivro}>
                      {livro.Titulo} - {livro.Autor}
                    </option>
                  ))}
                </select>
                <div className="livros-selecionados-list">
                  {formData.livrosSelecionados.map(idLivro => {
                    const livro = livros.find(l => l.IdLivro === idLivro);
                    if (!livro) return null;
                    return (
                      <div key={idLivro} className="livro-selecionado">
                        {livro.Titulo}
                        <button type="button" onClick={() => handleRemoverLivro(idLivro)}>x</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-actions">
                <button id="btnForm" type="submit">{isEditOpen ? "Salvar Alterações" : "Enviar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lists;
