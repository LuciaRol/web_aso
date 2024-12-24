import React, { useState } from 'react';
import Counter from '../components/counter';
import partidaVideo from '../img/dragon_dnd.mp4'; // Ruta del video
import logoNegro from '../img/landing/logo_negro_transp.png';
import queenDragon from '../img/landing/queen_dragon.png';
import '../styles/home.css';

const Home = () => {
  

  return (
    <div className="home-container">

        <main className="image-container">
          <img src={queenDragon}/>

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
        </main>

      

      <section>
        <div>
          <img src={logoNegro}/>
        </div>
      </section>



      </div>

      



  );

  
};

export default Home;
