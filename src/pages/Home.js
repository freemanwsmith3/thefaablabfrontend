import React from 'react';
import { useParams } from 'react-router-dom';
import SingleCard from '../component/SingleCard/SingleCard';

function Home({ curWk }) {
  const { wk: urlWk } = useParams(); // Get 'wk' from URL parameters
  const week = urlWk ? parseInt(urlWk, 10) : curWk; // Use URL 'wk' if available, otherwise use curWk


  return (
    <div className='faab-container'>
      <div className='homeCard'>
        <h3>Week {week - 27}</h3>
        <SingleCard week={week} />
      </div>
    </div>
  );
}

export default Home;