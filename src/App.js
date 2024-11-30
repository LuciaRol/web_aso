import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react" // Vercel Analytics
import './App.css';
import Footer from './components/Footer'; // Import the Footer component
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import CreateGame from './pages/CreateGame';
import Eventos from './pages/Eventos';
import GameList from './pages/GameList';
import Home from './pages/Home';
import Login from './pages/Login';
import Ludoteca from './pages/Ludoteca';
import RegistroInvitados from './pages/RegistroInvitados';
import Usuario from './pages/Usuario';
import CrearUsuario from './pages/CrearUsuario';
import AdminUsuarios from './pages/AdminUsuarios';
import WhoWeAre from './pages/WhoWeAre';
import Estadisticas from './pages/Estadisticas';
import CrearEventos from './pages/CrearEventos';
import PromocionYRecordatorios from './pages/PromoRecordatorios';
import JuegosPrestados from './pages/JuegosPrestados';
import ListaInvitados from './pages/ListaInvitados';

import Admin from './pages/Admin';


const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendariopartidas" element={<GameList />} />
        <Route path="/crearpartida" element={<ProtectedRoute element={<CreateGame />} />} />
        <Route path="/quienessomos" element={<WhoWeAre />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/usuario" element={<ProtectedRoute element={<Usuario />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
        <Route path="/crearusuario" element={<ProtectedRoute element={<CrearUsuario />} />} />
        <Route path="/adminusuarios" element={<ProtectedRoute element={<AdminUsuarios />} />} />
        <Route path="/RegistroInvitados" element={<ProtectedRoute element={<RegistroInvitados />} />} />
        <Route path="/creareventos" element={<ProtectedRoute element={<CrearEventos />} />} />
        <Route path="/promocionyrecordatorios" element={<ProtectedRoute element={<PromocionYRecordatorios />} />} />
        <Route path="/estadisticas" element={<ProtectedRoute element={<Estadisticas />} />} />
        <Route path="/juegosprestados" element={<ProtectedRoute element={<JuegosPrestados />} />} />
        <Route path="/listainvitados" element={<ProtectedRoute element={<ListaInvitados />} />} />
        <Route path="/Ludoteca" element={<Ludoteca />} />
        <Route path="/login" element={<Home />} />
      </Routes>
      <Footer /> {/* Include the Footer component */}
    </Router>
  );
};

export default App;
