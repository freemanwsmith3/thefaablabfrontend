import React from 'react'
import SingleCard from '../component/SingleCard/SingleCard'

function Auction({  }) {
  const auction_week = 2000
  return (
    <div className='faab-container'>
    <div className='homeCard'>
        <h3 style={{ marginTop: '20px', fontSize: 45, lineHeight: '1.5' }}>2025 Auction Values</h3>
        <SingleCard week = {auction_week} />
        </div>
    </div>
  )
}

export default Auction