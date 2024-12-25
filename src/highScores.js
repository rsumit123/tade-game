// src/highScores.js

import axios from 'axios';

const API_KEY = import.meta.env.VITE_JSONBIN_API_KEY;
const BIN_ID = import.meta.env.VITE_JSONBIN_BIN_ID;
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;

// Fetch High Scores
export const fetchHighScores = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        'X-Master-Key': API_KEY,
      },
    });
    return response.data.record;
  } catch (error) {
    console.error('Error fetching high scores:', error);
    return [];
  }
};

// Submit High Score
export const submitHighScore = async (name, score) => {
  try {
    const currentScores = await fetchHighScores();
    const newScores = [...currentScores, { name, score }];

    // Sort scores in descending order and keep top 20
    newScores.sort((a, b) => b.score - a.score);
    const topScores = newScores.slice(0, 20);

    // Update the bin with the new top scores
    await axios.put(
      `https://api.jsonbin.io/v3/b/${BIN_ID}`,
      topScores,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': API_KEY,
        },
      }
    );

    return topScores;
  } catch (error) {
    console.error('Error submitting high score:', error);
    return [];
  }
};
