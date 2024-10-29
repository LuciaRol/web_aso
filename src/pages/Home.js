import React from 'react';
import Counter from '../components/counter';
import partidaAbierta from '../img/dragon_dnd.jpg';
import '../styles/home.css';

const Home = () => {
  // const [showChat, setShowChat] = useState(false);
  // const [questionCount, setQuestionCount] = useState(0);
  // const MAX_QUESTIONS = 10;

  // const handleEnd = () => {
  //   alert('La conversación ha terminado. ¡Gracias por usar nuestro chatbot!');
  // };

  // const steps = [
  //   {
  //     id: '1',
  //     message: '¡Hola! Soy un asistente virtual del Club de Juegos de Mesa. ¿En qué te puedo ayudar?',
  //     trigger: '2',
  //   },
  //   {
  //     id: '2',
  //     user: true,
  //     trigger: ({ value }) => {
  //       if (questionCount < MAX_QUESTIONS - 1) {
  //         setQuestionCount(questionCount + 1);
  //         return '3';
  //       } else {
  //         return 'end';
  //       }
  //     },
  //   },
  //   {
  //     id: '3',
  //     message: ({ previousValue }) => {
  //       const response = getChatbotResponse(previousValue);
  //       return response;
  //     },
  //     trigger: '4',
  //   },
  //   {
  //     id: '4',
  //     message: '¿Tienes otra pregunta?',
  //     trigger: '5',
  //   },
  //   {
  //     id: '5',
  //     options: [
  //       { value: 'yes', label: 'Sí', trigger: '2' },
  //       { value: 'no', label: 'No', trigger: 'end' },
  //     ],
  //   },
  //   {
  //     id: 'end',
  //     message: '¡Gracias por tus preguntas! Si tienes más dudas, no dudes en preguntar más tarde.',
  //     end: true,
  //   },
  // ];

  // const toggleChat = () => {
  //   setShowChat(!showChat);
  //   setQuestionCount(0); // Reiniciar contador de preguntas al abrir el chat
  // };

  return (
    <div className="home-container">
      <div className="background-container">
        <img src={partidaAbierta} alt="Board Game Club" className="home-image" />
        <div className="overlay"></div>
      </div>

      <div className="overlay-text">
        <h1>Dragón de Madera</h1>
        <p>Tu asociación de juegos de mesa, rol, wargames y miniaturas de Granada.</p>
        
        {/* Sección de contadores */}
        <div className="counter-section">
          {/* Cuadrado del contador de juegos */}
          <div className="counter-box">
            <h2 className="counter-title">Juegos</h2>
            <Counter endValue={900} />
          </div>

          {/* Cuadrado del contador de partidas */}
          <div className="counter-box">
            <h2 className="counter-title">Partidas</h2>
            <Counter endValue={300} />
          </div>
        </div>
      </div>

      {/* <div className={`chatbot-container ${showChat ? 'active' : ''}`}>
        <div className="chatbot-header">
          <button className="chatbot-close-button" onClick={toggleChat}>
            &times;
          </button>
        </div>
        <ChatBot
          steps={steps}
          handleEnd={handleEnd}
          headerTitle={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={nuevoLogo} alt="Logo" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
              <span>Chatbot</span>
            </div>
          }
        />
      </div>

      {!showChat && (
        <div className="floating-chat-button">
          <button onClick={toggleChat} className="fancy-chat-toggle-button">
            <img src={meepleImage} alt="Meeple" className="meeple-icon" />
            ¡Pregunta al chatbot!
          </button>
        </div>
      )} */}
    </div>
  );
};

export default Home;
