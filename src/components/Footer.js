import { faFacebook, faInstagram, faTwitter, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import '../styles/footer.css'; // Ensure the CSS file is imported

const Footer = () => {
  return (
    <footer className="footer">
      <div className="social-icons">
        <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faWhatsapp} size="2x" />
        </a>
        <a href="https://x.com/Dragon_DeMadera" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </a>
        <a href="https://www.facebook.com/AsocDragonDeMadera/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </a>
        <a href="https://www.instagram.com/dragon_demadera/" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
      </div>
      <div className='footer-text'>
        <p>©2025 Developed by Lucía Rodríguez López</p>
      </div>
      <div className='footer-links'>
        <a>Política de cookies</a>
        <a>Política de privacidad</a>
      </div>
    </footer>
  );
};

export default Footer;
