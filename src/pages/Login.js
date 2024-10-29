// src/pages/login.js
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import '../styles/login.css'; // Asegúrate de importar tu CSS

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setEmail('');
      setPassword('');
      navigate('/'); // Redirige al usuario a la página de inicio
    } catch (err) {
      let errorMessage;
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No hay una cuenta registrada con este email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'La contraseña es incorrecta.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El email ingresado no es válido.';
          break;
        default:
          errorMessage = 'Ocurrió un error. Inténtalo de nuevo.';
      }
      setError(errorMessage);
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Se ha enviado un correo electrónico para restablecer la contraseña.');
      setError('');
    } catch (error) {
      setError('Error al enviar el correo electrónico: ' + error.message);
      setMessage('');
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleLogin} className="form">
        <h1 className="title">Login</h1>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="input"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            className="input"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-container">
          <button type="submit" className="btn">Iniciar Sesión</button>
          <button type="button" onClick={handleResetPassword} className="btn-link">Restablecer Contraseña</button>
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
