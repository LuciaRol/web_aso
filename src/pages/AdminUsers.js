import { auth, firestore } from '../firebase';
import React, { useEffect, useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import '../styles/adminusers.css';
import { getFirestore, updateDoc, doc, serverTimestamp, getDocs, collection, query, orderBy, getCountFromServer, getDoc, deleteDoc } from 'firebase/firestore'; // Asegúrate de importar 'query' y 'orderBy'
import { ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import 'react-toastify/dist/ReactToastify.css';

const AdminUsers = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [usuario] = useAuthState(auth);
  const [usuarios, setUsuarios] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [errorPagination, setErrorPagination] = useState('');
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuarioTelegram, setUsuarioTelegram] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el pop-up

  useEffect(() => {
    if (usuario && usuario.email) {
      setEmail(usuario.email);
      fetchUsers();
      checkIfUserIsAdmin(usuario.email);
      fetchTotalUsuarios();
    }

    if (selectedUserId) {
      scrollToForm();
    }
  }, [usuario, page, selectedUserId, searchTerm]);

  const scrollToForm = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const fetchTotalUsuarios = async () => {
    try {
      const usersRef = collection(firestore, 'users');
      const snapshot = await getCountFromServer(usersRef);
      setTotalUsuarios(snapshot.data().count);
    } catch (err) {
      console.error('Error al obtener el total de usuarios:', err);
    }
  };

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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      let q = query(usersRef, orderBy('nombre'));

      const querySnapshot = await getDocs(q);
      const fetchedUsuarios = [];
      querySnapshot.forEach((doc) => {
        fetchedUsuarios.push({ id: doc.id, ...doc.data() });
      });

      const normalizedSearchTerm = searchTerm
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      const filteredUsuarios = fetchedUsuarios.filter((usuario) => {
        const nombreNormalized = usuario.nombre
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const apellidoNormalized = usuario.apellido
          ? usuario.apellido
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          : '';
        const telegramNormalized = usuario.usuarioTelegram
          ? usuario.usuarioTelegram
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
          : '';

        return (
          nombreNormalized.includes(normalizedSearchTerm) ||
          apellidoNormalized.includes(normalizedSearchTerm) ||
          telegramNormalized.includes(normalizedSearchTerm)
        );
      });

      setUsuarios(filteredUsuarios);
      setLoading(false);
    } catch (err) {
      setErrorPagination('Error al obtener usuarios: ' + err.message);
      setLoading(false);
    }
  };

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
      fetchUsers();
      closeModal(); // Cerrar el pop-up
    } catch (err) {
      toast.error('Error al actualizar la información del usuario: ' + err.message);
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setTelefono('');
    setUsuarioTelegram('');
    setSelectedUserId(null);
  };

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
        fetchUsers();
        resetForm();
      } catch (err) {
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
          fetchUsers();
        } else {
          toast.error('No se encontró el usuario en Firestore.');
        }
      } catch (err) {
        toast.error('Error al eliminar el usuario: ' + err.message);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Cerrar el modal
    resetForm(); // Resetear el formulario
  };

  const openModal = (usuario) => {
    setSelectedUserId(usuario.id);
    setNombre(usuario.nombre);
    setApellido(usuario.apellido);
    setTelefono(usuario.telefono);
    setUsuarioTelegram(usuario.usuarioTelegram);
    setIsModalOpen(true); // Abrir el modal
  };

  return (
    <div className="form-container admin-users-container">
      {isAdmin && (
        <div>
          <h2>Administrar Usuarios</h2>
          <div className="user-search-container">
            <label>Buscar usuario:</label>
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o telegram"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <p>Total de usuarios registrados: {totalUsuarios}</p>
          </div>
          

          <div className="users-grid">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="table-row">
                <div>
                  <label>Nombre y apellidos</label>
                  <p>{usuario.nombre} {usuario.apellido}</p>
                </div>
                <div>
                  <label>Email</label>
                  <p>{usuario.email}</p>
                </div>
                <div>
                  <label>Teléfono</label>
                  <p>{usuario.telefono}</p>
                </div>
                <div>
                  <label>Rol</label>
                  <p>{usuario.role}</p>
                </div>
                <div>
                  <label>Cambiar rol</label>
                  <select
                    id={`role-select-${usuario.id}`}
                    onChange={(e) => handleUpdateRole(usuario.id, e.target.value)}
                  >
                    <option value="">Seleccionar Rol</option>
                    <option value="admin">Administrador</option>
                    <option value="ludotecario">Ludotecario</option>
                    <option value="user">Usuario</option>
                  </select>
                </div>
                <div>
                  <label>Telegram</label>
                  <p>{usuario.usuarioTelegram}</p>
                </div>
                <div className="action-buttons">
                  <button className="submit-button users-button" onClick={() => openModal(usuario)}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button className="submit-button users-button" onClick={() => handleDeleteUser(usuario.id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal para editar usuario */}
          {isModalOpen && (
            <div className="user-modal" onClick={closeModal}>
              <div className="user-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Botón de cierre en la esquina superior derecha */}
                <button className="close-button" onClick={closeModal}>×</button>
                
                <h2>Editar usuario</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateUser(selectedUserId); }}>
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                  <label>Apellidos:</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                  />
                  <label>Teléfono:</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                  />
                  <label>Usuario Telegram:</label>
                  <input
                    type="text"
                    value={usuarioTelegram}
                    onChange={(e) => setUsuarioTelegram(e.target.value)}
                  />
                  <div className="button-container">
                    <button className='submit-button' type="submit">Guardar</button>
                    <button className='submit-button' type="button" onClick={closeModal}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminUsers;
