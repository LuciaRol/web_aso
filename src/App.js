import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Footer from './components/Footer'; // Import the Footer component
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import CreateGame from './pages/CreateGame';
import Events from './pages/Events';
import GameList from './pages/GameList';
import Home from './pages/Home';
import Login from './pages/Login';
import Ludoteca from './pages/Ludoteca';
import RegistroInvitados from './pages/RegistroInvitados';
import Usuario from './pages/Usuario';
import CreateUser from './pages/CreateUser';
import AdminUsers from './pages/AdminUsers';
import WhoWeAre from './pages/WhoWeAre';
import Statistics from './pages/Statistics';
import CreateEvents from './pages/CreateEvents';
import PromocionYRecordatorios from './pages/PromoRecordatorios';
import LoanedGames from './pages/LoanedGames';
import GuestList from './pages/GuestList';
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
        <Route path="/Events" element={<Events />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/usuario" element={<ProtectedRoute element={<Usuario />} />} />
        <Route path="/admin" element={<ProtectedRoute element={<Admin />} />} />
        <Route path="/CreateUser" element={<ProtectedRoute element={<CreateUser />} />} />
        <Route path="/AdminUsers" element={<ProtectedRoute element={<AdminUsers />} />} />
        <Route path="/RegistroInvitados" element={<ProtectedRoute element={<RegistroInvitados />} />} />
        <Route path="/CreateEvents" element={<ProtectedRoute element={<CreateEvents />} />} />
        <Route path="/promocionyrecordatorios" element={<ProtectedRoute element={<PromocionYRecordatorios />} />} />
        <Route path="/Statistics" element={<ProtectedRoute element={<Statistics />} />} />
        <Route path="/LoanedGames" element={<ProtectedRoute element={<LoanedGames />} />} />
        <Route path="/GuestList" element={<ProtectedRoute element={<GuestList />} />} />
        <Route path="/Ludoteca" element={<Ludoteca />} />
        <Route path="/login" element={<Home />} />
      </Routes>
      <Footer /> {/* Include the Footer component */}
    </Router>
  );
};

export default App;
