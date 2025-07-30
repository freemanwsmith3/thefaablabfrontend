import React from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css'; // You'll need to create this CSS file

const History = () => {
  const navigate = useNavigate();

  // Function to convert display week to actual week number for 2024
  const getActualWeekNumber = (displayWeek) => {
    return 28 + displayWeek; // Week 1 of 2024 = actual week 28
  };

  // Function to get weeks for 2024
  const getWeeksFor2024 = () => {
    // 2024 has 13 weeks in your system
    return Array.from({ length: 13 }, (_, i) => i + 1);
  };

  const handleWeekClick = (displayWeek) => {
    const actualWeek = getActualWeekNumber(displayWeek);
    navigate(`/history/${actualWeek}`);
  };

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Select Week from 2024</h2>
      </div>
      <div className="weeks-grid">
        {getWeeksFor2024().map((week) => (
          <div
            key={week}
            className="week-card"
            onClick={() => handleWeekClick(week)}
          >
            <h3>Week {week}</h3>
            <p>2024</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;