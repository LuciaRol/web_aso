import { addDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/user.css';
import { createUserWithEmailAndPassword, signOut} from "firebase/auth";

const CreateUser = () => {
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

 

  // Función para agregar nuevo usuario
  const handleAddNewUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Crear nuevo usuario con email y contraseña
      const userCredential = await createUserWithEmailAndPassword(auth, nuevoEmail, nuevaContraseña);
      const user = userCredential.user;
      

      // Se almacenará en la colección 'users' de Firestore
      await addDoc(collection(firestore, 'users'), {
        uid: user.uid,  
        email: user.email,
        role: 'user', // Rol por defecto
        nombre,
        apellido,
        telefono,
        usuarioTelegram,
        fechaHoraRegistro: serverTimestamp(),
        fechaHoraModificacion: serverTimestamp(),
      });

      /* 
      Cerrar sesión para que no se inicie sesión con el nuevo usuario. Este proceso se realiza automáticamente con la función de la línea 52. Se ha diseñado para que cada usuario inicie sesión por sí mismo.
      Según otros requisitos del cliente, se haría siguiendo las sugerencias de Firestore. Aquí, el administrador debe ser quien registre a los nuevos usuarios.
      */
      await signOut(auth);

      setExito('Nuevo usuario agregado exitosamente');
      // Limpia los campos del formulario
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
    <div className="form-container create-user-form-container">
      <h1>Nuevo usuario</h1>
      {/* Formulario de nuevo usuario */}
      {isAdmin && (
        <form onSubmit={handleAddNewUser}>
         
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

export default CreateUser;
