import React from 'react';
import { BarChart, Bar, ResponsiveContainer, LabelList, XAxis } from 'recharts';
import './barCharts.css';

const BidChart = ({ playerName, playerTeam, playerPos, graphData, statData }) => {
  const labelColors = ['#002E2C', '#035E7B'];

  const { averageBid, medianBid, mostCommonBid, numberOfBids } = statData;

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

  return (
    <div className="bid-chart-container">
      <div className="bid-chart-title">
        <h2 className="playerName">{playerName} </h2>
        <h3 className="playerTitle">{playerPos} - {playerTeam}</h3>
      </div>
      <div className="bid-cards-container">
        <div className="bid-card">
          <div className="bid-label">Average Bid</div>
          <div className="bid-value">{averageBid}%</div>
        </div>
        <div className="bid-card">
          <div className="bid-label">Median Bid</div>
          <div className="bid-value">{medianBid}%</div>
        </div>
        <div className="bid-card">
          <div className="bid-label">Most Common</div>
          <div className="bid-value">{mostCommonBid}%</div>
        </div>
        <div className="bid-card">
          <div className="bid-label">Number of Bids</div>
          <div className="bid-value">{numberOfBids}</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={graphData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={<CustomTick />} />
          <Bar
            dataKey="bids"
            fill="#035E7B"
            barSize={22}
            radius={[0, 0, 0, 0]}
          >
            <LabelList dataKey="bids" position={'top'} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BidChart;
