import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../firebase'; 
import Modal from '../components/Modal';
import '../styles/events.css'; 

const Event = ({ event, onOpen }) => {
  return (
    <div className="event-container" onClick={() => onOpen(event)}>
      <img src={event.img} alt={event.title} />
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p><strong>Fecha:</strong> {event.date}</p>
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]); // Estado para los eventos
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Cargar eventos desde Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(firestore, 'eventos'), where('fecha', '>=', today));
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Verifica que la URL de la imagen esté correctamente formada
          const imageUrl = data.imagen; // Esto debe ser una URL de la imagen como string
          if (!imageUrl) {
            console.warn(`Evento ${data.titulo} no tiene imagen.`);
          }

          return {
            id: doc.id,
            title: data.titulo,
            img: imageUrl, 
            description: data.descripcion,
            date: data.fecha,
          };
        });
        setEvents(eventsData); // Guarda los eventos en el estado
      } catch (error) {
        console.error("Error al obtener los eventos:", error);
      }
    };

    fetchEvents();
  }, []);

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
      <h1>Eventos</h1>
      <div className="description">
        <p>
          Eventos especiales que aprovechamos para reunirnos y pasar un buen rato todos juntos...
        </p>
      </div>
      <div className="events-list">
        {events.map(event => (
          <Event key={event.id} event={event} onOpen={openModal} />
        ))}
      </div>
      {/* Muestra el modal solo si hay un evento seleccionado */}
      <Modal isOpen={isModalOpen} onClose={closeModal} event={selectedEvent} />
    </div>
  );
};

export default Events;