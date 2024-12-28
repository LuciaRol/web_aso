import React from 'react';
import '../styles/Modal.css'; // Asegúrate de crear un CSS para el modal

const Modal = ({ isOpen, onClose, event }) => {
    if (!isOpen || !event) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>✖</button>
                <h2>{event.title}</h2>
                <img src={event.img} alt={event.title} />
                <p>{event.description}</p>
                <p><strong>Fecha:</strong> {event.date}</p>
            </div>
        </div>
    );
};

export default Modal;
