import React from 'react'
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, theme } from 'antd';
const text = `
Below are the top waiver wire adds for the week
`;
const text1 = `
Submit what you plan to bid in your league (bids are in % of start of season FAAB)

`;
const text2 = `
Zero % bids will not be stored, but will allow you to see the data`;
const text3 = `
After submission, the consensus data will be shown to you`;
const text4 = `
Use the crowdsourced data to get an edge in your league`;

const getItems = (panelStyle) => [
  {
    key: '1',
    label: 'Below are the top waiver',
    children: <p>{text}</p>,
    style: panelStyle,
  },
  {
    key: '2',
    label: 'Submit what you plan',
    children: <p>{text1}</p>,
    style: panelStyle,
  },
  {
    key: '3',
    label: 'Zero % bids will not be stored',
    children: <p>{text2}</p>,
    style: panelStyle,
  },
  {
    key: '4',
    label: 'After submission,',
    children: <p>{text3}</p>,
    style: panelStyle,
  },
  {
    key: '5',
    label: 'Use the crowdsourced',
    children: <p>{text4}</p>,
    style: panelStyle,
  },
];


const FAQS = () => {
    const { token } = theme.useToken();
    const panelStyle = {
        marginBottom: 24,
        background: token.colorFillAlter,
        borderRadius: token.borderRadiusLG,
        border: 'none',
      };
  return (
   <div className='faab-container'>
   <div className="collapesCard">
   <Collapse
    bordered={false}
    // defaultActiveKey={['1']}
    expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    style={{
      background: token.colorBgContainer,
    }}
    items={getItems(panelStyle)}
  />
   </div>
   </div>
  )
}

export default FAQS