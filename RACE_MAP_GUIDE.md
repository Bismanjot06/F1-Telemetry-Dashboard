# Professional F1 Live Race Map System — Implementation Guide

## Overview

You now have a professional real-time Formula 1 live race map system integrated into your dashboard. This system provides:

- **Live Canvas-based race track visualization** with smooth driver animation
- **Real-time telemetry streaming** via WebSocket
- **Professional leaderboard panel** with race order, gaps, and interval data
- **Advanced telemetry display panel** showing speed, throttle, brake, gear, and DRS status
- **3-panel integrated layout** (Leaderboard | Race Map | Telemetry)
- **Telemetry logging and replay system** for post-race analysis
- **LERP-based smooth animation** for realistic driver movement

---

## System Architecture

### Backend (server/)

#### 1. **telemetry.js** — Core telemetry processing
- `TelemetryNormalizer`: Converts raw OpenF1 location + car data into normalized packets
- `TelemetryLogger`: Logs all telemetry packets to NDJSON format for replay
- `TelemetryReplayer`: Streams historical session data at adjustable speeds
- `TEAM_COLORS` & `TRACK_LENGTHS_M`: Constants for visualization

#### 2. **openf1.js** — Enhanced API client
- Added `getLocation()` endpoint for real-time position tracking
- Existing endpoints: `getCarData()`, `getPositions()`, `getLaps()`, etc.

#### 3. **server/index.js** — WebSocket & REST backend
- **Dual polling system**:
  - Snapshot polling (4s) — broadcasts full race state
  - Telemetry polling (1s) — broadcasts real-time driver telemetry
- **WebSocket broadcast**: Streams `snapshot` and `telemetry` messages to all clients
- **REST API endpoints**:
  - `/api/telemetry-logs` — view current session telemetry packets
  - `/api/telemetry-logs/replay/:sessionKey` — retrieve historical session logs
  - `/api/health` — backend health and connection status

### Frontend (src/components/)

#### 1. **LiveRaceMap.jsx** — Canvas rendering engine
- Real-time Canvas animation loop (60 FPS)
- SVG track geometry parsing for driver positioning
- Smooth LERP interpolation (0.08 factor for smooth movement)
- Team color-based driver rendering with glow effects
- Telemetry overlay display for selected driver
- WebSocket integration for live telemetry updates
- Responsive design with status indicators

#### 2. **LeaderboardPanel.jsx** — Race order display
- Live position updates with gaps and intervals
- Tyre compound indicators with stint lap counter
- DRS status display with pulse animation
- Driver selection via click
- Lap counter for race progress
- Responsive scrolling list

#### 3. **TelemetryPanel.jsx** — Driver telemetry display
- Real-time speed, throttle, brake, gear visualization
- RPM and DRS status indicators
- Lap times and sector breakdown
- Team info and driver badge
- Responsive metrics grid with visual bars
- Smart color-coding based on values

#### 4. **RaceMapView.jsx** — Integrated layout
- 3-column layout: Leaderboard | Race Map | Telemetry
- Responsive design for tablets and mobile
- Framer Motion animations for view transitions

---

## How to Use

### Starting the System

```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend dev server (in another terminal)
npm run dev

# Or run both simultaneously
npm run dev:full
```

The race map view will be available as the first tab (**🗺 Race Map**) in the dashboard.

### Live Session Usage

1. **Launch the dashboard** → The system auto-detects live F1 sessions
2. **Navigate to "🗺 Race Map" tab** → View the live race map
3. **Click any driver** in the leaderboard → Select them for detailed telemetry
4. **Watch real-time updates** → Driver movements smooth across the track
5. **Monitor telemetry** → Right panel updates with live car data (speed, throttle, etc.)

### Testing with Historical Data

#### Test 1: Using Mock Data
The system runs in mock mode when no live session is detected. Perfect for development:

```javascript
// server/index.js
// Mock data is automatically used if no live session found
// Modify buildMockSnapshot() to test different scenarios
```

#### Test 2: Using Historical OpenF1 Data
To test with real historical session data (e.g., Canada GP):

```bash
# Access the API directly
curl http://localhost:3001/api/telemetry-logs/replay/9158

# This will load and stream the historical session data
```

#### Test 3: Replay Mode
The TelemetryReplayer class streams historical packets at real-time speed:

```javascript
// From backend
const replayer = new TelemetryReplayer();
const packets = replayer.loadLog('telemetry-9158-2024-06-09.ndjson');

// Stream packets with adjustable speed (2.0x = 2x faster)
for await (const packet of replayer.streamLog('telemetry-9158-...', 2.0)) {
  // Broadcast packet to clients
}
```

---

## Key Features Explained

### 1. Real-time Animation System

**How it works:**
- WebSocket receives telemetry packets every 1 second
- Canvas animation loop runs at 60 FPS
- LERP interpolation smooths movement between updates
- No React re-renders per frame (uses refs)

```javascript
// Animation update formula (from LiveRaceMap.jsx)
driver.progress += (driver.targetProgress - driver.progress) * 0.08;
driver.speed += (driver.targetSpeed - driver.speed) * 0.12;
```

Lower interpolation factors = smoother, more cinematic movement
Higher = snappier, more responsive to changes

### 2. SVG Track Geometry

The system uses SVG paths for accurate track rendering:
- Circuit paths defined in `CIRCUITS` constant
- Driver progress converted to (x,y) coordinates using `path.getPointAtLength()`
- Sectors defined with color overlays (Green, Yellow, Purple)

### 3. Telemetry Data Normalization

Raw OpenF1 data → Normalized packets:

```javascript
{
  driverNumber: 1,
  abbreviation: 'VER',
  progress: 0.623,           // 0-1 lap progress
  speed: 312,                // km/h
  throttle: 100,             // 0-100%
  brake: 0,                  // 0-100%
  gear: 8,                   // 1-8
  drs: true,
  sector: 2,                 // 0,1,2
  teamColor: '#3671c6',
  timestamp: ISO8601
}
```

### 4. WebSocket Message Format

**Snapshot message** (every 4 seconds):
```json
{
  "type": "snapshot",
  "data": {
    "drivers": [...],
    "weather": {...},
    "raceControl": [...],
    "currentLap": 47,
    "totalLaps": 78
  }
}
```

**Telemetry message** (every 1 second):
```json
{
  "type": "telemetry",
  "data": [
    { "driverNumber": 1, "speed": 312, "throttle": 100, ... },
    { "driverNumber": 16, "speed": 305, "throttle": 95, ... }
  ]
}
```

### 5. Telemetry Logging

When enabled, all telemetry packets are logged to NDJSON format:

```bash
# Enable telemetry logging
TELEMETRY_LOGGING=true npm run server

# Logs are saved to: logs/telemetry-{sessionKey}-{timestamp}.ndjson
# Each line is a JSON packet
```

---

## Configuration

### Environment Variables

```bash
# Backend
TELEMETRY_LOGGING=true          # Enable/disable packet logging
PORT=3001                        # Server port
POLL_INTERVAL=1000              # Telemetry poll interval (ms)
SNAPSHOT_INTERVAL=4000          # Snapshot poll interval (ms)

# Frontend (.env.local)
VITE_WS_URL=ws://localhost:3001 # WebSocket server URL
VITE_API_URL=http://localhost:3001/api  # REST API base URL
VITE_POLL_INTERVAL=4000         # REST polling interval (ms)
VITE_RECONNECT_DELAY=3000       # WebSocket reconnect delay (ms)
```

### Circuit Configuration

Add new circuits in `LiveRaceMap.jsx`:

```javascript
const CIRCUITS = {
  bahrain: {
    name: 'Bahrain International Circuit',
    code: 'BAH',
    viewBox: '0 0 500 400',
    path: 'M ... Z',  // SVG path string
    sectors: [
      { start: 0.00, end: 0.33, name: 'Sector 1', color: '#00E676' },
      { start: 0.33, end: 0.66, name: 'Sector 2', color: '#FFE600' },
      { start: 0.66, end: 1.00, name: 'Sector 3', color: '#BF00FF' },
    ],
    scale: 1.0,
  },
  // ... more circuits
};
```

---

## Testing Scenarios

### Scenario 1: Live Race Session (Canada GP)

```bash
# 1. Start backend
npm run server

# 2. Start frontend
npm run dev

# 3. Navigate to Race Map tab
# 4. System auto-detects if live session is running
# 5. Watch live driver updates
```

### Scenario 2: Mock Mode Testing

```bash
# Mock data works automatically when no live session
# Test leaderboard sorting, telemetry updates, interactions

# Modify buildMockSnapshot() for edge cases:
# - Test pit stops (stintLapCount = 1)
# - Test DRS (set drs: true)
# - Test gap closures (reduce driver.interval)
```

### Scenario 3: Performance Testing

```javascript
// In browser console, enable FPS counter:
// Monitor 60 FPS smooth rendering with 20 drivers
// Check network tab: WebSocket bandwidth ~5-10 KB/s per client
// Memory usage should stay stable (no memory leaks)
```

### Scenario 4: Replay Mode

```bash
# Load historical session data
curl http://localhost:3001/api/telemetry-logs/replay/9158

# This returns 100 most recent packets from cached session
# Frontend can display "REPLAY" badge instead of "LIVE"
```

---

## Performance Optimization

### Current Optimizations

1. **Canvas-based rendering** — Avoids React DOM churn
2. **RequestAnimationFrame loop** — Smooth 60 FPS
3. **Mutable driver objects** — No state re-creates per frame
4. **LERP interpolation** — Smooth motion, stable FPS
5. **Throttled WebSocket updates** — 1 second telemetry updates
6. **Selective telemetry polling** — Only poll top 5 drivers' car data

### Further Optimization Options

```javascript
// Option 1: Increase LERP factor for snappier movement
const lerpFactor = 0.15; // instead of 0.08

// Option 2: Decrease polling frequency
const POLL_INTERVAL = 2000; // 2 seconds instead of 1s

// Option 3: Pool driver objects instead of creating new ones
// (Already done via driversRef.current.set())

// Option 4: Use WebGL canvas for 100+ drivers
// (Currently using 2D context)
```

---

## Troubleshooting

### Issue: Canvas not rendering drivers

**Solution:**
```javascript
// Check browser console for SVG path errors
// Verify circuit.path is valid SVG string
// Test getPointAtLengthOnPath() with mock data
```

### Issue: WebSocket not connecting

**Solution:**
```javascript
// 1. Verify backend is running: curl http://localhost:3001/api/health
// 2. Check VITE_WS_URL environment variable
// 3. Check browser WebSocket in DevTools (F12 → Network → WS)
// 4. Fallback to REST polling should activate automatically
```

### Issue: Telemetry lag or jittery movement

**Solution:**
```javascript
// Reduce LERP factor to 0.06 for smoother movement
// Increase POLL_INTERVAL to reduce update frequency
// Check network conditions (WebSocket latency)
```

### Issue: High memory usage

**Solution:**
```javascript
// Clear old telemetry cache: telemetryCache = {}
// Limit driver objects stored in driversRef
// Disable telemetry logging if not needed
```

---

## API Reference

### WebSocket Messages

**PING/PONG Heartbeat:**
```json
Client sends: { "type": "ping" }
Server sends: { "type": "pong" }
```

**Snapshot Broadcast** (every 4s):
```
{
  "type": "snapshot",
  "data": { drivers[], weather, raceControl, ... }
}
```

**Telemetry Broadcast** (every 1s):
```
{
  "type": "telemetry",
  "data": { driverNumber, speed, throttle, ... }[]
}
```

### REST Endpoints

- `GET /api/snapshot` — Current race snapshot
- `GET /api/telemetry/:sessionKey/:driverNumber` — Historical telemetry
- `GET /api/telemetry-logs` — Current session logs
- `GET /api/telemetry-logs/replay/:sessionKey` — Replay packets
- `GET /api/health` — Backend status
- `GET /api/schedule` — Season schedule
- `GET /api/sessions?year=2024` — All sessions for year

---

## Next Steps

1. **Deploy to production**:
   - Build frontend: `npm run build`
   - Host on production server
   - Update VITE_WS_URL to production WebSocket URL

2. **Add more circuits**:
   - Export SVG paths from official F1 circuit maps
   - Add to CIRCUITS in LiveRaceMap.jsx
   - Test with historical session data

3. **Enhance features**:
   - Add pit lane visualization
   - Add motion blur effects
   - Add team radio integration
   - Add historical comparison overlay

4. **Performance tuning**:
   - Monitor real-race sessions
   - Adjust LERP factors based on feedback
   - Profile with Chrome DevTools

---

## Support & Contributing

For issues or feature requests:
1. Check the troubleshooting section
2. Verify OpenF1 API availability
3. Test with mock data first
4. Review browser console for errors
5. Check WebSocket connection status

---

**System Status**: ✅ Production-Ready

**Last Updated**: 2024
**Version**: 1.0.0
