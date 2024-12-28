import { addDoc, collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { firestore } from '../firebase';
import '../styles/GuestRegistry.css';

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const GuestRegistry = () => {
  const [invitedName, setInvitedName] = useState('');
  const [invitedSurname, setInvitedSurname] = useState('');
  const [searchText, setSearchText] = useState('');
  const [guestData, setGuestData] = useState([]);
  const [filteredGuestData, setFilteredGuestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxVisibleGuests] = useState(5); /* el número de invitados que se ven sin buscar */ 

  const filterGuestData = useCallback((data) => {
    const normalizedSearchText = normalizeText(searchText);

    const filtered = data.filter((guest) => {
      const nameMatch = guest.name.includes(normalizedSearchText);
      const surnameMatch = guest.surname.includes(normalizedSearchText);
      return nameMatch || surnameMatch;
    });

    setFilteredGuestData(filtered.slice(0, maxVisibleGuests));
  }, [searchText, maxVisibleGuests]);

  const fetchGuestData = useCallback(async () => {
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
            visitCount: 0,
            latestDate: null,
          };
        }

        guestMap[key].visitCount += 1;
        const registrationDate = data.registrationDate?.toDate ? data.registrationDate.toDate() : null;
        if (!guestMap[key].latestDate || (registrationDate && registrationDate > guestMap[key].latestDate)) {
          guestMap[key].latestDate = registrationDate;
        }
      });

      const guestsArray = Object.values(guestMap).map((guest) => ({
        ...guest,
        latestDate: guest.latestDate ? guest.latestDate.toLocaleDateString() : 'Nunca',
      }));

      console.log('Datos obtenidos de Firestore:', guestsArray);
      setGuestData(guestsArray);
      filterGuestData(guestsArray);
    } catch (err) {
      console.error('Error al obtener los datos de los invitados:', err);
      toast.error('Error al obtener los datos de los invitados.');
    } finally {
      setLoading(false);
    }
  }, [filterGuestData]);

  const handleAddGuest = async () => {
    const normalizedName = normalizeText(invitedName);
    const normalizedSurname = normalizeText(invitedSurname);

    if (!normalizedName || !normalizedSurname) {
      toast.warn('Por favor, complete todos los campos.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'invitados'), {
        name: normalizedName,
        surname: normalizedSurname,
        registrationDate: new Date(),
      });

      toast.success('Invitado registrado con éxito.');
      setInvitedName('');
      setInvitedSurname('');
      fetchGuestData();
    } catch (err) {
      console.error('Error al registrar el invitado:', err);
      toast.error('Error al registrar el invitado.');
    }
  };

  useEffect(() => {
    fetchGuestData();
  }, [fetchGuestData]);

  useEffect(() => {
    filterGuestData(guestData);
  }, [guestData, filterGuestData]);

  return (
    <div>
      <h1>Registro y Búsqueda de Invitados</h1>

      {/* Formulario de Registro */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddGuest();
        }}
        className="form-container"
      >
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            value={invitedName}
            onChange={(e) => setInvitedName(e.target.value)}
            placeholder="Nombre del invitado"
          />
        </div>
        <div className="form-group">
          <label htmlFor="surname">Apellido:</label>
          <input
            type="text"
            id="surname"
            value={invitedSurname}
            onChange={(e) => setInvitedSurname(e.target.value)}
            placeholder="Apellidos del invitado"
          />
        </div>
        <button type="submit" className="submit-button">
          Registrar
        </button>
      </form>

      {/* Formulario de Búsqueda */}
      <div className="search-container">
        <h2>Buscar Invitados</h2>
        <form className="form-container">
          <div className="form-group">
            <label htmlFor="searchText">Nombre o Apellido:</label>
            <input
              type="text"
              id="searchText"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Nombre o Apellido del invitado"
            />
          </div>
        </form>
      </div>

      {/* Resultados de la Búsqueda */}
      <div className="results-container">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="guest-list">
            {filteredGuestData.length > 0 ? (
              filteredGuestData.map((guest, index) => (
                <li key={index} className="guest-item">
                  <strong>{guest.name} {guest.surname}</strong><br />
                  Número de visitas: {guest.visitCount}<br />
                  Última fecha de visita: {guest.latestDate}
                </li>
              ))
            ) : (
              <p>No se encontraron resultados.</p>
            )}
          </ul>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default GuestRegistry;
