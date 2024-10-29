  import React from 'react';
import { default as event1, default as event3 } from '../img/evento_miercoles.jpg';
import event2 from '../img/halloween.jpg'; // Correct image for event2
import '../styles/eventos.css'; // Import CSS for styles

  // Sample data for events
  const events = [
    {
      id: 1,
      title: 'Miércoles Dragoneros',
      img: event1,
      description: 'Nos reunimos por las tardes para jugar a lo que más nos apetezca ¡Pide tu plaza en el grupo de whatsapp y pásate! ¡Tenemos ganas de conocerte! :)',
      date: 'Todos los miércoles por la tarde',
    },
    {
      id: 2,
      title: 'Noche de Halloween',
      img: event2,
      description: 'Una vez al año, nos reunimos para jugar a juegos de roles ocultos, asesinatos y misterios. ¿Te atreves a pasarte a jugar?.',
      date: 'Noche del 31 de Octubre, 2024',
    },
    {
      id: 3,
      title: 'Reunión Familiar de Juegos',
      img: event3,
      description: 'Un evento para toda la familia. Ven y disfruta de juegos clásicos y modernos con amigos, familiares y miembros del club.',
      date: '30 de Octubre, 2024',
    },
    // Add more events as needed
  ];

  const Event = ({ event }) => {
    return (
      <div className="event-container">
        <img src={event.img} alt={event.title} style={{ width: '300px', height: '200px' }} />
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <p><strong>Fecha:</strong> {event.date}</p>
      </div>
    );
  };

  const Eventos = () => {
    return (
      <div>
        <h1>Eventos</h1>
        <div className="description">
          <p>
            Estos son eventos especiales que aprovechamos para reunirnos y pasar un buen rato todos juntos. No seáis tímid@s y pasaros a conocernos.
          </p>
        </div>
        <div className="events-list" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {events.map(event => (
            <Event key={event.id} event={event} />
          ))}
        </div>
      </div>
    );
  };

  export default Eventos;
