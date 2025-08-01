import React, { useState } from "react";
import { Modal, Button } from "antd";
import { CheckOutlined } from '@ant-design/icons';

const HowItWorksAuction = ({ isVisible, handleOk, handleCancel }) => {
  return (
    <Modal title="How it works:" visible={isVisible} onOk={handleOk} onCancel={handleCancel} footer={[
      <Button key="submit" type="primary" onClick={handleOk}>
        Close
      </Button>,
    ]}>
      <div className="howWrokCard">
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Below are the top auction targets for 2025</li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Configure your league settings (team count, scoring, budget) at the top of the page
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Submit what you plan to bid in YOUR league format (e.g., if you have a $100 budget, enter amounts like $45, not $90)
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Your bids are automatically converted to our baseline format (12-team, Half-PPR, $200 budget) for data consistency
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> All displayed data is converted back to match YOUR league settings
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Win probability = % of historical bids below your amount (e.g., if 70% of people bid less than $45, then bidding $45 gives 70% win chance)
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Use the bid calculator slider to explore different bid amounts and see your win probability
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Zero dollar bids will not be stored, but will allow you to see the data
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Use the crowdsourced data to get an edge in your auction</li>
      </div>
    </Modal>
  );
};

export default HowItWorksAuction;