import React, { useState } from 'react';
import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import defaultImage from '../img/meeple_logo.png';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);  

  /* Se abren los pop ups al hacer clic en el enlace */
  const handleCookieClick = () => {
    setShowCookiePolicy(true);
  };

  const handlePrivacyClick = () => {
    setShowPrivacyPolicy(true);  
  };

  /* Se cierran los pop ups al hacer clic en el botón de cerrar */
  const closePopup = () => {
    setShowCookiePolicy(false);
    setShowPrivacyPolicy(false);  
  };

  return (
    /* Footer */
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

      {/* Pop up de la política de cookies */}
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

      {/* Pop up de la política de privacidad */}
      {showPrivacyPolicy && (
        <div className="popup">
          <div className="popup-content">
            <h2>Política de Privacidad</h2>
            <p>
            A través de este sitio web no se recaban datos de carácter personal de las personas usuarias sin su conocimiento, ni se ceden a terceros.

            Dragón de Madera no utiliza cookies para recoger información de las personas usuarias, ni registra las direcciones IP de acceso. Únicamente se utilizan cookies de sesión, con finalidad técnica (aquellas que permiten la navegación a través del sitio web y la utilización de las diferentes opciones y servicios que en ella existen).

            El portal del que es titular Dragón de Madera contiene enlaces a sitios web de terceros, cuyas políticas de privacidad son ajenas a la de la AEPD. Al acceder a tales sitios web usted puede decidir si acepta sus políticas de privacidad y de cookies. Con carácter general, si navega por internet usted puede aceptar o rechazar las cookies de terceros desde las opciones de configuración de su navegador.
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
