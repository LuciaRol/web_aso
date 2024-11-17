import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  query, 
  where 
} from 'firebase/firestore';
import { auth } from '../firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/usuario.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const Usuario = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (usuario && usuario.email) {
          const firestore = getFirestore();
          const userQuery = query(
            collection(firestore, 'users'),
            where('email', '==', usuario.email)
          );

          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data(); // Obtenemos los datos del usuario
            setNombre(userData.nombre || '');
            setApellido(userData.apellido || '');
            setTelefono(userData.telefono || '');
            setUsuarioTelegram(userData.usuarioTelegram || '');
          } else {
            setError('No se encontró información del usuario en la base de datos.');
          }
        }
      } catch (err) {
        setError('Error al obtener información del usuario: ' + err.message);
      }
    };

    fetchUserData();
  }, [usuario]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      const email = user.email;
      const firestore = getFirestore();

      const userQuery = query(
        collection(firestore, 'users'),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const usuarioExistente = querySnapshot.docs[0];
        const usuarioRef = doc(firestore, 'users', usuarioExistente.id);

        await updateDoc(usuarioRef, {
          nombre,
          apellido,
          telefono,
          usuarioTelegram,
          fechaHoraModificacion: serverTimestamp(),
        });

        setExito('Usuario actualizado correctamente');
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      setError('Error al actualizar la información del usuario: ' + err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (usuario && usuario.email) {
        await sendPasswordResetEmail(auth, usuario.email);
        setExito('Se ha enviado un correo para restablecer tu contraseña.');
      } else {
        setError('No se pudo restablecer la contraseña. Asegúrate de estar conectado.');
      }
    } catch (err) {
      setError('Error al enviar el correo de restablecimiento: ' + err.message);
    }
  };

  return (
    <div className="form-container">
      
      <h1>Modifica tu información de usuario</h1>

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
            placeholder="Usuario Telegram"
            value={usuarioTelegram}
            onChange={(e) => setUsuarioTelegram(e.target.value)}
            required
          />
        </div>

        <button className="submit-button" type="submit">Guardar</button>
      </form>

      {exito && <div className="success-message">{exito}</div>}
      {error && <div className="error-message">{error}</div>}
      {usuario && (
        <div className="user-info">
          <button className="submit-button" onClick={handleResetPassword}>Restablecer Contraseña</button>
        </div>
      )}
    </div>
  );
};

export default Usuario;
