// components/chatbot.js

// Función para simular el "backend" y procesar la pregunta del usuario
const getChatbotResponse = (question) => {
  
    // Convertir la pregunta a minúsculas para hacer la búsqueda más robusta
    const lowerCaseQuestion = question.toLowerCase();
  
    // Horarios
    if (lowerCaseQuestion.includes('horario') || lowerCaseQuestion.includes('abierto')) {
      return 'El horario depende de cuando los socios monten partidas. Las próximas partidas se anuncian en la sección "Lista de partidas".';
  
    // Ubicación
    } else if (lowerCaseQuestion.includes('ubicación') || lowerCaseQuestion.includes('dónde están')) {
      return 'Nos encontramos en Calle Falsa 123, Ciudad Gótica. ¡Te esperamos!';
  
    // Juegos disponibles
    } else if (lowerCaseQuestion.includes('juegos') || lowerCaseQuestion.includes('ludoteca')) {
      return 'Nuestra ludoteca incluye una amplia variedad de juegos. Puedes ver todos nuestros juegos en la sección de Ludoteca. Están disponibles para socios y algunos para alquiler.';
  
    // Información sobre partidas
    } else if (lowerCaseQuestion.includes('partidas') || lowerCaseQuestion.includes('eventos') || lowerCaseQuestion.includes('evento')|| lowerCaseQuestion.includes('partida')) {
      return 'Puedes ver todas nuestras partidas y eventos en la sección "Lista de partidas". Recuerda que debes reservar tu lugar para algunos eventos especiales.';
  
    // Información sobre socios
    } else if (lowerCaseQuestion.includes('socio') || lowerCaseQuestion.includes('hacerse socio') || lowerCaseQuestion.includes('cuota')) {
      return 'Para hacerte socio, visita la sección "Quiénes somos". Allí podrás encontrar información sobre cómo unirte y las cuotas actuales.';
  
    // Actividades especiales
    } else if (lowerCaseQuestion.includes('actividades') || lowerCaseQuestion.includes('talleres') || lowerCaseQuestion.includes('torneos')) {
      return 'Organizamos torneos, talleres y eventos especiales regularmente. Puedes consultar el calendario de eventos en nuestra web para obtener más detalles sobre las próximas actividades.';
  
    // Beneficios de ser socio
    } else if (lowerCaseQuestion.includes('beneficios') || lowerCaseQuestion.includes('ventajas') || lowerCaseQuestion.includes('descuentos')) {
      return 'Como socio, puedes acceder a descuentos en eventos, alquiler de juegos y participar en torneos exclusivos. También puedes proponer partidas y usar nuestra ludoteca sin costo adicional.';
  
    // Cómo reservar partidas o eventos
    } else if (lowerCaseQuestion.includes('reservar') || lowerCaseQuestion.includes('inscribir')) {
      return 'Puedes reservar tu participación en partidas o eventos a través de nuestra página web en la sección "Lista de partidas".';
  
    // Normas y reglamentos
    } else if (lowerCaseQuestion.includes('reglas') || lowerCaseQuestion.includes('normas') || lowerCaseQuestion.includes('conducta')) {
      return 'Nuestro club promueve un ambiente de respeto y cooperación. Puedes consultar nuestras normas de conducta y participación en la sección "Normas" de la página web.';
  
    // Información sobre voluntariado
    } else if (lowerCaseQuestion.includes('voluntariado') || lowerCaseQuestion.includes('ayudar') || lowerCaseQuestion.includes('colaborar')) {
      return '¡Nos encanta que los socios y visitantes quieran colaborar! Si estás interesado en voluntariado o en ayudar en la organización de eventos, contáctanos a través de la página de contacto.';
  
    // Información sobre alquiler de juegos
    } else if (lowerCaseQuestion.includes('alquiler') || lowerCaseQuestion.includes('rentar') || lowerCaseQuestion.includes('prestar')) {
      return 'Alquilamos juegos de nuestra ludoteca a los socios. El costo del alquiler varía según el juego y el tiempo. Visita nuestra sección de Ludoteca para más detalles.';
  
    // Información sobre visitas y tarifas
    } else if (lowerCaseQuestion.includes('visitar') || lowerCaseQuestion.includes('entrada') || lowerCaseQuestion.includes('tarifa')) {
      return 'Puedes visitarnos cualquier día que tengamos partidas abiertas. La entrada es gratuita para socios y con un pequeño costo para no socios. Consulta la sección "Visítanos" para más detalles.';
  
    // Cómo proponer partidas
    } else if (lowerCaseQuestion.includes('partida')) {
      return 'Si eres socio, puedes proponer partidas a través de nuestra web o directamente con los organizadores en nuestra sede. ¡Nos encantaría ver tus ideas en acción!';
  
    // Información sobre pagos y métodos de pago
    } else if (lowerCaseQuestion.includes('pagar') || lowerCaseQuestion.includes('métodos de pago')) {
      return 'Aceptamos pagos en efectivo, tarjeta y transferencias bancarias. También puedes pagar las cuotas de socio a través de la web en la sección de pagos.';
  
    // Preguntas técnicas sobre juegos de mesa
    } else if (lowerCaseQuestion.includes('cómo jugar') || lowerCaseQuestion.includes('reglas de juego')) {
      return '¿Tienes dudas sobre cómo jugar un juego específico? ¡No te preocupes! En nuestra ludoteca tenemos las reglas de todos los juegos disponibles, y nuestros socios estarán encantados de explicarte cualquier cosa.';
  
    // Información sobre devoluciones de juegos o eventos cancelados
    } else if (lowerCaseQuestion.includes('devoluciones') || lowerCaseQuestion.includes('cancelación')) {
      return 'Si no puedes asistir a un evento al que te has inscrito, por favor notifícanos con antelación para ver las opciones de reembolso o cambio de fecha.';
  
    // Preguntas divertidas o inapropiadas
    } else if (lowerCaseQuestion.includes('comida') || lowerCaseQuestion.includes('bebida')) {
      return '¡Por supuesto que puedes traer comida y bebida, pero cuidado con derramar algo sobre los juegos! Los Meeples no saben nadar.';
  
    } else if (lowerCaseQuestion.includes('te casas conmigo') || lowerCaseQuestion.includes('tienes novio') || lowerCaseQuestion.includes('salir conmigo')) {
      return '¡Oh, qué halago! Pero soy un chatbot dedicado al club de juegos de mesa, y mi corazón pertenece a los Meeples y los dados de 20 caras.';
  
    } else if (lowerCaseQuestion.includes('eres humano') || lowerCaseQuestion.includes('inteligente') || lowerCaseQuestion.includes('gilipollas') || lowerCaseQuestion.includes('mierda')) {
      return 'Soy un simple chatbot, pero gracias por la duda existencial. Si fuera humano, probablemente estaría jugando "Catan" en lugar de responder preguntas aquí.';
  
    } else if (lowerCaseQuestion.includes('qué opinas de') || lowerCaseQuestion.includes('qué te parece')) {
      return 'Como chatbot, no tengo opiniones propias, pero creo que lo importante es ¡divertirse jugando juegos de mesa!';
  
    } else if (lowerCaseQuestion.includes('contacto') || lowerCaseQuestion.includes('whatsapp') || lowerCaseQuestion.includes('escribir') || lowerCaseQuestion.includes('persona') || lowerCaseQuestion.includes('telegram') ) {
        return 'Tenemos grupos de chat y redes sociales en las que puedes escribirnos si quieres más información';
    
    // Si no se encuentra ninguna coincidencia
    } else {
      return `Lo siento, no he entendido lo que me preguntas. Puedes preguntar por el grupo de whatsapp y seguro que alguien te responderá de forma más específica`;
    }
  };
  

// Exportar la función para ser utilizada en el componente Home
export default getChatbotResponse;
