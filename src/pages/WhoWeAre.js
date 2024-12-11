import React, { useState } from 'react';
import homer_a from '../img/quienes_somos/homer_a.jpg';
import homer_b from '../img/quienes_somos/homer_b.jpg';
import peter_parker from '../img/quienes_somos/peter_parker.jpg';
import spiderman from '../img/quienes_somos/spiderman.jpg';
import qrCode from '../img/quienes_somos/qr_code.png';
import SendEmail from '../components/SendEmail';
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

      <h2>¡Bienvenidos!</h2>
      <div className="description">
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
          Colaboramos y participamos en varios eventos relacionados con el sector, ¡ven a conocernos!
        </p>
      </div>

      <h2>Visítanos</h2>
      <div className="description">
        <ul>
          <li>Tiene 3 invitaciones gratuitas para asistir a partidas privadas.</li>
          <li>Organizamos eventos gratuitos periódicamente, ¡síguenos en redes sociales!</li>
          <li>Si te interesa hacerte socio, te recomendamos usar tus invitaciones y conocernos.</li>
        </ul>
        <p>
          No tenemos un horario de apertura fijo, sino que los socios van abriendo partidas a diferentes horas en función de su disponibilidad. 
          Si alguien que no es socio se quiere sumar, la mejor manera es ver el calendario de actividades donde aparecen las partidas y los huecos disponibles. 
          Si alguna partida te interesa, pregúntanos en las redes sociales o únete al chat de WhatsApp para contactar con el organizador.
        </p>
      </div>

      {/* Sección de contacto */}
      <h2>Contacto</h2>
      <p>
        Si tienes alguna pregunta o quieres unirte a nuestro grupo, puedes enviarnos un mensaje o unirte a nuestro grupo de WhatsApp haciendo clic en el siguiente icono:
      </p>
      
      <div>
        <div>
          <img src={qrCode} alt="Código QR para acceder al grupo de WhatsApp del Dragón de Madera" />
        </div>
      </div>

      <div>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp size={50} color="#25D366" /> {/* Icono de WhatsApp */}
        </a>
      </div>

      {/* EL FORMULARIO VA AQUÍ */}
      <div>
        <SendEmail />
      </div>

      {/* Miembros */}
      {members.length > 0 && (
        <>
          <h2>Nuestros Miembros</h2>
          <p style={{ textAlign: 'center', fontStyle: 'italic' }}>
            Haz clic en los miembros para ver su identidad secreta.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {members.map(member => (
              <Member key={member.id} member={member} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WhoWeAre;
