import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getDocs, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/usuario.css';

const Usuario = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [tiposJuegosFavoritos, setTiposJuegosFavoritos] = useState([]);
  const [password, setPassword] = useState(''); // Contraseña para el nuevo usuario
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuarios, setUsuarios] = useState([]); // Todos los usuarios
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin

  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsuarios(); // Cargar todos los usuarios
      checkIfUserIsAdmin(usuario.email); // Verificamos si el usuario es admin
    }
  }, [usuario]);

  // Función para verificar si el usuario actual es admin
  const checkIfUserIsAdmin = async (email) => {
    try {
      const usersRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersRef);
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.role === 'admin') {
          setIsAdmin(true); // Si el usuario tiene rol 'admin', actualizamos el estado
        }
      });
    } catch (err) {
      console.error('Error al verificar si el usuario es admin:', err);
    }
  };

  // Función para cargar todos los usuarios desde Firestore
  const fetchUsuarios = async () => {
    try {
      const usersRef = collection(firestore, 'users');
      const querySnapshot = await getDocs(usersRef);
      const fetchedUsuarios = [];
      querySnapshot.forEach((doc) => {
        fetchedUsuarios.push({ id: doc.id, ...doc.data() });
      });
      setUsuarios(fetchedUsuarios);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const role = 'user'; // Asignar 'user' por defecto, pero los admins pueden cambiarlo

      // Si el usuario ya existe, actualizamos su información
      const usuarioExistente = usuarios.find((u) => u.email === email);

      if (usuarioExistente) {
        // Verificar si el usuario es admin para permitir actualizar el rol
        if (isAdmin) {
          const usuarioRef = doc(firestore, 'users', usuarioExistente.id);
          await updateDoc(usuarioRef, {
            nombre,
            apellido,
            telefono,
            usuarioTelegram,
            tiposJuegosFavoritos,
            role, // Incluye el rol al actualizar
            fechaHoraModificacion: serverTimestamp(),
          });
          setExito('Usuario actualizado exitosamente');
        } else {
          setError('No tienes permisos para actualizar el rol de otros usuarios.');
        }
      } else {
        // Si el usuario no existe, se agrega uno nuevo
        if (isAdmin) {
          await addDoc(collection(firestore, 'users'), {
            nombre,
            apellido,
            email,
            telefono,
            usuarioTelegram,
            tiposJuegosFavoritos,
            role, // Asignar el rol al nuevo usuario
            fechaHoraRegistro: serverTimestamp(),
            fechaHoraModificacion: serverTimestamp(),
          });
          setExito('Usuario agregado exitosamente');
        } else {
          setError('No tienes permisos para agregar un usuario.');
        }
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

  // Función para agregar un nuevo usuario con email y contraseña
  const handleAddNewUser = async (event) => {
    event.preventDefault();
    try {
      // Crear el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;
      // Almacenar los datos adicionales en Firestore
      await addDoc(collection(firestore, 'users'), {
        email: user.email,
        role: 'user', // Rol por defecto
        nombre: nombre,
        apellido: apellido,
        telefono,
        usuarioTelegram,
        tiposJuegosFavoritos,
        fechaHoraRegistro: serverTimestamp(),
        fechaHoraModificacion: serverTimestamp(),
      });

      setExito('Nuevo usuario agregado exitosamente');
      setEmail('');
      setPassword('');
      setNombre('');
      setApellido('');
      setTelefono('');
      setUsuarioTelegram('');
      setTiposJuegosFavoritos([]);
    } catch (err) {
      setError('Error al agregar nuevo usuario: ' + err.message);
      setExito('');
    }
  };

  const handleUpdateRole = async (userId) => {
    // Solo un admin puede actualizar el rol
    if (!isAdmin) {
      setError('No tienes permisos para cambiar el rol de este usuario.');
      return;
    }

    const newRole = prompt('Ingrese el nuevo rol para el usuario (user/admin):');
    if (newRole === 'user' || newRole === 'admin') {
      try {
        const usuarioRef = doc(firestore, 'users', userId);
        await updateDoc(usuarioRef, {
          role: newRole,
          fechaHoraModificacion: serverTimestamp(),
        });
        setExito('Rol actualizado correctamente');
      } catch (err) {
        setError('Error al actualizar el rol: ' + err.message);
      }
    } else {
      setError('Rol inválido. Solo se permiten los roles "user" o "admin".');
    }
  };

  // Función para eliminar un usuario
  const handleDeleteUser = async (userId) => {
    // Solo un admin puede eliminar un usuario
    if (!isAdmin) {
      setError('No tienes permisos para eliminar usuarios.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmation) {
      try {
        const usuarioRef = doc(firestore, 'users', userId);
        await deleteDoc(usuarioRef);
        setExito('Usuario eliminado correctamente');
        fetchUsuarios(); // Recargar la lista de usuarios
      } catch (err) {
        setError('Error al eliminar el usuario: ' + err.message);
      }
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

      {usuario && (
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

        <div className="form-group">
          <label htmlFor="tiposJuegosFavoritos">Tipos de Juegos Favoritos</label>
          <input
            id="tiposJuegosFavoritos"
            className="form-control"
            type="text"
            placeholder="Tipos de Juegos Favoritos"
            value={tiposJuegosFavoritos.join(', ')}
            onChange={(e) => setTiposJuegosFavoritos(e.target.value.split(','))}
            required
          />
        </div>

        <button className="submit-button" type="submit">Guardar</button>
      </form>

      {exito && <div className="success-message">{exito}</div>}
      {error && <div className="error-message">{error}</div>}

      {isAdmin && (
        <>
          <h2>Todos los Usuarios</h2>
          <ul>
            {usuarios.map((usuario) => (
              <li key={usuario.id}>
                <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Tipo de juegos favoritos:</strong> {usuario.tiposJuegosFavoritos.join(', ')}</p>
                <p><strong>Rol:</strong> {usuario.role}</p>
                <button onClick={() => handleUpdateRole(usuario.id)}>Cambiar Rol</button>
                <button onClick={() => handleDeleteUser(usuario.id)}>Eliminar Usuario</button>
              </li>
            ))}
          </ul>
        </>
      )}

      {isAdmin && (
        <form onSubmit={handleAddNewUser}>
          <h2>Agregar Nuevo Usuario</h2>
          <div className="form-group">
            <label htmlFor="new-email">Email</label>
            <input
              id="new-email"
              className="form-control"
              type="email"
              placeholder="Email del nuevo usuario"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-password">Contraseña</label>
            <input
              id="new-password"
              className="form-control"
              type="password"
              placeholder="Contraseña del nuevo usuario"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="submit-button" type="submit">Agregar Usuario</button>
        </form>
      )}
    </div>
  );
};

export default Usuario;
