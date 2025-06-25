import { BrowserRouter } from 'react-router-dom';
import RotasGeneros from './components/RotasGeneros';
import Cabecalho from './components/Cabecalho';
import Rodape from './components/Rodape';
import './components/cabecalho.css';
import './components/rodape.css';


export default function App() {
  return (
    <main>
      <BrowserRouter>
        <Cabecalho />
        <RotasGeneros />
        <Rodape />
      </BrowserRouter>
    </main>
  );
}
