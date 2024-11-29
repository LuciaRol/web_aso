import { auth, firestore } from '../firebase';
import React, { useEffect, useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/adminusuarios.css';
import { getFirestore, updateDoc, doc, serverTimestamp, getDocs, query, where, getCountFromServer, collection, orderBy, startAfter, limit, getDoc, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';  // Importar ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos

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

  const [selectedUserId, setSelectedUserId] = useState(null); // Usuario seleccionado para editar
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const formRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el término de búsqueda


  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsuarios(); // Cargar todos los usuarios
      checkIfUserIsAdmin(usuario.email); // Verificamos si el usuario es admin
      fetchTotalUsuarios(); // Obtener el total de usuarios
    }
  
    // Desplazarse al formulario cuando un usuario es seleccionado para editar
    if (selectedUserId) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [usuario, page, selectedUserId, searchTerm]); // Agregar searchTerm como dependencia
  
  
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
  // Función para cargar los usuarios con paginación y filtro de búsqueda
  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      let q;

      // Si hay un término de búsqueda, lo aplicamos en la consulta
      if (searchTerm) {
        q = query(
          usersRef,
          where('nombre', '>=', searchTerm),
          where('nombre', '<=', searchTerm + '\uf8ff'),
          limit(usuariosPorPagina)
        );
      } else {
        // Si no hay búsqueda, simplemente mostramos los usuarios paginados
        if (page === 1) {
          q = query(usersRef, orderBy('nombre'), limit(usuariosPorPagina));
        } else if (lastVisible) {
          q = query(usersRef, orderBy('nombre'), startAfter(lastVisible), limit(usuariosPorPagina));
        }
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


  // Función para actualizar la información del usuario
  const handleUpdateUser = async (userId) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para modificar los datos de otros usuarios.');

      return;
    }

    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        nombre,
        apellido,
        telefono,
        usuarioTelegram,
        fechaHoraModificacion: serverTimestamp(),
      });

      toast.success('Usuario actualizado correctamente');
      fetchUsuarios(); // Recargar la lista de usuarios
      resetForm(); // Resetear el formulario
    } catch (err) {
      toast.error('Error al actualizar la información del usuario: ' + err.message);
    }
  };

  // Resetear formulario después de la actualización
  const resetForm = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setUsuarioTelegram('');
    setSelectedUserId(null);
  };

  // Función para actualizar el rol de un usuario.
  const handleUpdateRole = async (userId, newRole) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para cambiar el rol de este usuario.');

      return;
    }

    if (newRole === 'user' || newRole === 'admin' || newRole === 'ludotecario') {
      try {
        const usuarioRef = doc(firestore, 'users', userId);
        await updateDoc(usuarioRef, {
          role: newRole,
          fechaHoraModificacion: serverTimestamp(),
        });
        toast.success('Rol actualizado correctamente.');
        fetchUsuarios(); // Recargar la lista de usuarios
        resetForm(); // Resetear el formulario
      } catch (err) {
            // Mensaje de éxito
        toast.error('Error al actualizar el rol: ' + err.message);

      }
    } else {
      toast.error('Rol inválido. Solo se permiten los roles "user", "ludotecario" o "admin".');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar usuarios.');
      return;
    }

    const confirmation = window.confirm('¿Estás seguro de que quieres eliminar este usuario?');
    if (confirmation) {
      try {
        const usuarioRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(usuarioRef);

        if (userDoc.exists()) {
          await deleteDoc(usuarioRef);
          toast.success('Usuario eliminado correctamente.');
          fetchUsuarios(); // Recargar la lista de usuarios
        } else {
          toast.error('No se encontró el usuario en Firestore.');
        }
      } catch (err) {
        toast.error('Error al eliminar el usuario: ' + err.message);
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

  const cerrarFormulario = () => {
    fetchUsuarios(); // Recargar la lista de usuarios
    resetForm(); // Resetear el formulario
  }
  // Lógica para mostrar u ocultar el botón de "Siguiente"
  const showNextButton = usuarios.length === usuariosPorPagina && page * usuariosPorPagina < totalUsuarios;

  return (
    <div className="form-container">
       {/* Campo de búsqueda */}
       <div className="search-container">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o telegram"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el término de búsqueda
            />
          </div>
      {isAdmin && (
        <div>
          <h2>Administrar Usuarios</h2>
          <p>Total de usuarios: {totalUsuarios}</p> {/* Mostrar el total de usuarios */}

          <div className="users-grid">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="user-card">
                <p><strong>Nombre:</strong> {usuario.nombre} {usuario.apellido}</p>
                <p><strong>Email:</strong> {usuario.email}</p>
                <p><strong>Teléfono:</strong> {usuario.telefono}</p>
                <p><strong>Rol:</strong> {usuario.role}</p>
                <p><strong>Usuario Telegram:</strong> {usuario.usuarioTelegram}</p>

                {/* Botones para editar el rol y eliminar usuario */}
                <button onClick={() => handleUpdateRole(usuario.id, 'admin')}>Hacer Admin</button>
                <button onClick={() => handleUpdateRole(usuario.id, 'ludotecario')}>Hacer Ludotecario</button>
                <button onClick={() => handleUpdateRole(usuario.id, 'user')}>Hacer Usuario</button>
                <button onClick={() => handleDeleteUser(usuario.id)}>Eliminar Usuario</button>
                <button onClick={() => { 
                  setSelectedUserId(usuario.id); 
                  setNombre(usuario.nombre); 
                  setApellido(usuario.apellido); 
                  setTelefono(usuario.telefono); 
                  setUsuarioTelegram(usuario.usuarioTelegram); 
                }}>
                  Editar Usuario
                </button>
              </div>
            ))}
          </div>
          
  {/* Formulario para editar usuario */}
           {selectedUserId && (
            <div ref={formRef}>
              <div className="centered-container">
                <div className="user-form">
                  <h3>Actualizar Información de Usuario</h3>
                  <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(selectedUserId); }}>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Teléfono"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Usuario Telegram"
                      value={usuarioTelegram}
                      onChange={(e) => setUsuarioTelegram(e.target.value)}
                      required
                    />
                    <button type="submit">Actualizar Usuario</button>
                    <button type="button" className="cancel-button" onClick={cerrarFormulario}>
                      Cancelar
                    </button>

                  </form>
                </div>
              </div>
              
            </div>
         
        )}



          {/* Botones de paginación */}
          <div className="pagination-buttons">
            <button onClick={prevPage}>Anterior</button>
            <button onClick={nextPage} disabled={!showNextButton}>Siguiente</button>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default AdminUsuarios;
