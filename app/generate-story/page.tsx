"use client"

import React from 'react'

const GenerateStory = () => {
  // get values from localstorage storyDetails
  const storedData = localStorage.getItem('storyDetails');
  let parsedData: {chapter: number; story: string;} = {chapter: 0, story: ''};
  if(storedData) {
    parsedData = JSON.parse(storedData);
  }

  return (
    <>
      <div style={{ backgroundColor: 'rgb(241 241 241)', padding: '20px', margin: '20px' }}>
        <div style={{ margin: '20px' }}><a href="http://localhost:4000/">Back</a></div>
        <p style={{marginLeft: '20px'}}> Story</p>
        <p style={{marginLeft: '20px'}}>{parsedData.story}</p>
      </div>
    </>
  )
}

export default GenerateStory