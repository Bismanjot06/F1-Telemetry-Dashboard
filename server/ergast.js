/**
 * Ergast API Client — Historical F1 data
 * Free, no API key. Being deprecated but still operational.
 * http://ergast.com/mrd/
 */

const BASE = 'https://ergast.com/api/f1';

const cache = new Map();
const CACHE_TTL = 60 * 1000; // 1 min — ergast is historical, no need to hammer it

async function fetchJSON(url) {
  const now = Date.now();
  if (cache.has(url)) {
    const { data, ts } = cache.get(url);
    if (now - ts < CACHE_TTL) return data;
  }
  try {
    const res = await fetch(`${url}.json`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Ergast ${res.status}`);
    const json = await res.json();
    cache.set(url, { data: json, ts: now });
    return json;
  } catch (err) {
    console.warn('[ergast] fetch failed:', err.message);
    return null;
  }
}

/** Current season schedule */
async function getCurrentSchedule() {
  const data = await fetchJSON(`${BASE}/current`);
  return data?.MRData?.RaceTable?.Races || FALLBACK_SCHEDULE;
}

/** Driver standings for current season */
async function getDriverStandings() {
  const data = await fetchJSON(`${BASE}/current/driverStandings`);
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
}

/** Constructor standings */
async function getConstructorStandings() {
  const data = await fetchJSON(`${BASE}/current/constructorStandings`);
  return data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
}

/** Last race results */
async function getLastRaceResults() {
  const data = await fetchJSON(`${BASE}/current/last/results`);
  return data?.MRData?.RaceTable?.Races?.[0] || null;
}

/** Get qualifying results for a round */
async function getQualifying(year, round) {
  const data = await fetchJSON(`${BASE}/${year}/${round}/qualifying`);
  return data?.MRData?.RaceTable?.Races?.[0] || null;
}

// ── Fallback data (when Ergast is down) ───────────────────────────────────────
const FALLBACK_SCHEDULE = [
  { round: '1',  raceName: 'Bahrain Grand Prix',    Circuit: { circuitName: 'Bahrain International Circuit' }, date: '2024-03-02' },
  { round: '2',  raceName: 'Saudi Arabian Grand Prix', Circuit: { circuitName: 'Jeddah Corniche Circuit' },     date: '2024-03-09' },
  { round: '3',  raceName: 'Australian Grand Prix', Circuit: { circuitName: 'Albert Park Circuit' },            date: '2024-03-24' },
  { round: '4',  raceName: 'Japanese Grand Prix',   Circuit: { circuitName: 'Suzuka International Racing Course' }, date: '2024-04-07' },
  { round: '5',  raceName: 'Chinese Grand Prix',    Circuit: { circuitName: 'Shanghai International Circuit' }, date: '2024-04-21' },
  { round: '6',  raceName: 'Miami Grand Prix',      Circuit: { circuitName: 'Miami International Autodrome' }, date: '2024-05-05' },
  { round: '7',  raceName: 'Emilia Romagna Grand Prix', Circuit: { circuitName: 'Autodromo Enzo e Dino Ferrari' }, date: '2024-05-19' },
  { round: '8',  raceName: 'Monaco Grand Prix',     Circuit: { circuitName: 'Circuit de Monaco' },              date: '2024-05-26' },
  { round: '9',  raceName: 'Canadian Grand Prix',   Circuit: { circuitName: 'Circuit Gilles Villeneuve' },      date: '2024-06-09' },
  { round: '10', raceName: 'Spanish Grand Prix',    Circuit: { circuitName: 'Circuit de Barcelona-Catalunya' }, date: '2024-06-23' },
  { round: '11', raceName: 'Austrian Grand Prix',   Circuit: { circuitName: 'Red Bull Ring' },                  date: '2024-06-30' },
  { round: '12', raceName: 'British Grand Prix',    Circuit: { circuitName: 'Silverstone Circuit' },            date: '2024-07-07' },
  { round: '13', raceName: 'Hungarian Grand Prix',  Circuit: { circuitName: 'Hungaroring' },                    date: '2024-07-21' },
  { round: '14', raceName: 'Belgian Grand Prix',    Circuit: { circuitName: 'Circuit de Spa-Francorchamps' },   date: '2024-07-28' },
  { round: '15', raceName: 'Dutch Grand Prix',      Circuit: { circuitName: 'Circuit Zandvoort' },              date: '2024-08-25' },
  { round: '16', raceName: 'Italian Grand Prix',    Circuit: { circuitName: 'Autodromo Nazionale Monza' },      date: '2024-09-01' },
  { round: '17', raceName: 'Azerbaijan Grand Prix', Circuit: { circuitName: 'Baku City Circuit' },              date: '2024-09-15' },
  { round: '18', raceName: 'Singapore Grand Prix',  Circuit: { circuitName: 'Marina Bay Street Circuit' },      date: '2024-09-22' },
  { round: '19', raceName: 'United States Grand Prix', Circuit: { circuitName: 'Circuit of the Americas' },     date: '2024-10-20' },
  { round: '20', raceName: 'Mexico City Grand Prix', Circuit: { circuitName: 'Autodromo Hermanos Rodriguez' },  date: '2024-10-27' },
  { round: '21', raceName: 'São Paulo Grand Prix',  Circuit: { circuitName: 'Autodromo Jose Carlos Pace' },     date: '2024-11-03' },
  { round: '22', raceName: 'Las Vegas Grand Prix',  Circuit: { circuitName: 'Las Vegas Strip Circuit' },        date: '2024-11-23' },
  { round: '23', raceName: 'Qatar Grand Prix',      Circuit: { circuitName: 'Lusail International Circuit' },   date: '2024-12-01' },
  { round: '24', raceName: 'Abu Dhabi Grand Prix',  Circuit: { circuitName: 'Yas Marina Circuit' },             date: '2024-12-08' },
];

module.exports = {
  getCurrentSchedule,
  getDriverStandings,
  getConstructorStandings,
  getLastRaceResults,
  getQualifying,
  FALLBACK_SCHEDULE,
};
