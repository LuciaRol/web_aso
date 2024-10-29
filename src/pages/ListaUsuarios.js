// // src/pages/UserList.js
// import {
//   collection,
//   getDocs,
//   query,
//   where
// } from 'firebase/firestore'; // Importa funciones necesarias desde firestore

// import React, { useEffect, useState } from 'react';
// import { useAuthState } from 'react-firebase-hooks/auth'; // Importa useAuthState para obtener el usuario autenticado
// import { auth, firestore } from '../firebase'; // Importa firestore desde firebase.js

// const ListaUsuarios = () => {
//   const [usuario] = useAuthState(auth);
//   const [usuariosConMismoEmail, setUsuariosConMismoEmail] = useState([]);
  
//   useEffect(() => {
//     if (usuario && usuario.email) {
//       fetchUsuariosConMismoEmail(usuario.email);
//     }
//   }, [usuario]);

//   const fetchUsuariosConMismoEmail = async (email) => {
//     try {
//       const usersRef = collection(firestore, 'users');
//       const q = query(usersRef, 
//         where('autorizoPublicacion', '==', true)
//       );
//       const querySnapshot = await getDocs(q);
//       const fetchedUsuarios = [];
//       querySnapshot.forEach((doc) => {
//         fetchedUsuarios.push({ id: doc.id, ...doc.data() });
//       });
//       setUsuariosConMismoEmail(fetchedUsuarios);
//     } catch (err) {
//       console.error('Error al obtener usuarios con el mismo email y autorización de publicación:', err);
//     }
//   };

//   return (
//     <div>
//       {usuariosConMismoEmail.length > 0 && (
//         <div>
//           <h2>Usuarios que autorizan publicación:</h2>
//           <ul>
//             {usuariosConMismoEmail.map((usuario) => (
//               <li key={usuario.id}>
//                 <p><strong>Nombre:</strong> {usuario.nombre}</p>
//                 <p><strong>Apellido:</strong> {usuario.apellido}</p>
//                 <p><strong>Email:</strong> {usuario.email}</p>
//                 <p><strong>Teléfono:</strong> {usuario.telefono}</p>
//                 <p><strong>Publicación autorizada:</strong> {usuario.autorizoPublicacion ? 'Sí' : 'No'}</p>
//                 <p><strong>Usuario Telegram:</strong> {usuario.usuarioTelegram}</p>
//                 <p><strong>Tipos de juegos favoritos:</strong> {usuario.tiposJuegosFavoritos ? usuario.tiposJuegosFavoritos.join(', ') : 'No especificado'}</p>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ListaUsuarios;
