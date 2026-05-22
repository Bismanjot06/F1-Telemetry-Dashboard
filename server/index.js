/**
 * PitWall F1 Dashboard — Backend Server
 * Express + WebSocket, real-time telemetry polling at 1s intervals
 * All API keys stay server-side (OpenF1 requires none).
 * Port: 3001
 */

const express   = require('express');
const http      = require('http');
const { WebSocketServer } = require('ws');
const cors      = require('cors');
const openf1    = require('./openf1');
const ergast    = require('./ergast');
const { TelemetryNormalizer, TelemetryReplayer } = require('./telemetry');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());

// ── State ──────────────────────────────────────────────────────────────────────
let currentSession   = null;
let latestSnapshot   = null;
let schedule         = [];
let raceControlCache = [];
let telemetryNormalizer = null;
let telemetryCache   = {}; // per-driver latest telemetry packet
const POLL_INTERVAL  = 1000; // 1 second for telemetry updates
const SNAPSHOT_INTERVAL = 4000; // 4 seconds for snapshot broadcasts

// ── Mock fallback (when no live session) ──────────────────────────────────────
function buildMockSnapshot() {
  const DRIVERS = [
    { driverNumber: 1,  abbreviation: 'VER', fullName: 'Max Verstappen',   teamName: 'Red Bull Racing', teamColor: '#3671c6', position: 1, lapNumber: 47, lapDuration: 91.245, compound: 'MEDIUM',   stintLapCount: 12, gap: null,     interval: null,   sector1: 28.112, sector2: 32.891, sector3: 30.242 },
    { driverNumber: 16, abbreviation: 'LEC', fullName: 'Charles Leclerc',  teamName: 'Ferrari',         teamColor: '#e8002d', position: 2, lapNumber: 47, lapDuration: 91.618, compound: 'SOFT',     stintLapCount: 8,  gap: 0.373,    interval: 0.373,  sector1: 28.341, sector2: 33.102, sector3: 30.175 },
    { driverNumber: 4,  abbreviation: 'NOR', fullName: 'Lando Norris',     teamName: 'McLaren',         teamColor: '#ff8000', position: 3, lapNumber: 47, lapDuration: 91.892, compound: 'SOFT',     stintLapCount: 5,  gap: 0.647,    interval: 0.274,  sector1: 28.442, sector2: 33.208, sector3: 30.242 },
    { driverNumber: 44, abbreviation: 'HAM', fullName: 'Lewis Hamilton',   teamName: 'Mercedes',        teamColor: '#27f4d2', position: 4, lapNumber: 47, lapDuration: 92.104, compound: 'MEDIUM',   stintLapCount: 18, gap: 0.859,    interval: 0.212,  sector1: 28.601, sector2: 33.421, sector3: 30.082 },
    { driverNumber: 63, abbreviation: 'RUS', fullName: 'George Russell',   teamName: 'Mercedes',        teamColor: '#27f4d2', position: 5, lapNumber: 47, lapDuration: 92.287, compound: 'HARD',     stintLapCount: 24, gap: 1.042,    interval: 0.183,  sector1: 28.712, sector2: 33.542, sector3: 30.033 },
    { driverNumber: 55, abbreviation: 'SAI', fullName: 'Carlos Sainz',     teamName: 'Ferrari',         teamColor: '#e8002d', position: 6, lapNumber: 47, lapDuration: 92.451, compound: 'MEDIUM',   stintLapCount: 14, gap: 1.206,    interval: 0.164,  sector1: 28.811, sector2: 33.621, sector3: 30.019 },
    { driverNumber: 14, abbreviation: 'ALO', fullName: 'Fernando Alonso',  teamName: 'Aston Martin',    teamColor: '#358c75', position: 7, lapNumber: 47, lapDuration: 92.719, compound: 'HARD',     stintLapCount: 30, gap: 1.474,    interval: 0.268,  sector1: 29.012, sector2: 33.801, sector3: 29.906 },
    { driverNumber: 81, abbreviation: 'PIA', fullName: 'Oscar Piastri',    teamName: 'McLaren',         teamColor: '#ff8000', position: 8, lapNumber: 47, lapDuration: 92.841, compound: 'SOFT',     stintLapCount: 9,  gap: 1.596,    interval: 0.122,  sector1: 29.104, sector2: 33.912, sector3: 29.825 },
    { driverNumber: 11, abbreviation: 'PER', fullName: 'Sergio Perez',     teamName: 'Red Bull Racing', teamColor: '#3671c6', position: 9, lapNumber: 47, lapDuration: 93.012, compound: 'MEDIUM',   stintLapCount: 15, gap: 1.767,    interval: 0.171,  sector1: 29.201, sector2: 34.002, sector3: 29.809 },
    { driverNumber: 18, abbreviation: 'STR', fullName: 'Lance Stroll',     teamName: 'Aston Martin',    teamColor: '#358c75', position: 10,lapNumber: 47, lapDuration: 93.245, compound: 'HARD',     stintLapCount: 20, gap: 2.000,    interval: 0.233,  sector1: 29.312, sector2: 34.112, sector3: 29.821 },
  ];

  const noise  = () => (Math.random() - 0.5) * 0.3;
  const drivers = DRIVERS.map(d => ({
    ...d,
    lapDuration: d.lapDuration + noise(),
    interval:    d.interval !== null ? Math.max(0.001, d.interval + (Math.random() - 0.5) * 0.05) : null,
    gap:         d.gap !== null ? Math.max(0.001, d.gap + (Math.random() - 0.5) * 0.05) : null,
  }));

  return {
    session: 'mock',
    sessionType: 'Race',
    sessionName: 'Monaco Grand Prix',
    circuitName: 'Circuit de Monaco',
    isLive: false,
    isMock: true,
    timestamp: new Date().toISOString(),
    drivers,
    weather: { air_temperature: 24, track_temperature: 42, humidity: 58, wind_speed: 3.3, wind_direction: 315, rainfall: false },
    raceControl: raceControlCache.length ? raceControlCache : MOCK_RC_MESSAGES,
    pitStops: [
      { driver_number: 44, lap_number: 18, pit_duration: 2.4, date: new Date().toISOString() },
      { driver_number: 55, lap_number: 20, pit_duration: 2.8, date: new Date().toISOString() },
      { driver_number: 16, lap_number: 22, pit_duration: 2.2, date: new Date().toISOString() },
    ],
    stints: MOCK_STINTS,
    currentLap: 47,
    totalLaps: 78,
    fastestLap: { driverNumber: 1, abbreviation: 'VER', time: 91.245, lap: 47 },
    flag: 'GREEN',
    safetycar: false,
    vsc: false,
  };
}

const MOCK_RC_MESSAGES = [
  { date: new Date(Date.now() - 120000).toISOString(), category: 'Flag', flag: 'GREEN',  message: 'GREEN FLAG - TRACK IS CLEAR', driver_number: null },
  { date: new Date(Date.now() -  90000).toISOString(), category: 'Drs',  flag: null,     message: 'DRS ENABLED', driver_number: null },
  { date: new Date(Date.now() -  60000).toISOString(), category: 'PitLane', flag: null,  message: 'CAR 44 (HAM): FAST PIT STOP - 2.4s', driver_number: 44 },
  { date: new Date(Date.now() -  30000).toISOString(), category: 'SafetyCar', flag: null,message: 'SAFETY CAR ENDING THIS LAP', driver_number: null },
  { date: new Date(Date.now() -  10000).toISOString(), category: 'Flag', flag: 'GREEN',  message: 'GREEN FLAG - RACING RESUMED', driver_number: null },
];

const MOCK_STINTS = [
  { driver_number: 1,  stint_number: 2, compound: 'MEDIUM', lap_start: 20, lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 16, stint_number: 2, compound: 'SOFT',   lap_start: 22, lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 4,  stint_number: 2, compound: 'SOFT',   lap_start: 25, lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 44, stint_number: 2, compound: 'MEDIUM', lap_start: 18, lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 63, stint_number: 1, compound: 'HARD',   lap_start: 1,  lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 55, stint_number: 2, compound: 'MEDIUM', lap_start: 20, lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 14, stint_number: 1, compound: 'HARD',   lap_start: 1,  lap_end: null,   tyre_age_at_start: 0 },
  { driver_number: 81, stint_number: 2, compound: 'SOFT',   lap_start: 22, lap_end: null,   tyre_age_at_start: 0 },
  // First stints
  { driver_number: 1,  stint_number: 1, compound: 'SOFT',   lap_start: 1,  lap_end: 19,  tyre_age_at_start: 0 },
  { driver_number: 16, stint_number: 1, compound: 'MEDIUM', lap_start: 1,  lap_end: 21,  tyre_age_at_start: 0 },
  { driver_number: 4,  stint_number: 1, compound: 'SOFT',   lap_start: 1,  lap_end: 24,  tyre_age_at_start: 0 },
  { driver_number: 44, stint_number: 1, compound: 'SOFT',   lap_start: 1,  lap_end: 17,  tyre_age_at_start: 0 },
  { driver_number: 55, stint_number: 1, compound: 'SOFT',   lap_start: 1,  lap_end: 19,  tyre_age_at_start: 0 },
  { driver_number: 81, stint_number: 1, compound: 'MEDIUM', lap_start: 1,  lap_end: 21,  tyre_age_at_start: 0 },
];

// ── Broadcast to all WebSocket clients ────────────────────────────────────────
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(payload);
  });
}

function broadcastTelemetry(packets) {
  if (!packets || packets.length === 0) return;
  broadcast({ type: 'telemetry', data: packets });
}

function broadcastSnapshot(snapshot) {
  broadcast({ type: 'snapshot', data: snapshot });
}

// ── Polling loop ──────────────────────────────────────────────────────────────
async function pollTelemetry() {
  if (!currentSession || !telemetryNormalizer) return;

  try {
    const sessionKey = currentSession.session_key;
    const drivers = latestSnapshot?.drivers || [];

    // Fetch location data for all drivers
    let locations = [];
    try {
      const locData = await openf1.getLocation(sessionKey);
      locations = locData || [];
    } catch (err) {
      // Location data might not be available for all sessions
    }

    // Fetch car data for drivers (sample a few to avoid rate limiting)
    const carDataMap = {};
    for (let i = 0; i < Math.min(drivers.length, 5); i++) {
      const driver = drivers[i];
      try {
        const carData = await openf1.getCarData(sessionKey, driver.driverNumber, 1);
        carDataMap[driver.driverNumber] = carData;
      } catch (err) {
        // Skip if error
      }
    }

    // Normalize telemetry data
    const packets = telemetryNormalizer.normalizeBatch(drivers, locations, carDataMap);
    
    // Cache and broadcast
    packets.forEach(p => {
      telemetryCache[p.driverNumber] = p;
    });
    
    if (packets.length > 0) {
      broadcastTelemetry(packets);
    }
  } catch (err) {
    console.warn('[pollTelemetry] error:', err.message);
  }
}

async function poll() {
  try {
    const session = await openf1.getLatestSession();
    currentSession = session;

    if (session) {
      const snap = await openf1.buildSnapshot(session.session_key);
      snap.sessionType  = session.session_type;
      snap.sessionName  = session.meeting_name;
      snap.circuitName  = session.circuit_short_name;
      snap.isLive       = session.date_end ? new Date(session.date_end) > new Date() : true;
      snap.isMock       = false;
      snap.totalLaps    = session.total_laps || 78;
      snap.currentLap   = snap.drivers[0]?.lapNumber || 1;
      snap.flag         = snap.raceControl?.[0]?.flag || 'GREEN';
      snap.fastestLap   = null; // computed from laps if needed
      snap.safetycar    = false;
      snap.vsc          = false;
      latestSnapshot    = snap;

      // Initialize telemetry normalizer if session changed
      if (!telemetryNormalizer || telemetryNormalizer.sessionKey !== session.session_key) {
        if (telemetryNormalizer) telemetryNormalizer.end();
        const circuitCode = session.circuit_short_name?.substring(0, 3).toUpperCase() || 'MNO';
        telemetryNormalizer = new TelemetryNormalizer(session.session_key, circuitCode);
      }
    } else {
      latestSnapshot = buildMockSnapshot();
    }
  } catch (err) {
    console.warn('[poll] error, using mock:', err.message);
    latestSnapshot = buildMockSnapshot();
  }

  broadcastSnapshot(latestSnapshot);
}

// ── REST API (fallback / on-demand) ───────────────────────────────────────────
app.get('/api/snapshot', (_, res) => {
  res.json(latestSnapshot || buildMockSnapshot());
});

app.get('/api/sessions', async (req, res) => {
  const year = req.query.year || 2024;
  try {
    const sessions = await openf1.getSessionsByYear(year);
    res.json(sessions);
  } catch { res.json([]); }
});

app.get('/api/schedule', async (_, res) => {
  try {
    const s = await ergast.getCurrentSchedule();
    res.json(s);
  } catch { res.json(ergast.FALLBACK_SCHEDULE); }
});

app.get('/api/standings/drivers', async (_, res) => {
  try { res.json(await ergast.getDriverStandings()); }
  catch { res.json([]); }
});

app.get('/api/standings/constructors', async (_, res) => {
  try { res.json(await ergast.getConstructorStandings()); }
  catch { res.json([]); }
});

app.get('/api/telemetry/:sessionKey/:driverNumber', async (req, res) => {
  const { sessionKey, driverNumber } = req.params;
  try {
    const data = await openf1.getCarData(sessionKey, driverNumber, 500);
    res.json(data);
  } catch { res.json([]); }
});

// ── Telemetry Logging & Replay API ──────────────────────────────────────────────
app.get('/api/telemetry-logs', (_, res) => {
  try {
    if (telemetryNormalizer) {
      const packets = telemetryNormalizer.getLogger().getPackets();
      res.json({
        sessionKey: telemetryNormalizer.sessionKey,
        packetCount: packets.length,
        packets: packets.slice(-100), // Last 100 packets
      });
    } else {
      res.json({ sessionKey: null, packetCount: 0, packets: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/telemetry-logs/replay/:sessionKey', (req, res) => {
  try {
    const { TelemetryReplayer } = require('./telemetry');
    const replayer = new TelemetryReplayer();
    const logs = replayer.listLogs();
    const matching = logs.filter(log => log.includes(req.params.sessionKey));
    
    if (matching.length === 0) {
      return res.status(404).json({ error: 'No logs found for session' });
    }
    
    const packets = replayer.loadLog(matching[0]);
    res.json({
      filename: matching[0],
      sessionKey: req.params.sessionKey,
      packetCount: packets.length,
      packets: packets.slice().reverse().slice(0, 100), // Last 100 packets
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    wsClients: wss.clients.size,
    currentSession: currentSession?.session_key || null,
    isLive: currentSession ? new Date(currentSession.date_end) > new Date() : false,
    uptime: process.uptime(),
  });
});

// ── WebSocket handshake ───────────────────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log('[ws] client connected, total:', wss.clients.size);
  // Send current snapshot immediately
  if (latestSnapshot) ws.send(JSON.stringify({ type: 'snapshot', data: latestSnapshot }));

  ws.on('message', (msg) => {
    try {
      const { type, payload } = JSON.parse(msg);
      if (type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
    } catch {}
  });

  ws.on('close', () => console.log('[ws] client disconnected'));
  ws.on('error', (err) => console.warn('[ws] error:', err.message));
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`\n🏎  PitWall backend running on http://localhost:${PORT}`);
  console.log('   WebSocket: ws://localhost:' + PORT);
  
  // Load schedule in background
  ergast.getCurrentSchedule().then(s => { schedule = s; console.log(`   Schedule: ${s.length} rounds loaded`); }).catch(() => {});

  // Initial poll, then repeat at different intervals
  await poll();
  setInterval(poll, SNAPSHOT_INTERVAL);
  console.log(`   Polling snapshots every ${SNAPSHOT_INTERVAL / 1000}s`);
  
  // Telemetry polling at faster rate
  setInterval(pollTelemetry, POLL_INTERVAL);
  console.log(`   Polling telemetry every ${POLL_INTERVAL / 1000}s\n`);
});
