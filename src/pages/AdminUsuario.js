import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/usuario.css';
import { createUserWithEmailAndPassword } from "firebase/auth";

const AdminUsuario = () => {
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (usuario && usuario.email) {
      checkIfUserIsAdmin(usuario.email);
    }
  }, [usuario]);

  // Function to check if user is an admin
  const checkIfUserIsAdmin = async (email) => {
    try {
      const usersRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersRef);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.role === 'admin') {
          setIsAdmin(true);
        }
      });
    } catch (err) {
      console.error('Error al verificar si el usuario es admin:', err);
    }
  };

 

  // Function to add a new user
  const handleAddNewUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, nuevoEmail, nuevaContraseña);
      const user = userCredential.user;

      // Store additional data in Firestore, including UID
      await addDoc(collection(firestore, 'users'), {
        uid: user.uid,  // Store UID in db
        email: user.email,
        role: 'user', // Default role user
        nombre,
        apellido,
        telefono,
        usuarioTelegram,
        fechaHoraRegistro: serverTimestamp(),
        fechaHoraModificacion: serverTimestamp(),
      });

      setExito('Nuevo usuario agregado exitosamente');
      // Clear form fields after submission
      setNuevoEmail('');
      setNuevaContraseña('');
      setNombre('');
      setApellido('');
      setTelefono('');
      setUsuarioTelegram('');
    } catch (err) {
      setError('Error al agregar nuevo usuario: ' + err.message);
      setExito('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Tu información de usuario</h1>

      {isAdmin && (
        <form onSubmit={handleAddNewUser}>
          <h2>Agregar Nuevo Usuario</h2>
          <div className="form-group">
            <label htmlFor="nuevo-email">Email</label>
            <input
              id="nuevo-email"
              className="form-control"
              type="email"
              placeholder="Email del nuevo usuario"
              value={nuevoEmail}
              onChange={(e) => setNuevoEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nueva-contraseña">Contraseña</label>
            <input
              id="nueva-contraseña"
              className="form-control"
              type="password"
              placeholder="Contraseña del nuevo usuario"
              value={nuevaContraseña}
              onChange={(e) => setNuevaContraseña(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nuevo-nombre">Nombre</label>
            <input
              id="nuevo-nombre"
              className="form-control"
              type="text"
              placeholder="Nombre del nuevo usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nuevo-apellido">Apellido</label>
            <input
              id="nuevo-apellido"
              className="form-control"
              type="text"
              placeholder="Apellido del nuevo usuario"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nuevo-telefono">Teléfono</label>
            <input
              id="nuevo-telefono"
              className="form-control"
              type="text"
              placeholder="Teléfono del nuevo usuario"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="nuevo-usuarioTelegram">Usuario Telegram</label>
            <input
              id="nuevo-usuarioTelegram"
              className="form-control"
              type="text"
              placeholder="Usuario Telegram del nuevo usuario"
              value={usuarioTelegram}
              onChange={(e) => setUsuarioTelegram(e.target.value)}
            />
          </div>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Agregando...' : 'Agregar Usuario'}
          </button>
        </form>
      )}

      {error && <div className="error">{error}</div>}
      {exito && <div className="success">{exito}</div>}
    </div>
  );
};

export default AdminUsuario;
