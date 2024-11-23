import React from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { sendTelegramMessage } from '../components/TelegramMessenger'; // Ajusta la ruta
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importar estilos de react-toastify

const PromocionYRecordatorios = () => {
  // Función para obtener los eventos y enviarlos manualmente
  const handleManualExecution = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'eventos'));
      const today = new Date(); // Fecha actual
      today.setHours(0, 0, 0, 0); // Ignorar la hora para comparaciones

      const eventsData = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((event) => {
          const eventDate = new Date(event.fecha); // Convierte la fecha del evento
          return eventDate >= today; // Incluye solo eventos de hoy o posteriores
        });

      const thread_id = 180; // ID del tema de Telegram
      for (const event of eventsData) {
        const message = `¡Recordad que tenemos este evento programado!
Título: ${event.titulo}
Fecha: ${event.fecha}
Hora: ${event.hora}
Descripción: ${event.descripcion}`;

        await sendTelegramMessage(message, event.imagen, thread_id);
        console.log(`Mensaje enviado para el evento: ${event.titulo}`);
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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Promoción y Recordatorios</h1>
      <p style={{ textAlign: 'center', color: '#555' }}>
        Haz clic en el botón para enviar los recordatorios de eventos programados.
      </p>
      {/* Botón para ejecutar los eventos manualmente */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleManualExecution}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007BFF',
            color: '#FFF',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Enviar Recordatorios
        </button>
      </div>
      {/* Contenedor de Toast */}
      <ToastContainer />
    </div>
  );
};

export default PromocionYRecordatorios;
