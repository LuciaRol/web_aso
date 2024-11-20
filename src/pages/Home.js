import React from 'react';
import Counter from '../components/counter';
import partidaAbierta from '../img/dragon_dnd.jpg';
import '../styles/home.css';

const Home = () => {
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
   </div>
  );
};

export default Home;
