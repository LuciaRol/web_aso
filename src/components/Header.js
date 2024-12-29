import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import defaultImage from '../img/meeple_logo.png';
import '../styles/header.css';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Header = () => {
    const [user] = useAuthState(auth);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    const db = getFirestore();

    useEffect(() => {
        setIsLoggedIn(!!user); // Check if user is authenticated

        const fetchUserRole = async () => {
            if (user) {
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', user.email.trim().toLowerCase()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data(); 
                        setUserRole(userData.role);
                    } else {
                        console.error('No se encontró un usuario con el email proporcionado en Firestore.');
                        setUserRole(null);
                    }
                } catch (error) {
                    console.error('Error al obtener el rol del usuario:', error);
                }
            }
        };

        fetchUserRole();
    }, [user, db]);

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

    const closeMenu = () => {
        setIsMenuOpen(false); // Cierra el menú al hacer clic en cualquier enlace
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-logo-container">
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
                            <Link
                                to="/"
                                className={window.location.pathname === '/' ? 'active' : ''}
                                onClick={closeMenu} // Cerrar el menú al hacer clic
                            >
                                Inicio
                            </Link>
                        </li>
                        {!isLoggedIn && (
                            <>
                                <li>
                                    <Link
                                        to="/Events"
                                        className={window.location.pathname === '/Events' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Eventos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/calendariopartidas"
                                        className={window.location.pathname === '/calendariopartidas' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Partidas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/quienessomos"
                                        className={window.location.pathname === '/quienessomos' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        ¿Quiénes somos?
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/Ludoteca"
                                        className={window.location.pathname === '/Ludoteca' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Ludoteca
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/login"
                                        className={window.location.pathname === '/login' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Login
                                    </Link>
                                </li>
                            </>
                        )}
                        {isLoggedIn && (
                            <>  
                                <li>
                                    <Link
                                        to="/Events"
                                        className={window.location.pathname === '/Events' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Eventos
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/crearpartida"
                                        className={window.location.pathname === '/crearpartida' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Crear Partida
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/calendariopartidas"
                                        className={window.location.pathname === '/calendariopartidas' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Partidas
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/GuestRegistry"
                                        className={window.location.pathname === '/GuestRegistry' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Registro Invitados
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/ludoteca"
                                        className={window.location.pathname === '/Ludoteca' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Solicitar Juego
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/User"
                                        className={window.location.pathname === '/User' ? 'active' : ''}
                                        onClick={closeMenu}
                                    >
                                        Usuario
                                    </Link>
                                </li>
                                {userRole === 'admin' && (
                                    <li>
                                        <Link
                                            to="/admin"
                                            className={window.location.pathname === '/admin' ? 'active' : ''}
                                            onClick={closeMenu}
                                        >
                                            Admin
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button onClick={handleLogout} className="logout-btn">
                                        Logout
                                    </button>
                                </li>
                                
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
