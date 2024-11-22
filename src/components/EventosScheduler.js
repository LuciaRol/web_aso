import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase';
import { sendTelegramMessage } from './TelegramMessenger'; // Ajusta la ruta si es necesario

const EventosScheduler = () => {
  const [events, setEvents] = useState([]);

  // Función para obtener los eventos de Firestore
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'eventos'));
      const today = new Date(); // Fecha actual
      today.setHours(0, 0, 0, 0); // Asegúrate de ignorar la hora para comparaciones
  
      const eventsData = querySnapshot.docs
        .map((doc) => doc.data())
        .filter((event) => {
          const eventDate = new Date(event.fecha); // Convierte la fecha del evento
          return eventDate >= today; // Incluye solo eventos de hoy o posteriores
        });
  
      setEvents(eventsData);
      return eventsData; // Retorna los eventos para que se usen inmediatamente
    } catch (error) {
      console.error('Error al obtener los eventos:', error);
      return [];
    }
  };

  // Función para enviar mensajes a Telegram
  const sendEventMessages = async (eventsToSend) => {
    const thread_id = 180; // ID del tema de Telegram
    for (const event of eventsToSend) {
      const message = `Evento próximo:
      
Título: ${event.titulo}
Fecha: ${event.fecha}
Hora: ${event.hora}
Descripción: ${event.descripcion}`;

      try {
        await sendTelegramMessage(message, event.imagen, thread_id);
        console.log(`Mensaje enviado para el evento: ${event.titulo}`);
      } catch (error) {
        console.error(`Error al enviar el mensaje para el evento: ${event.titulo}`, error);
      }
    }
  };

  // Configurar el intervalo para enviar mensajes y refrescar eventos
  useEffect(() => {
    const executeScheduler = async () => {
      const latestEvents = await fetchEvents(); // Obtener eventos más recientes
      await sendEventMessages(latestEvents); // Enviar mensajes con los eventos más recientes
    };

    executeScheduler(); // Ejecutar inmediatamente al montar el componente

    const interval = setInterval(() => {
      executeScheduler(); // Ejecutar periódicamente
    }, 86400000); // ms Un día

    return () => clearInterval(interval); // Limpiar intervalo al desmontar el componente
  }, []); // Ejecutar solo una vez al montar

  return null; // Este componente no necesita renderizar nada
};

export default EventosScheduler;
