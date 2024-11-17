import { getFirestore, addDoc, collection, getDocs, getDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, startAfter, limit, getCountFromServer } from 'firebase/firestore';
import { auth, firestore } from '../firebase';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/usuario.css';

const AdminUsuarios = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuarios, setUsuarios] = useState([]); // Todos los usuarios
  const [isAdmin, setIsAdmin] = useState(false); // Estado para verificar si el usuario es admin
  const [lastVisible, setLastVisible] = useState(null); // Último documento para la paginación
  const [loading, setLoading] = useState(false); // Estado de carga
  const [page, setPage] = useState(1); // Página actual
  const [errorPagination, setErrorPagination] = useState(''); // Error en la paginación
  const [totalUsuarios, setTotalUsuarios] = useState(0); // Total de usuarios en la base de datos
  const [usuariosPorPagina] = useState(5); // Número de usuarios por página

  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsuarios(); // Cargar todos los usuarios
      checkIfUserIsAdmin(usuario.email); // Verificamos si el usuario es admin
      fetchTotalUsuarios(); // Obtener el total de usuarios
    }
  }, [usuario, page]);

  // Función para obtener el total de usuarios en la base de datos
  const fetchTotalUsuarios = async () => {
    try {
      const usersRef = collection(firestore, 'users');
      const snapshot = await getCountFromServer(usersRef);
      setTotalUsuarios(snapshot.data().count); // Guardar el total de usuarios
    } catch (err) {
      console.error('Error al obtener el total de usuarios:', err);
    }
  };

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

  // Función para cargar los usuarios con paginación
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      let q;

      if (page === 1) {
        // Si es la primera página, no usamos startAfter
        q = query(usersRef, orderBy('nombre'), limit(usuariosPorPagina));
      } else if (lastVisible) {
        // Usamos startAfter si no estamos en la primera página
        q = query(usersRef, orderBy('nombre'), startAfter(lastVisible), limit(usuariosPorPagina));
      }

      const querySnapshot = await getDocs(q);
      const fetchedUsuarios = [];
      querySnapshot.forEach((doc) => {
        fetchedUsuarios.push({ id: doc.id, ...doc.data() });
      });

      setUsuarios(fetchedUsuarios);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]); // Actualizar el último documento
      setLoading(false);
    } catch (err) {
      setErrorPagination('Error al obtener usuarios: ' + err.message);
      setLoading(false);
    }
  };

  // Función para actualizar el rol de un usuario.
  const handleUpdateRole = async (userId, newRole) => {
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
    if (!isAdmin) {
      setError('No tienes permisos para eliminar usuarios.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmation) {
      try {
        const usuarioRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(usuarioRef);

        if (userDoc.exists()) {
          await deleteDoc(usuarioRef);
          setExito('Usuario eliminado correctamente');
          fetchUsuarios(); // Recargar la lista de usuarios
        } else {
          setError('No se encontró el usuario en Firestore.');
        }
      } catch (err) {
        setError('Error al eliminar el usuario: ' + err.message);
      }
    }
  };

  // Función para ir a la siguiente página
  const nextPage = () => {
    setPage(page + 1);
  };

  // Función para ir a la página anterior
  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Lógica para mostrar u ocultar el botón de "Siguiente"
  const showNextButton = usuarios.length === usuariosPorPagina && page * usuariosPorPagina < totalUsuarios;

  return (
    <div className="form-container">
      {isAdmin && (
        <div>
          <h2>Administrar Usuarios</h2>
          <p>Total de usuarios: {totalUsuarios}</p> {/* Mostrar el total de usuarios */}
          <ul>
            {usuarios.map((usuario) => (
              <li key={usuario.id}>
                <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Rol:</strong> {usuario.role}</p>

                <select
                  onChange={(e) => handleUpdateRole(usuario.id, e.target.value)}
                  value={usuario.role}
                >
                  <option value="user">User</option>
                  <option value="ludotecario">Ludotecario</option>
                  <option value="admin">Admin</option>
                </select>
                <button onClick={() => handleDeleteUser(usuario.id)}>Eliminar Usuario</button>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button onClick={prevPage} disabled={page === 1}>Anterior</button>
            <span>Página {page}</span>
            {showNextButton && (
              <button onClick={nextPage}>Siguiente</button>
            )}
          </div>
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {errorPagination && <p>{errorPagination}</p>}
    </div>
  );
};

export default AdminUsuarios;
