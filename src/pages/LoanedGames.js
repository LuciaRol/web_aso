import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase'; 
import '../styles/loanedgames.css'; 
import TopArrow from '../components/TopArrow';



const LoanedGames = () => {
  const [loanedGames, setLoanedGames] = useState([]); 
  const [usersMap, setUsersMap] = useState({}); 
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const [gamesPerPage] = useState(5); 

  const formatDate = (date) => new Date(date.toDate()).toLocaleDateString();

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        // Obtener datos de usuarios
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const usersMap = {};
        usersSnapshot.docs.forEach(doc => {
          const user = doc.data();
          usersMap[user.email] = { name: user.nombre, lastName: user.apellido };
        });
        setUsersMap(usersMap);

        // Obtener los juegos prestados de la base de datos
        const prestamoRef = collection(firestore, 'prestamojuegos');
        const prestamoSnapshot = await getDocs(prestamoRef);
        const loanedGamesData = prestamoSnapshot.docs.map(doc => doc.data());

        setLoanedGames(loanedGamesData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setIsLoading(false);
      }
    };

    fetchGameStats();
  }, []);


  const indexOfLastGame = currentPage * gamesPerPage; // Último juego de la página
  const indexOfFirstGame = indexOfLastGame - gamesPerPage; // Primer juego de la página
  const currentGames = loanedGames.slice(indexOfFirstGame, indexOfLastGame); // Juegos actuales en la página

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    /* Cards de juegos prestados */
    <div className="loaned-games-container">
      <h1>Juegos en préstamo</h1>
      {/* Contenedor de Número de Usuarios */}
      {/* Listado de Juegos Prestados */}
      <div className="loaned-games-list">
        {isLoading ? (
          <p>Cargando...</p>
        ) : currentGames.length > 0 ? (
          <ul>
            {currentGames.map((game, index) => {
              const user = usersMap[game.userName]; // Buscar los datos del usuario en el mapa
              const fullName = user ? `${user.name} ${user.lastName}` : 'Usuario desconocido';

              return (
                <li key={index} className="loaned-game-item">
                  <div>
                    <img src={game.game.image} alt={game.game.name} width="50" height="50" />
                  </div>
                  <div>
                    <p><strong>Juego:</strong> {game.game.name}</p>
                    <p><strong>Usuario:</strong> {fullName} ({game.userName})</p>
                    <p><strong>Fecha de Préstamo:</strong> {formatDate(game.loanDate)}</p>
                    <p><strong>Estado:</strong> {game.returnDate ? formatDate(game.returnDate) : 'Pendiente'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No hay juegos prestados actualmente.</p>
        )}

        {/* Paginación */}
        <div className="pagination">
          <button
            className='submit-button'
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            className='submit-button'
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * gamesPerPage >= loanedGames.length}
          >
            Siguiente
          </button>
        </div>
      </div>
      <TopArrow />
    </div>
  );
};

export default LoanedGames;
