import React from 'react';
import { calculateTotalMedals } from '../utils/calculatePoints';
import playersData from '../data/players.json';

export default function DetailedTracker({ medalData }) {
  // Get all unique countries with their medal data and teams
  const allCountries = [];
  playersData.players.forEach((player) => {
    player.countries.forEach((country) => {
      const existing = allCountries.find(c => c.name === country);
      if (!existing) {
        const medals = medalData[country] || { gold: 0, silver: 0, bronze: 0 };
        allCountries.push({
          name: country,
          gold: medals.gold || 0,
          silver: medals.silver || 0,
          bronze: medals.bronze || 0,
          totalMedals: calculateTotalMedals(medals),
          teams: [player.teamName]
        });
      } else {
        // Add team if not already present
        if (!existing.teams.includes(player.teamName)) {
          existing.teams.push(player.teamName);
        }
      }
    });
  });

  // Sort by: 1) Gold (descending), 2) Total Medals (descending)
  allCountries.sort((a, b) => {
    if (b.gold !== a.gold) {
      return b.gold - a.gold;
    }
    return b.totalMedals - a.totalMedals;
  });

  return (
    <div className="bg-winter-light-blue p-6 rounded-lg overflow-x-auto">
      <h2 className="text-3xl font-bold text-winter-gold mb-6 text-center">
        📊 Detailed Medal Tracker by Country
      </h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-winter-gold">
            <th className="text-left p-4 text-winter-gold font-bold">Country</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥇 Gold</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥈 Silver</th>
            <th className="text-center p-4 text-winter-gold font-bold">🥉 Bronze</th>
            <th className="text-center p-4 text-winter-gold font-bold">Total Medals</th>
            <th className="text-center p-4 text-winter-gold font-bold">Team</th>
          </tr>
        </thead>
        <tbody>
          {allCountries.map((country, index) => (
            <tr
              key={country.name}
              className={`border-b border-gray-600 hover:bg-winter-light-blue transition ${
                index === 0 ? 'bg-winter-gold bg-opacity-10' : ''
              }`}
            >
              <td className="p-4 font-semibold">{country.name}</td>
              <td className="p-4 text-center font-bold text-winter-gold">
                {country.gold}
              </td>
              <td className="p-4 text-center font-bold text-winter-silver">
                {country.silver}
              </td>
              <td className="p-4 text-center font-bold text-winter-bronze">
                {country.bronze}
              </td>
              <td className="p-4 text-center font-semibold">
                {country.totalMedals}
              </td>
              <td className="p-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  {country.teams.map((team) => (
                    <span key={team} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold">
                      {team}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
