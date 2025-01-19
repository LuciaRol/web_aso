import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner'; // Importa el componente Spinner
import '../styles/creategame.css'; // Import the CSS file
import { sendTelegramMessage } from '../components/TelegramMessenger'; // Ajusta la ruta según tu estructura de proyecto
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
  const defaultImageUrl = 'https://pbs.twimg.com/media/Fz4hsZrXwAA6lG4.jpg';

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

  /* Busca un juego en la BGG */
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
  
      // Itera sobre cada elemento
      for (const item of items) {
        const id = item.getAttribute('id');
        const nameElement = item.querySelector('name[type="primary"]');
        const name = nameElement ? nameElement.getAttribute('value') : 'Sin nombre';
  
        // Llama a fetchGameDetails para obtener los detalles
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

  /* Función para seleccionar un juego */
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
  
      navigate('/calendariopartidas');
    } catch (err) {
      console.error('Error al agregar partida: ', err);
      setError('Error al agregar partida: ' + err.message);
    }
  };
  
  /* Busca un juego cuando se pulsa la tecla enter */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (searchQuery.length >= 4) {
        searchGames();
      }
    }
  };

  return (
  <div className="create-game-form-container">
    {loading && <Spinner />} {/* Mostrar el spinner mientras se carga */}

    <h1 className="create-game-title">Crea una partida</h1>
    {successMessage && <p className="create-game-success-message">{successMessage}</p>}
    <div className="create-game-form-group">
      <label className="create-game-label">Tipo de partida:</label>
      <select
        value={partidaTipo}
        onChange={(e) => setPartidaTipo(e.target.value)}
        className="create-game-select"
      >
        <option value="partidaJuego">Partida con juego de la BGG</option>
        <option value="partidaAbierta">Partida abierta</option>
      </select>
    </div>
    {/* Formulario de búsqueda de un juego */}
    {partidaTipo === 'partidaJuego' && !selectedGame && (
      <div className="create-game-search-container">
        <div className="create-game-form-group">
          <label className="create-game-label">Buscar juego:</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Introduce al menos 4 letras"
            className="create-game-input"
          />
          <button
            onClick={() => {
              if (searchQuery.length >= 4) {
                searchGames();
              }
            }}
            className="create-game-submit-button submit-button"
          >
            Buscar
          </button>
        </div>
        {noResultsMessage && <p className="create-game-no-results">{noResultsMessage}</p>}
        {gameResults.length > 0 && (
          <div className="create-game-results-container">
            <h2 className="create-game-results-title">Resultados de la búsqueda:</h2>
            <ul className="create-game-guest-list">
              {gameResults.map((game) => (
                <li key={game.id} className="create-game-guest-item">
                  <div>
                    <img
                      src={game.image}
                      alt={game.name}
                      className="create-game-game-image"
                    />
                    <div>
                      <span className="create-game-game-name">{game.name}</span>
                      <p></p>
                      <a
                        href={game.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="create-game-game-link btn-link"
                      >
                        Ver en BGG
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => selectGame(game)}
                    className="create-game-submit-button submit-button"
                  >
                    Seleccionar
                  </button>
                </li>
              ))}
            </ul>
            {loading && <p className="create-game-loading-text">Cargando juegos...</p>}
          </div>
        )}
      </div>
    )}

    {(partidaTipo === 'partidaJuego' && selectedGame) || partidaTipo === 'partidaAbierta' ? (
      <div class="form-container-partida">
      <form onSubmit={handleSubmit}>
        {partidaTipo === 'partidaAbierta' && (
          <div className='game-form-group'>
            <label className="create-game-label">Nombre del Juego:</label>
            <input
              type="text"
              value={manualGameName}
              onChange={(e) => setManualGameName(e.target.value)}
              placeholder="Introduce el nombre del juego"
              required
              className="create-game-input form-control"
            />
          </div>
        )}
        {partidaTipo === 'partidaJuego' && selectedGame && (
          <div>
            <h2 className="create-game-selected-game-title">Juego Seleccionado: {selectedGame.name}</h2>
            {selectedGame.image && (
              <img
                src={selectedGame.image}
                alt="Foto del juego"
                className="create-game-selected-game-image"
              />
            )}
            {selectedGame.url && (
              <p>
                <a
                  href={selectedGame.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="create-game-game-link btn-link"
                >
                  Ver en BGG
                </a>
              </p>
            )}
          </div>
        )}
        {/* Formulario de creación de partida */}
          <div className="game-form-group">
            <label className="game-label">Fecha:</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="game-input"
            />
          </div>
          
          <div className="game-form-group">
            <label className="game-label">Hora:</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="game-input"
            />
          </div>
          
          <div className="game-form-group">
            <label className="game-label">Número de Jugadores:</label>
            <input
              type="number"
              value={numJugadoresMax}
              onChange={(e) => setNumJugadoresMax(parseInt(e.target.value))}
              required
              className="game-input"
            />
          </div>
          
          <div className="game-form-group">
            <label className="game-label">Duración (Horas):</label>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              required
              className="game-input"
            />
          </div>
          
          <div className="game-form-group">
            <label className="game-label">Descripción:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="game-textarea"
            />
          </div>
  
          <button type="submit" className="game-submit-button submit-button">
            Agregar Partida
          </button>
        

      </form>
      </div>
    ) : null}

    {error && <p className="create-game-error-message">{error}</p>}
  </div>
);
}

export default CreateGame;
