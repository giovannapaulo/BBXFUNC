import { Route, Routes } from 'react-router-dom';
import Home from './Home';
import Generos from './Generos';
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
      <Route path="/Comunidade" element={<Comunidade />} />
      <Route path="/Evento" element={<Evento />} />
      <Route path="/Lists" element={<Lists />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/UserDashboard" element={<UserDashboard />} />
    </Routes>
  );
}
