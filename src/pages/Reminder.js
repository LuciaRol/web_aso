import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { sendTelegramMessage } from '../components/TelegramMessenger';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/reminder.css'; // Import the CSS file
import logo_negro from '../img/logo_negro_transp.png';

const Reminder = () => {
  const handleManualExecution = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'eventos'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventsData = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((event) => {
          const eventDate = new Date(event.fecha);
          return !isNaN(eventDate) && eventDate >= today;
        });

      if (eventsData.length === 0) {
        toast.info('No hay eventos programados para hoy o fechas futuras.', {
          position: 'top-right',
          autoClose: 5000,
        });
        return;
      }

      const thread_id = 180;
      for (const event of eventsData) {
        if (!event.titulo || !event.fecha || !event.hora || !event.descripcion) {
          console.warn(`Evento inválido: ${JSON.stringify(event)}`);
          continue;
        }

        const message = `¡Recordad que tenemos este evento programado!
          Título: ${event.titulo}
          Fecha: ${event.fecha}
          Hora: ${event.hora}
          Descripción: ${event.descripcion}`;

        try {
          await sendTelegramMessage(message, event.imagen, thread_id);
          console.log(`Mensaje enviado para el evento: ${event.titulo}`);
        } catch (error) {
          console.error(`Error al enviar el mensaje para ${event.titulo}:`, error);
        }
      }

      toast.success('¡Eventos ejecutados y mensajes enviados con éxito!', {
        position: 'top-right',
        autoClose: 5000,
      });
    } catch (error) {
      console.error('Error al ejecutar los eventos manualmente:', error);
      toast.error('Hubo un error al enviar los recordatorios. Revisa la consola.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="reminder-container">
      <h1 className="reminder-title">Envío de recordatorios al canal de Telegram</h1>
      <p className="reminder-description">
        Haz clic en el botón para enviar los recordatorios de eventos y/o partidas programadas.
      </p>
      <div className="reminder-info"> 
        <div>
          <img src={logo_negro}alt="Logo de la asociación Dragón de madera: dragón negro que forma un cículo abierto a la izquierda y que envuelve un peón en negro." />
        </div>
        <div className="reminder-button-container">
          <button onClick={handleManualExecution} className="reminder-button submit-button">
            Enviar recordatorios
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Reminder;
