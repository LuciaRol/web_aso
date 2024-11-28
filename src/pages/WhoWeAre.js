import React, { useState } from 'react';
import homer_a from '../img/quienes_somos/homer_a.jpg';
import homer_b from '../img/quienes_somos/homer_b.jpg';
import peter_parker from '../img/quienes_somos/peter_parker.jpg';
import spiderman from '../img/quienes_somos/spiderman.jpg';
import { FaWhatsapp } from 'react-icons/fa'; // Importamos el icono de WhatsApp
import '../styles/whoweare.css'; // Importa el CSS correspondiente

const members = [
  {
    id: 1,
    name: 'Homer',
    imgA: homer_a,
    imgB: homer_b,
    messageA: 'Soy Homer',
    messageB: 'El tarugo número 1'
  },
  {
    id: 2,
    name: 'Amigo y vecino',
    imgA: peter_parker,
    imgB: spiderman,
    messageA: 'Soy el verdadero Spiderman',
    messageB: 'El verdadero Spiderman soy yo!'
  },
];

const Member = ({ member }) => {
  const [isToggled, setIsToggled] = useState(false);

  const handleClick = () => {
    setIsToggled(!isToggled);
  };

  return (
    <div className="member-container" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className={`member-content ${isToggled ? 'flipped' : ''}`}>
        <div className="member-front">
          <div className="member-name">{member.name}</div>
          <img src={member.imgA} alt={member.name} style={{ width: '150px', height: '150px' }} />
          <p className="member-message">{member.messageA}</p>
        </div>
        <div className="member-back">
          <div className="member-name">{member.name}</div>
          <img src={member.imgB} alt={member.name} style={{ width: '150px', height: '150px' }} />
          <p className="member-message">{member.messageB}</p>
        </div>
      </div>
    </div>
  );
};

const WhoWeAre = () => {
  const [isBannerVisible, setIsBannerVisible] = useState(true); // Estado para mostrar/ocultar el banner

  const handleCloseBanner = () => {
    setIsBannerVisible(false); // Cerrar el banner
  };

  return (
    <div>
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

      <h2>¿Quiénes somos?</h2>
      <div className="description">
        <p>
          Bienvenidos a nuestro club de juegos de mesa, un refugio para los entusiastas de todas las edades y niveles de experiencia. Fundado por un grupo de amigos apasionados, nuestro club es más que un simple lugar de reunión; es un espacio donde la imaginación cobra vida y las amistades se forjan entre risas y estrategias. 
        </p>
        <p>
          Desde nuestros humildes comienzos, nuestro propósito ha sido claro: crear una comunidad inclusiva y vibrante donde cada miembro pueda explorar nuevos mundos, enfrentarse a desafíos épicos y disfrutar del espíritu de la camaradería. Ya sea que prefieras juegos de estrategia, aventuras temáticas, o clásicos familiares, aquí encontrarás un asiento en la mesa esperando por ti.
        </p>
        <p>
          Únete a nosotros y descubre el poder de los juegos de mesa para conectar, educar y, sobre todo, divertir. ¡Que empiecen los juegos!
        </p>
      </div>


      
      {/* Sección de contacto */}
      <h2>¿Cómo contactarnos?</h2>
      <p style={{ textAlign: 'center' }}>
      <p>Si tienes alguna pregunta o quieres unirte a nuestro grupo, puedes enviarnos un mensaje o unirte a nuestro grupo de WhatsApp haciendo clic en el siguiente icono:</p>
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp size={50} color="#25D366" /> {/* Icono de WhatsApp */}
        </a>
      </div>

      <h2>Nuestros Miembros</h2>
      <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
        Haz clic en los miembros para ver su identidad secreta.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {members.map(member => (
          <Member key={member.id} member={member} />
        ))}
      </div>

    </div>
  );
};

export default WhoWeAre;
