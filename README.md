# Winter Games Medal Tracker

A web application for tracking Winter Games medals in a family competition. Built with React, Vite, and Tailwind CSS.

## Features

- 🏆 Real-time leaderboard with automatic sorting by Total Points
- 📊 Points system: Gold = 5, Silver = 3, Bronze = 1
- ✏️ Manual entry dashboard for editing medal counts
- 💾 Automatic data persistence with localStorage
- ❄️ Winter Olympics theme with dark mode

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

## Usage

### Leaderboard Tab
- View the current standings for all players
- Automatically sorted by Total Points (highest first)
- The **Total Points** column is highlighted and bold

### Manual Entry Tab
- Select a player to edit their country medal counts
- Use the +/- buttons to adjust Gold, Silver, and Bronze medals
- Changes update the leaderboard instantly
- All data is automatically saved to localStorage

## Players & Countries

- **Ben (Blades of Steel)**: Norway, Austria, Italy, Slovenia
- **Sadie & Gemma (SEMMA)**: USA, France, Great Britain, Finland
- **Spencer (TEAM)**: China, Japan, Switzerland, Netherlands
- **Trish (Pringles)**: Germany, Canada, Sweden, AIN

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
