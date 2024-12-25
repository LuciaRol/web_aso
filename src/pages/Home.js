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

        <article>
          <h3>Dragón de madera</h3>
          <p>Asociación sin ánimo de lucro</p>
          <p>Visítanos en:</p>
          <p>c/ Pepita Serrador 3, local 6</p>
          <p>18015 Granada</p>
          <ul>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </article>
      </section>

      <section>
        <article>
          <h4>Si te gustan los juegos de mesa, vives en Granada o alrededores y quieres conocer gente nueva, ¡pásate a conocernos!</h4>
          <p>Disponemos de un local de 140m2 situado en La Chana y destinado a las actividades de la asociación.</p>
          <p>Disfruta de juegos clásicos y modernos en todo su esplendor con títulos que te sorprenderán y te distraerán desde el primer momento.</p>
        </article>
        <ul>
          <li>Local</li>
          <li>Ludoteca</li>
          <li>Eventos</li>
          <li>Descuentos</li>
        </ul>
      </section>

    </div>

  );

  
};

export default Home;
