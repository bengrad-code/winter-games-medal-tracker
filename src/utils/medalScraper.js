// Country name mapping (USA Today might use different names)
const COUNTRY_MAPPING = {
  'United States': 'USA',
  'USA': 'USA',
  'U.S.': 'USA',
  'U.S.A.': 'USA',
  'US': 'USA',
  'Great Britain': 'Great Britain',
  'GBR': 'Great Britain',
  'GB': 'Great Britain',
  'Individual Neutral Athletes': 'AIN',
  'Individual  Neutral Athletes': 'AIN', // Handle double space
  'Individual Neutral AthletesAINAIN': 'AIN', // Handle concatenated format
  'Individual  Neutral AthletesAINAIN': 'AIN', // Handle double space + concatenated
  'AIN': 'AIN',
  'Italy': 'Italy',
  'ITA': 'Italy',
  'Norway': 'Norway',
  'NOR': 'Norway',
  'Austria': 'Austria',
  'AUT': 'Austria',
  'Slovenia': 'Slovenia',
  'SLO': 'Slovenia',
  'SVN': 'Slovenia',
  'France': 'France',
  'FRA': 'France',
  'Finland': 'Finland',
  'FIN': 'Finland',
  'China': 'China',
  'CHN': 'China',
  'Japan': 'Japan',
  'JPN': 'Japan',
  'Switzerland': 'Switzerland',
  'SUI': 'Switzerland',
  'Netherlands': 'Netherlands',
  'NED': 'Netherlands',
  'Germany': 'Germany',
  'GER': 'Germany',
  'Canada': 'Canada',
  'CAN': 'Canada',
  'Sweden': 'Sweden',
  'SWE': 'Sweden',
  // Add more mappings as needed
};

// Helper function to normalize country names (case-insensitive, trim whitespace)
function normalizeCountryName(name) {
  if (!name) return '';
  return name.trim();
}

// Helper function to extract country name from concatenated strings like "ItalyITAITA"
function extractCountryName(countryText) {
  if (!countryText) return '';
  
  // Normalize whitespace (replace multiple spaces with single space, then trim)
  const normalized = countryText.replace(/\s+/g, ' ').trim();
  
  // Special handling for "Individual Neutral Athletes" variations
  // Check for variations with AIN code appended or extra spaces
  const lowerNormalized = normalized.toLowerCase();
  if (lowerNormalized.includes('individual') && 
      lowerNormalized.includes('neutral') && 
      lowerNormalized.includes('athletes')) {
    // Handle various formats:
    // - "Individual Neutral Athletes"
    // - "Individual  Neutral Athletes" (double space)
    // - "Individual Neutral AthletesAINAIN"
    // - "Individual  Neutral AthletesAINAIN"
    // Match pattern: "Individual" + spaces + "Neutral" + spaces + "Athletes" + optional "AINAIN"
    const ainPattern = /^Individual\s+Neutral\s+Athletes\s*(AINAIN?)?$/i;
    const match = normalized.match(ainPattern);
    if (match) {
      return 'AIN';
    }
    // Also try a more flexible pattern that just checks if it starts with the phrase
    if (normalized.match(/^Individual\s+Neutral\s+Athletes/i)) {
      return 'AIN';
    }
  }
  
  // Check if it's a concatenated format like "ItalyITAITA" or "United StatesUSAUSA"
  // Try to find a known country name at the beginning (longest match first)
  const sortedKeys = Object.keys(COUNTRY_MAPPING).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    // Normalize the key for comparison (handle spaces)
    const normalizedKey = key.replace(/\s+/g, ' ').trim();
    if (normalized.startsWith(normalizedKey)) {
      return COUNTRY_MAPPING[key]; // Return the mapped value
    }
  }
  
  // Try case-insensitive match (longest first)
  for (const key of sortedKeys) {
    const normalizedKey = key.replace(/\s+/g, ' ').trim().toLowerCase();
    if (lowerNormalized.startsWith(normalizedKey)) {
      return COUNTRY_MAPPING[key];
    }
  }
  
  // If it contains a known country code pattern at the end (like "ITAITA" or "USAUSA")
  // Try to extract the name part before the repeated code
  // Pattern: "CountryNameCODECODE" - extract "CountryName"
  const codePattern = /([A-Z]{3})\1?$/; // Match 3-letter code, optionally repeated
  const match = normalized.match(codePattern);
  if (match) {
    const code = match[1];
    const codeIndex = normalized.lastIndexOf(code);
    if (codeIndex > 0) {
      const potentialName = normalized.substring(0, codeIndex).trim();
      // Check if this matches a known country
      if (COUNTRY_MAPPING[potentialName]) {
        return COUNTRY_MAPPING[potentialName];
      }
      // Try case-insensitive
      for (const [key, value] of Object.entries(COUNTRY_MAPPING)) {
        if (key.toLowerCase() === potentialName.toLowerCase()) {
          return value;
        }
      }
    }
  }
  
  return normalized;
}

// Helper function to map country name (case-insensitive lookup)
function mapCountryName(countryText) {
  // First, try to extract the country name from concatenated strings
  const extracted = extractCountryName(countryText);
  
  // Try exact match first
  if (COUNTRY_MAPPING[extracted]) {
    return COUNTRY_MAPPING[extracted];
  }
  
  // Try case-insensitive match
  const lowerExtracted = extracted.toLowerCase();
  for (const [key, value] of Object.entries(COUNTRY_MAPPING)) {
    if (key.toLowerCase() === lowerExtracted) {
      return value;
    }
  }
  
  // Return extracted name if no mapping found
  return extracted;
}

// Function to parse medal data from HTML
function parseMedalTable(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const medalData = {};
  
  console.log('Parsing HTML, length:', html.length);
  
  // Try multiple selectors to find the medal table
  const tables = doc.querySelectorAll('table');
  console.log('Found', tables.length, 'tables');
  
  // Also try to find JSON data embedded in script tags
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(script => {
    const text = script.textContent || script.innerHTML;
    // Look for JSON data that might contain medal information
    if (text.includes('medal') || text.includes('country') || text.includes('gold')) {
      try {
        // Try to extract JSON objects
        const jsonMatches = text.match(/\{[\s\S]*?"(?:country|nation|name)"[\s\S]*?\}/g);
        if (jsonMatches) {
          jsonMatches.forEach(match => {
            try {
              const data = JSON.parse(match);
              if (data.country || data.nation || data.name) {
                const country = data.country || data.nation || data.name;
                const mappedCountry = COUNTRY_MAPPING[country] || country;
                medalData[mappedCountry] = {
                  gold: parseInt(data.gold || data.g || 0) || 0,
                  silver: parseInt(data.silver || data.s || 0) || 0,
                  bronze: parseInt(data.bronze || data.b || 0) || 0,
                };
              }
            } catch (e) {
              // Not valid JSON, continue
            }
          });
        }
      } catch (e) {
        // Continue parsing tables
      }
    }
  });
  
  // Parse tables
  const allFoundCountries = []; // Track all countries found for debugging
  tables.forEach((table, tableIndex) => {
    const rows = table.querySelectorAll('tr');
    console.log(`Table ${tableIndex}: ${rows.length} rows`);
    
    // First pass: identify column indices from header row
    let countryIndex = -1;
    let goldIndex = -1;
    let silverIndex = -1;
    let bronzeIndex = -1;
    
    if (rows.length > 0) {
      const headerRow = rows[0];
      const headerCells = headerRow.querySelectorAll('td, th');
      const headers = Array.from(headerCells).map(c => c.textContent.trim().toLowerCase());
      console.log('Table headers:', headers);
      
      // Find column indices
      headers.forEach((header, i) => {
        if (header.includes('country') || header.includes('nation') || header.includes('name')) {
          countryIndex = i;
        } else if (header.includes('gold') || header === 'g') {
          goldIndex = i;
        } else if (header.includes('silver') || header === 's') {
          silverIndex = i;
        } else if (header.includes('bronze') || header === 'b') {
          bronzeIndex = i;
        }
      });
      
      console.log(`Column indices - Country: ${countryIndex}, Gold: ${goldIndex}, Silver: ${silverIndex}, Bronze: ${bronzeIndex}`);
      
      // If we didn't find country column, default to index 1 (second column)
      if (countryIndex === -1 && headers.length > 1) {
        countryIndex = 1;
        console.log('Country column not found in headers, defaulting to column 1');
      }
    }
    
    // Second pass: parse data rows
    rows.forEach((row, index) => {
      // Skip header row
      if (index === 0) return;
      
      const cells = row.querySelectorAll('td, th');
      
      if (cells.length < 3) return;
      
      // Get country name from the identified column (or default to first column)
      const countryColumn = countryIndex >= 0 ? countryIndex : 0;
      const countryText = cells[countryColumn] ? cells[countryColumn].textContent.trim() : '';
      
      // Log ALL country names found (for debugging)
      if (countryText && 
          countryText !== 'Country' && 
          countryText !== 'Nation' && 
          countryText !== 'Rank' &&
          countryText !== 'Rnk' &&
          !countryText.toLowerCase().includes('rank') &&
          !countryText.toLowerCase().includes('country') &&
          !/^\d+$/.test(countryText)) { // Skip pure numbers (ranks)
        allFoundCountries.push(countryText);
      }
      
      // Skip header rows and invalid country names
      if (!countryText || 
          countryText === 'Country' || 
          countryText === 'Nation' || 
          countryText === 'Rank' ||
          countryText === 'Rnk' ||
          countryText.toLowerCase().includes('rank') ||
          countryText.toLowerCase().includes('country') ||
          /^\d+$/.test(countryText)) { // Skip pure numbers (ranks)
        return;
      }
      
      // Extract medal counts using identified column indices
      let gold = 0, silver = 0, bronze = 0;
      
      if (goldIndex >= 0 && cells[goldIndex]) {
        gold = parseInt(cells[goldIndex].textContent.trim()) || 0;
      }
      if (silverIndex >= 0 && cells[silverIndex]) {
        silver = parseInt(cells[silverIndex].textContent.trim()) || 0;
      }
      if (bronzeIndex >= 0 && cells[bronzeIndex]) {
        bronze = parseInt(cells[bronzeIndex].textContent.trim()) || 0;
      }
      
      // If column indices weren't found, try heuristic: look for numbers in remaining columns
      if (goldIndex === -1 || silverIndex === -1 || bronzeIndex === -1) {
        let numCount = 0;
        for (let i = 0; i < cells.length; i++) {
          if (i === countryColumn) continue; // Skip country column
          const text = cells[i].textContent.trim();
          const num = parseInt(text);
          if (!isNaN(num)) {
            if (numCount === 0) gold = num;
            else if (numCount === 1) silver = num;
            else if (numCount === 2) bronze = num;
            numCount++;
          }
        }
      }
      
      // Always save countries we find (even with 0 medals) for debugging
      const mappedCountry = mapCountryName(countryText);
      const total = gold + silver + bronze;
      
      console.log(`Found row: "${countryText}" -> "${mappedCountry}": G${gold} S${silver} B${bronze} (Total: ${total})`);
      
      // Save all countries found, even with 0 medals (helps with debugging)
      medalData[mappedCountry] = { gold, silver, bronze };
    });
  });
  
  // Log all countries found for debugging
  console.log('All country names found in tables:', allFoundCountries);
  console.log('Looking for Italy variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('ital') || c === 'ITA' || c === 'Italy'
  ));
  
  console.log('Parsed medal data:', medalData);
  console.log('Countries in parsed data:', Object.keys(medalData));
  
  return medalData;
}

// Fetch medal data with CORS proxy
export async function fetchMedalData() {
  console.log('Starting medal data fetch...');
  
  try {
    // Try multiple potential URLs for USA Today medal data
    const possibleUrls = [
      'https://www.usatoday.com/sports/olympics/medal-count/',
      'https://sportsdata.usatoday.com/olympics/medals',
      'https://sportsdata.usatoday.com/olympics/medal-count',
      'https://www.usatoday.com/sports/olympics/',
    ];
    
    // Try multiple CORS proxies
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://corsproxy.io/?',
      'https://api.codetabs.com/v1/proxy?quest=',
    ];
    
    for (const proxyUrl of proxies) {
      for (const targetUrl of possibleUrls) {
        try {
          console.log(`Trying: ${proxyUrl}${targetUrl}`);
          const fullUrl = proxyUrl + encodeURIComponent(targetUrl);
          
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000), // 10 second timeout
          });
          
          if (!response.ok) {
            console.log(`Response not OK: ${response.status} ${response.statusText}`);
            continue;
          }
          
          const html = await response.text();
          console.log(`Got HTML response, length: ${html.length}`);
          
          if (html.length < 100) {
            console.log('HTML too short, likely an error page');
            continue;
          }
          
          const medalData = parseMedalTable(html);
          
          // If we got some data, return it
          if (Object.keys(medalData).length > 0) {
            console.log(`Successfully scraped ${Object.keys(medalData).length} countries`);
            return medalData;
          } else {
            console.log('No medal data found in HTML');
          }
        } catch (err) {
          console.log(`Failed to fetch from ${targetUrl} via ${proxyUrl}:`, err.message);
          continue;
        }
      }
    }
    
    // If all URLs failed, return null
    console.warn('Could not fetch medal data from any source');
    return null;
  } catch (error) {
    console.error('Failed to fetch medal data:', error);
    return null;
  }
}

export function getDefaultMedalCounts() {
  return {
    gold: 0,
    silver: 0,
    bronze: 0,
  };
}

// Test function to verify country mapping
export function testCountryMapping() {
  const testCountries = ['Italy', 'USA', 'United States', 'ITA', 'Norway', 'NOR'];
  console.log('Testing country mapping:');
  testCountries.forEach(country => {
    const mapped = COUNTRY_MAPPING[country] || country;
    console.log(`${country} -> ${mapped}`);
  });
}
