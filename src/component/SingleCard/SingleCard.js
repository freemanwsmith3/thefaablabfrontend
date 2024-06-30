import React, { useEffect, useState } from 'react';
import image1 from "../../assets/images/image1.webp";
import image2 from "../../assets/images/image2.webp";
import image3 from "../../assets/images/image3.webp";
import { InputNumber } from "antd";
import BidChart from "../BarCharts/BarCharts";
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import HowItWorkModal from './HowItWorkModal'; // Import the modal component
import './singleCard.css'; // Import the CSS file

const SingleCard = ({ week }) => {
  const [clickedIndex, setClickedIndex] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading
  const [graphData, setGraphData] = useState([]);
  const [statData, setStatData] = useState([]);
  const [bidValue, setBidValue] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const apiUrl = 'https://faablab.herokuapp.com/api';
  const onChange = (value) => {
    setBidValue(value);
  };

  const sendBid = async (playerID) => {
    try {
      // Dictionary of data to send
      const data = {
        week: week,
        player: playerID,
        value: bidValue,
      };
      // Send POST request with axios
      const response = await axios.post(`${apiUrl}/bid`, data);
    } catch (error) {
      console.error('Error sending bid:', error.response ? error.response.data : error.message);
    }
  };

  const handleButtonClick = (index, playerID) => {
    setClickedIndex((prevIndices) => {
      // Check if the index is already in the array
      if (!prevIndices.includes(index)) {
        return [...prevIndices, index];
      }
      return prevIndices;
    });
    sendBid(playerID);
  };

  // Load items from localStorage on component mount
  useEffect(() => {
    const visibleItems = JSON.parse(localStorage.getItem('visible'));
    if (visibleItems) {
      setClickedIndex(visibleItems);
    }
  }, []);

  // Save items to localStorage whenever the items array changes
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
        setData(response.data.players);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        fetchStats(); // Set loading to false after data is fetched
      }
    };
    fetchTargets();
  }, [week]);

  // Functions to handle modal visibility
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="singleCardContainer">
      <div className="buttonContainer">
        <button onClick={showModal} className="modalButton">How It Works</button>
      </div>
      <HowItWorkModal isVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} /> {/* Modal component */}
      <div className="singleCard">
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {index % 6 === 0 && index !== 0 && (
              <div className="mainCard emptyCard">
                <img
                  src="https://www.draftdashboard.com/creatives/creative300anim.gif"
                  alt="Advertisement"
                />
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
                      graphData={graphData[item.id]} 
                      statData={statData[item.id]}
                    />
                  )}
                </div>
              ) : (
                <>
                  <img src={item.image} alt="missing" />
                  <div className="playerTitle">{item.name} - {item.position}</div>
                  <div className="playerTeam">{item.team}</div>
                  <div className="">
                    <InputNumber
                      min={0}
                      max={100}
                      onChange={(value) => onChange(value)}
                      changeOnWheel
                      placeholder="% of initial FAAB"
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
