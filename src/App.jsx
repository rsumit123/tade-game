// App.js

import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchHighScores, submitHighScore } from './highScores';

const INITIAL_CASH = 500;
const INITIAL_BACKPACK = 10;
const MAX_DAYS = 30;
const INITIAL_UPGRADE_COST = 100; // Starting cost for the first upgrade
const UPGRADE_MULTIPLIER = 2; // Each upgrade costs 2x the previous

// Utility function to generate random price between 50 and 500
const getRandomPrice = () => Math.floor(Math.random() * 451) + 50;

// Initialize items with dynamic names from .env
const initializeItems = () => {
  // Access the environment variable using import.meta.env
  const itemNamesEnv = import.meta.env.VITE_ITEM_NAMES;

  // Split the string into an array, trimming any whitespace
  const itemNames = itemNamesEnv
    ? itemNamesEnv.split(',').map((name) => name.trim())
    : ['Item A', 'Item B', 'Item C', 'Item D', 'Item E']; // Default names if not set

  // Limit to 5 items
  const limitedItemNames = itemNames.slice(0, 5);

  const items = limitedItemNames.map((name, index) => ({
    id: index + 1,
    name: name, // Use dynamic name
    price: getRandomPrice(),
    quantity: 0,
  }));

  return items;
};

function App() {
  const [cash, setCash] = useState(INITIAL_CASH);
  const [day, setDay] = useState(1);
  const [backpack, setBackpack] = useState(INITIAL_BACKPACK);
  const [items, setItems] = useState(initializeItems());
  const [gameOver, setGameOver] = useState(false);
  const [upgradeCount, setUpgradeCount] = useState(0);
  const [currentUpgradeCost, setCurrentUpgradeCost] = useState(INITIAL_UPGRADE_COST);
  const [highScores, setHighScores] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // **New State Variable for Last Purchase**
  const [lastPurchase, setLastPurchase] = useState(null);

  // Fetch high scores on component mount
  useEffect(() => {
    const loadHighScores = async () => {
      const scores = await fetchHighScores();
      setHighScores(scores);
    };
    loadHighScores();
  }, []);

  // Handle buying items
  const handleBuy = (itemId, amount) => {
    const item = items.find((i) => i.id === itemId);
    const totalCost = item.price * amount;
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0) + amount;

    if (cash >= totalCost && totalItems <= backpack) {
      setCash(cash - totalCost);
      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + amount } : i
        )
      );

      // **Update Last Purchase State**
      setLastPurchase({
        name: item.name,
        price: item.price,
        quantity: amount,
      });
    }
  };

  // Handle selling items
  const handleSell = (itemId, amount) => {
    const item = items.find((i) => i.id === itemId);
    if (item.quantity >= amount) {
      const totalRevenue = item.price * amount;
      setCash(cash + totalRevenue);
      setItems(
        items.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - amount } : i
        )
      );
    }
  };

  // Handle backpack upgrade
  const handleUpgrade = () => {
    if (upgradeCount >= 20) {
      alert("Maximum number of upgrades reached.");
      return;
    }
    if (cash >= currentUpgradeCost) {
      setCash(cash - currentUpgradeCost);
      setBackpack(backpack + 10);
      setUpgradeCount(upgradeCount + 1);
      setCurrentUpgradeCost(currentUpgradeCost * UPGRADE_MULTIPLIER);
    }
  };

  // Handle next day
  const handleNextDay = () => {
    if (day >= MAX_DAYS) {
      setGameOver(true);
      return;
    }
    setDay(day + 1);
    // Update item prices
    setItems(
      items.map((item) => ({
        ...item,
        price: getRandomPrice(),
      }))
    );
  };

  // Disable buy/sell buttons based on conditions
  const canBuy = (item, amount) => {
    const totalCost = item.price * amount;
    const totalItems = items.reduce((acc, curr) => acc + curr.quantity, 0) + amount;
    return cash >= totalCost && totalItems <= backpack;
  };

  const canSell = (item, amount) => item.quantity >= amount;

  // Handle high score submission
  const handleSubmitHighScore = async (e) => {
    e.preventDefault();
    if (playerName.trim() === '') {
      alert('Please enter your name.');
      return;
    }
    setIsSubmitting(true);
    const updatedScores = await submitHighScore(playerName, cash);
    setHighScores(updatedScores);
    setIsSubmitting(false);
    setPlayerName('');
  };

  // Handle game over
  if (gameOver) {
    return (
      <div className="App">
        <h1>Game Over</h1>
        <p>Final Cash Balance: {cash} Rs</p>

        {/* **Display Last Purchase Message** */}
        {lastPurchase && (
          <div className="last-purchase">
            <p>
              The last item purchased was <strong>{lastPurchase.name}</strong> at <strong>{lastPurchase.price} Rs</strong> for <strong>{lastPurchase.quantity}</strong> units.
            </p>
          </div>
        )}

        {/* Submit High Score Form */}
        <div className="submit-score">
          <h2>Submit Your High Score</h2>
          <form onSubmit={handleSubmitHighScore}>
            <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Display High Scores */}
        <div className="high-scores">
          <h2>High Scores</h2>
          {highScores.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score (Rs)</th>
                </tr>
              </thead>
              <tbody>
                {highScores.slice(0, 10).map((score, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{score.name}</td>
                    <td>{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No high scores yet.</p>
          )}
        </div>

        <button onClick={() => window.location.reload()}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <h2>Trading Game</h2>
        <div className="status">
          <p>Cash Balance: {cash} Rs</p>
          <p>Day: {day}</p>
          <p>Backpack Capacity: {backpack} slots</p>
        </div>
      </header>
      <main>
        {/* **Optional: Display Last Purchase Message on Main Screen** */}
        {lastPurchase && (
          <div className="last-purchase">
            <p>
              Last purchased: <strong>{lastPurchase.name}</strong> at <strong>{lastPurchase.price} Rs</strong> for <strong>{lastPurchase.quantity}</strong> units.
            </p>
          </div>
        )}

        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Price (Rs)</th>
              <th>Owned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>
                  <button
                    onClick={() => handleBuy(item.id, 1)}
                    disabled={!canBuy(item, 1)}
                  >
                    Buy 1
                  </button>
                  <button
                    onClick={() => handleSell(item.id, 1)}
                    disabled={!canSell(item, 1)}
                  >
                    Sell 1
                  </button>
                  <button
                    onClick={() => handleBuy(item.id, 10)}
                    disabled={!canBuy(item, 10)}
                  >
                    Buy 10
                  </button>
                  <button
                    onClick={() => handleSell(item.id, 10)}
                    disabled={!canSell(item, 10)}
                  >
                    Sell 10
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="upgrade-section">
          <h3>Upgrade Backpack</h3>
          {upgradeCount < 20 ? (
            <button
              onClick={handleUpgrade}
              disabled={cash < currentUpgradeCost}
            >
              Buy +10 Slots for {currentUpgradeCost} Rs
            </button>
          ) : (
            <p>Maximum upgrades reached.</p>
          )}
          {upgradeCount > 0 && upgradeCount < 20 && (
            <p>Next Upgrade Cost: {currentUpgradeCost} Rs</p>
          )}
        </div>
      </main>
      <footer>
        <button onClick={handleNextDay}>Next Day</button>
      </footer>
    </div>
  );
}

export default App;
