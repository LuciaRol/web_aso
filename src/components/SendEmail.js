// src/components/SendEmail.js
import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import '../styles/whoweare.css';

const SendEmail = () => {
  const [emailData, setEmailData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData({ ...emailData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus(null); // Reinicia el estado antes de enviar

    // Configuración de EmailJS
    const serviceID = 'service_uemdbp5'; // Sustituye con tu service_id de EmailJS
    const templateID = 'template_9848ss1'; // Sustituye con tu template_id de EmailJS
    const userID = 'Gzq_yUi6d-AX7f9pq'; // Sustituye con tu user_id de EmailJS

    emailjs.send(serviceID, templateID, emailData, userID)
      .then((response) => {
        console.log('Correo enviado con éxito:', response);
        setStatus({ success: true, message: '¡Correo enviado con éxito!' });
        setEmailData({ name: '', email: '', message: '' });
      })
      .catch((error) => {
        console.error('Hubo un error al enviar el correo:', error);
        setStatus({ success: false, message: 'Hubo un error al enviar el correo. Inténtalo nuevamente.' });
      });
  };

  return (
    <div className="email-container">
    {status && (
      <p className={`status-message ${status.success ? 'success' : 'error'}`}>
        {status.message}
      </p>
    )}
    <form onSubmit={handleSubmit} className="email-form">
      <label className="email-label">
        Nombre:
        <input
          type="text"
          name="name"
          value={emailData.name}
          onChange={handleChange}
          required
          className="email-input"
        />
      </label>
      <label className="email-label">
        Correo Electrónico:
        <input
          type="email"
          name="email"
          value={emailData.email}
          onChange={handleChange}
          required
          className="email-input"
        />
      </label>
      <label className="email-label">
        Mensaje:
        <textarea
          name="message"
          value={emailData.message}
          onChange={handleChange}
          required
          className="email-textarea"
        />
      </label>
      <button type="submit" className="">Enviar Email</button>
    </form>
  </div>
  );
};

export default SendEmail;
