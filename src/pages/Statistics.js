import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { firestore } from '../firebase'; 
import Spinner from '../components/Spinner'; 
import '../styles/statistics.css'; 
import { FaUserAlt } from 'react-icons/fa'; 
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registra las escalas y elementos que usarás
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [chartData, setChartData] = useState({});
  const [invitedChartData, setInvitedChartData] = useState({});
  const [historicludotecaChartData, setHistoricChartData] = useState({});
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState({}); // Para almacenar los datos del gráfico que se mostrará en el modal
  
  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const partidasRef = collection(firestore, 'partidas');
        const querySnapshot = await getDocs(partidasRef);
        const partidas = querySnapshot.docs.map(doc => doc.data());
        const partidasPorMes = {};

        partidas.forEach(partida => {
          const fecha = new Date(partida.fecha);
          const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!partidasPorMes[mesAño]) {
            partidasPorMes[mesAño] = 0;
          }
          partidasPorMes[mesAño]++;
        });

        const labels = Object.keys(partidasPorMes).sort();
        const counts = labels.map(mes => partidasPorMes[mes]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Partidas por mes',
              data: counts,
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        });

        // Obtener datos de invitados
        const invitadosRef = collection(firestore, 'invitados');
        const invitadosSnapshot = await getDocs(invitadosRef);
        const invitados = invitadosSnapshot.docs.map(doc => doc.data());
        const invitadosPorMes = {};

        invitados.forEach(invitado => {
          const fecha = new Date(invitado.registrationDate.toDate());
          const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!invitadosPorMes[mesAño]) {
            invitadosPorMes[mesAño] = 0;
          }
          invitadosPorMes[mesAño]++;
        });

        const invitedLabels = Object.keys(invitadosPorMes).sort();
        const invitedCounts = invitedLabels.map(mes => invitadosPorMes[mes]);

        setInvitedChartData({
          labels: invitedLabels,
          datasets: [
            {
              label: 'Invitados por mes',
              data: invitedCounts,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });

        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        setUserCount(usersSnapshot.size);

        // Obtener datos de historicos juegos
        const historicoprestamojuegosRef = collection(firestore, 'historicoprestamojuegos');
        const historicoprestamojuegosSnapshot = await getDocs(historicoprestamojuegosRef);
        const historicoprestamojuegos = historicoprestamojuegosSnapshot.docs.map(doc => doc.data());
        const historicoprestamojuegosPorMes = {};

        historicoprestamojuegos.forEach(historicoprestamojuego => {
          const fecha = new Date(historicoprestamojuego.loanDate.toDate());
          const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!historicoprestamojuegosPorMes[mesAño]) {
            historicoprestamojuegosPorMes[mesAño] = 0;
          }
          historicoprestamojuegosPorMes[mesAño]++;
        });

        const historicoprestamojuegosLabels = Object.keys(historicoprestamojuegosPorMes).sort();
        const historicoprestamojuegosCounts = historicoprestamojuegosLabels.map(mes => historicoprestamojuegosPorMes[mes]);

        setHistoricChartData({
          labels: historicoprestamojuegosLabels,
          datasets: [
            {
              label: 'Juegos prestados',
              data: historicoprestamojuegosCounts,
              backgroundColor: 'rgba(255, 159, 64, 0.6)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1,
            },
          ],
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setIsLoading(false);
      }
    };

    fetchGameStats();
  }, []);

  // Función para abrir el modal con los datos del gráfico
  const openModal = (data) => {
    setModalData(data); // Establece los datos del gráfico en el estado
    setIsModalOpen(true); // Abre el modal
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false); // Cierra el modal
    setModalData({}); // Limpia los datos del modal
  };

  return (
    <div className="statistics-container">
      <h1>Estadísticas</h1>
      <div className="user-count-box">
        <FaUserAlt size={50} />
        <div>
          <h3>Usuarios registrados</h3>
          <p>{userCount}</p>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="charts-container">
          <div className="chart-box" onClick={() => openModal(chartData)}>
            <Bar data={chartData} options={{ responsive: true, scales: { x: { title: { display: true, text: 'Año y mes' } }, y: { title: { display: true, text: 'Cantidad de partidas' }, beginAtZero: true } }}} />
          </div>

          <div className="chart-box" onClick={() => openModal(invitedChartData)}>
            <Bar data={invitedChartData} options={{ responsive: true, scales: { x: { title: { display: true, text: 'Año y mes' } }, y: { title: { display: true, text: 'Cantidad de invitados' }, beginAtZero: true } }}} />
          </div>

          <div className="chart-box" onClick={() => openModal(historicludotecaChartData)}>
            <Bar data={historicludotecaChartData} options={{ responsive: true, scales: { x: { title: { display: true, text: 'Año y mes' } }, y: { title: { display: true, text: 'Juegos prestados' }, beginAtZero: true } }}} />
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <Bar data={modalData} options={{ responsive: true, scales: { x: { title: { display: true, text: 'Año y mes' } }, y: { title: { display: true, text: 'Cantidad' }, beginAtZero: true } }}} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
