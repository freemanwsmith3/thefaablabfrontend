import React, { useEffect, useState } from 'react';
import { InputNumber, Input } from "antd";
import BidChart from "../BarCharts/BarCharts";
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import HowItWorkModal from './HowItWorkModal'; // Import the standard modal component
import HowItWorksAuction from './HowItWorksAuction'; // Import the auction modal component
import './singleCard.css'; // Import the CSS file

const SingleCard = ({ week }) => {
  const [clickedIndex, setClickedIndex] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [graphData, setGraphData] = useState([]);
  const [statData, setStatData] = useState([]);
  const [bidValue, setBidValue] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [searchQuery, setSearchQuery] = useState(''); // State for player name search
  const [positionFilter, setPositionFilter] = useState(''); // State for position filter
  //const apiUrl = 'http://127.0.0.1:8000/api';
  const apiUrl = 'https://faablab.herokuapp.com/api';

  const onChange = (value) => {
    setBidValue(value);
  };

  const sendBid = async (playerID) => {
    try {
      const data = {
        week: week,
        player: playerID,
        value: bidValue,
      };
      const response = await axios.post(`${apiUrl}/bid`, data);
    } catch (error) {
      console.error('Error sending bid:', error.response ? error.response.data : error.message);
    }
  };

  const handleButtonClick = (index, playerID) => {
    setClickedIndex((prevIndices) => {
      if (!prevIndices.includes(index)) {
        return [...prevIndices, index];
      }
      return prevIndices;
    });
    sendBid(playerID);
  };

  useEffect(() => {
    const visibleItems = JSON.parse(localStorage.getItem('visible'));
    if (visibleItems) {
      setClickedIndex(visibleItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('visible', JSON.stringify(clickedIndex));
  }, [clickedIndex]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/stats`, {
          params: { week }
        });
        setGraphData(response.data.binned_data);
        setStatData(response.data.stats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    const fetchTargets = async () => {
      try {
        const response = await axios.get(`${apiUrl}/targets`, {
          params: { week }
        });
        const sortedPlayers = response.data.players.sort((a, b) => a.target_id - b.target_id);
        setData(sortedPlayers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        fetchStats(); // Set loading to false after data is fetched
      }
    };
    fetchTargets();
  }, [week]);

  const getPlaceholderText = () => {
    return week === 1000 ? 'Your Auction bid out of $200' : '% of initial FAAB';
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Filtered data based on search query and position filter
  const filteredData = data.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter ? player.position === positionFilter : true;
    return matchesSearch && matchesPosition;
  });

  return (
    <div className="singleCardContainer">
      <div className="buttonContainer">
        <button onClick={showModal} className="modalButton">How It Works</button>
      </div>
      
      {/* Conditionally render the correct modal component */}
      {week === 1000 ? (
        <HowItWorksAuction isVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} />
      ) : (
        <HowItWorkModal isVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} />
      )}
      
      {/* Add the search and filter controls */}
      <div className="filterContainer">
        <Input 
          placeholder="Search by player name" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200, marginRight: 10, marginBottom: 15}}
        />
      </div>

      {/* Position Filter Buttons */}
      <div className="positionFilterContainer">
        {['All', 'QB', 'RB', 'WR', 'TE'].map((position) => (
          <button
            key={position}
            className={`positionFilterButton ${positionFilter === position || (position === 'All' && positionFilter === '') ? 'active' : ''}`}
            onClick={() => setPositionFilter(position === 'All' ? '' : position)}
          >
            {position}
          </button>
        ))}
      </div>

      <div className="singleCard">
        {filteredData.map((item, index) => (
          <React.Fragment key={index}>
            {((index === 2) || (index % 8 === 0 && index !== 0)) && (
                <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  
                }}>
                <a href="https://446ed-g0ded8ibu4-5tpk732eo.hop.clickbank.net/?&traffic_source=blog&traffic_type=organic" target="_blank" rel="noopener noreferrer">
                  <img
                    src="https://www.draftdashboard.com/creatives/creative300anim.gif"
                    alt="Advertisement"
                  />
                </a>
              </div>
            )}
            {index % 4 === 0 && index !== 0 && index % 8 !== 0  && (
                <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  
                }}>
              <a href='https://www.dailyfantasynerd.com?afmc=ba' target="_blank" rel="noopener noreferrer">
                <img
                  src='https://leaddyno-client-images.s3.amazonaws.com/71204ad8ccb61f89f443611d24ec951b101516a9/0ec7cd0a590b758c96e947630563cfbbbbb6f049_DFN-NFL-300x250.png'
                  alt="Daily Fantasy Nerd"
                  style={{ width: '300px', height: '250px' }}
                />
              </a>
            </div>
            )}
            <div className="mainCard">
              {clickedIndex.includes(index) ? (
                <div>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <BidChart
                      playerName={item.name}
                      playerTeam={item.team}
                      playerPos={item.position}
                      graphData={graphData[item.id]} 
                      statData={statData[item.id]}
                    />
                  )} 
                </div>
              ) : (
                <>
                  <img src={item.image} alt="missing" />
                  <div className="playerTitle">{item.name}  </div>
                  <div className="playerTeam">{item.position} - {item.team}</div>
                  <div className="inputContainer">
                    <InputNumber
                      min={0}
                      max={100}
                      onChange={(value) => onChange(value)}
                      changeOnWheel
                      placeholder={getPlaceholderText()} // Use the function here
                      type="number"
                    />
                    <button
                      className="mybtn"
                      onClick={() => handleButtonClick(index, item.id)}
                    >
                      SUBMIT
                    </button>
                  </div>
                </>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SingleCard;
