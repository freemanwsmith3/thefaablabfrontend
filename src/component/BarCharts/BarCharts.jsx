import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, Tooltip, ResponsiveContainer, LabelList, XAxis } from 'recharts';
import { CircularProgress } from '@mui/material';

const BidChart = ({ playerName, playerTeam, graphData, statData, loading }) => {
  const labelColors = ['#FF6700', '#004E98']; // Alternating colors


  const averageBid = statData.averageBid
  const medianBid = statData.medianBid
  const mostCommonBid = statData.mostCommonBid
  const numberOfBids = statData.numberOfBids

  function formatEarnings(value) {
    if (value >= 1000) {
      return `${value}`;
    }
    return `${value}`;
  }

  const CustomTick = (props) => {
    const { x, y, payload, index } = props;
    const fill = labelColors[index % labelColors.length];
    return (
      <text x={x} y={y} fill={fill} textAnchor="middle" dy={16}>
        {payload.value.split('-').map(num => num.trim())[0] === payload.value.split('-').map(num => num.trim())[1] 
          ? payload.value.split('-').map(num => num.trim())[0] 
          : payload.value}
      </text>
    );
    
    
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className='month-day'>{`${playerName}`}</p>
          <p className='month-day'>{`${playerTeam}`}</p>
          <p className='earn-money'>{`Average Bid: ${formatEarnings(averageBid)}%`}</p>
          <p className='earn-money'>{`Number of Bids: ${formatEarnings(numberOfBids)}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ x, y, value }) => (
    <text
      x={x}
      y={y}
      dy={10} // adjust this value to position the label vertically
      textAnchor="middle"
      fill="#666"
      transform={`rotate(90, ${x}, ${y})`}
      style={{ fontSize: '12px' }}
    >
      {value}
    </text>
  );

  return (
    <>
      <div className='mainBar'>
        <div className="playerTitle">{playerName}</div>
        <div className="playerTeam">{playerTeam}</div>
        <div className='bidCard'>
          Average Bid: <strong className="bidAvg">{averageBid}%</strong>
        </div>
        <div className='bidCard'>
          Median Bid:  <strong className="bidAvg">{medianBid}%</strong>
        </div>
        <div className='bidCard'>
          Most Common Bid: <strong className="bidAvg">{mostCommonBid}%</strong>
        </div>
        <div className='bidCard'>
          Number of Bids: <strong className="bidAvg">{numberOfBids}</strong>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={graphData} style={{ marginTop: '20px' }} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <XAxis dataKey="label" tick={<CustomTick />} />
          {/* <Tooltip content={<CustomTooltip />} /> */}
          <Bar
            dataKey="bids"
            fill="#004E98"
            barSize={22}
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="bids" position={'top'} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

export default BidChart;
