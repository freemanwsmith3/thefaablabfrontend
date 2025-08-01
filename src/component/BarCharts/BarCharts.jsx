import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { convertBidRangeData, convertFromBaseline } from '../../utils/conversionUtils';
import './barCharts.css';

const BidChart = ({ playerName, playerTeam, playerPos, graphData, statData, leagueSettings, isAuctionWeek }) => {
  const labelColors = ['#002E2C', '#035E7B'];
  const { averageBid, medianBid, mostCommonBid, numberOfBids } = statData;

  // Convert graph data based on league settings for auction weeks
  const convertedGraphData = useMemo(() => {
    if (!isAuctionWeek || !leagueSettings) {
      return graphData; // No conversion needed for FAAB weeks
    }
    return convertBidRangeData(graphData, leagueSettings, playerPos);
  }, [graphData, leagueSettings, playerPos, isAuctionWeek]);

  // Enhanced data processing with simplified 3-tier strategy
  const processedData = useMemo(() => {
    if (!convertedGraphData) return [];
    
    const totalBids = convertedGraphData.reduce((sum, item) => sum + item.bids, 0);
    let cumulativeBidsBelow = 0;
    
    const dataWithProbabilities = convertedGraphData.map((item, index) => {
      // For auction weeks, use converted ranges; for FAAB, use original
      const [min, max] = isAuctionWeek && item.convertedMin !== undefined 
        ? [item.convertedMin, item.convertedMax]
        : item.label.split(' - ').map(num => parseInt(num.trim()));
      
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

    // Strategy assignment logic
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

    // Ensure at least one "Recommended" bar exists
    const hasRecommended = dataWithStrategies.some(item => item.strategy === 'Recommended');
    
    if (!hasRecommended) {
      let closestIndex = 0;
      let closestDiff = Math.abs(dataWithStrategies[0].winProbability - 65);
      
      for (let i = 1; i < dataWithStrategies.length; i++) {
        const diff = Math.abs(dataWithStrategies[i].winProbability - 65);
        if (diff < closestDiff) {
          closestDiff = diff;
          closestIndex = i;
        }
      }
      
      dataWithStrategies[closestIndex].strategy = 'Recommended';
    }

    return dataWithStrategies;
  }, [convertedGraphData, isAuctionWeek]);

  // Calculate win probability for any bid amount (in user's format)
  const calculateWinProbability = (bidAmount) => {
    if (!processedData.length) return 1;
    
    const totalBids = processedData.reduce((sum, item) => sum + item.bids, 0);
    let totalBidsBelow = 0;
    
    for (const item of processedData) {
      if (item.max <= bidAmount) {
        totalBidsBelow += item.bids;
      } else if (item.min < bidAmount && bidAmount < item.max) {
        const rangeProgress = (bidAmount - item.min) / (item.max - item.min);
        totalBidsBelow += item.bids * rangeProgress;
      }
    }
    
    return totalBids > 0 ? Math.round((totalBidsBelow / totalBids) * 100) : 1;
  };

  // Find the bid range that gives 1% to 99% win probability
  const getSliderRange = () => {
    if (!processedData.length) return { min: 1, max: 100 };
    
    const maxBudget = isAuctionWeek ? leagueSettings?.budget || 200 : 100;
    let minBid = 1;
    let maxBid = maxBudget;
    
    // Find minimum bid that gives >1% win chance
    for (let bid = maxBudget; bid >= 1; bid--) {
      const winProb = calculateWinProbability(bid);
      if (winProb <= 1) {
        minBid = bid + 1;
        break;
      }
    }
    
    // Find minimum bid that gives ≥99% win chance
    for (let bid = 1; bid <= maxBudget; bid++) {
      const winProb = calculateWinProbability(bid);
      if (winProb >= 99) {
        maxBid = bid;
        break;
      }
    }
    
    if (minBid >= maxBid) {
      minBid = 1;
      maxBid = maxBudget;
    }
    
    return { min: minBid, max: maxBid };
  };

  const sliderRange = getSliderRange();

  // Get bid amount that gives ~50% win probability
  const get50PercentBid = () => {
    if (!processedData.length) return 50;
    
    for (let bid = sliderRange.min; bid <= sliderRange.max; bid++) {
      const winProb = calculateWinProbability(bid);
      if (winProb >= 50) {
        return bid;
      }
    }
    
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

  // Convert stats for display (only for auction weeks)
  const displayStats = useMemo(() => {
    if (!isAuctionWeek || !leagueSettings) {
      return { averageBid, medianBid, mostCommonBid }; // No conversion for FAAB
    }
    
    return {
      averageBid: convertFromBaseline(averageBid, leagueSettings, playerPos),
      medianBid: convertFromBaseline(medianBid, leagueSettings, playerPos),
      mostCommonBid: convertFromBaseline(mostCommonBid, leagueSettings, playerPos)
    };
  }, [averageBid, medianBid, mostCommonBid, isAuctionWeek, leagueSettings, playerPos]);

  // Get currency symbol and format
  const formatBidAmount = (amount) => {
    if (isAuctionWeek) {
      return `${amount}`;
    }
    return `${amount}%`;
  };

  const getXAxisLabel = () => {
    if (isAuctionWeek) {
      return `Bid Amount ($)`;
    }
    return 'Bid Range (%)';
  };

  return (
    <div className="bid-chart-container">
      <div className="playerTitle">{playerName}</div>
      <div className="playerTeam">{playerPos} - {playerTeam}</div>

      {/* Interactive bid slider */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8fafc',
        border: '2px solid #035E7B',
        borderRadius: '12px',
        margin: '15px 5px'
      }}>
        <div style={{ fontSize: '14px', color: '#035E7B', fontWeight: '600', marginBottom: '12px', textAlign: 'center' }}>
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
              background: #035E7B;
              cursor: pointer;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #035E7B;
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
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#035E7B' }}>
              {formatBidAmount(sliderValue)}
            </div>
            <div style={{ fontSize: '11px', color: '#035E7Bad' }}>
              Bid amount
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: currentWinProbability < 50 ? '#ef4444' : 
                     currentWinProbability < 80 ? '#10b981' : '#3b82f6'
            }}>
              {currentWinProbability}%
            </div>
            <div style={{ fontSize: '11px', color: '#035E7Bad' }}>
              Acquire probability
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
          TOTAL HISTORICAL BIDS
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#334155' }}>
          {totalBids.toLocaleString()}
        </div>
      </div>

      {/* Clean mobile chart with Y-axis and labeled bars */}
      <ResponsiveContainer width="100%" height={270}>
        <BarChart 
          data={processedData} 
          margin={{ top: 10, right: 5, left: 20, bottom: 55 }}
        >
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 11, fill: '#374151' }}
            axisLine={false}
            tickLine={false}
            label={{ 
              value: getXAxisLabel(), 
              position: 'insideBottom', 
              offset: -10,
              style: { textAnchor: 'middle', fontSize: '12px', fill: '#6b7280' }
            }}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={20}
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

      {/* Show conversion note for auction weeks */}
      {isAuctionWeek && leagueSettings && (
        <div style={{
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          padding: '8px',
          backgroundColor: '#f1f5f9',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
          margin: '10px 0'
        }}>
          💡 Data converted from 12-team Half-PPR $200 baseline to your league format
        </div>
      )}
    </div>
  );
};

export default BidChart;
