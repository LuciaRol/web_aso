import React, { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { firestore } from '../firebase'; // Importa la configuración de Firebase
import Spinner from '../components/Spinner'; // Importa el Spinner
import '../styles/estadisticas.css'; // Estilo personalizado si lo necesitas
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaUserAlt } from 'react-icons/fa'; // Importa el ícono de usuario

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
  const [userCount, setUserCount] = useState(0); // Estado para contar usuarios
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        // Reemplaza 'partidas' con el nombre de tu colección
        const partidasRef = collection(firestore, 'partidas');
        const querySnapshot = await getDocs(partidasRef);

        // Procesar datos
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

        // Crear datos para el gráfico
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
        setIsLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
        setIsLoading(false);
      }
    };

    const fetchUserCount = async () => {
      try {
        // Referencia a la colección de usuarios
        const usersRef = collection(firestore, 'users');
        const userSnapshot = await getCountFromServer(usersRef); // Obtener el número de usuarios
        setUserCount(userSnapshot.data().count);
      } catch (error) {
        console.error("Error al obtener el número de usuarios:", error);
      }
    };

    fetchGameStats();
    fetchUserCount();
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
      <h1>Estadísticas de Partidas</h1>
      
      {isLoading ? (
        <Spinner /> // Aquí mostramos el Spinner mientras se cargan los datos
      ) : (
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
      )}

      
    </div>
  );
};

export default Estadisticas;
