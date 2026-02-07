import React, { useState, useEffect, useCallback } from 'react';
import Leaderboard from './components/Leaderboard';
import ManualEntry from './components/ManualEntry';
import DetailedTracker from './components/DetailedTracker';
import { fetchMedalData } from './utils/medalScraper';
import playersData from './data/players.json';

function App() {
  // Initialize medal data structure
  const initializeMedalData = () => {
    const initialData = {};
    playersData.players.forEach((player) => {
      player.countries.forEach((country) => {
        if (!initialData[country]) {
          initialData[country] = { gold: 0, silver: 0, bronze: 0 };
        }
      });
    });
    return initialData;
  };

  const [medalData, setMedalData] = useState(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('medalData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with any new countries that might have been added
        const initialized = initializeMedalData();
        return { ...initialized, ...parsed };
      } catch (e) {
        return initializeMedalData();
      }
    }
    return initializeMedalData();
  });

  const [activeTab, setActiveTab] = useState('leaderboard');
  const [lastScraped, setLastScraped] = useState(() => {
    const saved = localStorage.getItem('lastScraped');
    return saved ? new Date(saved) : null;
  });
  const [isScraping, setIsScraping] = useState(false);

  // Save to localStorage whenever medalData changes
  useEffect(() => {
    localStorage.setItem('medalData', JSON.stringify(medalData));
  }, [medalData]);

  // Manual scrape function
  const handleScrape = useCallback(async () => {
    setIsScraping(true);
    console.log('Starting scrape...');
    try {
      const scrapedData = await fetchMedalData();
      console.log('Scraped data received:', scrapedData);
      
      if (scrapedData && Object.keys(scrapedData).length > 0) {
        setMedalData((prev) => {
          // Merge scraped data with existing data (scraped data takes precedence)
          const merged = { ...prev };
          const updatedCountries = [];
          const skippedCountries = [];
          
          Object.keys(scrapedData).forEach((country) => {
            if (scrapedData[country]) {
              const oldData = merged[country] || { gold: 0, silver: 0, bronze: 0 };
              const newData = scrapedData[country];
              
              // Only update if scraped data has valid numbers (not all zeros or undefined)
              const hasValidData = (newData.gold || 0) + (newData.silver || 0) + (newData.bronze || 0) > 0;
              
              // Only update if the new total is >= old total (prevent going backwards)
              const oldTotal = (oldData.gold || 0) + (oldData.silver || 0) + (oldData.bronze || 0);
              const newTotal = (newData.gold || 0) + (newData.silver || 0) + (newData.bronze || 0);
              
              if (hasValidData && newTotal >= oldTotal) {
                merged[country] = newData;
                updatedCountries.push({
                  country,
                  old: oldData,
                  new: newData
                });
              } else {
                skippedCountries.push({
                  country,
                  reason: !hasValidData ? 'invalid data (all zeros)' : `new total (${newTotal}) < old total (${oldTotal})`,
                  old: oldData,
                  new: newData
                });
                console.log(`Skipping ${country}: ${!hasValidData ? 'invalid data (all zeros)' : `new total (${newTotal}) < old total (${oldTotal})`}`);
              }
            }
          });
          
          console.log('Updated countries:', updatedCountries);
          if (skippedCountries.length > 0) {
            console.log('Skipped countries (to prevent going backwards):', skippedCountries);
          }
          console.log('Merged data:', merged);
          return merged;
        });
        const now = new Date();
        setLastScraped(now);
        localStorage.setItem('lastScraped', now.toISOString());
        console.log('Scrape completed successfully');
      } else {
        console.warn('No medal data was scraped - check console for details');
        alert('No medal data was found. The site may use JavaScript to load data dynamically, or the URL structure may have changed. Please use Manual Entry to update medal counts.');
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      alert('Scraping failed. Check the browser console for details. You can still use Manual Entry to update medal counts.');
    } finally {
      setIsScraping(false);
    }
  }, []);

  // Auto-scrape every 30 minutes
  useEffect(() => {
    const scrapeInterval = setInterval(async () => {
      await handleScrape();
    }, 30 * 60 * 1000); // 30 minutes

    // Also scrape on mount if it's been more than 30 minutes since last scrape
    const shouldScrapeOnMount = !lastScraped || 
      (new Date() - lastScraped) > 30 * 60 * 1000;
    
    if (shouldScrapeOnMount) {
      handleScrape();
    }

    return () => clearInterval(scrapeInterval);
  }, [handleScrape, lastScraped]);

  const handleMedalUpdate = (country, medals) => {
    setMedalData((prev) => ({
      ...prev,
      [country]: medals,
    }));
  };

  // Clear all data function
  const handleClearData = () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all medal data? This will reset all countries to zero and cannot be undone.'
    );
    
    if (confirmed) {
      // Clear localStorage
      localStorage.removeItem('medalData');
      localStorage.removeItem('lastScraped');
      
      // Reset state to initial values
      setMedalData(initializeMedalData());
      setLastScraped(null);
      
      alert('All data has been cleared. Medal counts reset to zero.');
    }
  };

  return (
    <div className="min-h-screen bg-winter-blue text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-winter-gold mb-4">
            ❄️ Grad Winter Games Challenge ❄️
          </h1>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <button
              onClick={handleScrape}
              disabled={isScraping}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition"
            >
              {isScraping ? '⏳ Scraping...' : '🔄 Update from USA Today'}
            </button>
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
              title="Clear all medal data and reset to zero"
            >
              🗑️ Clear Data
            </button>
            {lastScraped && (
              <div className="bg-winter-light-blue px-4 py-2 rounded-lg border border-winter-gold border-opacity-30">
                <span className="text-base font-semibold text-winter-gold">
                  Last updated: {lastScraped.toLocaleDateString()} at {lastScraped.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        </header>

        <div className="flex justify-center mb-6 gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'leaderboard'
                ? 'bg-winter-gold text-winter-blue'
                : 'bg-winter-light-blue text-white hover:bg-blue-700'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'detailed'
                ? 'bg-winter-gold text-winter-blue'
                : 'bg-winter-light-blue text-white hover:bg-blue-700'
            }`}
          >
            Detailed Tracker
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              activeTab === 'manual'
                ? 'bg-winter-gold text-winter-blue'
                : 'bg-winter-light-blue text-white hover:bg-blue-700'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {activeTab === 'leaderboard' && (
          <Leaderboard medalData={medalData} />
        )}

        {activeTab === 'detailed' && (
          <DetailedTracker medalData={medalData} />
        )}

        {activeTab === 'manual' && (
          <ManualEntry medalData={medalData} onMedalUpdate={handleMedalUpdate} />
        )}
      </div>
    </div>
  );
}

export default App;
