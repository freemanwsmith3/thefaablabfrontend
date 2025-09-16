import React, { useEffect, useState } from 'react';
import CompactBidChart from "../component/BarCharts/CompactBidChart"; // Use the new compact component
import axios from 'axios';
import { CircularProgress } from '@mui/material';

const CompactTopTargetsDashboard = ({ week, curWk, isDemo }) => {
  // Function to get current week
  const getCurrentWeek = () => {
    const currentInteger = 1;
    return 39 + currentInteger;
  };

  const displayWeek = week || curWk || getCurrentWeek();
  
  const [loading, setLoading] = useState(true);
  const [topTargets, setTopTargets] = useState([]);
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

        // Sort ALL players by number of bids (overall, not by position)
        const sortedPlayers = players.sort((a, b) => {
          const aBids = (stats[a.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[a.id]?.numberOfBids || 0;
          const bBids = (stats[b.id]?.numberOfBids === "You're the 1st bid") ? 0 : stats[b.id]?.numberOfBids || 0;
          return bBids - aBids;
        });

        // Get top 4 players overall
        setTopTargets(sortedPlayers.slice(0, 4));
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
        width: '100%', 
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
      width: '100%',
      maxWidth: '800px',
      backgroundColor: '#ffffff',
      padding: '12px',
      fontFamily: 'Arial, sans-serif',
      boxSizing: 'border-box',
      margin: '0 auto'
    }}>


      {/* 2x2 Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '8px',
        height: 'auto'
      }}>
        {topTargets.map((player, index) => (
          <CompactBidChart
            key={player.id}
            playerName={player.name}
            playerTeam={player.team}
            playerPos={player.position}
            graphData={graphData[player.id]} 
            statData={statData[player.id] || {}}
            leagueSettings={isAuctionWeek ? defaultLeagueSettings : null}
            isAuctionWeek={isAuctionWeek}
            rank={index + 1} // Pass the rank for the badge
          />
        ))}
      </div>

      {/* Enhanced Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '12px',
        padding: '16px 20px',
        backgroundColor: '#035E7B',
        borderRadius: '8px',
        fontSize: '15px',
        color: 'white',
        fontWeight: 'bold',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ 
          marginBottom: '8px',
          fontSize: '16px',
          lineHeight: '1.3'
        }}>
          Want to see more players and get personalized recommendations?
        </div>
        <a 
          href="https://www.faablab.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            color: '#62D2FF',
            textDecoration: 'none',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '3px solid #62D2FF',
            paddingBottom: '3px',
            transition: 'all 0.3s ease',
            display: 'inline-block'
          }}
          onMouseOver={(e) => {
            e.target.style.color = '#ffffff';
            e.target.style.borderBottomColor = '#ffffff';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.target.style.color = '#62D2FF';
            e.target.style.borderBottomColor = '#62D2FF';
            e.target.style.transform = 'scale(1)';
          }}
        >
          Visit FAABLab.app for Full Access →
        </a>
      </div>
    </div>
  );
};

export default CompactTopTargetsDashboard;