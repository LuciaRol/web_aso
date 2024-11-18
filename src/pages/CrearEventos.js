import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import { firestore } from '../firebase'; // Importa la instancia de Firestore

// Componente para ingresar la URL de la imagen
const FormularioImagen = ({ setImagen }) => {
  const [urlImagen, setUrlImagen] = useState('');

  const handleChange = (e) => {
    setUrlImagen(e.target.value);
  };

  const handleBlur = () => {
    setImagen(urlImagen); // Actualiza el estado del formulario principal
  };

  return (
    <div className="form-group">
      <label htmlFor="imagen">URL de la Imagen</label>
      <input
        id="imagen"
        className="form-control"
        type="url"
        placeholder="Ingresa la URL de la imagen"
        value={urlImagen}
        onChange={handleChange}
        onBlur={handleBlur} // Actualiza la URL cuando el input pierde el foco
      />
    </div>
  );
};

// Componente principal para crear un evento
const FormularioEvento = () => {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState(''); // Estado para la URL de la imagen
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titulo || !fecha || !hora || !descripcion || !imagen) {
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
        imagen, // Guarda la URL de la imagen
        fechaHoraCreacion: serverTimestamp(), // Agregar la fecha de creación
      });

      setExito('Evento creado correctamente');
      // Limpiar el formulario después de crear el evento
      setTitulo('');
      setFecha('');
      setHora('');
      setDescripcion('');
      setImagen(''); // Limpiar el campo de la imagen
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

        {/* Incluir el componente de imagen */}
        <FormularioImagen setImagen={setImagen} />

        <button className="submit-button" type="submit">Crear Evento</button>
      </form>

      {exito && <div className="success-message">{exito}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FormularioEvento;
