import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import '../styles/admin.css';

const Admin = () => {
    const [user] = useAuthState(auth);
    const navigate = useNavigate();
    const db = getFirestore();
    const [isAdmin, setIsAdmin] = React.useState(false);

    useEffect(() => {
        const checkUserRole = async () => {
            if (user) {
                try {
                    const usersRef = collection(db, 'users');
                    const q = query(usersRef, where('email', '==', user.email.trim().toLowerCase()));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        const userData = querySnapshot.docs[0].data();
                        if (userData.role === 'admin') {
                            setIsAdmin(true);
                        } else {
                            navigate('/'); // Redirigir si no es admin
                        }
                    } else {
                        navigate('/'); // Redirigir si no hay datos del usuario
                    }
                } catch (error) {
                    console.error('Error al verificar el rol del usuario:', error);
                    navigate('/'); // Redirigir en caso de error
                }
            } else {
                navigate('/login'); // Redirigir si no está autenticado
            }
        };

        checkUserRole();
    }, [user, navigate, db]);

    if (!isAdmin) {
        return null; // Mostrar nada mientras verifica el rol
    }

    return (
        <div className="admin-container">
            <h1>Panel de administración</h1>
            <div className="admin-grid">
                <div className="admin-box">
                    <Link to="/CreateEvents">Gestionar eventos</Link>
                </div>
                <div className="admin-box">
                    <Link to="/CreateUser">Crear usuarios</Link>
                </div>
                <div className="admin-box">
                    <Link to="/AdminUsers">Gestionar usuarios</Link>
                </div>
                <div className="admin-box">
                    <Link to="/Reminder">Recordatorios</Link>
                </div>
                <div className="admin-box">
                    <Link to="/Statistics">Estadísticas</Link>
                </div>
                <div className="admin-box">
                    <Link to="/LoanedGames">Juegos prestados</Link>
                </div>
                <div className="admin-box">
                    <Link to="/GuestList">Listado de invitados</Link>
                </div>
            </div>
        </div>
    );
};

export default Admin;
