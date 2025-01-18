import React, { useState } from 'react';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultImage from '../img/meeple_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);  // Estado para la política de privacidad

  const handleCookieClick = () => {
    setShowCookiePolicy(true);
  };

  const handlePrivacyClick = () => {
    setShowPrivacyPolicy(true);  // Mostrar el popup de la política de privacidad
  };

  const closePopup = () => {
    setShowCookiePolicy(false);
    setShowPrivacyPolicy(false);  // Cerrar ambos popups
  };

  return (
    <footer className="footer">
      <div className="footer-text">
        <div><img className="footer-text-img" src={defaultImage}/></div>
        <div>Dragón de Madera</div>
        <div>c/ Pepita Serrador 3, local 6</div>
        <div>18015 Granada</div>
      </div>

      <div className="social-icons">
        <a href="https://x.com/Dragon_DeMadera" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </a>
        <a href="https://www.facebook.com/AsocDragonDeMadera/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </a>
        <a href="https://www.instagram.com/dragon_demadera/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </a>
      </div>

      

      <div className="footer-links">
        <a onClick={handleCookieClick}>Política de cookies</a>
        <a onClick={handlePrivacyClick}>Política de privacidad</a>
        <a>
          <Link
            to="/quienessomos"
            className={window.location.pathname === '/quienessomos' ? 'active' : ''}
          >
            Hazte socio
          </Link>
        </a>
      </div>

      {showCookiePolicy && (
        <div className="popup">
          <div className="popup-content">
            <h2>Política de Cookies</h2>
            <p>
              Este sitio utiliza cookies para mejorar la experiencia del usuario. Las cookies permiten recordar tus
              preferencias, analizar el tráfico y personalizar el contenido. Puedes gestionar tus preferencias de cookies
              en cualquier momento desde la configuración de tu navegador.
            </p>
            <button onClick={closePopup} className="close-button">
              <span className="close-icon">×</span>
            </button>
          </div>
        </div>
      )}

      {showPrivacyPolicy && (
        <div className="popup">
          <div className="popup-content">
            <h2>Política de Privacidad</h2>
            <p>
              La protección de tus datos personales es importante para nosotros. Esta política de privacidad explica cómo
              recopilamos, usamos y protegemos la información que proporcionas a través de nuestro sitio web. Cumplimos con
              el Reglamento General de Protección de Datos (RGPD) de la Unión Europea para garantizar que tus datos estén
              protegidos y utilizados adecuadamente.
            </p>
            <button onClick={closePopup} className="close-button">
              <span className="close-icon">×</span>
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
