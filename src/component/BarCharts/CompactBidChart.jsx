import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { convertBidRangeData, convertFromBaseline } from '../../utils/conversionUtils';

const CompactBidChart = ({ 
  playerName, 
  playerTeam, 
  playerPos, 
  graphData, 
  statData, 
  leagueSettings, 
  isAuctionWeek,
  rank // Add rank prop for position indicator
}) => {
  const { averageBid, medianBid, mostCommonBid, numberOfBids } = statData || {};

  // Convert graph data based on league settings for auction weeks
  const convertedGraphData = useMemo(() => {
    if (!graphData) return [];
    if (!isAuctionWeek || !leagueSettings) {
      return graphData;
    }
    return convertBidRangeData(graphData, leagueSettings, playerPos);
  }, [graphData, leagueSettings, playerPos, isAuctionWeek]);

  // Simplified data processing for compact view
  const processedData = useMemo(() => {
    if (!convertedGraphData) return [];
    
    const totalBids = convertedGraphData.reduce((sum, item) => sum + item.bids, 0);
    let cumulativeBidsBelow = 0;
    
    const dataWithProbabilities = convertedGraphData.map((item, index) => {
      const [min, max] = isAuctionWeek && item.convertedMin !== undefined 
        ? [item.convertedMin, item.convertedMax]
        : item.label.split(' - ').map(num => parseInt(num.trim()));
      
      const winProbability = totalBids > 0 ? (cumulativeBidsBelow / totalBids) * 100 : 0;
      cumulativeBidsBelow += item.bids;
      
      return {
        ...item,
        min,
        max,
        midpoint: (min + max) / 2,
        winProbability: Math.round(winProbability),
        bidPercentage: Math.round((item.bids / totalBids) * 100)
      };
    });

    // Simple strategy assignment
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

    return dataWithStrategies;
  }, [convertedGraphData, isAuctionWeek]);

  // Calculate win probability for any bid amount
  const calculateWinProbability = (bidAmount) => {
    if (!processedData.length) return 1;
    
    const totalBids = processedData.reduce((sum, item) => sum + item.bids, 0);

  // Early return if no data
  if (!graphData || !statData || totalBids === 0) {
    return (
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '20px',
        height: '280px',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{playerName}</div>
          <div>{playerPos} - {playerTeam}</div>
          <div style={{ marginTop: '8px', fontSize: '10px' }}>No bid data available</div>
        </div>
      </div>
    );
  }
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

  // Slider functionality
  const [sliderValue, setSliderValue] = useState(() => get50PercentBid());

  useEffect(() => {
    setSliderValue(get50PercentBid());
  }, [processedData, sliderRange.min, sliderRange.max]);

  const currentWinProbability = calculateWinProbability(sliderValue);

  // Get recommended bid
  const getRecommendedBid = () => {
    const sweetSpot = processedData.find(item => 
      item.winProbability >= 70 && item.winProbability <= 85
    );
    return sweetSpot || processedData[processedData.length - 1];
  };

  const recommendedBid = getRecommendedBid();

  // Simplified color scheme
  const getBarColor = (item) => {
    switch(item.strategy) {
      case 'Budget': return '#ef4444';
      case 'Recommended': return '#10b981';
      case 'Safe': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const totalBids = processedData.reduce((sum, item) => sum + item.bids, 0);

  // Format bid amount
  const formatBidAmount = (amount) => {
    if (isAuctionWeek) {
      return `$${amount}`;
    }
    return `${amount}%`;
  };

  // Convert stats for display
  const displayStats = useMemo(() => {
    if (!isAuctionWeek || !leagueSettings) {
      return { 
        averageBid: averageBid || 0, 
        medianBid: medianBid || 0, 
        mostCommonBid: mostCommonBid || 0 
      };
    }
    
    return {
      averageBid: convertFromBaseline(averageBid || 0, leagueSettings, playerPos),
      medianBid: convertFromBaseline(medianBid || 0, leagueSettings, playerPos),
      mostCommonBid: convertFromBaseline(mostCommonBid || 0, leagueSettings, playerPos)
    };
  }, [averageBid, medianBid, mostCommonBid, isAuctionWeek, leagueSettings, playerPos]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '10px',
      height: '320px',
      fontSize: '11px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Rank Badge */}
      {rank && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: '#035E7B',
          color: 'white',
          fontSize: '9px',
          fontWeight: 'bold',
          padding: '2px 5px',
          borderRadius: '3px',
          zIndex: 10
        }}>
          #{rank}
        </div>
      )}

      {/* Player Header - Compact */}
      <div style={{ marginBottom: '4px', paddingRight: '25px' }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 'bold', 
          color: '#035E7B',
          lineHeight: '1.2',
          marginBottom: '1px'
        }}>
          {playerName}
        </div>
        <div style={{ 
          fontSize: '9px', 
          color: '#64748b',
          lineHeight: '1.1'
        }}>
          {playerPos} - {playerTeam}
        </div>
      </div>

      {/* Key Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '6px',
        padding: '3px 6px',
        backgroundColor: '#f8fafc',
        borderRadius: '3px',
        fontSize: '9px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#035E7B' }}>
            {formatBidAmount(Math.round(displayStats.averageBid))}
          </div>
          <div style={{ color: '#64748b' }}>Avg</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#035E7B' }}>
            {recommendedBid ? formatBidAmount(Math.round(recommendedBid.midpoint)) : 'N/A'}
          </div>
          <div style={{ color: '#64748b' }}>Rec</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', color: '#035E7B' }}>
            {totalBids}
          </div>
          <div style={{ color: '#64748b' }}>Bids</div>
        </div>
      </div>

      {/* Compact Interactive Slider */}
      <div style={{
        padding: '6px 8px',
        backgroundColor: '#f0f9ff',
        border: '1px solid #0891b2',
        borderRadius: '4px',
        margin: '4px 0',
        fontSize: '8px'
      }}>
        <div style={{ 
          fontSize: '8px', 
          color: '#0891b2', 
          fontWeight: '600', 
          marginBottom: '4px', 
          textAlign: 'center' 
        }}>
          TRY YOUR BID
        </div>
        
        {/* Compact Slider */}
        <div style={{ marginBottom: '4px' }}>
          <input
            type="range"
            min={sliderRange.min}
            max={sliderRange.max}
            value={sliderValue}
            onChange={(e) => setSliderValue(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '4px',
              borderRadius: '2px',
              background: '#d1d5db',
              outline: 'none',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          <style jsx>{`
            input[type="range"]::-webkit-slider-thumb {
              appearance: none;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #0891b2;
              cursor: pointer;
              border: 1px solid white;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
            input[type="range"]::-moz-range-thumb {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #0891b2;
              cursor: pointer;
              border: 1px solid white;
              box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            }
          `}</style>
        </div>

        {/* Compact Display */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0891b2' }}>
              {formatBidAmount(sliderValue)}
            </div>
            <div style={{ fontSize: '7px', color: '#0891b2aa' }}>
              Your Bid
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: 'bold', 
              color: currentWinProbability < 50 ? '#ef4444' : 
                     currentWinProbability < 80 ? '#10b981' : '#3b82f6'
            }}>
              {currentWinProbability}%
            </div>
            <div style={{ fontSize: '7px', color: '#0891b2aa' }}>
              Acquire Chance
            </div>
          </div>
        </div>
      </div>

      {/* Compact Chart */}
      <div style={{ height: '130px', marginBottom: '4px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={processedData} 
            margin={{ top: 5, right: 5, left: 5, bottom: 20 }}
          >
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 8, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={20}
            />
            <YAxis 
              tick={{ fontSize: 8, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={15}
            />
            <Bar 
              dataKey="bids" 
              barSize={20} 
              radius={[2, 2, 0, 0]}
            >
              {processedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry)}
                  stroke={entry.strategy === 'Recommended' ? '#059669' : 'transparent'}
                  strokeWidth={entry.strategy === 'Recommended' ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Strategy Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: '8px', 
        marginBottom: '6px',
        fontSize: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '1px' }}></div>
          <span>Budget</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '1px', border: '1px solid #059669' }}></div>
          <span><strong>Rec</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '1px' }}></div>
          <span>Safe</span>
        </div>
      </div>

      {/* Recommended Bid Highlight */}
      {recommendedBid && (
        <div style={{
          textAlign: 'center',
          padding: '4px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #10b981',
          borderRadius: '3px',
          fontSize: '9px'
        }}>
          <span style={{ color: '#059669', fontWeight: 'bold' }}>
            Recommended: {formatBidAmount(Math.round(recommendedBid.midpoint))} 
            ({recommendedBid.winProbability}% win chance)
          </span>
        </div>
      )}

      {/* Conversion note for auction weeks */}
      {isAuctionWeek && leagueSettings && (
        <div style={{
          fontSize: '7px',
          color: '#64748b',
          textAlign: 'center',
          marginTop: '2px',
          lineHeight: '1.1'
        }}>
          Converted from 12T Half-PPR $200
        </div>
      )}
    </div>
  );
};

export default CompactBidChart;