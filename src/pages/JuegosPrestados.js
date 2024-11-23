import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../firebase'; // Importa la configuración de Firebase
import '../styles/juegosprestados.css'; // Estilo personalizado si lo necesitas



const JuegosPrestados = () => {
  const [loanedGames, setLoanedGames] = useState([]); // Para los juegos prestados
  const [usersMap, setUsersMap] = useState({}); // Mapa de usuarios (email -> {name, lastName})
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [gamesPerPage] = useState(5); // Juegos por página

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

        // Obtener los juegos prestados
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

  // Lógica de paginación
  const indexOfLastGame = currentPage * gamesPerPage; // Último juego de la página
  const indexOfFirstGame = indexOfLastGame - gamesPerPage; // Primer juego de la página
  const currentGames = loanedGames.slice(indexOfFirstGame, indexOfLastGame); // Juegos actuales en la página

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="estadisticas-container">
      {/* Contenedor de Número de Usuarios */}
      {/* Listado de Juegos Prestados */}
      <div className="loaned-games-list">
        <h3>Juegos Prestados</h3>
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
                    <p><strong>Fecha de Retorno:</strong> {game.returnDate ? formatDate(game.returnDate) : 'Pendiente'}</p>
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
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * gamesPerPage >= loanedGames.length}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default JuegosPrestados;
