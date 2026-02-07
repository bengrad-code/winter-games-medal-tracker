import React from 'react';
import { calculatePoints, calculateTotalMedals } from '../utils/calculatePoints';
import playersData from '../data/players.json';

export default function Leaderboard({ medalData }) {
  const calculatePlayerStats = (player) => {
    let gold = 0;
    let silver = 0;
    let bronze = 0;

    player.countries.forEach((country) => {
      const medals = medalData[country] || { gold: 0, silver: 0, bronze: 0 };
      gold += medals.gold || 0;
      silver += medals.silver || 0;
      bronze += medals.bronze || 0;
    });

    const totalMedals = calculateTotalMedals({ gold, silver, bronze });
    const totalPoints = calculatePoints({ gold, silver, bronze });

    return { gold, silver, bronze, totalMedals, totalPoints };
  };

  const playerStats = playersData.players.map((player) => ({
    ...player,
    ...calculatePlayerStats(player),
  }));

  // Sort by total points (descending)
  playerStats.sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="bg-winter-light-blue p-6 rounded-lg overflow-x-auto">
      <h2 className="text-3xl font-bold text-winter-gold mb-6 text-center">
        🏆 Winter Games Leaderboard 🏆
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-winter-gold">
            <th className="text-left p-4 text-winter-gold font-bold">Player Name</th>
            <th className="text-left p-4 text-winter-gold font-bold">Team Name</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥇 Gold</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥈 Silver</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥉 Bronze</th>
            <th className="text-center p-4 text-winter-gold font-bold">Total Medals</th>
            <th className="text-center p-4 text-winter-gold font-bold bg-winter-gold bg-opacity-20">
              <span className="text-2xl">Total Points</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {playerStats.map((player, index) => (
            <tr
              key={player.name}
              className={`border-b border-gray-600 hover:bg-winter-light-blue transition ${
                index === 0 ? 'bg-winter-gold bg-opacity-10' : ''
              }`}
            >
              <td className="p-4 font-semibold">{player.name}</td>
              <td className="p-4 text-gray-300">{player.teamName}</td>
              <td className="p-4 text-center font-bold text-winter-gold">
                {player.gold}
              </td>
              <td className="p-4 text-center font-bold text-winter-silver">
                {player.silver}
              </td>
              <td className="p-4 text-center font-bold text-winter-bronze">
                {player.bronze}
              </td>
              <td className="p-4 text-center font-semibold">
                {player.totalMedals}
              </td>
              <td className="font-black text-xl text-yellow-400 bg-yellow-400/10 border-l-2 border-yellow-500/50 px-6 py-4 shadow-[inset_0_0_10px_rgba(250,204,21,0.1)] text-center">
                {player.totalPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
