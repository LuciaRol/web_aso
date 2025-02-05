import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth, firestore } from '../firebase'; 
import '../styles/ludoteca.css'; 
import { utils, writeFile } from 'xlsx'; 
import { sendTelegramMessage } from '../components/TelegramMessenger';
import TopArrow from '../components/TopArrow';

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
  const [user, setUser] = useState(null);
  const [loanedGames, setLoanedGames] = useState({}); 
  const [usersMap, setUsersMap] = useState({}); 
  const [sortCriteria, setSortCriteria] = useState('alphabetical-asc');
  const [sortOrder, setSortOrder] = useState('asc');
  const thread_id = 14;
  const [letterFilter, setLetterFilter] = useState('');
  const [showAlphabetButtons, setShowAlphabetButtons] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Carga todos los juegos de la BGG
        const gamesSnapshot = await getDocs(collection(firestore, 'ludoteca'));
        const gamesList = gamesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
  
        
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
              role: data.role || 'user', 
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

    return () => unsubscribe();
  }, []);

  /* Función que resetea los filtros */
  const resetFilters = () => {
    setSelectedGenre('');
    setSearchName('');
    setSortCriteria('alphabetical-asc');
    setSortOrder('asc');
    filterGames();
  };

  /* Filtros */
  const filterGames = useCallback(() => {
    let filtered = games;
  
    if (selectedGenre) {
      filtered = filtered.filter(game => game.genres.includes(selectedGenre));
    }
  
    if (searchName) {
      filtered = filtered.filter(game => game.name.toLowerCase().includes(searchName.toLowerCase()));
    }
  
    filtered = filtered.map(game => ({
      ...game,
      available: !(loanedGames[game.id] && !loanedGames[game.id].returnDate),
      loanedBy: loanedGames[game.id] ? usersMap[loanedGames[game.id].userName].name || 'Desconocido' : null,
      returnDate: loanedGames[game.id] && loanedGames[game.id].loanDate ? new Date(loanedGames[game.id].loanDate.seconds * 1000 + 7 * 24 * 60 * 60 * 1000) : null
    }));
  
    // Filtro para mostrar los juegos según distintos criterios
    if (sortCriteria === 'alphabetical-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortCriteria === 'alphabetical-desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortCriteria === 'availability') {
      filtered = filtered.filter(game => game.available); 
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
  
      // Actualiza el estado del juego
      setLoanedGames(prev => ({ ...prev, [selectedGame.id]: { ...prev[selectedGame.id], loanDate: new Date(), userName: user.email } }));
      toast.success('Préstamo registrado con éxito.');
      
      // Envía un mensaje de telegram
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
    
    // Check if the user is admin, ludotecario or the same user that loaned the game. If different, no possible to return it. 
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
  
      // Envía un mensaje de telagram
      const message = `Devolución registrada: El juego "${selectedGame.name}" ha sido devuelto por ${userFullName}.`;
      await sendTelegramMessage(message, selectedGame.image, thread_id);
  
      closeModal();
    } catch (err) {
      console.error('Error al registrar la devolución:', err);
      toast.error('Error al registrar la devolución. Prueba a recargar la página.');
    }
  };


  const exportToExcel = (data, filename = 'ludoteca.xlsx') => {
    const worksheet = utils.json_to_sheet(data); // Convierte de los datos en un JSON
    const workbook = utils.book_new(); 
    utils.book_append_sheet(workbook, worksheet, 'Ludoteca'); 
    writeFile(workbook, filename); 
  };

    // Filtro por letra
    const filterByLetter = (letter) => {
      setLetterFilter(letter);
      const filtered = games.filter((game) => game.name.toLowerCase().startsWith(letter.toLowerCase()))
        .map(game => ({
          ...game,
          available: !(loanedGames[game.id] && !loanedGames[game.id].returnDate),
          loanedBy: loanedGames[game.id] ? usersMap[loanedGames[game.id].userName].name || 'Desconocido' : null,
          returnDate: loanedGames[game.id] && loanedGames[game.id].loanDate ? new Date(loanedGames[game.id].loanDate.seconds * 1000 + 7 * 24 * 60 * 60 * 1000) : null
        }));
      setFilteredGames(filtered);
    };

   // Función abrir o cerra el filtro por letra
   const toggleAlphabetButtons = () => {
    setShowAlphabetButtons(!showAlphabetButtons);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <div className="ludoteca-container">
      <h1>Ludoteca y préstamo de juegos </h1>
  
      {/* Filtros y botón de exportación */}
      <div className="filters-row">
        {/* Botón para exportar */}
        {user && (
          <div className="filter-item">
            <button
            className='export-button'
              onClick={() =>
                exportToExcel(
                  filteredGames.map((game) => ({
                    Nombre: game.name,
                    Géneros: game.genres.join(', '),
                    Disponible: game.available ? 'Sí' : 'No',
                    'Prestado a': game.loanedBy || '',
                    'Fecha de préstamo': game.loanedBy
                      ? loanedGames[game.id]?.loanDate?.toDate().toLocaleDateString()
                      : '', // Agrega la fecha de préstamo
                    'Fecha de devolución': game.returnDate
                      ? game.returnDate.toLocaleDateString()
                      : '',
                  }))
                )
              }
            >
              Exportar a Excel
            </button>
          </div>
        )}
      </div>
      
      <div className="filters-row">
          {/* Botón para mostrar/ocultar los botones de letras */}
          <button onClick={toggleAlphabetButtons} className="alphabet-button">
            {showAlphabetButtons ? 'Ocultar filtro por letra inicial' : 'Filtro por letra inicial'}
          </button>

      </div>
      {/* Filtro por letra */}
      <div className="filters-row">
      
      {showAlphabetButtons && (
        <div className="alphabet-buttons">
          {[...Array(26)].map((_, i) => {
            const letter = String.fromCharCode(65 + i); // Letras de la A a la Z
            return (
              <button
                key={letter}
                onClick={() => filterByLetter(letter)}
              >
                {letter}
              </button>
            );
          })}
        </div>)}
      </div>

      <div className="filters-row">
        <label className="filter-item">
          Buscar:
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Introduce un nombre"
          />
        </label>
  
        <label className="filter-item">
          Categoría:
          <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
            <option value=''>Todos</option>
            {genres.sort().map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </label>
        
        <label className="filter-item">
         Mostrar:
          <div className="sort-options">
            <select value={sortCriteria} onChange={(e) => setSortCriteria(e.target.value)}>
              <option value="alphabetical-asc">Alfabéticamente, A-Z</option>
              <option value="alphabetical-desc">Alfabéticamente, Z-A</option>
              <option value="availability">Disponibles</option>
            </select>
          </div>
        </label>
        <div>
          <div className="filter-item" id='reset-filters'>
            <button onClick={resetFilters}>Eliminar filtros</button>
          </div>
        </div>
      </div>
    
      <div className="games-grid">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className={`game-card ${game.available ? "available" : "unavailable"}`}
            onClick={() => openModal(game)}
          >
            <div className="game-image-container">
              <img
                src={game.image}
                alt={game.name}
                className="game-image"
              />
            </div>
            <h2 className="game-title">{game.name}</h2>
            {!game.available && (
              <p className="game-unavailable-text">
                No disponible {game.loanedBy ? `- Prestado a: ${game.loanedBy}` : ""}
              </p>
            )}
          </div>
        ))}
      </div>

  
      {/* Modal for showing game details */}
      <Modal
        isOpen={!!selectedGame}
        onRequestClose={closeModal}
        contentLabel="Game Details"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeModal} className="modal-close-button" aria-label="Cerrar modal">
          ×
        </button>
        {selectedGame && (
          <div className="modal-inner">
            <h2 style={{ margin: "0 0 10px", fontSize: "1.5em" }}>{selectedGame.name}</h2>
            <img
              src={selectedGame.image}
              alt={selectedGame.name}
              className="modal-image"
            />
            <div style={{ flex: 1, padding: "10px" }}>
              <p><strong>Géneros:</strong> {selectedGame.genres.join(", ")}</p>
              <p><strong>Jugadores Máximos:</strong> {selectedGame.maxPlayers}</p>
              <p>
                <a href={selectedGame.url} target="_blank" rel="noopener noreferrer" className='btn-link'>
                  Ver en BGG
                </a>
              </p>
            </div>
            <div style={{ marginTop: "20px" }}>
              {!selectedGame.available ? (
                <>
                  <p><strong>Prestado a:</strong> {usersMap[user.email]?.name || "Usuario desconocido"}</p>
                  <p>
                    <strong>Fecha máxima de devolución:</strong>{" "}
                    {selectedGame.returnDate ? selectedGame.returnDate.toLocaleDateString() : "No disponible"}
                  </p>
                  <button
                    onClick={handleReturn}
                    className="modal-button modal-button-return submit-button"
                  >
                    Devolver
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLoan}
                  className="modal-button modal-button-loan submit-button"
                >
                  Registrar préstamo
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
  
      <ToastContainer />

      <TopArrow />
    </div>
  );
  
}
  export default Ludoteca;
