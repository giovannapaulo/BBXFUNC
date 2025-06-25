import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import Generos from './Generos';
import Narrativo from './Narrativo';
import Lirico from './Lirico';
import Dramatico from './Dramatico';
import Comunidade from './Comunidade';
import Evento from './Evento';
import Lists from './Lists';
import Login from './Login';
import UserDashboard from './UserDashboard';

export default function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Generos" element={<Generos />} />
      <Route path="/Narrativo" element={<Narrativo />} />
      <Route path="/Lirico" element={<Lirico />} />
      <Route path="/Dramatico" element={<Dramatico />} />
      <Route path="/subgenero/:id" element={<Dramatico />} />
      <Route path="/Comunidade" element={<Comunidade />} />
      <Route path="/Evento" element={<Evento />} />
      <Route path="/Lists" element={<Lists />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/dashboard" element={<UserDashboard />} />
    </Routes>
  );
}
