import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { firestore } from '../firebase'; // Ajusta la ruta según la ubicación real de tu archivo firebase.js

// Establece el contenedor del modal
Modal.setAppElement('#root');

const Ludoteca = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(firestore, 'ludoteca'));

        const gamesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setGames(gamesList);
        setFilteredGames(gamesList);

        // Extract unique genres
        const allGenres = new Set();
        gamesList.forEach(game => {
          game.genres.forEach(genre => allGenres.add(genre));
        });
        setGenres(Array.from(allGenres));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const filterGames = useCallback(() => {
    let filtered = games;

    if (selectedGenre) {
      filtered = filtered.filter(game => game.genres.includes(selectedGenre));
    }

    if (searchName) {
      filtered = filtered.filter(game => game.name.toLowerCase().includes(searchName.toLowerCase()));
    }

    setFilteredGames(filtered);
  }, [games, selectedGenre, searchName]);

  useEffect(() => {
    filterGames();
  }, [filterGames]);

  const openModal = (game) => {
    setSelectedGame(game);
  };

  const closeModal = () => {
    setSelectedGame(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Ludoteca</h1>
      <p>Información del club</p>

      <div style={{ marginBottom: '20px' }}>
        <label>
          Filtrar por Género:
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value=''>Todos</option>
            {genres.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: '20px' }}>
          Buscar por Nombre:
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Nombre del juego"
          />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {filteredGames.map(game => (
          <div
            key={game.id}
            style={{ cursor: 'pointer', textAlign: 'center' }}
            onClick={() => openModal(game)}
          >
            <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '8px' }}>
              <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: '16px', marginTop: '10px' }}>{game.name}</h2>
          </div>
        ))}
      </div>

      {/* Modal for showing game details */}
      <Modal
        isOpen={!!selectedGame}
        onRequestClose={closeModal}
        contentLabel="Game Details"
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          content: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '70vw',  // Reduce el ancho máximo del modal
            maxHeight: '80vh',  // Mantiene la altura máxima ajustada
            width: '70vw',  // Ajusta el ancho del modal
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#fff',
            overflow: 'auto',
            position: 'relative',
          }
        }}
      >
        {selectedGame && (
          <div style={{ textAlign: 'center', maxWidth: '100%', maxHeight: '100%' }}>
            <h2 style={{ margin: '0 0 10px' }}>{selectedGame.name}</h2>
            <img src={selectedGame.image} alt={selectedGame.name} style={{ maxWidth: '80%', maxHeight: '50vh', objectFit: 'contain', borderRadius: '8px' }} /> {/* Reduce el tamaño de la imagen */}
            <p><strong>Géneros:</strong> {selectedGame.genres.join(', ')}</p>
            <p><strong>Jugadores Máximos:</strong> {selectedGame.maxPlayers}</p>
            <p><a href={selectedGame.url} target="_blank" rel="noopener noreferrer">Ver en BGG</a></p>
            <button onClick={closeModal} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Ludoteca;
