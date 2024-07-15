import React from 'react'
import SingleCard from '../component/SingleCard/SingleCard'

function Home({ wk, defaultWk }) {
  const week = wk || defaultWk;
  return (
    <div className='faab-container'>
        <div className='homeCard'>
            <h3>Week {week - 27}</h3>
        <SingleCard week = {week} />
        </div>
    </div>
  )
}

export default Home