import React, { useState } from "react";
import '../styles/cookiebanner.css';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  const handleAccept = () => {
    setIsVisible(false);
    localStorage.setItem("cookiesAccepted", "true"); // Guarda el estado en el almacenamiento local
  };

  React.useEffect(() => {
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (cookiesAccepted) {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p>
        Este sitio web utiliza cookies de terceros para mejorar la experiencia del usuario. 
        Al aceptar, consientes el uso de cookies.
      </p>
      <button className="accept-btn" onClick={handleAccept}>
        Aceptar
      </button>
    </div>
  );
};

export default CookieBanner;
