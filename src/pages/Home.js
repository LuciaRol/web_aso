import React, { useState } from 'react';
import Counter from '../components/counter';
import partidaVideo from '../img/dragon_dnd.mp4'; // Ruta del video
import '../styles/home.css';

const Home = () => {
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Maneja el cambio de estado cuando el video está listo
  const handleVideoReady = () => {
    setIsVideoReady(true);
  };

  return (
    <div className="home-container">
      {/* Mostrar el video de fondo en bucle */}
      <video
        className="home-video"
        autoPlay
        muted
        loop={true} // El video se reproduce en bucle
        onCanPlay={handleVideoReady}
        style={{ display: isVideoReady ? 'block' : 'none' }} // Ocultar hasta que esté listo
      >
        <source src={partidaVideo} type="video/mp4" />
        Tu navegador no soporta videos HTML5.
      </video>

      {/* Texto superpuesto */}
      {isVideoReady && (
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
      )}
    </div>
  );
};

export default Home;
