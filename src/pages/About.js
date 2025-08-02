import React from 'react';
import './about.css'; // Import the CSS file for About page

const About = () => {
  return (
    <div className="aboutContainer">
      <h1>About FaabLab</h1>
      <p>
        Use FaabLab to get an edge on waivers AND auction drafts. Don't be the joke of your league by dropping half your FAAB budget in week one for some backup running back, or overpaying for players in your auction draft.
      </p>
      
      <h2>What is it?</h2>
      <p>You know how you do a mock draft before the season to have a good idea where guys will go? This is the same thing but for your weekly free agent auction AND your auction draft. Use the tool to see how much you should bid in your real league.</p>
      
      <h2>Two Powerful Tools in One</h2>
      
      <h3>🏈 FAAB Intelligence (In-Season)</h3>
      <p>Get crowdsourced bidding data for weekly waiver wire pickups:</p>
      <ul>
        <li>Submit what you plan to bid in your league (bids are in % of start of season FAAB)</li>
        <li>See consensus data from thousands of other fantasy players</li>
        <li>Interactive bid calculator shows your win probability for any bid amount</li>
        <li>Zero % bids will not be stored, but will allow you to see the data</li>
      </ul>

      <h3>💰 Auction Draft Intelligence (Pre-Season)</h3>
      <p>Get auction values tailored to YOUR league format:</p>
      <ul>
        <li>Configure your league settings (team count, scoring, budget, superflex)</li>
        <li>All data automatically converts to match your specific league format</li>
        <li>Submit bids in your actual league budget (e.g., $45 for a $100 budget league)</li>
        <li>Data sourced from our baseline 12-team, Half-PPR, $200 budget format</li>
        <li>Win probability calculator helps you find the sweet spot for each player</li>
      </ul>

      <h2>Key Features</h2>
      <ul>
        <li><strong>Smart Conversion System:</strong> All auction data converts between league formats automatically</li>
        <li><strong>Win Probability Calculator:</strong> Shows your exact chances of winning each player at different bid amounts</li>
        <li><strong>Interactive Bid Slider:</strong> Explore different bid amounts and see win probabilities in real-time</li>
        <li><strong>Mobile-Optimized:</strong> Designed for quick decisions on your phone</li>
        <li><strong>Crowdsourced Data:</strong> Powered by bids from thousands of fantasy players</li>
        <li><strong>Multiple Formats:</strong> Supports standard, half-PPR, full-PPR, superflex, and any budget size</li>
      </ul>

      <h2>How Win Probability Works</h2>
      <p>
        Our win probability calculation is simple but powerful: <strong>Win probability = % of historical bids below your amount</strong>. 
        For example, if 70% of people historically bid less than $45 for a player, then bidding $45 gives you a 70% chance to win.
      </p>

      <h2>Data Quality</h2>
      <p>
        Our platform has generated millions of data points from engaged fantasy players. Popular players often receive 10,000+ bids, 
        ensuring statistically meaningful insights. We've been featured in NBC Sports, Sharp Football Analysis, and Yahoo Fantasy.
      </p>

      <h2>Contact Us</h2>
      <p>
        Have questions, want to advertise, or need support? Reach out to us:
      </p>
      <ul>
        <li>Reddit: <a href="https://www.reddit.com/user/blopsk" target="_blank" rel="noopener noreferrer">u/blopsk</a></li>
        <li>Twitter: <a href="https://twitter.com/blopsk" target="_blank" rel="noopener noreferrer">@blopsk</a></li>
        {/* <li>Email: <a href="mailto:faablabapp@gmail.com">faablabapp@gmail.com</a></li> */}
      </ul>
    </div>
  );
};

export default About;