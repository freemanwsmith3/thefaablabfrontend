import React from "react";
import { CheckOutlined } from '@ant-design/icons';

const HowItWork = () => {
  return (
    <div className="faab-container">
      <div className="collapesCard">
        <h3>How it works:</h3>
        <div className="howWrokCard">
          <li><CheckOutlined style={{paddingRight:'10px',color:'#004E98'}}/> Below are the top waiver wire adds for the week</li>
          <li><CheckOutlined style={{paddingRight:'10px',color:'#004E98'}}/> Submit what you plan to bid in your league (bids are in % of start
            of season FAAB)
          </li>
          <li><CheckOutlined style={{paddingRight:'10px',color:'#004E98'}}/> Zero % bids will not be stored, but will allow you to see the data
          </li>
          <li><CheckOutlined style={{paddingRight:'10px',color:'#004E98'}}/> After submission, the consensus data will be shown to you</li>
          <li><CheckOutlined style={{paddingRight:'10px',color:'#004E98'}}/> Use the crowdsourced data to get an edge in your league</li>
        </div>
      </div>
    </div>
  );
};

export default HowItWork;
