import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase';
import Modal from '../components/Modal';
import '../styles/eventos.css';

const CrearEventos = () => {
  const [events, setEvents] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');  // Nuevo estado para la hora
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch events from Firestore
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'eventos'));
      const eventsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.titulo,
          img: data.imagen,
          description: data.descripcion,
          date: data.fecha,
          time: data.hora, // Añadir la hora
        };
      });
      setEvents(eventsData);
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(); // Llamamos a fetchEvents para cargar los eventos al inicio
  }, []);

  // Handle form submission to create new event
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !fecha || !hora || !descripcion || !imagen) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      // Crear el evento con fecha y hora
      await addDoc(collection(firestore, 'eventos'), {
        titulo,
        fecha,
        hora,
        descripcion,
        imagen,
      });

      // Clear the form
      setTitulo('');
      setFecha('');
      setHora(''); // Limpiar el campo de hora
      setDescripcion('');
      setImagen('');
      setError('');
      alert('Evento creado correctamente');
      // Refetch the events to stay in sync
      fetchEvents();
    } catch (error) {
      setError('Error al crear el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'eventos', id));
      setEvents(events.filter(event => event.id !== id)); // Remove the deleted event from the list
      alert('Evento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
    }
  };

  // Open modal to confirm deletion
  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Close modal
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

      {/* Formulario para crear nuevo evento */}
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

      {/* Mostrar los eventos creados */}
      <h2>Eventos Creados</h2>
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-container">
            <img src={event.img} alt={event.title} />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Fecha:</strong> {event.date} {event.time}</p> {/* Mostrar fecha y hora */}
            <button onClick={() => handleDeleteEvent(event.id)} className="delete-button">
              Eliminar Evento
            </button>
          </div>
        ))}
      </div>

      {/* Modal para confirmación de eliminación (se elimina la funcionalidad del botón de eliminación dentro del modal) */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
        />
      )}
    </div>
  );
};

export default CrearEventos;
