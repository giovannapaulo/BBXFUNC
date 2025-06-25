import { Link } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Cabecalho() {
  return (
    <nav className="cabecalho">
      <img
  src="https://i.postimg.cc/SsJFfC6G/logo.png"
  alt="Logo BookBox"
  className="logo-img"
/>
      <div className="telasNavegacao">
        <Link to="/" onClick={() => window.scrollTo(0, 0)}>HOME</Link>
        <Link to="/Generos" onClick={() => window.scrollTo(0, 0)}>GÊNEROS</Link>
        <Link to="/Comunidade" onClick={() => window.scrollTo(0, 0)}>COMUNIDADE</Link>
        <Link to="/Evento" onClick={() => window.scrollTo(0, 0)}>EVENTO</Link>
        <Link to="/lists" onClick={() => window.scrollTo(0, 0)}>LISTAS</Link>
      </div>
     <div className="iconePerfil">
        <Link to="/login">
          <i className="bi bi-person-circle" style={{ fontSize: "35px", color: "black" }}></i>
        </Link>
      </div>
    </nav>
  );
}