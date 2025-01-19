import React, { useState } from 'react';
import Counter from '../components/counter';
import partidaVideo from '../img/dragon_dnd.mp4'; // Ruta del video
import aso1 from '../img/quienes_somos/aso1.jpg';
import aso2 from '../img/quienes_somos/aso2.jpg';
import aso3 from '../img/quienes_somos/aso3.jpg';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import House from '../img/landing/House.png';
import Meeple from '../img/landing/Meeple.png';
import Evento from '../img/landing/Event.png';
import Discount from '../img/landing/Discount.png';
import Wood from '../img/landing/wood3.webp';
import DragonMobile from '../img/landing/dragon-mobile.png';
import '../styles/home.css';
import TopArrow from '../components/TopArrow';
import CookieBanner from "../components/CookieBanner";

const Home = () => {
  return (
    <div className="home-container">
      <CookieBanner /> {/* Banner de cookies */}
        <main className="image-container">

          <div class="image-container-mobile">
            <img src={Wood} alt="Dragón dormido tallado en madera. está acostado sobre una mesa. Delante de él hay un tablero de un juego de mesa y un peón. Detrás, hay estanterías llenas de juegos y una lámpara colgante en la esquina superior derecha."/>
          </div>

          <div class="image-container-alternative">
            <img src={DragonMobile} alt="Dragón dormido tallado en madera. está acostado sobre una mesa. Delante de él hay un tablero de un juego de mesa y un peón. Detrás, hay estanterías llenas de juegos y una lámpara colgante en la esquina superior derecha."/>
          </div>
          
          <div class="video-container">
            <video src={partidaVideo} autoPlay loop muted className="video-background" alt="Video de un dragón que llega volando desde la esquina superior izquierda, aterriza en una planicie rocosa y lanza fuego barriendo todo el área de izquierda a derecha." />
          </div>

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

        {/* Carrusel de fotos */}
        <section className="info-section">
            <div id="carouselExampleRide" class="carousel slide carousel-info" data-bs-ride="true" >
              <div class="carousel-inner">
                <div class="carousel-item active">
                  <img src={aso1} class="d-block w-100" alt="Foto del local de la asociación. Las paredes están llenas de estanterías con juegos. En el centro hay varias mesas con sillas. Cinco mesas están ocupadas con gente jugando a juegos de mesa. Al fondo se ve una ventana roja y la puerta de entrada." />
                </div>
                <div class="carousel-item">
                  <img src={aso2} class="d-block w-100" alt="Foto del local de la asociación en un plano más cercano. Hay dos mesas llenas de gente jugando a juegos de mesa. La parded de atrás está revestida con estanterías con juegos." />
                </div>
                <div class="carousel-item">
                  <img src={aso3} class="d-block w-100" alt="Foto en primer plano de unas minis del juego Wonderland Wars, de izquierda a derecha: la Reina de orazones en rojo, el Sombrerero Loco en violeta, un dragón en verde, Alicia en azul y blanco y el gato de Cheshire en fucsia." />
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

          {/* Secciones de texto */}
          <article className="info-details">
            <h3>Dragón de Madera</h3>
            <p>Asociación sin ánimo de lucro</p>
            <p>c/ Pepita Serrador 3, local 6</p>
            <p>18015 Granada</p>
            <p className="info-social">
              <li><a href="https://x.com/Dragon_DeMadera" target="_blank" rel="noopener noreferrer" alt="Icono antiguo de twitter">
                  <FontAwesomeIcon icon={faTwitter} size="2x" style={{ color: '#2c3e50' }} />
                  </a>
              </li>
              <li>
                <a href="https://www.facebook.com/AsocDragonDeMadera/" target="_blank" rel="noopener noreferrer" alt="Icono de facebook">
                  <FontAwesomeIcon icon={faFacebook} size="2x" style={{ color: '#2c3e50' }} />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/dragon_demadera/" target="_blank" rel="noopener noreferrer" alt="Icono de instagram">
                  <FontAwesomeIcon icon={faInstagram} size="2x" style={{ color: '#2c3e50' }} />
                </a>
              </li>
              <li>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" alt="Icono de whatsapp">
                <FontAwesomeIcon icon={faWhatsapp} size="2x" style={{ color: '#2c3e50' }} />
                </a>
              </li>
            </p>
          </article>
        </section>

        {/* Iconos */}
        <section className="about-section">
          <article className="about-details">
            <h4>
              <strong>
              Si te gustan los juegos de mesa, vives en Granada o alrededores y quieres
              conocer gente nueva, ¡pásate a conocernos!
              </strong>
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
                <img src={House} alt="Círculo relleno en naranja con el icono de una casita de frente en blanco."/>
                <p>Local</p>
              </div>
              <div className="hover-text"><p>Local a disposición de los socios</p></div>
            </li>
            <li>
              <div className="feature-content">
                <img src={Meeple} alt="Círculo relleno en naranja con el icono de un peón en blanco." />
                <p>Ludoteca</p>
              </div>
              <div className="hover-text"><p>Amplia variedad de juegos en la ludoteca</p></div>
            </li>
            <li>
              <div className="feature-content">
                <img src={Evento} alt="Círculo relleno en naranja con un calensario marcado en blanco." />
                <p>Eventos</p>
              </div>
              <div className="hover-text"><p>Eventos mensuales y extraordinarios</p></div>
            </li>
            <li>
              <div className="feature-content">
                <img src={Discount} alt="Círculo relleno en naranja con el símbolo de porcentaje en blanco." />
                <p>Descuentos</p>
              </div>
              <div className="hover-text"><p>Descuentos en tiendas colaboradoras</p></div>
            </li>
          </ul>

        </section>
        <TopArrow />
    </div>
  );
};

export default Home;
