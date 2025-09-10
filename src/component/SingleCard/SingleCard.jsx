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
  
  // NEW: Store original bid values by player ID and week
  const [originalBids, setOriginalBids] = useState(() => {
    const saved = localStorage.getItem('originalBids');
    return saved ? JSON.parse(saved) : {};
  });
  
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

  // NEW: Save original bids to localStorage
  useEffect(() => {
    localStorage.setItem('originalBids', JSON.stringify(originalBids));
  }, [originalBids]);

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

      // NEW: Store the original bid value before converting
      const bidKey = `${week}_${playerID}`;
      setOriginalBids(prev => ({
        ...prev,
        [bidKey]: bidValue
      }));

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

  // NEW: Function to get original bid for a player
  const getOriginalBid = (playerID) => {
    const bidKey = `${week}_${playerID}`;
    return originalBids[bidKey] || null;
  };

  // Helper function to determine if image needs centering
  const isPrivateImageUrl = (imageUrl) => {
    return imageUrl && imageUrl.startsWith('https://static.www.nfl.com/image/private/');
  };

  // NEW: Helper function to check if image is a smaller god-combine/god-prospect image
  const isSmallCombineImage = (imageUrl) => {
    return imageUrl && (imageUrl.includes('god-combine') || imageUrl.includes('god-prospect'));
  };

  // NEW: Helper function to get appropriate container styling
  const getImageContainerStyle = (imageUrl) => {
    const baseStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    };

    if (isSmallCombineImage(imageUrl)) {
      // For smaller god-combine/god-prospect images, use less height for better centering
      return {
        ...baseStyle,
        minHeight: '80px',   // Much less height for smaller images
        padding: '5px 0'     // Reduced vertical padding
      };
    } else if (isPrivateImageUrl(imageUrl)) {
      // For regular private NFL images
      return {
        ...baseStyle,
        minHeight: '120px'
      };
    } else {
      // For other images
      return {
        ...baseStyle,
        minHeight: 'auto'
      };
    }
  };

  // NEW: Helper function to get appropriate image styling
  const getImageStyle = (imageUrl) => {
    const baseStyle = {
      display: 'block'
    };

    if (isSmallCombineImage(imageUrl)) {
      // For smaller images, ensure they're centered and add some constraints
      return {
        ...baseStyle,
        margin: '0 auto',
        maxWidth: '100%',
        height: 'auto'
      };
    } else if (isPrivateImageUrl(imageUrl)) {
      // For regular private images
      return {
        ...baseStyle,
        margin: '0 auto'
      };
    } else {
      // For other images
      return {
        ...baseStyle,
        margin: 'initial'
      };
    }
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

  // Create array with ads inserted at positions 0, 5, 10, 15, etc.
  const createDataWithAds = () => {
    const result = [];
    filteredData.forEach((player, index) => {
      // Insert ad at the very beginning (position 0)
      if (index === 0) {
        result.push({ type: 'ad', id: 'ad-0' });
      }
      
      result.push({ type: 'player', data: player, originalIndex: index });
      
      // Insert ad every 5 players after the first one
      if ((index + 1) % 5 === 0 && index < filteredData.length - 1) {
        result.push({ type: 'ad', id: `ad-${Math.floor((index + 1) / 5)}` });
      }
    });
    return result;
  };

  const dataWithAds = createDataWithAds();

  // Ad Banner Component
const AdBanner = ({ adId }) => {
  const handleAdClick = () => {
    // Replace with your actual link URL
    window.open('https://www.sharpfootballanalysis.com/fantasy-packages/?utm_source=faab', '_blank');
  };

  return (
    <div 
      className="mainCard" 
      style={{ 
        cursor: 'pointer',
        border: 'none',  // Remove border
        boxShadow: 'none'  // Remove box shadow if any
      }} 
      onClick={handleAdClick}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px'
      }}>
        <img 
          src="/faab_square_ad.png" // You'll need to add this to your public folder
          alt="Sharp Fantasy - Weekly Game Previews"
          style={{
            maxWidth: '100%',
            height: 'auto',
            borderRadius: '8px'
          }}
        />
      </div>
    </div>
  );
};

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
        {dataWithAds.map((item, index) => {
          if (item.type === 'ad') {
            return <AdBanner key={item.id} adId={item.id} />;
          }
          
          const player = item.data;
          return (
            <div key={`player-${player.id || index}`} className="mainCard">
              {isPastWeek || clickedIndex.includes(player.target_id) ? (
                <div>
                  {loading ? (
                    <CircularProgress />
                  ) : (
                    <BidChart
                      playerName={player.name}
                      playerTeam={player.team}
                      playerPos={player.position}
                      graphData={graphData[player.id]} 
                      statData={statData[player.id]}
                      leagueSettings={isAuctionWeek ? leagueSettings : null}
                      isAuctionWeek={isAuctionWeek}
                      originalBid={getOriginalBid(player.id)} // NEW: Pass the original bid
                    />
                  )} 
                </div>
              ) : (
                <>
                  <div style={getImageContainerStyle(player.image)}>
                    <img 
                      src={player.image} 
                      alt="missing"
                      style={getImageStyle(player.image)}
                    />
                  </div>
                  <div className="playerTitle">{player.name}</div>
                  <div className="playerTeam">{player.position} - {player.team}</div>
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
                      onClick={() => handleButtonClick(player.target_id, player.id, player.position)}
                    >
                      SUBMIT
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SingleCard;