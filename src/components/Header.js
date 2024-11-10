import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import defaultImage from '../img/meeple_logo.png';
import '../styles/header.css';

const Header = () => {
    const [user] = useAuthState(auth);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoggedIn(!!user); // Verifica si hay un usuario autenticado
    }, [user]);

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/');
        } catch (error) {
            console.error('Error al intentar cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="header">
        <div className="header-content">
            <div className="header-logo-container"> {/* Nuevo contenedor para el logo */}
                <Link to="/">
                    <img src={defaultImage} alt="Dragon" className="header-logo" />
                </Link>
                 <button className="menu-toggle" onClick={toggleMenu}>
                &#9776; {/* Ícono de menú hamburguesa */}
            </button>
            </div>
            <nav className={`header-nav-container ${isMenuOpen ? 'open' : ''}`}>
                <ul className="header-nav">
                    <li>
                        <Link to="/" className={window.location.pathname === '/' ? 'active' : ''}>Inicio</Link>
                    </li>
                    {!isLoggedIn && <li><Link to="/eventos" className={window.location.pathname === '/eventos' ? 'active' : ''}>Eventos</Link></li>}
                    {!isLoggedIn && <li><Link to="/calendariopartidas" className={window.location.pathname === '/calendariopartidas' ? 'active' : ''}>Partidas</Link></li>}
                    {!isLoggedIn && <li><Link to="/quienessomos" className={window.location.pathname === '/quienessomos' ? 'active' : ''}>¿Quiénes somos?</Link></li>}
                    {!isLoggedIn && <li><Link to="/PrestamosJuegos" className={window.location.pathname === '/PrestamosJuegos' ? 'active' : ''}>Ludoteca</Link></li>}
                    {!isLoggedIn && <li><Link to="/login" className={window.location.pathname === '/login' ? 'active' : ''}>Login</Link></li>}
                    {isLoggedIn && <li><Link to="/crearpartida" className={window.location.pathname === '/crearpartida' ? 'active' : ''}>Crear Partida</Link></li>}
                    {isLoggedIn && <li><Link to="/calendariopartidas" className={window.location.pathname === '/calendariopartidas' ? 'active' : ''}>Partidas</Link></li>}
                    {isLoggedIn && <li><Link to="/RegistroInvitados" className={window.location.pathname === '/RegistroInvitados' ? 'active' : ''}>Registro de Invitados</Link></li>}
                    {isLoggedIn && <li><Link to="/PrestamosJuegos" className={window.location.pathname === '/PrestamosJuegos' ? 'active' : ''}>Solicitar Juego</Link></li>}
                    {isLoggedIn && <li><Link to="/Usuario" className={window.location.pathname === '/Usuario' ? 'active' : ''}>Usuario</Link></li>}
                    {isLoggedIn && (
                    <li>
                        <button onClick={handleLogout} className="logout-btn">
                            Logout
                        </button>
                    </li>
                    )}
                </ul>
            </nav>

            </div>
        </header>
    );
};

export default Header;
