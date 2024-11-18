import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Asegúrate de que firestore está correctamente configurado
import Modal from '../components/Modal';
import '../styles/eventos.css'; // Importa el CSS para los estilos

const CrearEventos = () => {
  const [events, setEvents] = useState([]); // Estado para los eventos existentes
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Cargar eventos existentes desde Firestore
  useEffect(() => {
    const fetchEvents = async () => {
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
          };
        });
        setEvents(eventsData); // Actualizar estado con los eventos obtenidos
      } catch (error) {
        console.error("Error al obtener los eventos:", error);
      }
    };

    fetchEvents();
  }, []);

  // Manejar el envío del formulario para crear un nuevo evento
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !fecha || !descripcion || !imagen) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'eventos'), {
        titulo,
        fecha,
        descripcion,
        imagen,
      });

      // Después de agregar el evento, actualizar la lista
      setTitulo('');
      setFecha('');
      setDescripcion('');
      setImagen('');
      setError('');
      alert('Evento creado correctamente');
    } catch (error) {
      setError('Error al crear el evento: ' + error.message);
    }
  };

  // Manejar la eliminación de un evento
  const handleDeleteEvent = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'eventos', id));
      setEvents(events.filter(event => event.id !== id)); // Filtrar el evento eliminado de la lista
      closeModal(); // Cerrar el modal después de la eliminación
      alert('Evento eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar el evento:', error);
    }
  };

  // Abrir el modal
  const openModal = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Cerrar el modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div>
      <h1>Crear Evento</h1>
      <div className="description">
        <p>
          Crea un evento especial y compártelo con todos para que no se lo pierdan...
        </p>
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

        <button type="submit">Crear Evento</button>
      </form>

      {/* Mostrar los eventos creados */}
      <h2>Eventos Creados</h2>
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-container" onClick={() => openModal(event)}>
            <img src={event.img} alt={event.title} />
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p><strong>Fecha:</strong> {event.date}</p>
          </div>
        ))}
      </div>

      {/* Modal para confirmación de eliminación */}
      {selectedEvent && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          event={selectedEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default CrearEventos;
