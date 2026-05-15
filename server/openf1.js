/**
 * OpenF1 API Client
 * Free, no API key required. Rate limit: 3 req/s, 30 req/min.
 * https://openf1.org/docs
 */

const BASE = 'https://api.openf1.org/v1';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 4000; // ms — matches polling interval

async function fetchJSON(url) {
  const now = Date.now();
  if (cache.has(url)) {
    const { data, ts } = cache.get(url);
    if (now - ts < CACHE_TTL) return data;
  }
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`OpenF1 ${res.status}: ${url}`);
  const data = await res.json();
  cache.set(url, { data, ts: now });
  return data;
}

/** Get the latest session (live or most recent completed) */
async function getLatestSession() {
  // Fetch the current year's sessions, then pick the most recent by date
  const year = new Date().getFullYear();
  const data  = await fetchJSON(`${BASE}/sessions?year=${year}`);
  if (!data?.length) return null;
  // Sort descending by date_start
  const sorted = [...data].sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
  return sorted[0] || null;
}

/** Get all sessions for a given year */
async function getSessionsByYear(year) {
  return fetchJSON(`${BASE}/sessions?year=${year}`);
}

/** Get drivers for a session */
async function getDrivers(sessionKey) {
  return fetchJSON(`${BASE}/drivers?session_key=${sessionKey}`);
}

/** Get latest lap data for each driver */
async function getLaps(sessionKey) {
  return fetchJSON(`${BASE}/laps?session_key=${sessionKey}&order_by=-lap_number&limit=100`);
}

/** Get position data (race order) */
async function getPositions(sessionKey) {
  return fetchJSON(`${BASE}/position?session_key=${sessionKey}&order_by=-date&limit=50`);
}

/** Get intervals (gaps between cars) */
async function getIntervals(sessionKey) {
  return fetchJSON(`${BASE}/intervals?session_key=${sessionKey}&order_by=-date&limit=50`);
}

/** Get car telemetry data for a driver */
async function getCarData(sessionKey, driverNumber, limit = 100) {
  return fetchJSON(
    `${BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}&order_by=-date&limit=${limit}`
  );
}

/** Get stints (tire info per driver) */
async function getStints(sessionKey) {
  return fetchJSON(`${BASE}/stints?session_key=${sessionKey}`);
}

/** Get pit stop data */
async function getPitStops(sessionKey) {
  return fetchJSON(`${BASE}/pit?session_key=${sessionKey}&order_by=-date&limit=30`);
}

/** Get race control messages */
async function getRaceControl(sessionKey) {
  return fetchJSON(`${BASE}/race_control?session_key=${sessionKey}&order_by=-date&limit=50`);
}

/** Get weather data */
async function getWeather(sessionKey) {
  const data = await fetchJSON(
    `${BASE}/weather?session_key=${sessionKey}&order_by=-date&limit=1`
  );
  return data[0] || null;
}

// ─── Aggregator: build full snapshot for broadcast ────────────────────────────

async function buildSnapshot(sessionKey) {
  const [drivers, laps, positions, intervals, stints, pits, raceControl, weather] =
    await Promise.allSettled([
      getDrivers(sessionKey),
      getLaps(sessionKey),
      getPositions(sessionKey),
      getIntervals(sessionKey),
      getStints(sessionKey),
      getPitStops(sessionKey),
      getRaceControl(sessionKey),
      getWeather(sessionKey),
    ]).then(results => results.map(r => (r.status === 'fulfilled' ? r.value : null)));

  // Build a per-driver lookup from latest positions
  const posMap = {};
  if (positions) {
    positions.forEach(p => {
      if (!posMap[p.driver_number] || p.date > posMap[p.driver_number].date)
        posMap[p.driver_number] = p;
    });
  }

  // Latest lap per driver
  const lapMap = {};
  if (laps) {
    laps.forEach(l => {
      if (!lapMap[l.driver_number] || l.lap_number > lapMap[l.driver_number].lap_number)
        lapMap[l.driver_number] = l;
    });
  }

  // Latest interval per driver
  const intMap = {};
  if (intervals) {
    intervals.forEach(i => {
      if (!intMap[i.driver_number] || i.date > intMap[i.driver_number].date)
        intMap[i.driver_number] = i;
    });
  }

  // Latest stint per driver
  const stintMap = {};
  if (stints) {
    stints.forEach(s => {
      if (!stintMap[s.driver_number] || s.stint_number > stintMap[s.driver_number].stint_number)
        stintMap[s.driver_number] = s;
    });
  }

  // Merge into driver list
  const driverList = (drivers || []).map(d => {
    const pos  = posMap[d.driver_number]  || {};
    const lap  = lapMap[d.driver_number]  || {};
    const intv = intMap[d.driver_number]  || {};
    const stint= stintMap[d.driver_number]|| {};
    return {
      driverNumber:  d.driver_number,
      abbreviation:  d.name_acronym,
      fullName:      d.full_name,
      teamName:      d.team_name,
      teamColor:     d.team_colour ? `#${d.team_colour}` : '#888',
      headshot:      d.headshot_url,
      position:      pos.position    || 0,
      lapNumber:     lap.lap_number  || 0,
      lapDuration:   lap.lap_duration|| null,
      sector1:       lap.duration_sector_1 || null,
      sector2:       lap.duration_sector_2 || null,
      sector3:       lap.duration_sector_3 || null,
      isPitOut:      lap.is_pit_out_lap || false,
      compound:      stint.compound  || 'UNKNOWN',
      stintLapCount: stint.lap_end ? (stint.lap_end - (stint.lap_start || 1) + 1) : 0,
      gap:           intv.gap_to_leader || null,
      interval:      intv.interval     || null,
      drs:           false, // from car_data if needed
    };
  });

  driverList.sort((a, b) => (a.position || 99) - (b.position || 99));

  return {
    session: sessionKey,
    timestamp: new Date().toISOString(),
    drivers: driverList,
    raceControl: raceControl || [],
    weather: weather || {},
    pitStops: pits || [],
    stints: stints || [],
  };
}

module.exports = {
  getLatestSession,
  getSessionsByYear,
  getDrivers,
  getLaps,
  getPositions,
  getIntervals,
  getCarData,
  getStints,
  getPitStops,
  getRaceControl,
  getWeather,
  buildSnapshot,
};
