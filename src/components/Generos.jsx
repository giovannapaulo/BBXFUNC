import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './generos.css';

export default function Generos() {
  const [generos, setGeneros] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8081/genero-com-subgenero")
      .then(res => res.json())
      .then(data => {
        const agrupados = {};
        data.forEach(item => {
          if (!agrupados[item.NomeGenero]) {
            agrupados[item.NomeGenero] = [];
          }
          agrupados[item.NomeGenero].push({
            id: item.IdSubgenero,
            nome: item.NomeSubgenero,
          });
        });
        setGeneros(Object.entries(agrupados));
      })
      .catch(err => console.error("Erro ao buscar gêneros:", err));
  }, []);

  return (
    <div className="Generos">
      {generos.map(([nomeGenero, subgeneros]) => (
        <div className="BlocoGenero" key={nomeGenero}>
          <h2 className="GeneroTitulo">{nomeGenero}</h2>
          <div className="SubgenerosGrid">
            {subgeneros.map((sub, index) => (
              <Link key={sub.id} to={`/subgenero/${sub.id}`} className="SubGeneroCard">
                <div className={`SubGenero sub${(index % 5) + 1}`}>
                  <span>{sub.nome.toUpperCase()}</span>
                  <span className="Icone">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
