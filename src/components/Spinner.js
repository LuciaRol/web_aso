import React from 'react';
import '../styles/styles.css'; // Asegúrate de que la ruta sea correcta

const Spinner = () => {
    return (
        <div className="spinner-overlay">
        <div className="spinner"></div>
        <p className="spinner-message">La paciencia es una virtud!</p>
        </div>
    );
};

export default Spinner;
