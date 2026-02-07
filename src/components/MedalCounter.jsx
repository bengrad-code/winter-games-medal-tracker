import React from 'react';

export default function MedalCounter({ country, medals, onUpdate }) {
  const updateMedal = (type, delta) => {
    const newMedals = { ...medals };
    newMedals[type] = Math.max(0, (newMedals[type] || 0) + delta);
    onUpdate(country, newMedals);
  };

  return (
    <div className="bg-winter-light-blue p-4 rounded-lg mb-4">
      <h3 className="text-xl font-bold text-winter-gold mb-3">{country}</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-winter-gold font-bold text-2xl mb-2">🥇</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => updateMedal('gold', -1)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
            >
              −
            </button>
            <span className="text-2xl font-bold w-12 text-center">
              {medals.gold || 0}
            </span>
            <button
              onClick={() => updateMedal('gold', 1)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-center">
          <div className="text-winter-silver font-bold text-2xl mb-2">🥈</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => updateMedal('silver', -1)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
            >
              −
            </button>
            <span className="text-2xl font-bold w-12 text-center">
              {medals.silver || 0}
            </span>
            <button
              onClick={() => updateMedal('silver', 1)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
            >
              +
            </button>
          </div>
        </div>
        <div className="text-center">
          <div className="text-winter-bronze font-bold text-2xl mb-2">🥉</div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => updateMedal('bronze', -1)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
            >
              −
            </button>
            <span className="text-2xl font-bold w-12 text-center">
              {medals.bronze || 0}
            </span>
            <button
              onClick={() => updateMedal('bronze', 1)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
