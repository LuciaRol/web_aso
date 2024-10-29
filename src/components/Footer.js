import { faFacebook, faInstagram, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import '../styles/styles.css'; // Ensure the CSS file is imported

const Footer = () => {
  return (
    <footer className="footer">
      <p>Síguenos en nuestras redes</p>
      <div className="social-icons">
        <a href="https://telegram.me/your_channel" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTelegram} size="2x" />
        </a>
        <a href="https://twitter.com/your_profile" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </a>
        <a href="https://facebook.com/your_profile" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </a>
        <a href="https://instagram.com/your_profile" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
