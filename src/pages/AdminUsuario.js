import { getFirestore, addDoc, collection, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/usuario.css';
import { getAuth, deleteUser, createUserWithEmailAndPassword } from "firebase/auth";

const AdminUsuario = () => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [password, setPassword] = useState(''); // Password for new users
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuarios, setUsuarios] = useState([]); // Get all users
  const [isAdmin, setIsAdmin] = useState(false); // Check that user is admin

  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsuarios(); // Load all users
      checkIfUserIsAdmin(usuario.email); // Check if admin user
    }
  }, [usuario]);

  // Function to check if admin user
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

  // Function to get all users from Firestore
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

  // Function to add new user to db and authentication
  const handleAddNewUser = async (event) => {
    event.preventDefault();
    try {
      // Create user in firebase authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional data in Firestore, including UID
      await addDoc(collection(firestore, 'users'), {
        uid: user.uid,  // Store UID in db
        email: user.email,
        role: 'user', // Default role user
        nombre: nombre,
        apellido: apellido,
        telefono,
        usuarioTelegram,
        fechaHoraRegistro: serverTimestamp(),
        fechaHoraModificacion: serverTimestamp(),
      });

      setExito('Nuevo usuario agregado exitosamente');
      // Clean form
      setEmail('');
      setPassword('');
      setNombre('');
      setApellido('');
      setTelefono('');
      setUsuarioTelegram('');
    } catch (err) {
      setError('Error al agregar nuevo usuario: ' + err.message);
      setExito('');
    }
  };

  // Function to update the role of a user
  const handleUpdateRole = async (userId, newRole) => {
    // Only an admin can update the role
    if (!isAdmin) {
      setError('No tienes permisos para cambiar el rol de este usuario.');
      return;
    }

    if (newRole === 'user' || newRole === 'admin' || newRole === 'ludotecario') {
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
      setError('Rol inválido. Solo se permiten los roles "user", "ludotecario" o "admin".');
    }
  };

  const handleDeleteUser = async (userId) => {
    // Only an admin can delete a user
    if (!isAdmin) {
      setError('No tienes permisos para eliminar usuarios.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmation) {
      try {
        // Get the user document from Firestore
        const usuarioRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(usuarioRef);

        if (userDoc.exists()) {
          // Delete the Firestore document
          await deleteDoc(usuarioRef);
          setExito('Usuario eliminado correctamente');
          fetchUsuarios(); // Reload the user list if needed
        } else {
          setError('No se encontró el usuario en Firestore.');
        }
      } catch (err) {
        setError('Error al eliminar el usuario: ' + err.message);
      }
    }
  };

  return (
    <div className="form-container">
      <h1>Tu información de usuario</h1>

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

          <div className="form-group">
            <label htmlFor="new-nombre">Nombre</label>
            <input
              id="new-nombre"
              className="form-control"
              type="text"
              placeholder="Nombre del nuevo usuario"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-apellido">Apellido</label>
            <input
              id="new-apellido"
              className="form-control"
              type="text"
              placeholder="Apellido del nuevo usuario"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-telefono">Teléfono</label>
            <input
              id="new-telefono"
              className="form-control"
              type="text"
              placeholder="Teléfono del nuevo usuario"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-usuarioTelegram">Usuario Telegram</label>
            <input
              id="new-usuarioTelegram"
              className="form-control"
              type="text"
              placeholder="Usuario Telegram del nuevo usuario"
              value={usuarioTelegram}
              onChange={(e) => setUsuarioTelegram(e.target.value)}
            />
          </div>

       

          <button className="submit-button" type="submit">Agregar Usuario</button>
        </form>
      )}

      {isAdmin && (
        <div>
          <h2>Administrar Usuarios</h2>
          <ul>
            {usuarios.map((usuario) => (
              <li key={usuario.id}>
                <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Rol:</strong> {usuario.role}</p>

                <select
                  onChange={(e) => handleUpdateRole(usuario.id, e.target.value)}
                  defaultValue={usuario.role}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="ludotecario">Ludotecario</option>
                </select>

                <button
                  onClick={() => handleDeleteUser(usuario.id)}
                >
                  Eliminar Usuario
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {exito && <div className="success">{exito}</div>}
    </div>
  );
};

export default AdminUsuario;
