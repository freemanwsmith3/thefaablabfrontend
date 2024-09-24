import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import './mixDensityHistogram.css';

const BidDensityHistogram = ({ playerName, playerTeam, playerPos, graphData, statData }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select(chartRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Prepare the data: Extract bid ranges (midpoints) and bid counts
    const data = [];
    graphData.forEach(d => {
      const range = d.label.split(' - ').map(Number);
      const midpoint = (range[0] + range[1]) / 2;
      data.push({ x: midpoint, y: d.bids });
    });

    // X-axis: represents the bid ranges
    const x = d3.scaleLinear()
      .domain([1, d3.max(data, d => d.x)]) // Adjust domain to fit bid ranges
      .range([0, width]);

    // Y-axis: represents the number of bids
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.y)])
      .range([height, 0]);

    // Add X axis to the SVG
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis to the SVG
    svg.append('g')
      .call(d3.axisLeft(y));

    // Create the histogram bars
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(d.x) - 10) // Position the bars at midpoints
      .attr('y', d => y(d.y))
      .attr('width', 20) // Fixed bar width
      .attr('height', d => height - y(d.y))
      .attr('fill', '#69b3a2')
      .attr('stroke', 'black');

    // Create the density plot (contours)
    const densityData = d3.contourDensity()
      .x(d => x(d.x))
      .y(d => y(d.y))
      .size([width, height])
      .bandwidth(30)
      (data);

    // Add density contours
    svg.selectAll("path")
      .data(densityData)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("fill", "none")
      .attr("stroke", "#ff7f0e") // Density contour color
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round");

    return () => {
      d3.select(chartRef.current).selectAll('*').remove(); // Clean up on component unmount
    };
  }, [graphData]);

  const { averageBid, medianBid, mostCommonBid, numberOfBids } = statData;

  return (
    <div className="bid-density-histogram-container">
      <div className="bid-heatmap-title">
        <h2 className="playerName">{playerName}</h2>
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
      <svg ref={chartRef}></svg>
    </div>
  );
};

export default BidDensityHistogram;
