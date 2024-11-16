import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { firestore } from '../firebase'; // Asegúrate de importar Firestore
import { collection, query, where, getDocs } from 'firebase/firestore'; // Métodos para consultar Firestore
import '../styles/login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Check if the email is available in the firestore database as double check security measure
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Este correo electrónico no está registrado en nuestra base de datos.');
        return; // if email is not registered, stop the login process
      }

      // If mail exists, proceed to check the password and log in
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
      setEmail('');
      setPassword('');
      navigate('/'); // Redirect to the home page

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
