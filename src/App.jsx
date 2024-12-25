import React, { useState } from 'react';
import './App.css';

const INITIAL_CASH = 200;
const INITIAL_BACKPACK = 10;
const MAX_DAYS = 30;
const INITIAL_UPGRADE_COST = 100; // Starting cost for the first upgrade
const UPGRADE_MULTIPLIER = 2; // Each upgrade costs 2.5x the previous

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
      setBackpack(backpack + 5);
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

  // Handle game over
  if (gameOver) {
    return (
      <div className="App">
        <h1>Game Over</h1>
        <p>Final Cash Balance: {cash} Rs</p>
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
              Buy +5 Slots for {currentUpgradeCost} Rs
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
