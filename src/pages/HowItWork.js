import React from "react";
import { CheckOutlined } from '@ant-design/icons';

const HowItWork = () => {
  return (
    <div className="faab-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: '20px'
    }}>
      <div className="collapesCard" style={{
        maxWidth: '600px',
        width: '100%',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>How it works:</h3>
        <div className="howWrokCard">
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {[
              "Below are the top waiver wire adds for the week",
              "Submit what you plan to bid in your league (bids are in % of start of season FAAB)",
              "Zero % bids will not be stored, but will allow you to see the data",
              "After submission, the consensus data will be shown to you",
              "Use the crowdsourced data to get an edge in your league"
            ].map((text, index) => (
              <li key={index} style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                <CheckOutlined style={{ paddingRight: '10px', color: '#035E7B', marginTop: '4px' }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;