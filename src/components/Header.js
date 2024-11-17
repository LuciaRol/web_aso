import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const db = getFirestore();

    useEffect(() => {
        setIsLoggedIn(!!user); // Check if user is authenticated

        // Check once authenticated, if the user has the admin role. If admin role,it will display different header options
        const fetchUserRole = async () => {
            if (user) {
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', user.email.trim().toLowerCase()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data(); // Asumimos un único documento por email
                        setUserRole(userData.role); // Asumimos que el campo del rol es 'role'
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
                    {!isLoggedIn && <li><Link to="/Ludoteca" className={window.location.pathname === '/Ludoteca' ? 'active' : ''}>Ludoteca</Link></li>}
                    {!isLoggedIn && <li><Link to="/login" className={window.location.pathname === '/login' ? 'active' : ''}>Login</Link></li>}
                    {isLoggedIn && <li><Link to="/crearpartida" className={window.location.pathname === '/crearpartida' ? 'active' : ''}>Crear Partida</Link></li>}
                    {isLoggedIn && <li><Link to="/calendariopartidas" className={window.location.pathname === '/calendariopartidas' ? 'active' : ''}>Partidas</Link></li>}
                    {isLoggedIn && <li><Link to="/registroinvitados" className={window.location.pathname === '/RegistroInvitados' ? 'active' : ''}>Registro de Invitados</Link></li>}
                    {isLoggedIn && <li><Link to="/ludoteca" className={window.location.pathname === '/Ludoteca' ? 'active' : ''}>Solicitar Juego</Link></li>}
                    {isLoggedIn && <li><Link to="/usuario" className={window.location.pathname === '/Usuario' ? 'active' : ''}>Usuario</Link></li>}
                    {isLoggedIn && userRole === 'admin' && (
                        <li>
                            <Link
                                to="/crearusuario"
                                className={window.location.pathname === '/crearusuario' ? 'active' : ''}
                            >
                                Crear Usuarios
                            </Link>
                            
                        </li>
                        
                    )}
                    {isLoggedIn && userRole === 'admin' && (
                        <li>
                            <Link
                                to="/adminusuarios"
                                className={window.location.pathname === '/adminusuarios' ? 'active' : ''}
                            >
                                Administrar Usuarios
                            </Link>
                            
                        </li>
                        
                    )}
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
