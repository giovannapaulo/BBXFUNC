import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './geralGeneros.css';

export default function Dramatico() {
  const { id } = useParams(); 
  const [livros, setLivros] = useState([]);
  const [todosLivros, setTodosLivros] = useState([]);
  const [showPopupDetalhes, setShowPopupDetalhes] = useState(false);
  const [showPopupEscolhaLista, setShowPopupEscolhaLista] = useState(false);
  const [popupInfo, setPopupInfo] = useState(null);
  const [nomeSubgenero, setNomeSubgenero] = useState('');
  const [autores, setAutores] = useState([]);
  const [autorSelecionado, setAutorSelecionado] = useState('');
  const [ordem, setOrdem] = useState('');
  const [letraSelecionada, setLetraSelecionada] = useState('');
  const [mostrarLetras, setMostrarLetras] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const [listasUsuario, setListasUsuario] = useState([]);
  const [listaEscolhida, setListaEscolhida] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8081/api/usuario/logado', { withCredentials: true })
      .then(res => {
        setUsuarioLogado(res.data);
        axios.get(`http://localhost:8081/listas/usuario/${res.data.idUsuario}`)
          .then(resListas => setListasUsuario(resListas.data))
          .catch(() => setListasUsuario([]));
      })
      .catch(() => setUsuarioLogado(null));
  }, []);

  useEffect(() => {
    fetch(`http://localhost:8081/livro/Idsubgenero/${id}`)
      .then(res => res.json())
      .then(data => {
        setTodosLivros(data);
        setLivros(data);
      });

    fetch(`http://localhost:8081/subgenero/${id}`)
      .then(res => res.json())
      .then(data => setNomeSubgenero(data?.NomeSubgenero || 'Subgênero'));

    fetch(`http://localhost:8081/autores/subgenero/${id}`)
      .then(res => res.json())
      .then(data => setAutores(data));
  }, [id]);

  const handleClick = (livro) => {
    setPopupInfo(livro);
    setShowPopupDetalhes(true);
    setListaEscolhida(''); 
  };

  const filtrarLivros = (autor, letra, ordem) => {
    let filtrados = [...todosLivros];
    if (autor) filtrados = filtrados.filter(livro => livro.Autor === autor);
    if (letra) filtrados = filtrados.filter(livro => livro.Titulo.toUpperCase().startsWith(letra));
    if (ordem === 'az') filtrados.sort((a, b) => a.Titulo.localeCompare(b.Titulo));
    else if (ordem === 'za') filtrados.sort((a, b) => b.Titulo.localeCompare(a.Titulo));
    setLivros(filtrados);
  };

  const handleAutorChange = (e) => {
    setAutorSelecionado(e.target.value);
    setLetraSelecionada('');
    filtrarLivros(e.target.value, '', ordem);
  };

  const handleOrdemChange = (e) => {
    setOrdem(e.target.value);
    filtrarLivros(autorSelecionado, letraSelecionada, e.target.value);
  };

  const irParaForum = () => navigate('/Comunidade');

  const abrirPopupEscolhaLista = () => {
    if (!usuarioLogado) {
      alert("Você precisa estar logado para adicionar livros à lista.");
      navigate('/login');
      return;
    }
    setShowPopupDetalhes(false);
    setShowPopupEscolhaLista(true);
  };

  const confirmarAdicionarLista = () => {
    if (!listaEscolhida) {
      alert("Escolha uma lista para adicionar o livro.");
      return;
    }

    axios.post(`http://localhost:8081/listas/${listaEscolhida}/adicionarLivro`, {
      idLivro: popupInfo.IdLivro
    }, { withCredentials: true })
      .then(() => {
        alert("Livro adicionado à lista com sucesso!");
        setShowPopupEscolhaLista(false);
        setListaEscolhida('');
      })
      .catch(() => {
        alert("Erro ao adicionar livro à lista. Tente novamente.");
      });
  };

  return (
    <div className="container">
      <h1 className="titulo titulo-menor">Todos os livros encontrados: {nomeSubgenero}</h1>

      <div className="filtros-wrapper">
        {autores.length > 0 && (
          <select value={autorSelecionado} onChange={handleAutorChange} className="filtro-botao quadrado">
            <option value="">Todos os autores</option>
            {autores.map((autor, i) => (
              <option key={i} value={autor}>{autor}</option>
            ))}
          </select>
        )}
      <select value={letraSelecionada} onChange={(e) => {
       const letra = e.target.value;
       setLetraSelecionada(letra);
       setAutorSelecionado('');
       if (letra === '') {
           setLivros(todosLivros);
    } else {
      setLivros(todosLivros.filter(livro => livro.Titulo.toUpperCase().startsWith(letra)));
    }
  }}
   className="filtro-botao quadrado"
>
  <option value="">Todas as letras</option>
  {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letra) => (
    <option key={letra} value={letra}>{letra}</option>
  ))}
</select>

        <select value={ordem} onChange={handleOrdemChange} className="filtro-botao quadrado">
          <option value="">Ordem padrão</option>
          <option value="az">Título (A–Z)</option>
          <option value="za">Título (Z–A)</option>
        </select>
      </div>

      <div className="livros">
        {livros.length === 0 && <p>Nenhum livro encontrado para este filtro.</p>}
        {livros.map((livro) => (
          <div
            key={livro.IdLivro}
            className="card"
            style={{ backgroundImage: `url(${livro.ImgUrl})` }}
            onClick={() => handleClick(livro)}
            title="Clique para abrir detalhes"
          >
          </div>
        ))}
      </div>

      {}
      {showPopupDetalhes && (
        <div className="popup-overlay" onClick={() => setShowPopupDetalhes(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>{popupInfo?.Titulo || 'Título'}</h3>
            <p><strong>Autor:</strong> {popupInfo?.Autor || '—'}</p>
            <p><strong>Sinopse:</strong> {popupInfo?.Sinopse || '—'}</p>
            <p><strong>Nota Média:</strong> {popupInfo?.NotaMedia || '—'}</p>
            <p><strong>Ano Publicação:</strong> {popupInfo?.AnoPublicacao || '—'}</p>

            <button
              type="button"
              onClick={abrirPopupEscolhaLista}
              style={{ margin: '10px 0' }}
            >
              <i className="fa fa-plus"></i> Adicionar à Lista
            </button>
            <button
              type="button"
              onClick={irParaForum}
            >
              Dê sua opinião no fórum!
            </button>
          </div>
        </div>
      )}

      {}
      {showPopupEscolhaLista && (
        <div className="popup-overlay" onClick={() => setShowPopupEscolhaLista(false)}>
          <div className="popup-content" onClick={e => e.stopPropagation()}>
            <h3>Escolha a lista para adicionar o livro:</h3>
            <select
              value={listaEscolhida}
              onChange={e => setListaEscolhida(e.target.value)}
              className="filtro-botao quadrado"
              style={{ margin: '10px 0' }}
            >
              <option value="">-- Selecione uma lista --</option>
              {listasUsuario.map(lista => (
                <option key={lista.idLista} value={lista.idLista}>
                  {lista.nomeLista}
                </option>
              ))}
            </select>
            <div>
              <button
                onClick={confirmarAdicionarLista}
                style={{ marginRight: 10 }}
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowPopupEscolhaLista(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
