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
import '../styles/user.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const User = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
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
            const userData = querySnapshot.docs[0].data();
            setNombre(userData.nombre || '');
            setApellido(userData.apellido || '');
            setTelefono(userData.telefono || '');
            setUsuarioTelegram(userData.usuarioTelegram || '');
          } else {
            toast.error('No se encontró información del usuario en la base de datos.');
          }
        }
      } catch (err) {
        toast.error('Error al obtener información del usuario: ' + err.message);
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
          telefono,
          usuarioTelegram,
          fechaHoraModificacion: serverTimestamp(),
        });

        toast.success('Usuario actualizado correctamente');
      } else {
        toast.error('Usuario no encontrado');
      }
    } catch (err) {
      toast.error('Error al actualizar la información del usuario: ' + err.message);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (usuario && usuario.email) {
        await sendPasswordResetEmail(auth, usuario.email);
        toast.success('Se ha enviado un correo para restablecer tu contraseña.');
      } else {
        toast.error('No se pudo restablecer la contraseña. Asegúrate de estar conectado.');
      }
    } catch (err) {
      toast.error('Error al enviar el correo de restablecimiento: ' + err.message);
    }
  };

  return (
    <div className="user-form-container">
      <h1>Perfil de usuario</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            className="form-control"
            type="text"
            value={nombre}
            readOnly
          />
          <span className="error-message">Este campo solo puede ser modificado por el administrador</span>
        </div>

        <div className="form-group">
          <label htmlFor="apellido">Apellidos</label>
          <input
            id="apellido"
            className="form-control"
            type="text"
            value={apellido}
            readOnly
          />
          <span className="error-message">Este campo solo puede ser modificado por el administrador</span>
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

        {usuario && (
          <div className="user-info">
            <button className="btn-link" onClick={handleResetPassword}>Restablecer contraseña</button>
          </div>
        )}
      </form>

      <ToastContainer />
    </div>
  );
};

export default User;
