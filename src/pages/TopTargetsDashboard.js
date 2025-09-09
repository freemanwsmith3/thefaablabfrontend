import React, { useEffect, useState } from 'react';
import BidChart from "../component/BarCharts/BarCharts";
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const TopTargetsDashboard = ({ week, curWk, isDemo }) => {
  // Function to get current week (replace with your logic)
  const getCurrentWeek = () => {
    // Calculate week as 39+ integer
    const currentInteger = 1; // Change this to whatever integer you want
    return 39 + currentInteger; // Will be 40, 41, 42, etc.
  };

  // Use current week if no week specified
  const displayWeek = week || curWk || getCurrentWeek();
  
  const [loading, setLoading] = useState(true);
  const [topTargets, setTopTargets] = useState({
    QB: null,
    RB: null,
    WR: null,
    TE: null
  });
  const [graphData, setGraphData] = useState({});
  const [statData, setStatData] = useState({});

  const apiUrl = 'https://faablab.herokuapp.com/api';
  const isAuctionWeek = displayWeek % 1000 === 0;

  // Default league settings for display
  const defaultLeagueSettings = {
    teamCount: 12,
    scoring: 'half-ppr',
    budget: 200,
    isSuperflex: false
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [targetsResponse, statsResponse] = await Promise.all([
          axios.get(`${apiUrl}/targets`, { params: { week: displayWeek } }),
          axios.get(`${apiUrl}/stats`, { params: { week: displayWeek } })
        ]);

        const players = targetsResponse.data.players;
        const stats = statsResponse.data.stats;

        // Group players by position and get the top target for each
        const playersByPosition = players.reduce((acc, player) => {
          if (!acc[player.position]) {
            acc[player.position] = [];
          }
          acc[player.position].push(player);
          return acc;
        }, {});

        // Get top target for each position (sorted by number of bids)
        const topByPosition = {};
        ['QB', 'RB', 'WR', 'TE'].forEach(position => {
          if (playersByPosition[position] && playersByPosition[position].length > 0) {
            const sorted = playersByPosition[position].sort((a, b) => {
              const aBids = (stats[a.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[a.id]?.numberOfBids || 0;
              const bBids = (stats[b.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[b.id]?.numberOfBids || 0;
              return bBids - aBids;
            });
            topByPosition[position] = sorted[0];
          }
        });

        setTopTargets(topByPosition);
        setGraphData(statsResponse.data.binned_data);
        setStatData(stats);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [displayWeek]);

  // Post height to parent window for iframe resizing
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const height = document.body.scrollHeight;
        if (window.parent) {
          window.parent.postMessage({ height }, '*');
        }
      }, 100);
    }
  }, [loading, topTargets]);

  if (loading) {
    return (
      <div style={{ 
        width: '700px', 
        height: '400px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{
      width: '700px',
      minHeight: '1400px',
      backgroundColor: '#ffffff',
      padding: '10px',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px',
        borderBottom: '2px solid #035E7B',
        paddingBottom: '10px'
      }}>
        <h1 style={{
          margin: '0 0 5px 0',
          color: '#035E7B',
          fontSize: '22px',
          fontWeight: 'bold'
        }}>
        FAABLab Top Waiver Targets by Position
        </h1>
        <div style={{
          fontSize: '12px',
          color: '#64748b'
        }}>
        Crowdsourced data to help you determine the perfect bid
        </div>
      </div>

      {/* Vertical Stack Layout for Positions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {['QB', 'RB', 'WR', 'TE'].map((position) => {
          const player = topTargets[position];
          
          if (!player) {
            return (
              <div key={position} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '6px' }}>
                    {position}
                  </div>
                  <div style={{ fontSize: '13px' }}>No targets available</div>
                </div>
              </div>
            );
          }

          return (
            <div key={position} style={{
              border: '2px solid #035E7B',
              borderRadius: '10px',
              padding: '10px',
              backgroundColor: '#ffffff',
              minHeight: '320px',
              boxSizing: 'border-box'
            }}>
              {/* Position Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '8px',
                padding: '6px',
                backgroundColor: '#035E7B',
                color: 'white',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                Top {position}
              </div>

              {/* Chart Container */}
              <div style={{
                transform: 'scale(1.04)',
                transformOrigin: 'top center',
                width: '111.1%',
                marginLeft: '-5.5%',
                overflow: 'hidden'
              }}>
                <BidChart
                  playerName={player.name}
                  playerTeam={player.team}
                  playerPos={player.position}
                  graphData={graphData[player.id]} 
                  statData={statData[player.id] || {}}
                  leagueSettings={isAuctionWeek ? defaultLeagueSettings : null}
                  isAuctionWeek={isAuctionWeek}
                  originalBid={null} // No original bid for dashboard view
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - More Prominent */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#035E7B',
        borderRadius: '8px',
        fontSize: '14px',
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '4px' }}>
          Want to see more players and get personalized recommendations?
        </div>
        <a 
          href="https://www.faablab.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#62D2FF',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
            borderBottom: '2px solid #62D2FF',
            paddingBottom: '2px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#ffffff';
            e.target.style.borderBottomColor = '#ffffff';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#62D2FF';
            e.target.style.borderBottomColor = '#62D2FF';
          }}
        >
          Visit FAABLab.app for Full Access →
        </a>
      </div>
    </div>
  );
};

export default TopTargetsDashboard;