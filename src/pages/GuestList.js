import { getDocs, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import * as XLSX from 'xlsx'; // Importar la librería xlsx
import '../styles/guestlist.css';

const GuestList = () => {
  const [guestData, setGuestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Página actual
  const [itemsPerPage] = useState(5); // Número de registros por página

  // Función para obtener los datos de los invitados desde Firestore
  const fetchGuestData = async () => {
    setLoading(true);

    try {
      const guestCollection = collection(firestore, 'invitados');
      const querySnapshot = await getDocs(guestCollection);
      const guestMap = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const key = `${data.name} ${data.surname}`;

        if (!guestMap[key]) {
          guestMap[key] = {
            name: data.name,
            surname: data.surname,
            visits: [],
          };
        }

        // Agregar la fecha de la visita a la lista de visitas
        const visitDate = data.registrationDate?.toDate ? data.registrationDate.toDate() : null;
        if (visitDate) {
          guestMap[key].visits.push(visitDate);
        }
      });

      // Convertir los datos a un formato adecuado para la visualización
      const guestsArray = Object.values(guestMap).map((guest) => ({
        ...guest,
        visits: guest.visits.map((visit) => visit.toLocaleDateString()),
      }));

      console.log('Datos obtenidos de Firestore:', guestsArray);
      setGuestData(guestsArray);
    } catch (err) {
      console.error('Error al obtener los datos de los invitados:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar los datos a un archivo Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(guestData.map(guest => ({
      Nombre: guest.name,
      Apellido: guest.surname,
      Visitas: guest.visits.join(", "), // Unir las fechas de visitas en una sola celda
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invitados");

    // Exportar el archivo Excel
    XLSX.writeFile(workbook, "GuestList.xlsx");
  };

  // Función para cambiar la página
  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Obtener los datos al montar el componente
  useEffect(() => {
    fetchGuestData();
  }, []);

  // Lógica para la paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGuests = guestData.slice(indexOfFirstItem, indexOfLastItem);

  // Número total de páginas
  const totalPages = Math.ceil(guestData.length / itemsPerPage);

  return (
    <div className='guest-list-container'>
      <h1>Lista de Invitados</h1>

      {/* Botón para exportar los datos a Excel */}
      <div className="button-container">
        <button onClick={exportToExcel} className="export-button submit-button">
          Exportar a Excel
        </button>
      </div>

      {/* Tabla de resultados */}
      <div className="results-container--unique">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <div className="guest-list--unique">
            {currentGuests.length > 0 ? (
              currentGuests.map((guest, index) => (
                <div key={index} className="guest-row--unique">
                  <div className="guest-card__row--unique">
                    <span className="guest-card__label--unique">Nombre:</span>
                    <span className="guest-card__value--unique">{guest.name}</span>
                  </div>

                  <div className="guest-card__row--unique">
                    <span className="guest-card__label--unique">Apellidos:</span>
                    <span className="guest-card__value--unique">{guest.surname}</span>
                  </div>

                  <div className="guest-card__row--unique">
                    <span className="guest-card__label--unique">Fecha de las visitas:</span>
                    <div className="guest-card__value--unique">
                      {guest.visits.length > 0 ? (
                        guest.visits.map((visit, idx) => (
                          <div key={idx}>{visit}</div>
                        ))
                      ) : (
                        <div>No tiene visitas registradas.</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No se encontraron invitados.</p>
            )}
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="pagination-container">
        <button
        className='submit-button guest-button'
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button
          className='submit-button guest-button'
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default GuestList;
