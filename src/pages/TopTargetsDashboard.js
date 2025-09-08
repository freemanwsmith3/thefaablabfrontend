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

  if (loading) {
    return (
      <div style={{ 
        width: '1024px', 
        height: '600px', 
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
      width: '1024px',
      minHeight: '800px',
      backgroundColor: '#ffffff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #035E7B',
        paddingBottom: '15px'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#035E7B',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Week {displayWeek - 39} Top Targets by Position
        </h1>
        <div style={{
          fontSize: '14px',
          color: '#64748b'
        }}>
          Most popular FAAB targets in each position
        </div>
      </div>

      {/* Grid Layout for Positions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        height: 'auto'
      }}>
        {['QB', 'RB', 'WR', 'TE'].map((position) => {
          const player = topTargets[position];
          
          if (!player) {
            return (
              <div key={position} style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px'
              }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                    {position}
                  </div>
                  <div>No targets available</div>
                </div>
              </div>
            );
          }

          return (
            <div key={position} style={{
              border: '2px solid #035E7B',
              borderRadius: '12px',
              padding: '15px',
              backgroundColor: '#ffffff',
              minHeight: '350px'
            }}>
              {/* Position Header */}
              <div style={{
                textAlign: 'center',
                marginBottom: '15px',
                padding: '8px',
                backgroundColor: '#035E7B',
                color: 'white',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                Top {position}
              </div>

              {/* Chart Container */}
              <div style={{
                transform: 'scale(0.85)',
                transformOrigin: 'top center',
                width: '117.6%', // Compensate for scale
                marginLeft: '-8.8%' // Center the scaled content
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

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#64748b'
      }}>
        Data shows historical bidding patterns • Visit FAABLab.com for interactive tools
      </div>
    </div>
  );
};

export default TopTargetsDashboard;