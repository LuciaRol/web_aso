import React, { useState } from 'react';
import { default as event1, default as event3 } from '../img/evento_miercoles.jpg';
import event2 from '../img/halloween.jpg'; // Correct image for event2
import Modal from '../components/Modal';
import '../styles/eventos.css'; // Import CSS for styles


const events = [
  {
    id: 1,
    title: 'Miércoles Dragoneros',
    img: event1,
    description: 'Nos reunimos por las tardes para jugar a lo que más nos apetezca...',
    date: 'Todos los miércoles por la tarde',
  },
  {
    id: 2,
    title: 'Noche de Halloween',
    img: event2,
    description: 'Una vez al año, nos reunimos para jugar a juegos de roles ocultos...',
    date: 'Noche del 31 de Octubre, 2024',
  },
  {
    id: 3,
    title: 'Reunión Familiar de Juegos',
    img: event3,
    description: 'Un evento para toda la familia...',
    date: '30 de Octubre, 2024',
  },
];

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

const Eventos = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);

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

export default Eventos;