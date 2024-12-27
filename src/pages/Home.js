import React, { useState } from 'react';
import Counter from '../components/counter';
import partidaVideo from '../img/dragon_dnd.mp4'; // Ruta del video
import queenDragon from '../img/landing/queen_dragon.png';
import aso1 from '../img/quienes_somos/aso1.jpg';
import aso2 from '../img/quienes_somos/aso2.jpg';
import aso3 from '../img/quienes_somos/aso3.jpg';
import { faFacebook, faInstagram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import House from '../img/landing/House.png';
import Meeple from '../img/landing/Meeple.png';
import Evento from '../img/landing/Event.png';
import Discount from '../img/landing/Discount.png';
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

        <section className="info-section">
            <div id="carouselExampleRide" class="carousel slide carousel-info" data-bs-ride="true">
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <img src={aso1} class="d-block w-100" alt="..." />
                </div>
                <div class="carousel-item">
                  <img src={aso2} class="d-block w-100" alt="..." />
                </div>
                <div class="carousel-item">
                  <img src={aso3} class="d-block w-100" alt="..." />
                </div>
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleRide" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleRide" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>

          <article className="info-details">
            <h3>Dragón de Madera</h3>
            <p>Asociación sin ánimo de lucro</p>
            <p>Visítanos en:</p>
            <p>c/ Pepita Serrador 3, local 6</p>
            <p>18015 Granada</p>
            <ul className="info-social">
              <li><a href="https://twitter.com/your_profile" target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faTwitter} size="2x" />
                  </a>
              </li>
              <li>
                <a href="https://facebook.com/your_profile" target="_blank" rel="noopener noreferrer">
                          <FontAwesomeIcon icon={faFacebook} size="2x" style={{ color: '#4267B2' }} />
                </a>
              </li>
              <li>
                <a href="https://instagram.com/your_profile" target="_blank" rel="noopener noreferrer">
                          <FontAwesomeIcon icon={faInstagram} size="2x" />
                </a>
              </li>
            </ul>
          </article>
        </section>

        <section className="about-section">
          <article className="about-details">
            <h4>
              Si te gustan los juegos de mesa, vives en Granada o alrededores y quieres
              conocer gente nueva, ¡pásate a conocernos!
            </h4>
            <p>
              Disponemos de un local de 140m2 situado en La Chana y destinado a las
              actividades de la asociación.
            </p>
            <p>
              Disfruta de juegos clásicos y modernos en todo su esplendor con títulos
              que te sorprenderán y te distraerán desde el primer momento.
            </p>
          </article>
          <ul className="about-features">
  <li>
    <div className="feature-content">
      <img src={House} alt="House" />
      <p>Local</p>
    </div>
    <div className="hover-text">Local a disposición de los socios</div>
  </li>
  <li>
    <div className="feature-content">
      <img src={Meeple} alt="Meeple" />
      <p>Ludoteca</p>
    </div>
    <div className="hover-text">Amplia variedad de juegos en la ludoteca propia de la asociación</div>
  </li>
  <li>
    <div className="feature-content">
      <img src={Evento} alt="Event" />
      <p>Eventos</p>
    </div>
    <div className="hover-text">Eventos mensuales y extraordinarios</div>
  </li>
  <li>
    <div className="feature-content">
      <img src={Discount} alt="Discount" />
      <p>Descuentos</p>
    </div>
    <div className="hover-text">Descuentos en tiendas</div>
  </li>
</ul>

        </section>


    </div>

  );

  
};

export default Home;
