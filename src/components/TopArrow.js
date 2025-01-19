import React, { useEffect } from 'react';
import '../styles/toparrow.css';

/* Pequeño componente de flechita que aparece en agunas páginas: al clicar lleva al principio de la misma */
const TopArrow = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollUpButton = document.querySelector('.scroll-up');

      if (scrollUpButton) {
        if (window.scrollY > 100) {
          scrollUpButton.classList.add('_show-scroll');
        } else {
          scrollUpButton.classList.remove('_show-scroll');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Limpia el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="top-arrow">
      <a id="scroll-up" className="scroll-up" href="#">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 0h24v24H0z" fill="none"></path>
          <path fill="rgba(255,255,255,1)" d="M11.9997 10.8284L7.04996 15.7782L5.63574 14.364L11.9997 8L18.3637 14.364L16.9495 15.7782L11.9997 10.8284Z"></path>
        </svg>
      </a>
    </div>
  );
};

export default TopArrow;
