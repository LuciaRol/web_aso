import { collection, getDocs } from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/es'; // Importa el idioma español para moment
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';
import { firestore } from '../firebase';
import defaultImage from '../img/partida_abierta.jpg';
import '../styles/calendariopartidas.css'; // Importa el CSS

// Configurar moment en español
moment.locale('es');

const localizer = momentLocalizer(moment);
Modal.setAppElement('#root'); // Set root element for accessibility

const CalendarioPartidas = () => {
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState(Views.MONTH);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      const partidasRef = collection(firestore, 'partidas');
      const querySnapshot = await getDocs(partidasRef);
      const fetchedEventos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const start = new Date(data.fecha + 'T' + data.hora);
        let end = new Date(start.getTime() + data.duracion);

        if (end.getDate() !== start.getDate()) {
          end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59);
        }

        const jugadoresApuntados = data.jugadores ? data.jugadores.length : 0;
        const maxJugadores = data.numJugadoresMax;
        const jugadores = data.jugadores ? data.jugadores.join(', ') : '';
        const photoUrl = data.photoUrl || ''; // Obtén la URL de la foto del juego
        const gameUrl = data.gameUrl || ''; // Obtén la URL del juego
        const description = data.descripcion || ''; // Obtén la descripción del juego

        const gameTitle = `${data.juego}`;

        return {
          id: doc.id,
          title: `${gameTitle}\n${moment(start).format('D [de] MMMM [de] YYYY')}  ${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}\nCreada por ${data.creador}\nParticipantes (${jugadoresApuntados}/${maxJugadores}):\n${jugadores}`,
          start,
          end,
          allDay: false,
          resource: {
            numJugadoresMax: data.numJugadoresMax,
            jugadores: data.jugadores || [],
            creador: data.creador,
            photoUrl,
            gameUrl,
            description
          }
        };
      });

      fetchedEventos.sort((a, b) => a.start - b.start);
      setEventos(fetchedEventos);
    } catch (err) {
      console.error('Error al obtener partidas: ', err);
      setError('Error al obtener partidas: ' + err.message);
    }
  };

  const MonthEventComponent = ({ event }) => {
    const titleLines = event.title.split('\n');
    const startTime = moment(event.start).format('HH:mm'); // Hora de inicio en formato HH:mm
    return (
      <div>
        <strong>{titleLines[0]}</strong> {/* Mostrar el título del evento */}
        {startTime}h {/* Mostrar la hora de inicio del evento */}
      </div>
    );
  };

  const EventComponent = ({ event }) => {
    return (
      <div>
        <strong>{event.title}</strong>
      </div>
    );
  };

  const openModal = (event) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const handleNavigate = (date, view) => {
    setCurrentView(view);
  };

  const handleMoreEventsClick = (date) => {
    setCurrentView(Views.agenda);
    handleNavigate(date, Views.agenda); // Navega a la vista del día seleccionado
  };

  // Configura los mensajes para mostrar el calendario en español
  const messages = {
    allDay: 'Todo el día',
    previous: 'Atrás',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango de fechas.',
    showMore: total => `+ Ver más (${total})`
  };

  return (
    <div className="game-list">
      <h1>Lista de Partidas</h1>
      {error && <p className="error-message">{error}</p>}
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100vh' }}
        views={{ month: true, agenda: true }} // Habilita la vista de día
        defaultView={Views.MONTH}
        onSelectEvent={event => openModal(event)}
        onNavigate={handleNavigate}
        components={{
          month: { event: MonthEventComponent },
          event: EventComponent,
        }}
        messages={messages} // Cambia los textos del calendario a español
        popup // Habilita el comportamiento emergente para `+X more`
        onDrillDown={(date, view) => handleMoreEventsClick(date)} // Controla el clic en `+X more`
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del Evento"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedEvent && (
          <div>
            <h2>{selectedEvent.title.split('\n')[0]}</h2>
            <img
              src={selectedEvent.resource.photoUrl || defaultImage}
              alt="Foto del juego"
              className="event-image"
            />
            <p><strong>Fecha:</strong> {moment(selectedEvent.start).format('D [de] MMMM [de] YYYY')}</p>
            <p><strong>Hora:</strong> {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</p>
            <p><strong>Creador:</strong> {selectedEvent.resource.creador}</p>
            <p><strong>Participantes:</strong> {selectedEvent.resource.jugadores.join(', ')}</p>
            <p><strong>Jugadores:</strong> {selectedEvent.resource.jugadores.length}/{selectedEvent.resource.numJugadoresMax}</p>
            <p><strong>Descripción:</strong> {selectedEvent.resource.description}</p>
            {selectedEvent.resource.gameUrl && (
              <p><strong>Más información:</strong> <a href={selectedEvent.resource.gameUrl} target="_blank" rel="noopener noreferrer">Ver en BoardGameGeek</a></p>
            )}
            <button onClick={closeModal} className="button-close">Cerrar</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarioPartidas;
