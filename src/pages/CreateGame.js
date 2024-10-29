import axios from 'axios';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner'; // Importa el componente Spinner
import '../styles/creategame.css'; // Import the CSS file

import { auth, firestore } from '../firebase';

const CreateGame = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gameResults, setGameResults] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [numJugadoresMax, setNumJugadoresMax] = useState(0);
  const [duracion, setDuracion] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [user] = useAuthState(auth);
  const [nombreCompletoUsuario, setNombreCompletoUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [noResultsMessage, setNoResultsMessage] = useState('');
  const [abortController, setAbortController] = useState(null);
  const [partidaTipo, setPartidaTipo] = useState('partidaJuego'); // Estado para el tipo de partida
  const [manualGameName, setManualGameName] = useState(''); // Estado para el nombre del juego en "Partida Abierta"
  const thread_id = 34; // Reemplaza con el ID del tema "Test"
  const defaultImageUrl = 'https://media.istockphoto.com/id/179311557/es/foto/cerdo-en-mud.jpg?s=612x612&w=0&k=20&c=HKbW3H4O5IaJfNCoNxIfkRyELxCG1Zz2cGLkAvdgah8=';

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserDetails(user.email);
    }
  }, [user]);

  const fetchUserDetails = async (email) => {
    try {
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setNombreCompletoUsuario(`${userData.nombre} ${userData.apellido}`);
      } else {
        console.log('No se encontró el usuario.');
      }
    } catch (err) {
      console.error('Error al obtener detalles del usuario:', err);
    }
  };

  
const sendTelegramMessage = async (message, photoUrl, thread_id) => {
    const botToken = '7350032544:AAG9w7OxVesnNISo_zntiGYjiCPSq2lQOv4';
    const chatId = '-1002173130256'; // ID del grupo
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    try {
      await axios.post(telegramApiUrl, {
        chat_id: chatId,
        photo: photoUrl || defaultImageUrl, // Usa la URL predeterminada si photoUrl es null o vacío
        caption: message,
        message_thread_id: thread_id, // Incluye el ID del tema aquí
      });
    } catch (error) {
      console.error('Error al enviar mensaje a Telegram:', error);
    }
  };

  const fetchGameDetails = async (id) => {
    try {
      const gameResponse = await fetch(`https://www.boardgamegeek.com/xmlapi2/thing?id=${id}`);
      const gameText = await gameResponse.text();
      const parser = new DOMParser();
      const gameXml = parser.parseFromString(gameText, 'text/xml');
      const item = gameXml.querySelector('item');
      
      if (item) {
        const type = item.getAttribute('type');
        if (type !== 'boardgame') {
          console.error('El tipo de juego no es boardgame.');
          return null;
        }

        const image = item.querySelector('image') ? item.querySelector('image').textContent : '';
        const url = `https://boardgamegeek.com/boardgame/${id}`;
        return { image, url };
      } else {
        console.error('No se encontró el elemento del juego en la respuesta XML.');
        return null;
      }
    } catch (err) {
      console.error('Error al obtener detalles del juego:', err);
      return null;
    }
  };

  const searchGames = async () => {
    if (abortController) {
      abortController.abort();
    }
    const controller = new AbortController();
    setAbortController(controller);
  
    setGameResults([]);
    setNoResultsMessage('');
    setLoading(true);
  
    try {
      const searchResponse = await fetch(`https://www.boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(searchQuery)}&type=boardgame`, { signal: controller.signal });
      const searchText = await searchResponse.text();
      const parser = new DOMParser();
      const searchXml = parser.parseFromString(searchText, 'text/xml');
      const items = searchXml.querySelectorAll('item');
  
      if (items.length === 0) {
        setNoResultsMessage('No se encontraron juegos.');
        setLoading(false);
        return;
      }
  
      // Iterar sobre cada elemento, pero no esperes a que terminen todos
      for (const item of items) {
        const id = item.getAttribute('id');
        const nameElement = item.querySelector('name[type="primary"]');
        const name = nameElement ? nameElement.getAttribute('value') : 'Sin nombre';
  
        // Llama a fetchGameDetails para obtener los detalles, pero no esperes
        fetchGameDetails(id).then((gameDetails) => {
          if (gameDetails) {
            const game = {
              id,
              name,
              image: gameDetails.image || 'https://b1157417.smushcdn.com/1157417/wp-content/uploads/2024/03/black-and-white-pig-feeding-on-shrubs-1.png?lossy=1&strip=1&webp=0',
              url: gameDetails.url
            };
  
            // Añade el nuevo juego al estado inmediatamente
            setGameResults((prevGames) => [...prevGames, game]);
          }
        });
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Búsqueda cancelada.');
      } else {
        console.error('Error al buscar juegos:', err);
        setNoResultsMessage('Error al buscar juegos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const selectGame = (game) => {
    setSelectedGame(game);
    setGameResults([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setError('Debes estar autenticado para crear una partida.');
      return;
    }
    if (partidaTipo === 'partidaJuego' && !selectedGame) {
      setError('Selecciona un juego primero.');
      return;
    }
    try {
      const partidasRef = collection(firestore, 'partidas');
      const partidaData = {
        fecha,
        hora,
        juego: partidaTipo === 'partidaAbierta' ? manualGameName : (selectedGame ? selectedGame.name : null),
        numJugadoresMax: parseInt(numJugadoresMax),
        duracion: duracion * 3600000,
        descripcion: description,
        creador: nombreCompletoUsuario,
        jugadores: [nombreCompletoUsuario],
        photoUrl: partidaTipo === 'partidaJuego' && selectedGame ? selectedGame.image : defaultImageUrl,
        gameId: partidaTipo === 'partidaJuego' && selectedGame ? selectedGame.id : null,
        gameUrl: partidaTipo === 'partidaJuego' && selectedGame ? selectedGame.url : null
      };
  
      await addDoc(partidasRef, partidaData);
  
      // Enviar mensaje a Telegram
      const message = `Nueva partida creada por ${nombreCompletoUsuario}:
      
        - Juego: ${partidaData.juego}
        - Fecha: ${fecha}
        - Hora: ${hora}
        - Número Máximo de Jugadores: ${numJugadoresMax}
        - Duración: ${duracion} horas
        - Descripción: ${description}`;
      
      await sendTelegramMessage(message, partidaData.photoUrl, thread_id);
  
      // Limpieza y redirección
      setFecha('');
      setHora('');
      setNumJugadoresMax(0);
      setDuracion('');
      setDescription('');
      setSelectedGame(null);
      setManualGameName(''); // Limpiar el nombre del juego manual
      setError('');
      setSuccessMessage('Partida creada correctamente');
      setGameResults([]);
  
      navigate('/listapartidas');
    } catch (err) {
      console.error('Error al agregar partida: ', err);
      setError('Error al agregar partida: ' + err.message);
    }
  };
  
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchQuery.length >= 4) {
        searchGames();
      }
    }
  };
  return (
    <div className="form-container">
      {loading && <Spinner />} {/* Mostrar el spinner mientras se carga */}

      <h1>Crea una Partida</h1>
      {successMessage && <p className="success-message">{successMessage}</p>}
      <div className="form-group">
        <label>Tipo de Partida:</label>
        <select value={partidaTipo} onChange={(e) => setPartidaTipo(e.target.value)} className="form-control">
          <option value="partidaJuego">Partida Juego</option>
          <option value="partidaAbierta">Partida Abierta</option>
        </select>
      </div>

      {partidaTipo === 'partidaJuego' && !selectedGame && (
        <div className="search-container">
          <div className="form-group">
            <label>Buscar Juego:</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Introduce al menos 4 letras"
              className="form-control"
            />
            <button
              onClick={() => {
                if (searchQuery.length >= 4) {
                  searchGames();
                }
              }}
              className="submit-button"
            >
              Buscar
            </button>
          </div>
          {noResultsMessage && <p>{noResultsMessage}</p>}
          {gameResults.length > 0 && (
            <div className="results-container">
              <h2>Resultados de la búsqueda:</h2>
              <ul className="guest-list">
                {gameResults.map((game) => (
                  <li key={game.id} className="guest-item">
                    <div>
                      <img
                        src={game.image}
                        alt={game.name}
                        className="game-image"
                      />
                      <div>
                        <span className="game-name">{game.name}</span>
                        <p></p>
                        <a href={game.url} target="_blank" rel="noopener noreferrer" className="game-link">
                          Ver en BGG
                        </a>
                      </div>
                    </div>
                    <button onClick={() => selectGame(game)} className="submit-button">
                      Seleccionar
                    </button>
                  </li>
                ))}
              </ul>
              {loading && <p>Cargando juegos...</p>}
            </div>
          )}
        </div>
      )}

      {(partidaTipo === 'partidaJuego' && selectedGame) || partidaTipo === 'partidaAbierta' ? (
        <form onSubmit={handleSubmit}>
          {partidaTipo === 'partidaAbierta' && (
            <div className="form-group">
              <label>Nombre del Juego:</label>
              <input
                type="text"
                value={manualGameName}
                onChange={(e) => setManualGameName(e.target.value)}
                placeholder="Introduce el nombre del juego"
                required
                className="form-control"
              />
            </div>
          )}
          {partidaTipo === 'partidaJuego' && selectedGame && (
            <div>
              <h2>Juego Seleccionado: {selectedGame.name}</h2>
              {selectedGame.image && (
                <img src={selectedGame.image} alt="Foto del juego" className="selected-game-image" />
              )}
              {selectedGame.url && (
                <p>
                  <a href={selectedGame.url} target="_blank" rel="noopener noreferrer" className="game-link">
                    Ver en BGG
                  </a>
                </p>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Hora:</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Número de Jugadores:</label>
            <input
              type="number"
              value={numJugadoresMax}
              onChange={(e) => setNumJugadoresMax(parseInt(e.target.value))}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Duración (Horas):</label>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-control"
            />
          </div>
          <button type="submit" className="submit-button">Agregar Partida</button>
        </form>
      ) : null}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default CreateGame;
