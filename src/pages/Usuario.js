import { sendPasswordResetEmail } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore'; // Importa funciones necesarias desde firestore

import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth'; // Importa useAuthState para obtener el usuario autenticado
import { auth, firestore } from '../firebase'; // Importa firestore desde firebase.js
import '../styles/usuario.css'; // Import the CSS file



const Usuario = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [tiposJuegosFavoritos, setTiposJuegosFavoritos] = useState([]); // Nuevo estado para tipos de juegos favoritos
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuariosConMismoEmail, setUsuariosConMismoEmail] = useState([]);
  const [user] = useAuthState(auth);

  const handleResetPassword = () => {
    if (user && user.email) {
      sendPasswordResetEmail(auth, user.email)
        .then(() => {
          alert('Se ha enviado un correo electrónico para restablecer la contraseña.');
        })
        .catch((error) => {
          console.error('Error al enviar el correo electrónico:', error.message);
        });
    } else {
      alert('No se puede restablecer la contraseña. Asegúrate de haber iniciado sesión.');
    }
  };

  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsuariosConMismoEmail(usuario.email);
    }
  }, [usuario]);

  const fetchUsuariosConMismoEmail = async (email) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      const fetchedUsuarios = [];
      querySnapshot.forEach((doc) => {
        fetchedUsuarios.push({ id: doc.id, ...doc.data() });
      });
      setUsuariosConMismoEmail(fetchedUsuarios);
    } catch (err) {
      console.error('Error al obtener usuarios con el mismo email:', err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const usuarioExistente = usuariosConMismoEmail.find((u) => u.email === email);

      if (usuarioExistente) {
        const usuarioRef = doc(firestore, 'users', usuarioExistente.id);
        await updateDoc(usuarioRef, {
          nombre,
          apellido,
          telefono,
          usuarioTelegram,
          tiposJuegosFavoritos, // Incluye los tipos de juegos favoritos en la actualización
          fechaHoraModificacion: serverTimestamp(),
        });
        setExito('Usuario actualizado exitosamente');
      } else {
        await addDoc(collection(firestore, 'users'), {
          nombre,
          apellido,
          email,
          telefono,
          usuarioTelegram,
          tiposJuegosFavoritos, // Incluye los tipos de juegos favoritos en el nuevo documento
          fechaHoraRegistro: serverTimestamp(),
          fechaHoraModificacion: serverTimestamp(),
        });
        setExito('Usuario agregado exitosamente');
      }

      setNombre('');
      setApellido('');
      setTelefono('');
      setUsuarioTelegram('');
      setTiposJuegosFavoritos([]);
      setError('');
    } catch (err) {
      setError('Error al agregar o actualizar usuario: ' + err.message);
      setExito('');
    }
  };

  return (
    <div className="form-container">
      <h1>Modifica tu información de usuario</h1>
      
      {user && (
        <div className="form-group">
          <button className="submit-button" onClick={handleResetPassword}>Restablecer Contraseña</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            className="form-control"
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="apellido">Apellido</label>
          <input
            id="apellido"
            className="form-control"
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="form-control"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            className="form-control"
            type="text"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="usuarioTelegram">Usuario Telegram</label>
          <input
            id="usuarioTelegram"
            className="form-control"
            type="text"
            value={usuarioTelegram}
            onChange={(e) => setUsuarioTelegram(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tiposJuegosFavoritos">Tipos de juegos favoritos</label>
          <select
            id="tiposJuegosFavoritos"
            className="form-control"
            multiple
            value={tiposJuegosFavoritos}
            onChange={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
              setTiposJuegosFavoritos(selectedOptions);
            }}
          >
            <option value="eurogames">Eurogames</option>
            <option value="ameritrash">Ameritrash</option>
            <option value="rol">Rol</option>
            <option value="wargames">Wargames</option>
            <option value="party">Party</option>
            <option value="lcgs">LCGs</option>
            <option value="tcgs">TCGs</option>
          </select>
        </div>
        
        <button className="submit-button" type="submit">Agregar/Actualizar Usuario</button>
      </form>
      
      {error && <p className="error-message">{error}</p>}
      {exito && <p className="success-message">{exito}</p>}

      {usuariosConMismoEmail.length > 0 && (
        <div className="results-container">
          <h2>Tu información de usuario:</h2>
          <ul>
            {usuariosConMismoEmail.map((usuario) => (
              <li key={usuario.id} className="guest-item">
                <p><strong>Nombre:</strong> {usuario.nombre}</p>
                <p><strong>Apellido:</strong> {usuario.apellido}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                <p><strong>Usuario Telegram:</strong> {usuario.usuarioTelegram}</p>
                <p><strong>Tipos de juegos favoritos:</strong> {usuario.tiposJuegosFavoritos ? usuario.tiposJuegosFavoritos.join(', ') : 'No especificado'}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Usuario;
