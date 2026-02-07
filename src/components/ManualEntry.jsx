import React, { useState } from 'react';
import MedalCounter from './MedalCounter';
import playersData from '../data/players.json';

export default function ManualEntry({ medalData, onMedalUpdate }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const handleMedalUpdate = (country, medals) => {
    onMedalUpdate(country, medals);
  };

  if (!selectedPlayer) {
    return (
      <div className="bg-winter-light-blue p-6 rounded-lg">
        <h2 className="text-2xl font-bold text-winter-gold mb-4">
          Manual Entry Dashboard
        </h2>
        <p className="text-gray-300 mb-4">
          Select a player to edit their country medal counts:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playersData.players.map((player) => (
            <button
              key={player.name}
              onClick={() => setSelectedPlayer(player)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition"
            >
              <div className="font-bold text-lg">{player.name}</div>
              <div className="text-sm opacity-90">{player.teamName}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-winter-light-blue p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-winter-gold">
            {selectedPlayer.name}
          </h2>
          <p className="text-gray-300">{selectedPlayer.teamName}</p>
        </div>
        <button
          onClick={() => setSelectedPlayer(null)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
        >
          ← Back
        </button>
      </div>
      <div>
        {selectedPlayer.countries.map((country) => (
          <MedalCounter
            key={country}
            country={country}
            medals={medalData[country] || { gold: 0, silver: 0, bronze: 0 }}
            onUpdate={handleMedalUpdate}
          />
        ))}
      </div>
    </div>
  );
}
