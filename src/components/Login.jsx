import React, { useRef, useState, useEffect } from 'react';
import "./Login.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true; 

const Login = () => {
  const containerRef = useRef(null);
  const [emailLogin, setEmailLogin] = useState('');
  const [senhaLogin, setSenhaLogin] = useState('');
  const [nomeUsuarioCadastro, setNomeUsuarioCadastro] = useState('');
  const [emailCadastro, setEmailCadastro] = useState('');
  const [senhaCadastro, setSenhaCadastro] = useState('');
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  
  useEffect(() => {
    axios.get('http://localhost:8081/check-auth')
      .then(res => {
        if (res.data.loggedIn) {
          navigate('/dashboard');
        }
      });
  }, [navigate]);

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type });
    setTimeout(() => setPopup(p => ({ ...p, show: false })), 3000);
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/usuario', { email: emailLogin, senha: senhaLogin });
      showPopup(response.data.message || 'Login realizado com sucesso!');
      setEmailLogin('');
      setSenhaLogin('');
      navigate('/dashboard'); 
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          showPopup('Credenciais inválidas. Tente novamente.', 'error');
        } else {
          showPopup('Falha na realização do Login. Tente novamente.', 'error');
        }
      } else {
        showPopup('Erro de conexão. Tente novamente mais tarde.', 'error');
      }
      console.error("Erro ao fazer login:", error);
    }
  };

  const handleCadastroSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8081/usuario', { nomeUsuario: nomeUsuarioCadastro, email: emailCadastro, senha: senhaCadastro });
      showPopup('Conta criada com sucesso!');
      setNomeUsuarioCadastro('');
      setEmailCadastro('');
      setSenhaCadastro('');
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          showPopup('Este email já está cadastrado.', 'warning');
        } else {
          showPopup('Falha ao criar conta. Tente novamente.', 'error');
        }
      } else {
        showPopup('Erro de conexão. Tente novamente mais tarde.', 'error');
      }
      console.error("Erro ao cadastrar usuário:", error);
    }
  };

  const handleSignUp = () => {
    containerRef.current.classList.add('right-panel-active');
  };

  const handleSignIn = () => {
    containerRef.current.classList.remove('right-panel-active');
  };

  return (
    <>
      <div id="bodyLogin">
        {popup.show && (
          <div className={`custom-popup ${popup.type}`}>
            <p id="plogin">{popup.message}</p>
          </div>
        )}
        <div className="containerLogin" id="container" ref={containerRef}>
          <div className="form-container sign-up-container">
            <form id="formlogin" onSubmit={handleCadastroSubmit}>
              <h1 id="h1login">Crie uma conta</h1>
              <br />
              <span id="splogin">Use seu email</span>
              <input
                id="inputlogin"
                type="text"
                placeholder="Nome de Usuário"
                value={nomeUsuarioCadastro}
                onChange={e => setNomeUsuarioCadastro(e.target.value)}
                required
              />
              <input
                id="inputlogin"
                type="email"
                placeholder="Email"
                value={emailCadastro}
                onChange={e => setEmailCadastro(e.target.value)}
                required
              />
              <input
                id="inputlogin"
                type="password"
                placeholder="Senha"
                value={senhaCadastro}
                onChange={e => setSenhaCadastro(e.target.value)}
                required
              />
              <br />
              <button id="buttonLogin" type="submit">Criar conta</button>
            </form>
          </div>

          <div className="form-container sign-in-container">
            <form id="formlogin" onSubmit={handleLoginSubmit}>
              <h1 id="h1login">Login</h1>
              <br />
              <span>Use uma conta existente</span>
              <input
                id="inputlogin"
                type="email"
                placeholder="Email"
                value={emailLogin}
                onChange={e => setEmailLogin(e.target.value)}
                required
              />
              <input
                id="inputlogin"
                type="password"
                placeholder="Senha"
                value={senhaLogin}
                onChange={e => setSenhaLogin(e.target.value)}
                required
              />
              <br />
              <button id="buttonLogin" type="submit">Fazer Login</button>
            </form>
          </div>

          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 id="h1login">Olá, leitoras!</h1>
                <p id="plogin">
                  Crie uma conta e inicie sua jornada conosco.
                  <br /><br />
                  Caso já tenha uma conta, acesse agora!
                </p>
                <button id="buttonLogin" onClick={handleSignIn}>Login</button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 id="h1login">Bem-vindo(a) de volta ao BookBox!</h1>
                <p id="plogin">
                  Para continuar conectado, faça login com suas informações pessoais.
                  <br /><br />
                  Caso não tenha uma conta, crie uma agora!
                </p>
                <button id="buttonLogin" onClick={handleSignUp}>Criar conta</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
