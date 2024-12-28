import { getDocs, collection } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { firestore } from '../firebase';
import * as XLSX from 'xlsx'; // Importar la librería xlsx
import '../styles/GuestList.css';

const GuestList = () => {
  const [guestData, setGuestData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Obtener los datos al montar el componente
  useEffect(() => {
    fetchGuestData();
  }, []);

  return (
    <div>
      <h1>Lista de Invitados</h1>

      {/* Botón para exportar los datos a Excel */}
        <div className="button-container">
            <button onClick={exportToExcel} className="export-button">
                Exportar a Excel
            </button>
        </div>

      {/* Tabla de resultados */}
      <div className="results-container">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <table className="guest-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Fecha Visitas</th>
              </tr>
            </thead>
            <tbody>
              {guestData.length > 0 ? (
                guestData.map((guest, index) => (
                  <tr key={index}>
                    <td>{guest.name}</td>
                    <td>{guest.surname}</td>
                    <td>
                     
                        {guest.visits.length > 0 ? (
                          guest.visits.map((visit, idx) => (
                            <li key={idx}>{visit}</li>
                          ))
                        ) : (
                          <li>No tiene visitas registradas.</li>
                        )}
                    
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No se encontraron invitados.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GuestList;
