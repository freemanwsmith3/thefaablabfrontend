import React from 'react';
import { useNavigate } from 'react-router-dom';
import './History.css'; // You'll need to create this CSS file

const History = ({ curWk }) => {
  const navigate = useNavigate();

  // Function to convert display week to actual week number for 2025
  const getActualWeekNumber = (displayWeek) => {
    return 40 + displayWeek; // Week 1 of 2025 = actual week 41
  };

  // Function to get available weeks for 2025 (only before current week)
  const getAvailableWeeksFor2025 = () => {
    // Calculate current display week for 2025
    const currentDisplayWeek = curWk >= 41 ? curWk - 40 : 0;
    
    // Only show weeks before the current week
    const maxWeek = Math.min(currentDisplayWeek - 1, 13);
    
    // Return array of available weeks (only if maxWeek > 0)
    return maxWeek > 0 ? Array.from({ length: maxWeek }, (_, i) => i + 1) : [];
  };

  const handleWeekClick = (displayWeek) => {
    const actualWeek = getActualWeekNumber(displayWeek);
    navigate(`/history/${actualWeek}`);
  };

  const availableWeeks = getAvailableWeeksFor2025();

  // If no weeks are available, show a message
  if (availableWeeks.length === 0) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h2>2025 History</h2>
        </div>
        <div className="no-weeks-message">
          <p>No historical weeks available yet for 2025.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Select Week from 2025</h2>
      </div>
      <div className="weeks-grid">
        {availableWeeks.map((week) => (
          <div
            key={week}
            className="week-card"
            onClick={() => handleWeekClick(week)}
          >
            <h3>Week {week}</h3>
            <p>2025</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;