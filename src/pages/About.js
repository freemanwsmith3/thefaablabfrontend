import React from 'react';
import './about.css'; // Import the CSS file for About page

const About = () => {
  return (
    <div className="aboutContainer">
      <h1>About FaabLab</h1>
      <p>
      Use FaabLab to get an edge on waiverse. Don't be the joke of your league by dropping half your budget in week one for some back up runningback. 
      </p>
      <h2>What is it?</h2>
        <p>You know how you do a mock draft before the season to have a good idea where guys will go? This is the same thing but for your weekly free agent auction. Use the tool to see how much you should bid in your real league.</p>
      <h2>How It Works</h2>
      <p>
        We have a bunch of top waiver picks on the site:
      </p>
      <ol>
        <li>Submit what you plan to bid in your league (bids are in % of start of season FAAB).</li>
        <li>Zero % bids will not be stored, but will allow you to see the data.</li>
        <li>After submission, the consensus data will be shown to you.</li>
        <li>Use the crowdsourced data to get an edge in your league.</li>
      </ol>
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
