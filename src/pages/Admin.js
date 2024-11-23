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
            <h1>Panel de Administración</h1>
            <ul className="admin-links">
                <li>
                    <Link to="/creareventos">Crear Eventos</Link>
                </li>
                <li>
                    <Link to="/crearusuario">Crear Usuarios</Link>
                </li>
                <li>
                    <Link to="/adminusuarios">Administrar Usuarios</Link>
                </li>
                <li>
                    <Link to="/promocionyrecordatorios">Promoción y Recordatorios</Link>
                </li>
                <li>
                    <Link to="/estadisticas">Estadísticas</Link>
                </li>
            </ul>
        </div>
    );
};

export default Admin;
