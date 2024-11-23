// src/components/Counter.js
import React, { useEffect, useState } from 'react';
import '../styles/counter.css'; // Importa el CSS para el contador

const Counter = ({ endValue }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 10000; // Duración de la animación en milisegundos
    const increment = endValue / (duration / 100); // Incremento por intervalo

    const timer = setInterval(() => {
      setCount((prevCount) => {
        if (prevCount < endValue) {
          return Math.min(prevCount + increment, endValue);
        } else {
          clearInterval(timer);
          return prevCount; // Detener el conteo
        }
      });
    }, 100);

    return () => clearInterval(timer); // Limpiar el intervalo al desmontar el componente
  }, [endValue]);

  return (
    <div className="elementor-counter">
      <div className="elementor-counter-number-wrapper">
        <span className="elementor-counter-number-suffix">+</span>
        <span className="elementor-counter-number" data-duration="2000" data-to-value={endValue} data-from-value="0">
          {Math.floor(count)}
        </span>
        <span className="elementor-counter-number-prefix"></span>
      </div>
    </div>
  );
};

export default Counter;
