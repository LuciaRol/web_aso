import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer'; // Import the Footer component
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import CreateGame from './pages/CreateGame';
import Eventos from './pages/Eventos';
import GameList from './pages/GameList';
import Home from './pages/Home';
import ListaUsuarios from './pages/ListaUsuarios';
import Login from './pages/Login';
import Ludoteca from './pages/Ludoteca';
import RegistroInvitados from './pages/RegistroInvitados';
import Usuario from './pages/Usuario';
import AdminUsuario from './pages/AdminUsuario';
import WhoWeAre from './pages/WhoWeAre';

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
        <Route path="/adminusuario" element={<ProtectedRoute element={<AdminUsuario />} />} />
        <Route path="/ListaUsuarios" element={<ProtectedRoute element={<ListaUsuarios />} />} />
        <Route path="/RegistroInvitados" element={<ProtectedRoute element={<RegistroInvitados />} />} />
        <Route path="/Ludoteca" element={<Ludoteca />} />
        <Route path="/login" element={<Home />} />
      </Routes>
      <Footer /> {/* Include the Footer component */}
    </Router>
  );
};

export default App;
