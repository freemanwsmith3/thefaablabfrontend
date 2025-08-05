import React, { useEffect, useState } from 'react';
import { InputNumber, Input } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import BidChart from "../BarCharts/BarCharts";
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import HowItWorkModal from './HowItWorkModal';
import HowItWorksAuction from './HowItWorksAuction';
import { convertToBaseline, getBidDisplayFormat, getBidPlaceholder } from '../../utils/conversionUtils';
import './singleCard.css';

const SingleCard = ({ week, curWk, isDemo }) => {
  const [clickedIndex, setClickedIndex] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [graphData, setGraphData] = useState([]);
  const [statData, setStatData] = useState([]);
  const [bidValue, setBidValue] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  
  // League settings state with defaults: 12 team, half-ppr, $200, 1 QB
  const [leagueSettings, setLeagueSettings] = useState(() => {
    const saved = localStorage.getItem('leagueSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      teamCount: 12,
      scoring: 'half-ppr',
      budget: 200,
      isSuperflex: false
    };
  });

  const apiUrl = 'https://faablab.herokuapp.com/api';
  const isPastWeek = !isDemo && week < curWk;
  const isAuctionWeek = week % 1000 === 0;

  // Save league settings to localStorage
  useEffect(() => {
    localStorage.setItem('leagueSettings', JSON.stringify(leagueSettings));
  }, [leagueSettings]);

  // Check if all settings have been configured
  const areAllSettingsSelected = () => {
    return leagueSettings.teamCount !== null &&
           leagueSettings.scoring !== null &&
           leagueSettings.budget !== null &&
           leagueSettings.isSuperflex !== null;
  };

  const onChange = (value) => {
    setBidValue(value);
  };

  const sendBid = async (playerID, playerPosition) => {
    try {
      const baselineBid = isAuctionWeek 
        ? convertToBaseline(bidValue, leagueSettings, playerPosition)
        : bidValue;

      const data = {
        week: week,
        player: playerID,
        value: baselineBid,
      };
      const response = await axios.post(`${apiUrl}/bid`, data);
    } catch (error) {
      console.error('Error sending bid:', error.response ? error.response.data : error.message);
    }
  };

  const handleButtonClick = (index, playerID, playerPosition) => {
    setClickedIndex((prevIndices) => {
      if (!prevIndices.includes(index)) {
        return [...prevIndices, index];
      }
      return prevIndices;
    });
    sendBid(playerID, playerPosition);
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
    const fetchData = async () => {
      try {
        const [targetsResponse, statsResponse] = await Promise.all([
          axios.get(`${apiUrl}/targets`, { params: { week } }),
          axios.get(`${apiUrl}/stats`, { params: { week } })
        ]);

        const players = targetsResponse.data.players;
        const stats = statsResponse.data.stats;

        const sortedPlayers = players.sort((a, b) => {
          const aBids = (stats[a.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[a.id]?.numberOfBids || 0;
          const bBids = (stats[b.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[b.id]?.numberOfBids || 0;
          
          if (aBids !== bBids) {
            return bBids - aBids;
          }
          
          return a.target_id - b.target_id;
        });
        
        setData(sortedPlayers);
        setGraphData(statsResponse.data.binned_data);
        setStatData(stats);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [week]);

  const getPlaceholderText = () => {
    return isAuctionWeek ? getBidPlaceholder(leagueSettings) : '% of initial FAAB';
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

  const filteredData = data.filter((player) => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = positionFilter ? player.position === positionFilter : true;
    return matchesSearch && matchesPosition;
  });

  // Helper functions for display
  const getScoringDisplay = () => {
    if (leagueSettings.scoring === 'standard') return 'Standard';
    if (leagueSettings.scoring === 'half-ppr') return 'Half PPR';
    if (leagueSettings.scoring === 'full-ppr') return 'Full PPR';
    return '?';
  };

  const getSuperlexDisplay = () => {
    if (leagueSettings.isSuperflex === true) return ' • Superflex';
    if (leagueSettings.isSuperflex === null) return ' • ?QB';
    return '';
  };

  const getLeagueDisplayText = () => {
    const teamText = leagueSettings.teamCount || '?';
    const budgetText = leagueSettings.budget || '?';
    const scoringText = getScoringDisplay();
    const superflexText = getSuperlexDisplay();
    
    return `${teamText} teams • ${scoringText} • $${budgetText} budget${superflexText}`;
  };

  const getProgressText = () => {
    const selectedCount = [leagueSettings.teamCount, leagueSettings.scoring, leagueSettings.budget, leagueSettings.isSuperflex].filter(s => s !== null).length;
    const remaining = 4 - selectedCount;
    
    if (remaining === 0) {
      return 'Data converted from 12-team Half-PPR $200 baseline';
    }
    return `${remaining} more selection${remaining === 1 ? '' : 's'} needed`;
  };

  return (
    <div className="singleCardContainer">
      <div className="buttonContainer">
        <button onClick={showModal} className="modalButton">How It Works</button>
      </div>

      {isAuctionWeek && (
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto 20px auto',
          padding: '0 16px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#f8fafc',
            border: '2px solid #035E7B',
            borderRadius: '12px'
          }}>
            <div style={{ 
              fontSize: '16px', 
              color: '#035E7B', 
              fontWeight: '600', 
              marginBottom: '16px', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <SettingOutlined />
              League Settings
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: '#035E7B' }}>
                  Team Count
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[8, 10, 12, 14, 16].map(count => (
                    <button
                      key={count}
                      onClick={() => setLeagueSettings(prev => ({ ...prev, teamCount: count }))}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${leagueSettings.teamCount === count ? '#035E7B' : '#d1d5db'}`,
                        backgroundColor: leagueSettings.teamCount === count ? '#035E7B' : 'white',
                        color: leagueSettings.teamCount === count ? 'white' : '#035E7B',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: '#035E7B' }}>
                  Scoring System
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { value: 'standard', label: 'Standard' },
                    { value: 'half-ppr', label: 'Half PPR' },
                    { value: 'full-ppr', label: 'Full PPR' }
                  ].map(scoring => (
                    <button
                      key={scoring.value}
                      onClick={() => setLeagueSettings(prev => ({ ...prev, scoring: scoring.value }))}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${leagueSettings.scoring === scoring.value ? '#035E7B' : '#d1d5db'}`,
                        backgroundColor: leagueSettings.scoring === scoring.value ? '#035E7B' : 'white',
                        color: leagueSettings.scoring === scoring.value ? 'white' : '#035E7B',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      {scoring.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: '#035E7B' }}>
                  Auction Budget
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                  {[100, 200, 300].map(budget => (
                    <button
                      key={budget}
                      onClick={() => setLeagueSettings(prev => ({ ...prev, budget }))}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${leagueSettings.budget === budget ? '#035E7B' : '#d1d5db'}`,
                        backgroundColor: leagueSettings.budget === budget ? '#035E7B' : 'white',
                        color: leagueSettings.budget === budget ? 'white' : '#035E7B',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      ${budget}
                    </button>
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>Custom:</span>
                    <InputNumber
                      value={leagueSettings.budget}
                      onChange={(value) => setLeagueSettings(prev => ({ ...prev, budget: value }))}
                      style={{ width: '80px' }}
                      min={50}
                      max={500}
                      step={25}
                      size="small"
                      placeholder="$"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', fontSize: '14px', color: '#035E7B' }}>
                  Quarterback Format
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { value: false, label: 'Standard (1 QB)' },
                    { value: true, label: 'Superflex (2 QB)' }
                  ].map(qb => (
                    <button
                      key={qb.value.toString()}
                      onClick={() => setLeagueSettings(prev => ({ ...prev, isSuperflex: qb.value }))}
                      style={{
                        padding: '8px 16px',
                        border: `2px solid ${leagueSettings.isSuperflex === qb.value ? '#035E7B' : '#d1d5db'}`,
                        backgroundColor: leagueSettings.isSuperflex === qb.value ? '#035E7B' : 'white',
                        color: leagueSettings.isSuperflex === qb.value ? 'white' : '#035E7B',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '14px'
                      }}
                    >
                      {qb.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px', fontWeight: '600' }}>
                  YOUR LEAGUE FORMAT
                </div>
                <div style={{ fontSize: '13px', color: '#035E7B', fontWeight: '600' }}>
                  {getLeagueDisplayText()}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  {getProgressText()}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      
      {isAuctionWeek ? (
        <HowItWorksAuction isVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} />
      ) : (
        <HowItWorkModal isVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} />
      )}
      
      <div className="filterContainer">
        <Input 
          placeholder="Search by player name" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: 200, marginRight: 10, marginBottom: 15}}
        />
      </div>

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
            {index % 4 === 0 && index !== 0 && index % 8 !== 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
              {isPastWeek || clickedIndex.includes(item.target_id) ? (
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
                      leagueSettings={isAuctionWeek ? leagueSettings : null}
                      isAuctionWeek={isAuctionWeek}
                    />
                  )} 
                </div>
              ) : (
                <>
                  <img src={item.image} alt="missing" />
                  <div className="playerTitle">{item.name}</div>
                  <div className="playerTeam">{item.position} - {item.team}</div>
                  <div className="inputContainer">
                    <InputNumber
                      min={0}
                      max={isAuctionWeek ? leagueSettings.budget : 100}
                      onChange={(value) => onChange(value)}
                      changeOnWheel
                      placeholder={getPlaceholderText()}
                      type="number"
                    />
                    <button
                      className="mybtn"
                      onClick={() => handleButtonClick(item.target_id, item.id, item.position)}
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