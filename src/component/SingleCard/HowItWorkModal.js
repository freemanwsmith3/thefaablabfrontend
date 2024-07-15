import React, { useState } from "react";
import { Modal, Button } from "antd";
import { CheckOutlined } from '@ant-design/icons';

const HowItWorkModal = ({ isVisible, handleOk, handleCancel }) => {
  return (
    <Modal title="How it works:" visible={isVisible} onOk={handleOk} onCancel={handleCancel} footer={[
      <Button key="submit" type="primary" onClick={handleOk}>
        Close
      </Button>,
    ]}>
      <div className="howWrokCard">
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Below are the top waiver wire adds for the week</li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Submit what you plan to bid in your league (bids are in % of start
          of season FAAB)
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Zero % bids will not be stored, but will allow you to see the data
        </li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> After submission, the consensus data will be shown to you</li>
        <li><CheckOutlined style={{paddingRight:'10px',color:'#035E7B'}}/> Use the crowdsourced data to get an edge in your league</li>
      </div>
    </Modal>
  );
};

export default HowItWorkModal;
