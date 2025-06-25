import { useState, useEffect } from 'react';
import "./home.css";
import diaDoLivro from '../assets/diadolivro.jpg';
import blackFriday from '../assets/blackfriday.png';
import leia from '../assets/leia.png';
import bookfriday from '../assets/bookfriday.png';

const imagens = [diaDoLivro, blackFriday, leia, bookfriday];

const lojas = [
  { nome: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', url: 'https://www.amazon.com.br' },
  { nome: 'Saraiva', logo: 'https://images.seeklogo.com/logo-png/17/1/editora-saraiva-logo-png_seeklogo-173372.png', url: 'https://www.saraiva.com.br' },
  { nome: 'Submarino', logo: 'https://pbs.twimg.com/profile_images/1742543620547182592/X40_NE6Z_400x400.png', url: 'https://www.submarino.com.br' },
  { nome: 'Livraria Cultura', logo: 'https://livrariacultura.vteximg.com.br/arquivos/logoLC-compartilhamento.jpg?v=636846548733900000', url: 'https://www.livrariacultura.com.br' },
  { nome: 'Americanas', logo: 'https://e3ba6e8732e83984.cdn.gocache.net/uploads/image/file/657486/regular_4dda1ee4a4f732e5c02a2f06964fa45c.jpg', url: 'https://www.americanas.com.br' },
  { nome: 'Magazine Luiza', logo: 'https://g7s6.c10.e2-5.dev/escaesco/2024/06/Magalu.png', url: 'https://www.magazineluiza.com.br' },
];

export default function Home() {
  const [indiceAtual, setIndiceAtual] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndiceAtual((prev) => (prev + 1) % imagens.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const voltarImagem = () => {
    setIndiceAtual((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const avancarImagem = () => {
    setIndiceAtual((prev) => (prev + 1) % imagens.length);
  };

  return (
    <>
      {}
      <div className="carrossel">
        <button className="seta esquerda" onClick={voltarImagem} aria-label="Imagem anterior">
          &#10094;
        </button>
        <img src={imagens[indiceAtual]} alt={`Imagem ${indiceAtual + 1} do carrossel`} />
        <button className="seta direita" onClick={avancarImagem} aria-label="Próxima imagem">
          &#10095;
        </button>
      </div>

      {}
      <div style={{ marginTop: '60px' }}></div>

      {}
      <div className="carousel" role="list">
        {}
        <div className="group" aria-hidden="true">
          {lojas.map((loja, i) => (
            <a
              key={`group1-${i}`}
              href={loja.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              title={loja.nome}
              role="listitem"
            >
              <img src={loja.logo} alt={`Logo da ${loja.nome}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </a>
          ))}
        </div>

        {}
        <div className="group" aria-hidden="true">
          {lojas.map((loja, i) => (
            <a
              key={`group2-${i}`}
              href={loja.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card"
              title={loja.nome}
              role="listitem"
            >
              <img src={loja.logo} alt={`Logo da ${loja.nome}`} style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </a>
          ))}
        </div>
      </div>
      
    </>
  );
}
