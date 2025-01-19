import React from 'react';
import '../styles/styles.css'; 

const Spinner = () => {
    /* spinner de carga cuando tarda en cargar un página */
    return (
        <div className="spinner-overlay">
        <div className="spinner"></div>
        <p className="spinner-message">La paciencia es una virtud!</p>
        </div>
    );
};

export default Spinner;
