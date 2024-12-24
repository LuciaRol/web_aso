import React, { useState } from 'react';
import Counter from '../components/counter';
import partidaVideo from '../img/dragon_dnd.mp4'; // Ruta del video
import logoNegro from '../img/landing/logo_negro_transp.png';
import queenDragon from '../img/landing/queen_dragon.png';
import '../styles/home.css';

const Home = () => {
  

  return (
    <div className="home-container">
      <div>
        <img src={queenDragon}/>
      </div>


     
    </div>



  );

  
};

export default Home;
