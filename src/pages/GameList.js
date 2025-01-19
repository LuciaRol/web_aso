import { collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import Modal from 'react-modal';
import { auth, firestore } from '../firebase';
import defaultImage from '../img/partida_abierta.jpg';
import '../styles/gamelist.css'; 
import GuestNames from './GuestNames'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'moment/locale/es';  


moment.locale('es');

const localizer = momentLocalizer(moment);

Modal.setAppElement('#root'); // Establece el elemento raíz para el modal

const GameList = () => {
  const [eventos, setEventos] = useState([]);
  const [user] = useAuthState(auth);
  const [error, setError] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [apellidoUsuario, setApellidoUsuario] = useState('');
  const [joinSuccessMessage, setJoinSuccessMessage] = useState('');
  const [nombreCompletoUsuario, setNombreCompletoUsuario] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalPartidasDelDiaIsOpen, setModalPartidasDelDiaIsOpen] = useState(false);
  const [partidasDelDia, setPartidasDelDia] = useState([]);
  const [currentView, setCurrentView] = useState(Views.MONTH);
  const [guestCount, setGuestCount] = useState(1);
  const [numInvitadosEliminar, setNumInvitadosEliminar] = useState(1); // Default a 1
  const today = moment().startOf('day'); // Esto establece la fecha de hoy



  useEffect(() => {
    fetchEventos();  // Ahora siempre se ejecuta
    if (user) {
      fetchUserDetails(user.email);
    }
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

  /* Función que obtiene los detalles de un usuario desde la base de datos*/
  const fetchUserDetails = async (email) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombreUsuario(userData.nombre);
        setApellidoUsuario(userData.apellido);
        setNombreCompletoUsuario(`${userData.nombre} ${userData.apellido}`);
      } else {
        console.log('No existe el documento!');
      }
    } catch (err) {
      console.error('Error al obtener detalles del usuario:', err);
    }
  };

  const handleJoinEvent = async (event) => {
    if (!user) {
      toast.error('Debes estar logeado para unirte a una partida.'); // Alerta de fracaso
      //setError('Debes estar logeado para unirte a una partida.');
      return;
    }

    try {
      const partidaRef = doc(firestore, 'partidas', event.id);
      const partidaDoc = await getDoc(partidaRef);

      if (!partidaDoc.exists()) {
        toast.error('La partida seleccionada no existe.'); // Alerta de fracaso
        //setError('La partida seleccionada no existe.');
        return;
      }

      const partidaData = partidaDoc.data();

      const jugadorActual = `${nombreUsuario} ${apellidoUsuario}`;
      if (partidaData.jugadores.includes(jugadorActual)) {
        toast.error('Ya estás apuntad@ a esta partida.'); // Alerta de fracaso
        //setError('Ya estás apuntado a esta partida.');
        return;
      }

      if (partidaData.jugadores.length >= partidaData.numJugadoresMax) {
        toast.error('La partida ya ha alcanzado el número máximo de jugadores.'); // Alerta de fracaso
        //setError('La partida ya ha alcanzado el número máximo de jugadores.');
        return;
      }

      const updatedJugadores = [...partidaData.jugadores, jugadorActual];
      await updateDoc(partidaRef, {
        jugadores: updatedJugadores
      });

      toast.success('¡Te has unido correctamente a la partida!'); // Mensaje de éxito
      // setJoinSuccessMessage('¡Te has unido correctamente a la partida!');
      fetchEventos();

      setTimeout(() => {
        setJoinSuccessMessage('');
      }, 5000);
      closeModal(); // Cierra el modal después de unirse
    } catch (err) {
      console.error('Error al unirse a la partida: ', err);
      setError('Error al unirse a la partida: ' + err.message);
    }
  };

  /* Función para que un usuario pueda abandonar una partida */
  const handleLeaveEvent = async (event) => {
    if (!user) {
      toast.error('Debes estar autenticado para salir de una partida.'); // Mensaje de fracaso
      //setError('Debes estar autenticado para salir de una partida.');
      return;
    }

    try {
      const partidaRef = doc(firestore, 'partidas', event.id);
      const partidaDoc = await getDoc(partidaRef);

      if (!partidaDoc.exists()) {
        toast.error('La partida seleccionada no existe.'); 

        // setError('La partida seleccionada no existe.');
        return;
      }

      const partidaData = partidaDoc.data();

      const jugadorActual = `${nombreUsuario} ${apellidoUsuario}`;
      if (!partidaData.jugadores.includes(jugadorActual)) {
        toast.error('No estás apuntado a esta partida.'); 
        //setError('No estás apuntado a esta partida.');
        return;
      }

      const updatedJugadores = partidaData.jugadores.filter(jugador => jugador !== jugadorActual);
      await updateDoc(partidaRef, {
        jugadores: updatedJugadores
      });

      toast.success('¡Has salido de la partida correctamente!'); 

      //setJoinSuccessMessage('¡Has salido de la partida correctamente!');
      fetchEventos();

      setTimeout(() => {
        setJoinSuccessMessage('');
      }, 5000);
      closeModal(); 
    } catch (err) {
      console.error('Error al salir de la partida: ', err);
      setError('Error al salir de la partida: ' + err.message);
    }
  };

  /* Función para eliminar la partida */
  const handleDeleteEvent = async (event) => {
    if (!user) {
      toast.error('Debes estar logeado y ser el creador para borrar la partida.'); 
      //setError('Debes estar autenticado para borrar una partida.');
      return;
    }

    if (event.resource.creador !== nombreCompletoUsuario) {
      toast.error('Solo el creador puede borrar esta partida.'); 

//      setError('Solo el creador puede borrar esta partida.');
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'partidas', event.id));
      toast.success('¡Partida borrada!'); 
//      setJoinSuccessMessage('¡Partida borrada exitosamente!');
      fetchEventos();
      setTimeout(() => {
        setJoinSuccessMessage('');
      }, 5000);
      closeModal(); 
    } catch (err) {
      console.error('Error al borrar la partida: ', err);
      toast.error('Error al borrar la partida: ' + err.message); 
      //setError('Error al borrar la partida: ' + err.message);
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
    const [user] = useAuthState(auth); // Verificar si hay un usuario autenticado
    const isCreator = event.resource.creador === nombreCompletoUsuario;
    const isParticipant = event.resource.jugadores.includes(nombreCompletoUsuario);
  
    return (
      <div className="event-component">
        <strong>{event.title}</strong>
        <div>
          {/* Sin botones en la agenda */}
          {/* {user && (
            <>
              {isCreator ? (
                <button onClick={() => handleDeleteEvent(event)} className="button-delete">
                  Borrar Partida
                </button>
              ) : (
                <button onClick={() => handleJoinEvent(event)} className="button-join">
                  Unirse
                </button>
              )}
              {isParticipant && !isCreator && (
                <button onClick={() => handleLeaveEvent(event)} className="button-leave">
                  Dejar Partida
                </button>
              )}
            </>
          )} */}
        </div>
      </div>
    );
  };
  

  
  // Función para seleccionar nombres aleatorios sin repetir
  const seleccionarNombresAleatorios = (count, nombresDisponibles) => {
    const nombresSeleccionados = [];
    while (nombresSeleccionados.length < count) {
      const indiceAleatorio = Math.floor(Math.random() * nombresDisponibles.length);
      const nombre = nombresDisponibles[indiceAleatorio];
  
      if (!nombresSeleccionados.includes(nombre)) {
        nombresSeleccionados.push(nombre);
      }
    }
    return nombresSeleccionados;
  };
  
  const handleInviteGuest = async (count) => {
    if (!user) {
      toast.error('Debes estar logeado y en la partida para invitar a un jugador'); // Alerta de fracaso
      //setError('Debes estar autenticado para invitar a un jugador.');
      return;
    }
  
    try {
      const partidaRef = doc(firestore, 'partidas', selectedEvent.id);
      const partidaDoc = await getDoc(partidaRef);
  
      if (!partidaDoc.exists()) {
        toast.error('La partida seleccionada no existe'); // Alerta de fracaso
        //setError('La partida seleccionada no existe.');
        return;
      }
  
      const partidaData = partidaDoc.data();
      const maxInvitations = selectedEvent.resource.numJugadoresMax - partidaData.jugadores.length;
      const actualInvitations = Math.min(count, maxInvitations); // Limita el número de invitados al máximo permitido
  
      // Selecciona nombres aleatorios para los nuevos invitados
      const nuevosInvitados = seleccionarNombresAleatorios(actualInvitations, GuestNames);
  
      const updatedJugadores = [...partidaData.jugadores, ...nuevosInvitados];
      await updateDoc(partidaRef, {
        jugadores: updatedJugadores
      });
      
      toast.success(`¡Se ha invitado a ${actualInvitations} jugador(es) correctamente!`); // Alerta de éxito
      //setJoinSuccessMessage(`¡Se ha invitado a ${actualInvitations} jugador(es) correctamente!`);
      setGuestCount(guestCount + actualInvitations); // Incrementa el contador de invitados
      fetchEventos(); // Refresca los eventos
  
      setTimeout(() => {
        setJoinSuccessMessage('');
      }, 5000);
      closeModal(); // Cierra el modal después de invitar
    } catch (err) {
      console.error('Error al invitar a jugadores: ', err);
      toast.error('Error al invitar a jugadores: ' + err.message); // Alerta de fracaso
      //setError('Error al invitar a jugadores: ' + err.message);
    }
  };
  const handleRemoveGuest = async (numInvitadosAEliminar) => {
    if (!user) {
      toast.error('Debes estar logeado para echar a un invitado'); // Alerta de fracaso
      //setError('Debes estar autenticado para echar a un jugador.');
      return;
    }
  
    try {
      const partidaRef = doc(firestore, 'partidas', selectedEvent.id);
      const partidaDoc = await getDoc(partidaRef);
  
      if (!partidaDoc.exists()) {
        toast.error('La partida seleccionada no existe'); // Alerta de fracaso
        //setError('La partida seleccionada no existe.');
        return;
      }
  
      const partidaData = partidaDoc.data();
      
      // Filtrar los jugadores que están en la partida y coinciden con los nombres del array
      const invitados = partidaData.jugadores.filter(jugador =>
        GuestNames.includes(jugador)
      );
  
      if (invitados.length === 0) {
        toast.error('No hay invitados de la lista para echar.'); // Alerta de fracaso
        //setError('No hay invitados de la lista para echar.');
        return;
      }
  
      if (numInvitadosAEliminar > invitados.length) {
        toast.error(`Solo hay ${invitados.length} invitados, no puedes eliminar más.`); // Alerta de fracaso
        //setError(`Solo hay ${invitados.length} invitados, no puedes eliminar más.`);
        return;
      }
  
      // Seleccionar los primeros "numInvitadosAEliminar" invitados para eliminar
      const invitadosAEliminar = invitados.slice(0, numInvitadosAEliminar);
      const updatedJugadores = partidaData.jugadores.filter(jugador =>
        !invitadosAEliminar.includes(jugador)
      );
      
      await updateDoc(partidaRef, {
        jugadores: updatedJugadores
      });
      
      toast.success(`¡Has echado a ${invitadosAEliminar.join(', ')} correctamente!`); // Alerta de éxito
      //setJoinSuccessMessage(`¡Has echado a ${invitadosAEliminar.join(', ')} correctamente!`);
      fetchEventos(); // Refrescar eventos
  
      setTimeout(() => {
        setJoinSuccessMessage('');
      }, 5000);
      closeModal(); // Cerrar el modal después de eliminar
  
    } catch (err) {
      console.error('Error al echar a jugadores: ', err);
      toast.error('Error al echar a jugadores: ' + err.message); // Alerta de fracaso
      //setError('Error al echar a jugadores: ' + err.message);
    }
  };
  
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  const handleMoreEventsClick = (date) => {
    const eventosDelDia = eventos.filter(event => 
      moment(event.start).isSame(date, 'day')
    );
    setPartidasDelDia(eventosDelDia);
    setModalPartidasDelDiaIsOpen(true); // Abre el modal con las partidas del día
  };

  const closePartidasDelDiaModal = () => {
    setModalPartidasDelDiaIsOpen(false);
    setPartidasDelDia([]);
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',  // Traducción de "Month" a "Mes"
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay eventos en este rango de fechas.',
    showMore: total => `+ Ver más (${total})`,
  };

  return (
    <div className="game-list">
      {error && <p className="error">{error}</p>}
      {joinSuccessMessage && <p className="success">{joinSuccessMessage}</p>}
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100vh' }}
        onSelectEvent={handleEventClick}
        onNavigate={(date) => setCurrentView(date)}
        onView={view => setCurrentView(view)}
        components={{
          month: {
            event: MonthEventComponent,
          },
          agenda: {
            event: EventComponent,
          },
        }}
        messages={messages}  
        popup
        views={[Views.MONTH, Views.AGENDA]}
        selectable
        onSelectSlot={({ start }) => handleMoreEventsClick(start)} // Maneja el clic en el slot
      />
      
      {/* Modal de detalles de la partida */}
      
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del Evento"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedEvent && (
          <div>
            <button onClick={closeModal} className="button-close" aria-label="Cerrar">
              &times; {/* Carácter para la X */}
            </button>
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
            <div>
              {/* Renderizar botones solo si el usuario está autenticado */}
              {user && moment(selectedEvent.start).isSameOrAfter(today) && (
                <>
                  {selectedEvent.resource.creador === nombreCompletoUsuario ? (
                    <button onClick={() => { handleDeleteEvent(selectedEvent); closeModal(); }} className="button-delete">
                      Borrar Partida
                    </button>
                  ) : (
                    <>
                      {!selectedEvent.resource.jugadores.includes(nombreCompletoUsuario) && selectedEvent.resource.jugadores.length < selectedEvent.resource.numJugadoresMax && (
                        <button onClick={() => { handleJoinEvent(selectedEvent); closeModal(); }} className="button-join">
                          Unirse a Partida
                        </button>
                      )}
                      {selectedEvent.resource.jugadores.includes(nombreCompletoUsuario) && (
                        <button onClick={() => { handleLeaveEvent(selectedEvent); closeModal(); }} className="button-leave">
                          Dejar Partida
                        </button>
                      )}
                      {selectedEvent.resource.jugadores.length >= selectedEvent.resource.numJugadoresMax && (
                        <p className="error-message">La partida ya está llena</p>
                      )}
                    </>
                  )}
                  <div className="invite-section">
                    {selectedEvent.resource.jugadores.includes(`${nombreUsuario} ${apellidoUsuario}`) && 
                      selectedEvent.resource.jugadores.length < selectedEvent.resource.numJugadoresMax && (
                      <>
                        <label htmlFor="inviteCount"></label>
                        <select
                          id="inviteCount"
                          value={guestCount}
                          onChange={(e) => setGuestCount(parseInt(e.target.value))}
                          className="invite-select"
                        >
                          {[...Array(selectedEvent.resource.numJugadoresMax - selectedEvent.resource.jugadores.length).keys()].map(num => (
                            <option key={num + 1} value={num + 1}>
                              {num + 1}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => handleInviteGuest(guestCount)} className="button-invite">
                          + Invitados
                        </button>
                      </>
                    )}
                  </div>
                  <div className="remove-section">
                    {selectedEvent.resource.jugadores.includes(`${nombreUsuario} ${apellidoUsuario}`) && (
                      selectedEvent.resource.jugadores.some(jugador => GuestNames.includes(jugador)) && (
                        <>
                          <label htmlFor="numInvitadosEliminar"></label>
                          <select
                            id="numInvitadosEliminar"
                            value={numInvitadosEliminar}
                            onChange={(e) => setNumInvitadosEliminar(Number(e.target.value))}
                            className="remove-select"
                          >
                            {/* Generar opciones hasta el número de invitados actuales */}
                            {[...Array(selectedEvent.resource.jugadores.filter(jugador => GuestNames.includes(jugador)).length).keys()].map(num => (
                              <option key={num + 1} value={num + 1}>
                                {num + 1}
                              </option>
                            ))}
                          </select>
                          <button onClick={() => handleRemoveGuest(numInvitadosEliminar)} className="button-invite-guest">
                            - Invitados
                          </button>
                        </>
                      )
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer />
    </div>
  );
};

export default GameList;
