import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { firestore } from '../firebase'; // Importa la instancia de Firestore

const FormularioEvento = () => {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !fecha || !hora || !descripcion) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      const eventosCollectionRef = collection(firestore, 'eventos'); // Colección de eventos
      // Añadir el evento a Firestore
      await addDoc(eventosCollectionRef, {
        titulo,
        fecha,
        hora,
        descripcion,
        fechaHoraCreacion: serverTimestamp(), // Agregar la fecha de creación
      });

      setExito('Evento creado correctamente');
      // Limpiar el formulario después de crear el evento
      setTitulo('');
      setFecha('');
      setHora('');
      setDescripcion('');
    } catch (error) {
      setError('Error al crear el evento: ' + error.message);
    }
  };

  return (
    <div className="form-container">
      <h1>Crear un Evento</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            className="form-control"
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fecha">Fecha</label>
          <input
            id="fecha"
            className="form-control"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="hora">Hora</label>
          <input
            id="hora"
            className="form-control"
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            className="form-control"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>

        <button className="submit-button" type="submit">Crear Evento</button>
      </form>

      {exito && <div className="success-message">{exito}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FormularioEvento;
