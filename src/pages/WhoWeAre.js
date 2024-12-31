import React, { useState } from 'react';
import qrCode from '../img/quienes_somos/qr_code.png';
import aso1 from '../img/quienes_somos/aso1.jpg';
import aso2 from '../img/quienes_somos/aso2.jpg';
import aso3 from '../img/quienes_somos/aso3.jpg';
import SendEmail from '../components/SendEmail';
import { FaWhatsapp } from 'react-icons/fa'; // Importamos el icono de WhatsApp
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../styles/whoweare.css'; // Importa el CSS correspondiente




const WhoWeAre = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true); // Estado para mostrar/ocultar el banner
  const [formData, setFormData] = useState({ name: '', email: '', message: '' }); // Estado para el formulario

  const handleCloseBanner = () => {
    setIsBannerVisible(false); // Cerrar el banner
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    alert('¡Gracias por tu mensaje!');
    setFormData({ name: '', email: '', message: '' }); // Limpiar el formulario
  };

  return (
    <div className='who-container'>
      {/* Banner publicitario */}
      {isBannerVisible && (
        <div className="ad-banner">
          <div className="ad-banner-text">
            <p>¡Bebe Grog! Una bebida tan fuerte que puede disolver una jarra de metal.</p>
          </div>
          <button className="ad-banner-close" onClick={handleCloseBanner}>
            &times; {/* Icono de cerrar */}
          </button>
        </div>
      )}

      <h2>¡Bienvenidos!</h2>


    {/* Carrusel de fotos */}
    <section>
      <div id="carouselExampleRide" class="carousel slide" data-bs-ride="true">
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


      <div className="description-container">
        <div className="description custom-description">
          <p>
            Somos una asociación cultural sin ánimo de lucro, que fomenta el ocio a través de los juegos de mesa, pero también hacemos pintura de miniaturas, cineforums, rol, videojuegos, etc.
          </p>
          <p>
            Disponemos de un local de 140m2 situado en el barrio de la Chana y destinado exclusivamente a las actividades propias de nuestra asociación.
          </p>
          <p>
            Disfruta de juegos modernos en todo su esplendor con títulos que te sorprenderán y distraerán desde el primer momento. 
            La gran cantidad de socios permite que se organicen partidas de todo tipo (temáticas, mecánicas, dificultad) a diferentes horarios.
          </p>
          <p>
            No tenemos un horario de apertura fijo, sino que los socios van abriendo partidas a diferentes horas en función de su disponibilidad. 
            Si alguien que no es socio se quiere sumar, la mejor manera es ver el calendario de actividades donde aparecen las partidas y los huecos disponibles. 
            Si alguna partida te interesa, pregúntanos en las redes sociales o únete al chat de WhatsApp para contactar con el organizador.
          </p>
          <p>
            Colaboramos y participamos en varios eventos relacionados con el sector, ¡ven a conocernos!
          </p>
        </div>
      </div>
    </section>

    <section className="visit-us-section">
      <h2 className="visit-us-heading">Visítanos</h2>
        <div className="description custom-description">
          <ul className="visit-us-list">
            <li>Tiene 3 invitaciones gratuitas para asistir a partidas privadas.</li>
            <li>Organizamos eventos gratuitos periódicamente, ¡síguenos en redes sociales!</li>
            <li>Si te interesa hacerte socio, te recomendamos usar tus invitaciones y conocernos.</li>
          </ul>
        </div>
    </section>

    {/* Sección de contacto */}
    <section className="contact-section">
      <h2 className="contact-heading">Contacto</h2>
      <p className="contact-description">
        Si tienes alguna pregunta o quieres unirte a nuestro grupo, puedes enviarnos un mensaje o unirte a nuestro grupo de WhatsApp haciendo clic en el siguiente icono:
      </p>

      <div className="contact-content">
        <div className="contact-qr-container">
          <h2 className="contact-qr-heading">Grupo de WhatsApp</h2>
          <div>
            <img
              src={qrCode}
              alt="Código QR para acceder al grupo de WhatsApp del Dragón de Madera"
              className="contact-qr-image"
            />
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="email-form-container">
          
          <h2 className="email-heading">Envíanos un Email</h2>
          <SendEmail />
        </div>
      </div>
    </section>

    <div className="whatsapp-container">
      <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
        <FaWhatsapp size={50} color="#25D366" className="whatsapp-icon" /> {/* Icono de WhatsApp */}
      </a>
    </div>
  </div>
);
};

export default WhoWeAre;