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
  'United Kingdom': 'Great Britain',
  'UK': 'Great Britain',
  'Britain': 'Great Britain',
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
  'Holland': 'Netherlands',
  'NLD': 'Netherlands',
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
  
  // Check if it's a concatenated format like "ItalyITAITA" or "United StatesUSAUSA" or "NorwayNORNOR"
  // Try to find a known country name at the beginning (longest match first)
  const sortedKeys = Object.keys(COUNTRY_MAPPING).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    // Normalize the key for comparison (handle spaces)
    const normalizedKey = key.replace(/\s+/g, ' ').trim();
    // Check if it starts with the country name
    if (normalized.startsWith(normalizedKey)) {
      return COUNTRY_MAPPING[key]; // Return the mapped value
    }
    // Also check if the country name appears anywhere and is followed by its code
    // This handles cases like "NorwayNORNOR" where the name might be followed immediately by code
    const keyLower = key.toLowerCase();
    const keyIndex = lowerNormalized.indexOf(keyLower);
    if (keyIndex === 0) { // Country name at the start
      // Check if there's a country code right after (like "NorwayNOR")
      const afterKey = normalized.substring(key.length).trim();
      const countryCode = Object.keys(COUNTRY_MAPPING).find(k => 
        COUNTRY_MAPPING[k] === COUNTRY_MAPPING[key] && k.length === 3 && k === k.toUpperCase()
      );
      if (countryCode && afterKey.toUpperCase().startsWith(countryCode)) {
        return COUNTRY_MAPPING[key];
      }
      // If the country name is at the start and the rest looks like codes/numbers, use it
      if (afterKey.length > 0 && (afterKey.match(/^[A-Z]{3}/) || afterKey.match(/^\d/))) {
        return COUNTRY_MAPPING[key];
      }
    }
  }
  
  // Try case-insensitive match (longest first)
  for (const key of sortedKeys) {
    const normalizedKey = key.replace(/\s+/g, ' ').trim().toLowerCase();
    if (lowerNormalized.startsWith(normalizedKey)) {
      return COUNTRY_MAPPING[key];
    }
  }
  
  // If it contains a known country code pattern at the end (like "ITAITA" or "USAUSA" or "NORNOR")
  // Try to extract the name part before the repeated code
  // Pattern: "CountryNameCODECODE" - extract "CountryName"
  const codePattern = /([A-Z]{3})\1?$/; // Match 3-letter code, optionally repeated
  const match = normalized.match(codePattern);
  if (match) {
    const code = match[1];
    const codeIndex = normalized.lastIndexOf(code);
    if (codeIndex > 0) {
      const potentialName = normalized.substring(0, codeIndex).trim();
      
      // First, check if the extracted code actually maps to a known country
      const codeMappedCountry = COUNTRY_MAPPING[code];
      if (codeMappedCountry) {
        // Verify that the potential name matches the country that this code maps to
        if (COUNTRY_MAPPING[potentialName] === codeMappedCountry) {
          return codeMappedCountry;
        }
        // Try case-insensitive match
        for (const [key, value] of Object.entries(COUNTRY_MAPPING)) {
          if (key.toLowerCase() === potentialName.toLowerCase() && value === codeMappedCountry) {
            return value;
          }
        }
      }
      
      // If code doesn't map, just try to match the name (for countries not in our mapping)
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
  
  // Also check if the normalized string contains a country code anywhere (not just at the end)
  // This handles cases like "NorwayNORNOR" or "SloveniaSLOSVN" where the code might be in the middle
  // BUT: Only match if the country name is at the START and the code appears right after it
  for (const [key, value] of Object.entries(COUNTRY_MAPPING)) {
    const keyLower = key.toLowerCase();
    
    // Only process if the country name appears at the START of the string
    if (lowerNormalized.startsWith(keyLower)) {
      // Find all country codes that map to this country
      const countryCodes = Object.keys(COUNTRY_MAPPING).filter(k => 
        COUNTRY_MAPPING[k] === value && k.length === 3 && k === k.toUpperCase()
      );
      
      // Get the text after the country name
      const afterName = normalized.substring(key.length);
      
      // If we see the country name at the start AND any of its codes appear right after, it's this country
      for (const code of countryCodes) {
        // Check if the code appears immediately after the country name (with optional whitespace)
        if (afterName.toUpperCase().trim().startsWith(code)) {
          return value;
        }
      }
      
      // If the country name is at the start and what follows looks like country codes (3 uppercase letters), use it
      // This handles formats like "NorwayNORNOR" where the code might be repeated
      const afterNameUpper = afterName.toUpperCase().trim();
      if (afterNameUpper.match(/^[A-Z]{3}/)) {
        return value;
      }
    }
    
    // For longer country names (more than 3 chars), also check if it appears as a complete word at the start
    // This helps with countries like "Slovenia", "Netherlands", "Great Britain"
    if (key.length > 3 && lowerNormalized.startsWith(keyLower)) {
      // Check if what follows is just codes/numbers (not more country name text)
      const afterName = normalized.substring(key.length).trim();
      if (afterName.length === 0 || afterName.match(/^[A-Z]{3}/) || afterName.match(/^\d/)) {
        return value;
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
  let jsonDataFound = false;
  scripts.forEach((script, scriptIndex) => {
    const text = script.textContent || script.innerHTML;
    // Look for JSON data that might contain medal information
    if (text.includes('medal') || text.includes('country') || text.includes('gold') || text.includes('nation')) {
      try {
        // Try to find JSON arrays of objects (common format for medal data)
        const arrayPattern = /\[[\s\S]*?\{[\s\S]*?"(?:country|nation|name)"[\s\S]*?\}[\s\S]*?\]/g;
        const arrayMatches = text.match(arrayPattern);
        if (arrayMatches) {
          arrayMatches.forEach(match => {
            try {
              const array = JSON.parse(match);
              if (Array.isArray(array)) {
                array.forEach(data => {
                  if (data && (data.country || data.nation || data.name)) {
                    const country = data.country || data.nation || data.name;
                    const mappedCountry = mapCountryName(country);
                    if (mappedCountry) {
                      medalData[mappedCountry] = {
                        gold: parseInt(data.gold || data.g || 0) || 0,
                        silver: parseInt(data.silver || data.s || 0) || 0,
                        bronze: parseInt(data.bronze || data.b || 0) || 0,
                      };
                      jsonDataFound = true;
                      console.log(`Found JSON data for ${country} -> ${mappedCountry}: G${medalData[mappedCountry].gold} S${medalData[mappedCountry].silver} B${medalData[mappedCountry].bronze}`);
                    }
                  }
                });
              }
            } catch (e) {
              // Not valid JSON array, continue
            }
          });
        }
        
        // Also try to extract individual JSON objects
        const jsonMatches = text.match(/\{[\s\S]*?"(?:country|nation|name)"[\s\S]*?\}/g);
        if (jsonMatches) {
          jsonMatches.forEach(match => {
            try {
              const data = JSON.parse(match);
              if (data.country || data.nation || data.name) {
                const country = data.country || data.nation || data.name;
                const mappedCountry = mapCountryName(country);
                if (mappedCountry) {
                  medalData[mappedCountry] = {
                    gold: parseInt(data.gold || data.g || 0) || 0,
                    silver: parseInt(data.silver || data.s || 0) || 0,
                    bronze: parseInt(data.bronze || data.b || 0) || 0,
                  };
                  jsonDataFound = true;
                  console.log(`Found JSON object for ${country} -> ${mappedCountry}: G${medalData[mappedCountry].gold} S${medalData[mappedCountry].silver} B${medalData[mappedCountry].bronze}`);
                }
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
  
  if (jsonDataFound) {
    console.log('Found medal data in JSON/script tags');
  }
  
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
  console.log('Looking for Norway variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('norway') || c === 'NOR' || c === 'Norway' || c.includes('NOR')
  ));
  console.log('Looking for Slovenia variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('slovenia') || c === 'SLO' || c === 'SVN' || c === 'Slovenia' || c.includes('SLO') || c.includes('SVN')
  ));
  console.log('Looking for Finland variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('finland') || c === 'FIN' || c === 'Finland' || c.includes('FIN')
  ));
  console.log('Looking for Netherlands variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('netherlands') || c.toLowerCase().includes('holland') || c === 'NED' || c === 'NLD' || c === 'Netherlands' || c.includes('NED') || c.includes('NLD')
  ));
  console.log('Looking for Great Britain variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('britain') || c.toLowerCase().includes('united kingdom') || c === 'GBR' || c === 'GB' || c === 'UK' || c === 'Great Britain' || c.includes('GBR') || c.includes('GB')
  ));
  console.log('Looking for Austria variations:', allFoundCountries.filter(c => 
    c.toLowerCase().includes('austria') || c === 'AUT' || c === 'Austria' || c.includes('AUT')
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
