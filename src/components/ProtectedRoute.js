// src/components/ProtectedRoute.js
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase';

const ProtectedRoute = ({ element }) => {
    const [user, loading] = useAuthState(auth);

    if (loading) {
        // Opcional: Puedes mostrar un spinner o un componente de carga aquí
        return <div>Loading...</div>;
    }

    if (!user) {
        // Si no está autenticado, redirige a la página de inicio de sesión
        return <Navigate to="/" />;
    }

    // Si está autenticado, renderiza el componente
    return element;
};

export default ProtectedRoute;
