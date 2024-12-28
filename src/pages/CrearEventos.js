import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import Modal from '../components/Modal';
import '../styles/Events.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, firestore } from '../firebase';
import { sendTelegramMessage } from '../components/TelegramMessenger'; // Ajusta la ruta según tu estructura de proyecto

const CrearEventos = () => {
  const [events, setEvents] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuario] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const thread_id = 180; // Id del tema Eventos
  const defaultImageUrl = 'https://pbs.twimg.com/media/Fz4hsZrXwAA6lG4.jpg';


  // Fetch events from Firestore
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      setError('No tienes permisos para crear eventos.');
      return;
    }

    if (!titulo || !fecha || !hora || !descripcion || !imagen) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(firestore, 'eventos'), {
        titulo,
        fecha,
        hora,
        descripcion,
        imagen,
      });

      const message = `Nuevo evento creado:
      
        ${titulo}
        - Fecha: ${fecha}
        - Hora: ${hora}
        - Descripción: ${descripcion}`;
      
        // Enviar mensaje de Telegram después de crear el evento
      await sendTelegramMessage(message, imagen, thread_id);


      setTitulo('');
      setFecha('');
      setHora('');
      setDescripcion('');
      setImagen('');
      setError('');
      alert('Evento creado correctamente');
      fetchEvents();
    } catch (error) {
      setError('Error al crear el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!isAdmin) {
      setError('No tienes permisos para crear eventos.');
      return;
    }
    try {
      await deleteDoc(doc(firestore, 'eventos', id));
      setEvents(events.filter((event) => event.id !== id));
      alert('Evento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
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
    <div>
      <h1>Crear Evento</h1>
      <div className="description">
        <p>Crea un evento especial y compártelo con todos para que no se lo pierdan...</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
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
                e.stopPropagation();  // We do not allow the click to open the modal window
                handleDeleteEvent(event.id);
              }} 
              className="delete-button"
            >
              Eliminar Evento
            </button>
          </div>
          
        ))}
          
      </div>

      {selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={closeModal} event={selectedEvent} />
      )}
    </div>
  );
};

export default CrearEventos;
