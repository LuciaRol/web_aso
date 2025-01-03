import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from 'firebase/firestore';
import Modal from '../components/Modal';
import '../styles/events.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';
import { sendTelegramMessage } from '../components/TelegramMessenger'; // Adjust path as per your project structure
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateEvents = () => {
  const [events, setEvents] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuario] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const thread_id = 180; // Id del tema Eventos
  const [formVisible, setFormVisible] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'eventos'));
      const eventsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.titulo,
          img: data.imagen,
          description: data.descripcion,
          date: data.fecha,
          time: data.hora,
        };
      });
      setEvents(eventsData);
    } catch (error) {
      toast.error('Error al obtener los eventos.');
      console.error('Error al obtener los eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (usuario && usuario.email) {
      checkIfUserIsAdmin(usuario.email);
      fetchEvents();
    }
  }, [usuario]);

  const handleEditEvent = (event) => {
    setEditEvent({
      id: event.id,
      titulo: event.title, 
      fecha: event.date,
      hora: event.time,
      descripcion: event.description,
      imagen: event.img,
    });
  };
  
  const checkIfUserIsAdmin = async (email) => {
    try {
      const querySnapshot = await getDocs(
        query(collection(firestore, 'users'), where('email', '==', email))
      );
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.role === 'admin') {
          setIsAdmin(true);
        }
      });
    } catch (err) {
      toast.error('Error al verificar si el usuario es admin.');
      console.error('Error al verificar si el usuario es admin:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error('No tienes permisos para crear eventos.');
      return;
    }

    if (!titulo || !fecha || !hora || !descripcion || !imagen) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      // Añadir el evento a Firestore
      await addDoc(collection(firestore, 'eventos'), {
        titulo,
        fecha,
        hora,
        descripcion,
        imagen,
      });

      // Enviar mensaje a Telegram
      const message = `Nuevo evento creado:
        ${titulo}
        - Fecha: ${fecha}
        - Hora: ${hora}
        - Descripción: ${descripcion}`;
      await sendTelegramMessage(message, imagen, thread_id);

      // Limpiar los campos del formulario
      setTitulo('');
      setFecha('');
      setHora('');
      setDescripcion('');
      setImagen('');

      // Mostrar mensaje de éxito
      toast.success('Evento creado correctamente.');
      
      // Llamar a la función para obtener los eventos actualizados
      fetchEvents();

      // Ocultar el formulario después de crear el evento
      setFormVisible(false);

    } catch (error) {
      toast.error('Error al crear el evento.');
      console.error('Error al crear el evento:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteEvent = async (id) => {
    if (!isAdmin) {
      toast.error('No tienes permisos para eliminar eventos.');
      return;
    }
    try {
      await deleteDoc(doc(firestore, 'eventos', id));
      setEvents(events.filter((event) => event.id !== id));
      toast.success('Evento eliminado correctamente.');
    } catch (error) {
      toast.error('Error al eliminar el evento.');
      console.error('Error al eliminar el evento:', error);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
  
    if (!isAdmin) {
      toast.error('No tienes permisos para editar eventos.');
      return;
    }
  
    if (!editEvent.titulo || !editEvent.fecha || !editEvent.hora || !editEvent.descripcion || !editEvent.imagen) {
      toast.error('Por favor, completa todos los campos.');
      return;
    }
    
    setLoading(true);
    try {
      await updateDoc(doc(firestore, 'eventos', editEvent.id), {
        titulo: editEvent.titulo,
        fecha: editEvent.fecha,
        hora: editEvent.hora,
        descripcion: editEvent.descripcion,
        imagen: editEvent.imagen,
      });
  
      toast.success('Evento actualizado correctamente.');


      fetchEvents();  // Refresca la lista de eventos después de la actualización
      setEditEvent(null);  // Resetea el estado del evento editado
    } catch (error) {
      toast.error('Error al actualizar el evento.');
      console.error('Error al actualizar el evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className='events-container'>
      <ToastContainer />
      <h1>Administrar eventos</h1>

      {/* FORMULARIO PARA CREAR EVENTO */}
      <div className='new-event-container'>
        <button 
          className="new-event-btn submit-button" 
          onClick={() => setFormVisible(!formVisible)}
        >
          {formVisible ? 'Cerrar formulario' : 'Nuevo evento'}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className='create-event-form'>
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              className="form-control"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input
              id="fecha"
              className="form-control"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora">Hora</label>
            <input
              id="hora"
              className="form-control"
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              className="form-control"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imagen">URL de la Imagen</label>
            <input
              id="imagen"
              className="form-control"
              type="url"
              value={imagen}
              onChange={(e) => setImagen(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creando Evento...' : 'Crear Evento'}
          </button>
        </form>
      )}

      <h2>Eventos Creados</h2>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className="event-container" onClick={() => openModal(event)}>
            <img src={event.img} alt={event.title} />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p>
              <strong>Fecha:</strong> {event.date} {event.time}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();  // Evita que se abra el modal al hacer clic
                handleEditEvent(event);  // Llama a la función para editar
              }} 
              className="edit-button submit-button"
            >
              Editar Evento
            </button>
            <p></p>
            <button 
              onClick={(e) => {
                e.stopPropagation();  // Prevent modal from opening
                handleDeleteEvent(event.id);
              }} 
              className="delete-button  submit-button"
            >
              Eliminar Evento
            </button>
          </div>
        ))}
      </div>
      {editEvent && (
        <div className="description">
          <h1>Editar Evento</h1>
          <form onSubmit={handleUpdateEvent}>
            <div className="form-group">
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                className="form-control"
                type="text"
                value={editEvent.titulo}
                onChange={(e) => setEditEvent({ ...editEvent, titulo: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                id="fecha"
                className="form-control"
                type="date"
                value={editEvent.fecha}
                onChange={(e) => setEditEvent({ ...editEvent, fecha: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="hora">Hora</label>
              <input
                id="hora"
                className="form-control"
                type="time"
                value={editEvent.hora}
                onChange={(e) => setEditEvent({ ...editEvent, hora: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                className="form-control"
                value={editEvent.descripcion}
                onChange={(e) => setEditEvent({ ...editEvent, descripcion: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imagen">URL de la Imagen</label>
              <input
                id="imagen"
                className="form-control"
                type="url"
                value={editEvent.imagen}
                onChange={(e) => setEditEvent({ ...editEvent, imagen: e.target.value })}
                required
              />
            </div>

            <button type="submit">Actualizar Evento</button>
          </form>
        </div>
      )}

      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={closeModal} event={selectedEvent} />
      )}
    </div>
  );
};

export default CreateEvents;
