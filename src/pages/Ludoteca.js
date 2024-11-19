import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, firestore } from '../firebase'; // Ajusta la ruta según la ubicación real de tu archivo firebase.js
import '../styles/ludoteca.css'; // Import CSS for styles
import { sendTelegramMessage } from '../components/TelegramMessenger'; // Ajusta la ruta según tu estructura de proyecto


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
  const [user, setUser] = useState(null); // Información del usuario logueado
  const [loanedGames, setLoanedGames] = useState({}); // Estado para juegos prestados
  const [usersMap, setUsersMap] = useState({}); // Mapa para usuarios
  const [sortCriteria, setSortCriteria] = useState('alphabetical-asc'); // Inicializa con 'alfabeticamente, A-Z'
  const [sortOrder, setSortOrder] = useState('asc');
  const thread_id = 14; // Reemplaza con el ID del tema "Test"

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Cargar juegos sin restricciones
        const gamesSnapshot = await getDocs(collection(firestore, 'ludoteca'));
        const gamesList = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        // Solo cargar `loanedGames` y `usersMap` si el usuario está autenticado
        let loanedGamesMap = {};
        let usersMap = {};
  
        if (user) {
          const loanedSnapshot = await getDocs(collection(firestore, 'prestamojuegos'));
          loanedSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.game && data.game.id) {
              loanedGamesMap[data.game.id] = { ...data, id: doc.id, returnDate: data.returnDate, prestado: data.userName || null };
            }
          });
  
          const usersSnapshot = await getDocs(collection(firestore, 'users'));
          usersSnapshot.docs.forEach(doc => {
            const data = doc.data();
            usersMap[data.email] = {
              name: `${data.nombre} ${data.apellido}`,
              role: data.role || 'user', // Aquí traemos el rol del usuario. Si no existe será user
            };
          });
        }
  
        setUsersMap(usersMap);
        setLoanedGames(loanedGamesMap);
        setGames(gamesList);
        setFilteredGames(gamesList);
  
        const allGenres = new Set();
        gamesList.forEach(game => game.genres.forEach(genre => allGenres.add(genre)));
        setGenres([...allGenres]);
      } catch (err) {
        setError(err);
        toast.error('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const resetFilters = () => {
    setSelectedGenre('');
    setSearchName('');
    setSortCriteria('alphabetical-asc');
    setSortOrder('asc');
    filterGames(); // Vuelve a aplicar el filtrado con valores predeterminados
  };

  const filterGames = useCallback(() => {
    let filtered = games;
  
    if (selectedGenre) {
      filtered = filtered.filter(game => game.genres.includes(selectedGenre));
    }
  
    if (searchName) {
      filtered = filtered.filter(game => game.name.toLowerCase().includes(searchName.toLowerCase()));
    }
  
    // Calcular el estado de disponibilidad de cada juego
    filtered = filtered.map(game => ({
      ...game,
      available: !(loanedGames[game.id] && !loanedGames[game.id].returnDate),
      loanedBy: loanedGames[game.id] ? usersMap[loanedGames[game.id].userName].name || 'Desconocido' : null,
      returnDate: loanedGames[game.id] && loanedGames[game.id].loanDate ? new Date(loanedGames[game.id].loanDate.seconds * 1000 + 7 * 24 * 60 * 60 * 1000) : null
    }));
  
    // Ordenar o filtrar según el criterio seleccionado
    if (sortCriteria === 'alphabetical-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortCriteria === 'alphabetical-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortCriteria === 'availability') {
      filtered = filtered.filter(game => game.available); // Filtrar solo disponibles
    }
  
    setFilteredGames(filtered);
  }, [games, selectedGenre, searchName, loanedGames, usersMap, sortCriteria]);
  

  useEffect(() => {
    filterGames();
  }, [filterGames]);

  const openModal = (game) => {
    setSelectedGame(game);
  };

  const closeModal = () => {
    setSelectedGame(null);
  };

  const handleLoan = async () => {
    if (!user || !selectedGame) {
      toast.warn('Por favor, asegúrese de estar logeado y seleccionar un juego.');
      return;
    }
  
    const userFullName = usersMap[user.email].name || 'Usuario desconocido';
  
    try {
      await addDoc(collection(firestore, 'prestamojuegos'), {
        userName: user.email,
        game: {
          id: selectedGame.id,
          name: selectedGame.name,
          image: selectedGame.image,
          url: selectedGame.url,
        },
        loanDate: new Date(),
        returnDate: null,
      });
  
      // Update local state
      setLoanedGames(prev => ({ ...prev, [selectedGame.id]: { ...prev[selectedGame.id], loanDate: new Date(), userName: user.email } }));
      toast.success('Préstamo registrado con éxito.');
      
      // Send Telegram message
      const message = `Nuevo préstamo: El juego "${selectedGame.name}" ha sido prestado a ${userFullName}.`;
      await sendTelegramMessage(message, selectedGame.image, thread_id);
  
      closeModal();
    } catch (err) {
      console.error('Error al registrar el préstamo:', err);
      toast.error('Error al registrar el préstamo.');
    }
  };
  
  const handleReturn = async () => {
    if (!user || !selectedGame || !loanedGames[selectedGame.id]) {
      toast.warn('No se puede devolver el juego.');
      return;
    }
  
    const loanData = loanedGames[selectedGame.id];
    const userRole = usersMap[user.email]?.role;
    
    // Comprobar si el usuario es admin, ludotecario o el mismo usuario que pidió el juego
    if (userRole !== 'admin' && userRole !== 'ludotecario' && loanData.userName !== user.email) {
      toast.warn('No tienes permiso para devolver este juego.');
      return;
    }
  
    const userFullName = usersMap[user.email].name || 'Usuario desconocido';
  
    try {
      const loanDocRef = doc(firestore, 'prestamojuegos', loanData.id);
      const loanSnapshot = await getDoc(loanDocRef);
  
      if (!loanSnapshot.exists()) {
        toast.warn('El documento de préstamo no existe.');
        return;
      }
  
      const loanDocData = loanSnapshot.data();
  
      await addDoc(collection(firestore, 'historicoprestamojuegos'), {
        ...loanDocData,
        returnDate: new Date(),
      });
  
      await deleteDoc(loanDocRef);
  
      setLoanedGames(prev => {
        const updated = { ...prev };
        delete updated[selectedGame.id];
        return updated;
      });
  
      setFilteredGames(prev => {
        const updated = prev.map(game =>
          game.id === selectedGame.id
            ? { ...game, available: true }
            : game
        );
        return updated;
      });
  
      toast.success('Devolución registrada con éxito.');
  
      // Send Telegram message
      const message = `Devolución registrada: El juego "${selectedGame.name}" ha sido devuelto por ${userFullName}.`;
      await sendTelegramMessage(message, selectedGame.image, thread_id);
  
      closeModal();
    } catch (err) {
      console.error('Error al registrar la devolución:', err);
      toast.error('Error al registrar la devolución. Prueba a recargar la página.');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Ludoteca y préstamo de juegos </h1>
      
      <div class="filters-row">
        <label class="filter-item">
            Filtrar por nombre:
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Introduce un nombre"
            />
        </label>

        <label class="filter-item">
          Filtrar por género:
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value=''>Todos</option>
            {genres.sort().map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        
        <label class="filter-item">
          Ordenar por:
          <div class="sort-options">
            <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
              <option value="alphabetical-asc">Alfabéticamente, A-Z</option>
              <option value="alphabetical-desc">Alfabéticamente, Z-A</option>
              <option value="availability">Disponibles</option>
          </select>
          </div>
        </label>
        <div>
        <div class="filter-item">
          {/* Otros elementos de filtrado y ordenación */}
          <button onClick={resetFilters}>Eliminar filtros</button>
        </div>
        {/* Renderizado de juegos filtrados */}
      </div>
      </div>




      {/* juegos */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        {filteredGames.map(game => (
          <div
            key={game.id}
            style={{ cursor: 'pointer', textAlign: 'center', opacity: game.available ? 1 : 0.5 }}
            onClick={() => openModal(game)}
          >
            <div style={{ width: '100%', height: '200px', overflow: 'hidden', borderRadius: '8px' }}>
              <img src={game.image} alt={game.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2 style={{ fontSize: '16px', marginTop: '10px' }}>{game.name}</h2>
            {!game.available && <p style={{ color: 'red' }}>No disponible {game.loanedBy ? `- Prestado a: ${game.loanedBy}` : ''}</p>}
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
          maxWidth: '80vw', // Ajusta el ancho máximo
          maxHeight: '80vh', // Ajusta la altura máxima
          width: 'auto',
          height: 'auto',
          padding: '20px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: '#fff',
          overflow: 'auto', // Habilitar desplazamiento si el contenido es demasiado grande
          position: 'relative',
        }
      }}
    >
      {selectedGame && (
        <div style={{ textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '1.5em' }}>{selectedGame.name}</h2>
          <img
            src={selectedGame.image}
            alt={selectedGame.name}
            style={{
              maxWidth: '100%',
              maxHeight: '40vh', // Ajusta la altura máxima de la imagen
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '10px' }}>
            <p><strong>Géneros:</strong> {selectedGame.genres.join(', ')}</p>
            <p><strong>Jugadores Máximos:</strong> {selectedGame.maxPlayers}</p>
            <p><a href={selectedGame.url} target="_blank" rel="noopener noreferrer">Ver en BGG</a></p>
          </div>
          <div style={{ marginTop: '20px' }}>
            {!selectedGame.available ? (
              <>
                <p><strong>Prestado a: </strong>{usersMap[user.email].name || 'Usuario desconocido'}</p>
                <p><strong>Fecha de Máxima de Devolución:</strong> {selectedGame.returnDate ? selectedGame.returnDate.toLocaleDateString() : 'No disponible'}</p>


                <button
                  onClick={handleReturn}
                  style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                  }}
                >
                  Devolver
                </button>
              </>
            ) : (
              <button
                onClick={handleLoan}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                }}
              >
                Registrar Préstamo
              </button>
            )}
            <button
              onClick={closeModal}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: '#ccc',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </Modal>


      {/* Toast notifications container */}
      <ToastContainer />
    </div>
  );
};

export default Ludoteca;
