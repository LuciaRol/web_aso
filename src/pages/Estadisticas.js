import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { firestore } from '../firebase'; // Importa la configuración de Firebase
import Spinner from '../components/Spinner'; // Importa el Spinner
import '../styles/estadisticas.css'; // Estilo personalizado si lo necesitas
import { FaUserAlt } from 'react-icons/fa'; // Icono de usuario
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

const Estadisticas = () => {
  const [chartData, setChartData] = useState({});
  const [invitedChartData, setInvitedChartData] = useState({});
  const [historicludotecaChartData, setHistoricChartData] = useState({}); // Para los datos del gráfico de historicoprestamojuegos
  const [userCount, setUserCount] = useState(0); // Para contar usuarios
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        // Reemplaza 'partidas' con el nombre de tu colección
        const partidasRef = collection(firestore, 'partidas');
        const querySnapshot = await getDocs(partidasRef);

        // Procesar datos de partidas
        const partidas = querySnapshot.docs.map(doc => doc.data());
        const partidasPorMes = {};

        partidas.forEach(partida => {
          const fecha = new Date(partida.fecha); // Asegúrate de que el campo sea `fecha`
          const mesAño = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;

          if (!partidasPorMes[mesAño]) {
            partidasPorMes[mesAño] = 0;
          }
          partidasPorMes[mesAño]++;
        });

        // Crear datos para el gráfico de partidas
        const labels = Object.keys(partidasPorMes).sort(); // Ordenar meses cronológicamente
        const counts = labels.map(mes => partidasPorMes[mes]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Partidas por Mes',
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
          const fecha = new Date(invitado.registrationDate.toDate()); // Convertir Timestamp a Date
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
              label: 'Invitados por Mes',
              data: invitedCounts,
              backgroundColor: 'rgba(153, 102, 255, 0.6)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });

        // Obtener el número total de usuarios
        const usersRef = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersRef);
        setUserCount(usersSnapshot.size);

        // Obtener datos de historicos juegos (historicoprestamojuegos)
        const historicoprestamojuegosRef = collection(firestore, 'historicoprestamojuegos');
        const historicoprestamojuegosSnapshot = await getDocs(historicoprestamojuegosRef);
        const historicoprestamojuegos = historicoprestamojuegosSnapshot.docs.map(doc => doc.data());
        const historicoprestamojuegosPorMes = {};

        historicoprestamojuegos.forEach(historicoprestamojuego => {
          const fecha = new Date(historicoprestamojuego.loanDate.toDate()); // Convertir Timestamp a Date
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

  return (
    <div className="estadisticas-container">
      {/* Contenedor de Número de Usuarios */}
      <div className="user-count-box">
        <FaUserAlt size={50} /> {/* Ícono de persona */}
        <div>
          <h3>Usuarios Registrados</h3>
          <p>{userCount}</p>
        </div>
      </div>

      {/* Gráficos */}
      {isLoading ? (
        <Spinner /> // Aquí mostramos el Spinner mientras se cargan los datos
      ) : (
        <div className="charts-container">
          <div className="chart-box">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                scales: {
                  x: {
                    title: { display: true, text: 'Mes y Año' },
                  },
                  y: {
                    title: { display: true, text: 'Cantidad de Partidas' },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <Bar
              data={invitedChartData}
              options={{
                responsive: true,
                scales: {
                  x: {
                    title: { display: true, text: 'Mes y Año' },
                  },
                  y: {
                    title: { display: true, text: 'Cantidad de Invitados' },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          <div className="chart-box">
            <Bar
              data={historicludotecaChartData}
              options={{
                responsive: true,
                scales: {
                  x: {
                    title: { display: true, text: 'Mes y Año' },
                  },
                  y: {
                    title: { display: true, text: 'Juegos prestados' },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Estadisticas;
