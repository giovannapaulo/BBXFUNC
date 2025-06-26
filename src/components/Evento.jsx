import { Container, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import "./Evento.css";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Evento() {
  const [eventos, setEventos] = useState([]);
  const [isOpenFiltro, setIsOpenFiltro] = useState(false);
  const [isOpenInfo, setIsOpenInfo] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [filtroRegiao, setFiltroRegiao] = useState("Todos");
  const [filtroModalidade, setFiltroModalidade] = useState("Todos");
  const [filtroAno, setFiltroAno] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");

  const [favoritos, setFavoritos] = useState(() => {
    const fav = localStorage.getItem('eventosFavoritos');
    return fav ? JSON.parse(fav) : [];
  });

  const [formData, setFormData] = useState({
    nomeEvento: '',
    descEvento: '',
    dataEvento: '',
    localEvento: '',
    modalidade: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("http://localhost:8081/evento")
      .then((res) => res.json())
      .then((data) => setEventos(data))
      .catch((err) => console.error("Erro ao buscar eventos:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem('eventosFavoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  const anosDisponiveis = Array.from(new Set(eventos.map(e => {
    const d = new Date(e.Data);
    return isNaN(d) ? null : d.getFullYear();
  }).filter(Boolean))).sort((a,b) => b - a);

  const mesesDisponiveis = Array.from(new Set(eventos.map(e => {
    const d = new Date(e.Data);
    return isNaN(d) ? null : d.getMonth() + 1; 
  }).filter(Boolean))).sort((a,b) => a - b);

  const mesesNome = {
    1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
    5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
    9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro"
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const eventosFiltrados = eventos.filter(evento => {
    const regiaoOk = filtroRegiao === "Todos" || evento.regiao === filtroRegiao;
    const modalidadeOk = filtroModalidade === "Todos" || (evento.modalidade && evento.modalidade.toLowerCase() === filtroModalidade.toLowerCase());

    const dataEvento = new Date(evento.Data);
    if (isNaN(dataEvento)) return false;

    const anoEvento = dataEvento.getFullYear();
    const mesEvento = dataEvento.getMonth() + 1;

    const anoOk = filtroAno === "Todos" || anoEvento === Number(filtroAno);
    const mesOk = filtroMes === "Todos" || mesEvento === Number(filtroMes);

    return regiaoOk && modalidadeOk && anoOk && mesOk;
  });

  const popupFiltro = () => {
    const novaVisibilidade = !isOpenFiltro;
    setIsOpenFiltro(novaVisibilidade);
    if (!novaVisibilidade) {
      setFormData({
        nomeEvento: '',
        descEvento: '',
        dataEvento: '',
        localEvento: '',
        modalidade: '',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do formulário:', formData);
    popupFiltro();
    alert('Evento enviado! Em breve seu evento irá aparecer aqui!');
  };

  const popupInfo = (evento) => {
    setEventoSelecionado(evento);
    setIsOpenInfo(true);
  };

  const fecharPopupInfo = () => {
    setIsOpenInfo(false);
    setEventoSelecionado(null);
  };

  function formatarDataHora(dataISO, horaStr) {
  const dataObj = new Date(dataISO);
  if (isNaN(dataObj)) return `${dataISO} às ${horaStr}`;

  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();

  let horaFormatada = horaStr;

  if (horaStr && horaStr.includes(':')) {
    const partes = horaStr.split(':');
    const hora = partes[0].padStart(2, '0');
    const minuto = (partes[1] || '00').padStart(2, '0');

    
    horaFormatada = minuto !== '00' ? `${hora}:${minuto}h` : `${hora}h`;
  }

  return `${dia}/${mes}/${ano} às ${horaFormatada}`;
}

  const toggleFavorito = (id) => {
    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter(favId => favId !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  };

  const isFavorito = (id) => favoritos.includes(id);

  const imagensParceiros = [
    "https://i.ibb.co/hRPvS6SN/CARROSSEL1.jpg",
    "https://i.ibb.co/99bvBLt4/CARROSSEL4.jpg",
    "https://i.ibb.co/chWGst33/CAROSSEL3.jpg",
    "https://i.ibb.co/fGnPQY40/CAROSSEL4.jpg",
    "https://i.ibb.co/Q31JHxrW/CARROSSEL5.jpg",
  ];

  const [indiceCarrossel, setIndiceCarrossel] = useState(0);
  const timerRef = useRef(null);

  const anteriorCarrossel = () => {
    setIndiceCarrossel(prev => (prev === 0 ? imagensParceiros.length - 1 : prev - 1));
  };

  const proximoCarrossel = () => {
    setIndiceCarrossel(prev => (prev === imagensParceiros.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndiceCarrossel(prev => (prev === imagensParceiros.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(timerRef.current);
  }, [imagensParceiros.length]);

  const reiniciarTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndiceCarrossel(prev => (prev === imagensParceiros.length - 1 ? 0 : prev + 1));
    }, 3000);
  };

  return (
    <div className="evento">

      {}
      <div className="carrossel-parceiros-container">
        <button
          className="btn-navegacao-esq"
          aria-label="Imagem anterior"
          onClick={() => {
            anteriorCarrossel();
            reiniciarTimer();
          }}
        >
          ‹
        </button>

        <div className="carrossel-parceiros-imagem-wrapper">
          <img
            src={imagensParceiros[indiceCarrossel]}
            alt={`Parceiro ${indiceCarrossel + 1}`}
            className="carrossel-parceiros-imagem"
            loading="lazy"
          />
        </div>

        <button
          className="btn-navegacao-dir"
          aria-label="Próxima imagem"
          onClick={() => {
            proximoCarrossel();
            reiniciarTimer();
          }}
        >
          ›
        </button>
      </div>

      <Container className="my-5">
        <div id="header" className="text-center mb-4">

          <h2 className="subtitulo-evento">Encontre os eventos próximos de você</h2>

          <div className="mb-3 d-flex justify-content-center gap-3 flex-wrap" style={{ marginTop: '1rem' }}>

            <DropdownButton id="dropdown-regiao" title={`Estado: ${filtroRegiao}`}>
              {["Todos", "AC", "BA", "DF", "SP", "RJ", "RS", "AM", "MG"].map(regiao => (
                <Dropdown.Item key={regiao} onClick={() => setFiltroRegiao(regiao)}>
                  {regiao}
                </Dropdown.Item>
              ))}
            </DropdownButton>

            <DropdownButton id="dropdown-ano" title={`Ano: ${filtroAno}`}>
              <Dropdown.Item key="TodosAno" onClick={() => setFiltroAno("Todos")}>Todos</Dropdown.Item>
              {anosDisponiveis.map(ano => (
                <Dropdown.Item key={ano} onClick={() => setFiltroAno(ano.toString())}>
                  {ano}
                </Dropdown.Item>
              ))}
            </DropdownButton>

            <DropdownButton id="dropdown-mes" title={`Mês: ${filtroMes === "Todos" ? "Todos" : mesesNome[filtroMes]}`}>
              <Dropdown.Item key="TodosMes" onClick={() => setFiltroMes("Todos")}>Todos</Dropdown.Item>
              {mesesDisponiveis.map(mes => (
                <Dropdown.Item key={mes} onClick={() => setFiltroMes(mes.toString())}>
                  {mesesNome[mes]}
                </Dropdown.Item>
              ))}
            </DropdownButton>

          </div>
        </div>

        <Row className="justify-content-center">
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map(evento => (
              <Col key={evento.idEvento} md={4} className="mb-4 text-center" style={{ minWidth: '400px' }}>
                <div className="evento-img-container bg-light rounded mx-auto">
                  <img
                    src={evento.Imagem || "/default-event.jpg"}
                    alt={`Imagem do evento ${evento.nomeEvento}`}
                    className="img-fluid rounded"
                    onClick={() => popupInfo(evento)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <p className="mt-2 text-center"><strong>{evento.nomeEvento}</strong></p>
              </Col>
            ))
          ) : (
            <p className="text-center mt-4">Nenhum evento encontrado.</p>
          )}
        </Row>
      </Container>

      {isOpenFiltro && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={popupFiltro}><i className="bi bi-x"></i></button>
            <h2>Adicione um novo Evento!</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="nomeEvento" value={formData.nomeEvento} onChange={handleChange} placeholder="Nome do evento" />
              <button type="submit">Enviar</button>
            </form>
          </div>
        </div>
      )}

      {isOpenInfo && eventoSelecionado && (
        <div className="popup-overlay">
          <div className="popup-content evento-popup" style={{ maxWidth: '700px', borderRadius: '20px', padding: '30px 40px' }}>
            <button className="close-btn" onClick={fecharPopupInfo}><i className="bi bi-x-lg"></i></button>

            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <img
                src={eventoSelecionado.Imagem || "/default-event.jpg"}
                alt={`Imagem do evento ${eventoSelecionado.nomeEvento}`}
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }}
              />
            </div>

            <h2
              className="popup-title"
              style={{
                fontSize: '1.7rem',
                fontWeight: 'bold',
                color: '#d6336c',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {eventoSelecionado.nomeEvento}
            </h2>

            <p className="popup-descricao" style={{ fontWeight: 'normal', marginBottom: '1.5rem', textAlign: 'center' }}>
              {eventoSelecionado.descricao}
            </p>

            <div className="popup-info" style={{ fontWeight: 'normal', color: '#d6336c', textAlign: 'left', maxWidth: '480px', margin: '0 auto' }}>
              <p>
                <i className="bi bi-calendar-event" style={{ color: '#d6336c' }}></i>{' '}
                <strong>Data:</strong> {formatarDataHora(eventoSelecionado.Data, eventoSelecionado.Hora)}
              </p>
              <p>
                <i className="bi bi-geo-alt" style={{ color: '#d6336c' }}></i>{' '}
                <strong>Local:</strong> {eventoSelecionado.Rua}, {eventoSelecionado.Numero}, {eventoSelecionado.Cidade}
              </p>
              <p>
                <i className="bi bi-compass" style={{ color: '#d6336c' }}></i>{' '}
                <strong>Região:</strong> {eventoSelecionado.regiao}
              </p>
            </div>

            {}
          </div>
        </div>
      )}

      <style>{`
        .carrossel-parceiros-container {
          position: relative;
          width: 100vw;
          height: 180px; 
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          overflow: hidden;
          margin: 0; /* colado na navbar */
        }

        .carrossel-parceiros-imagem-wrapper {
          flex: 1;
          height: 100%;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .carrossel-parceiros-imagem {
          width: 100%;
          height: 100%;
          object-fit: cover; /* ocupa toda largura e altura, cortando o excesso */
          user-select: none;
          pointer-events: none;
        }

        .btn-navegacao-esq,
        .btn-navegacao-dir {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background-color: rgba(255, 255, 255, 0.8);
          border: none;
          font-size: 2.5rem;
          font-weight: bold;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          color: #6f4e37; /* marrom */
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          z-index: 10;
        }

        .btn-navegacao-esq:hover,
        .btn-navegacao-dir:hover {
          background-color: rgba(255, 255, 255, 1);
        }

        .btn-navegacao-esq {
          left: 12px;
        }

        .btn-navegacao-dir {
          right: 12px;
        }

        /* POPUP */

        .popup-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          z-index: 9999;
          overflow-y: auto;
        }

        .popup-content.evento-popup {
          background: #fff5f7;
          border-radius: 20px;
          padding: 30px 40px;
          max-width: 700px;
          width: 100%;
          max-height: 80vh;
          color: #333;
          box-shadow: 0 0 25px rgba(0,0,0,0.18);
          position: relative;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .popup-content.evento-popup img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 1rem;
        }

        .close-btn {
          position: absolute;
          top: 12px;
          right: 15px;
          font-size: 1.8rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          transition: color 0.2s ease-in-out;
        }

        .close-btn:hover {
          color: #000;
        }

        .popup-title {
          font-size: 1.7rem;
          font-weight: bold;
          color:rgb(91, 64, 49);
          margin-bottom: 1rem;
          text-align: center;
        }

        .popup-descricao {
          font-weight: normal;
          margin-bottom: 1.5rem;
          text-align: center;
          color: #555;
        }

        .popup-info {
          font-weight: normal;
          color: #d6336c;
          text-align: left;
          max-width: 480px;
          margin: 0 auto;
        }

        .popup-info p {
          margin: 0.2rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .popup-info i {
          color:rgb(215, 130, 159);
        }
      `}</style>
    </div>
  );
}
