import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SingleCard from '../component/SingleCard/SingleCard';

function Home({ curWk }) {
  const { wk: urlWk } = useParams(); // Get 'wk' from URL parameters
  const location = useLocation(); // Get current location
  const week = urlWk ? parseInt(urlWk, 10) : curWk; // Use URL 'wk' if available, otherwise use curWk
  
  // Check if current path is /demo
  const isDemo = location.pathname === '/demo';

  // Calculate year and display week based on the week number
  const getYearAndWeek = (weekNumber) => {
    if (weekNumber >= 41) {
      // 2025: weeks 41-53 map to week 1-13 of 2025
      return {
        year: 2025,
        displayWeek: weekNumber - 39
      };
    } else if (weekNumber >= 28) {
      // 2024: weeks 28-40 map to week 1-13 of 2024
      return {
        year: 2024,
        displayWeek: weekNumber - 27
      };
    } else if (weekNumber >= 15) {
      // 2023: weeks 15-27 map to week 1-13 of 2023
      return {
        year: 2023,
        displayWeek: weekNumber - 14
      };
    } else if (weekNumber >= 2) {
      // 2022: weeks 2-14 map to week 1-13 of 2022
      return {
        year: 2022,
        displayWeek: weekNumber 
      };
    } else {
      // For weeks before 2, assume they're from earlier years
      // You can adjust this logic based on your needs
      return {
        year: 2022,
        displayWeek: weekNumber
      };
    }
  };

  const { year, displayWeek } = getYearAndWeek(week);

  return (
    <div className='faab-container'>
      <div className='homeCard'>
        <h3>Week {displayWeek}, {year}</h3>
        {/* Pass curWk and isDemo as props to SingleCard */}
        <SingleCard week={week} curWk={curWk} isDemo={isDemo} />
      </div>
    </div>
  );
}

export default Home;
