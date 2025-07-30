import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell, CartesianGrid } from 'recharts';
import './barCharts.css';

const BidChart = ({ playerName, playerTeam, playerPos, graphData, statData }) => {
  const labelColors = ['#002E2C', '#035E7B'];
  const { averageBid, medianBid, mostCommonBid, numberOfBids } = statData;

  // Enhanced data processing with simplified 3-tier strategy
  const processedData = useMemo(() => {
    if (!graphData) return [];
    
    const totalBids = graphData.reduce((sum, item) => sum + item.bids, 0);
    let cumulativeBidsBelow = 0;
    
    const dataWithProbabilities = graphData.map((item, index) => {
      const [min, max] = item.label.split(' - ').map(num => parseInt(num.trim()));
      
      // Calculate win probability (percentage of bids BELOW this range)
      const winProbability = totalBids > 0 ? (cumulativeBidsBelow / totalBids) * 100 : 0;
      cumulativeBidsBelow += item.bids;
      
      const bidPercentage = Math.round((item.bids / totalBids) * 100);
      
      return {
        ...item,
        min,
        max,
        midpoint: (min + max) / 2,
        winProbability: Math.round(winProbability),
        bidPercentage
      };
    });

    // First pass: assign strategies based on win probability
    const dataWithStrategies = dataWithProbabilities.map(item => {
      let strategy;
      if (item.winProbability < 50) {
        strategy = 'Budget';
      } else if (item.winProbability < 80) {
        strategy = 'Recommended'; 
      } else {
        strategy = 'Safe';
      }
      
      return { ...item, strategy };
    });

    // Check if there's at least one "Recommended" bar
    const hasRecommended = dataWithStrategies.some(item => item.strategy === 'Recommended');
    
    if (!hasRecommended) {
      // Force at least one bar to be "Recommended"
      // Find the bar closest to 65% win probability (middle of 50-80 range)
      let closestIndex = 0;
      let closestDiff = Math.abs(dataWithStrategies[0].winProbability - 65);
      
      for (let i = 1; i < dataWithStrategies.length; i++) {
        const diff = Math.abs(dataWithStrategies[i].winProbability - 65);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
      
      // Force this bar to be "Recommended"
      dataWithStrategies[closestIndex].strategy = 'Recommended';
    }

    return dataWithStrategies;
  }, [graphData]);

  // Calculate win probability for any bid amount
  const calculateWinProbability = (bidAmount) => {
    if (!processedData.length) return 1;
    
    const totalBids = processedData.reduce((sum, item) => sum + item.bids, 0);
    let totalBidsBelow = 0;
    
    for (const item of processedData) {
      if (item.max <= bidAmount) {
        totalBidsBelow += item.bids;
      } else if (item.min < bidAmount && bidAmount < item.max) {
        // Interpolate within the range
        const rangeProgress = (bidAmount - item.min) / (item.max - item.min);
        totalBidsBelow += item.bids * rangeProgress;
      }
    }
    
    return totalBids > 0 ? Math.round((totalBidsBelow / totalBids) * 100) : 1;
  };

  // Find the bid range that gives 1% to 99% win probability
  const getSliderRange = () => {
    if (!processedData.length) return { min: 1, max: 100 };
    
    let minBid = 1; // Minimum bid that gives >1% win chance
    let maxBid = 100; // Maximum bid that gives <99% win chance
    
    // Find MAXIMUM bid that gives AT MOST 1% win chance (anything higher gives >1%)
    for (let bid = 100; bid >= 1; bid--) {
      const winProb = calculateWinProbability(bid);
      if (winProb <= 1) {
        minBid = bid + 1; // Add 1 to get the first bid that gives >1%
        break;
      }
    }
    
    // Find MINIMUM bid that gives AT LEAST 99% win chance
    for (let bid = 1; bid <= 100; bid++) {
      const winProb = calculateWinProbability(bid);
      if (winProb >= 99) {
        maxBid = bid;
        break;
      }
    }
    
    // Ensure valid range
    if (minBid >= maxBid) {
      minBid = 1;
      maxBid = 100;
    }
    
    return { min: minBid, max: maxBid };
  };

  const sliderRange = getSliderRange();

  // Get bid amount that gives ~50% win probability (within slider range)
  const get50PercentBid = () => {
    if (!processedData.length) return 50;
    
    // Find the first bid that gives 50% or higher win probability
    for (let bid = sliderRange.min; bid <= sliderRange.max; bid++) {
      const winProb = calculateWinProbability(bid);
      if (winProb >= 50) {
        return bid;
      }
    }
    
    // Fallback to middle of slider range if no bid gives 50%+
    return Math.round((sliderRange.min + sliderRange.max) / 2);
  };

  // Slider functionality - default to 50% win probability
  const [sliderValue, setSliderValue] = useState(() => get50PercentBid());

  const currentWinProbability = calculateWinProbability(sliderValue);

  // Simplified color scheme - only 3 colors
  const getBarColor = (item) => {
    switch(item.strategy) {
      case 'Budget': return '#ef4444';        // Red - budget/risky
      case 'Recommended': return '#10b981';   // Green - recommended  
      case 'Safe': return '#3b82f6';          // Blue - safe
      default: return '#6b7280';              // Gray - fallback
    }
  };

  // Calculate totals for each strategy
  const strategyTotals = useMemo(() => {
    const totals = { Budget: 0, Recommended: 0, Safe: 0 };
    processedData.forEach(item => {
      totals[item.strategy] += item.bids;
    });
    return totals;
  }, [processedData]);

  const totalBids = processedData.reduce((sum, item) => sum + item.bids, 0);

  // Get recommended bid (sweet spot around 70-80% win rate)
  const getRecommendedBid = () => {
    const sweetSpot = processedData.find(item => 
      item.winProbability >= 70 && item.winProbability <= 85
    );
    return sweetSpot || processedData[processedData.length - 1];
  };

  const recommendedBid = getRecommendedBid();

  const CustomTick = (props) => {
    const { x, y, payload, index } = props;
    const fill = labelColors[index % labelColors.length];
    return (
      <text x={x} y={y} fill={fill} textAnchor="middle" dy={16} fontSize="12">
        {payload.value}
      </text>
    );
  };

  return (
    <div className="bid-chart-container">
      <div className="bid-chart-title">
        <h2 className="playerName">{playerName}</h2>
        <h3 className="playerTitle">{playerPos} - {playerTeam}</h3>
      </div>

      {/* Interactive bid slider */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f0fdf4',
        border: '2px solid #22c55e',
        borderRadius: '12px',
        margin: '15px 0'
      }}>
        <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
          🎯 BID CALCULATOR
        </div>
        
        {/* Slider */}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="range"
            min={sliderRange.min}
            max={sliderRange.max}
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '5px',
              background: '#d1d5db',
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #22c55e;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #22c55e;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>

        {/* Display current bid and win probability */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              {sliderValue}%
            </div>
            <div style={{ fontSize: '11px', color: '#166534' }}>
              Your bid amount
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              {currentWinProbability}%
            </div>
            <div style={{ fontSize: '11px', color: '#166534' }}>
              Win probability
            </div>
          </div>
        </div>
      </div>

      {/* Total bids display */}
      <div style={{
        textAlign: 'center',
        padding: '12px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        margin: '15px 0'
      }}>
        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
          TOTAL BIDS
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#334155' }}>
          {totalBids.toLocaleString()}
        </div>
      </div>

      {/* Clean mobile chart with Y-axis and labeled bars */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
          data={processedData} 
          margin={{ top: 10, right: 5, left: 20, bottom: 35 }}
        >
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Bar 
            dataKey="bids" 
            barSize={30} 
            radius={[4, 4, 0, 0]}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry)}
                stroke={entry.strategy === 'Recommended' ? '#059669' : 'transparent'}
                strokeWidth={entry.strategy === 'Recommended' ? 3 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Simple strategy labels below chart */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '20px', 
        margin: '10px 0 15px 0',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>
          <span>Budget</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px', border: '2px solid #059669' }}></div>
          <span><strong>Recommended</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
          <span>Safe</span>
        </div>
      </div>
    </div>
  );
};

export default BidChart;