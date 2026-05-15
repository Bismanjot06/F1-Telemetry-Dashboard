/**
 * Professional F1 TV–style Timing Tower
 * Broadcast-grade leaderboard with animated reordering,
 * fastest lap glow, DRS indicators, pit badges, mini-sectors.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useRace } from '../context/RaceContext';

const COMPOUND_COLORS = {
  SOFT:    { color: '#ff1e1e', bg: 'rgba(255,30,30,0.18)',  label: 'S' },
  MEDIUM:  { color: '#ffe600', bg: 'rgba(255,230,0,0.18)', label: 'M' },
  HARD:    { color: '#e2e8f0', bg: 'rgba(226,232,240,0.14)',label: 'H' },
  INTER:   { color: '#00e5ff', bg: 'rgba(0,229,255,0.18)', label: 'I' },
  WET:     { color: '#3d7fff', bg: 'rgba(61,127,255,0.18)',label: 'W' },
  UNKNOWN: { color: '#64748b', bg: 'rgba(100,116,139,0.14)',label: '?' },
};

function formatLap(seconds) {
  if (!seconds) return '--:--.---';
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, '0');
  return `${m}:${s}`;
}

function formatGap(val) {
  if (val === null || val === undefined) return 'LEADER';
  if (val === 0) return 'LEADER';
  return `+${Number(val).toFixed(3)}`;
}

function formatInterval(val) {
  if (val === null || val === undefined || val === 0) return '—';
  return `+${Number(val).toFixed(3)}`;
}

function MiniSector({ time, best, session }) {
  if (!time) return <div className="w-3.5 h-1.5 rounded-sm bg-white/10" />;
  const color =
    time <= session ? 'bg-neon-purple' :
    time <= best    ? 'bg-neon-green'  : 'bg-neon-yellow';
  return <div className={`w-3.5 h-1.5 rounded-sm ${color}`} />;
}

function TimingRow({ driver, rank, isFastest, sessionBests }) {
  const { selectedDriver, setSelectedDriver, fastestLap } = useRace();
  const isSelected = selectedDriver?.driverNumber === driver.driverNumber;
  const compound   = COMPOUND_COLORS[driver.compound] || COMPOUND_COLORS.UNKNOWN;
  const isLeader   = rank === 0;
  const isPit      = driver.isPitOut;
  const hasFastest = fastestLap?.driverNumber === driver.driverNumber;

  const posColor =
    isLeader       ? 'text-neon-yellow'  :
    rank < 3       ? 'text-white'        : 'text-slate-500';

  return (
    <motion.div
      layout
      layoutId={`driver-${driver.driverNumber}`}
      key={driver.driverNumber}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ layout: { type: 'spring', stiffness: 400, damping: 40 }, duration: 0.25 }}
      onClick={() => setSelectedDriver(driver)}
      className={`
        relative flex items-center gap-2 px-2 py-2 rounded cursor-pointer
        transition-colors duration-200 border border-transparent group
        ${isSelected  ? 'bg-white/8 border-white/15'             : 'hover:bg-white/5'}
        ${hasFastest  ? 'bg-purple-500/10 border-purple-500/20'  : ''}
      `}
      style={isSelected ? { borderColor: driver.teamColor + '55' } : {}}
    >
      {/* Fastest lap left glow bar */}
      {hasFastest && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l"
          style={{ background: '#bf00ff' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Team color bar */}
      <div
        className="w-0.5 h-7 rounded-full shrink-0"
        style={{ backgroundColor: driver.teamColor }}
      />

      {/* Position */}
      <div className={`w-5 text-center font-display font-800 text-sm shrink-0 ${posColor}`}>
        {driver.position || rank + 1}
      </div>

      {/* Driver abbreviation */}
      <div className="w-9 shrink-0">
        <div className="font-display font-800 text-xs tracking-wider text-white leading-none">
          {driver.abbreviation}
        </div>
        <div className="font-mono text-[8px] text-slate-600 leading-none mt-0.5 truncate">
          {driver.teamName?.split(' ')[0]}
        </div>
      </div>

      {/* Tire compound */}
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center font-display font-800 text-[9px] shrink-0 border"
        style={{ backgroundColor: compound.bg, borderColor: compound.color, color: compound.color }}
        title={`${driver.compound} — ${driver.stintLapCount} laps`}
      >
        {compound.label}
      </div>

      {/* Tire age */}
      <div className="w-5 text-center font-mono text-[9px] text-slate-500 shrink-0">
        {driver.stintLapCount || '—'}
      </div>

      {/* Mini sectors */}
      <div className="flex items-center gap-0.5 shrink-0">
        <MiniSector time={driver.sector1} best={sessionBests.s1} session={sessionBests.s1} />
        <MiniSector time={driver.sector2} best={sessionBests.s2} session={sessionBests.s2} />
        <MiniSector time={driver.sector3} best={sessionBests.s3} session={sessionBests.s3} />
      </div>

      {/* Lap time */}
      <div className="flex-1 text-right">
        <div className={`font-mono text-[10px] leading-none ${hasFastest ? 'text-purple-300' : 'text-white'}`}>
          {hasFastest ? '⚡ ' : ''}{formatLap(driver.lapDuration)}
        </div>
        <div className="font-mono text-[9px] text-slate-500 leading-none mt-0.5">
          {isLeader ? 'LEADER' : formatInterval(driver.interval)}
        </div>
      </div>

      {/* Gap to leader */}
      <div className="w-16 text-right shrink-0">
        <div className={`font-mono text-[10px] leading-none ${isLeader ? 'text-neon-yellow' : 'text-slate-400'}`}>
          {formatGap(driver.gap)}
        </div>
      </div>

      {/* DRS + PIT badges */}
      <div className="flex flex-col gap-0.5 shrink-0 w-6 items-center">
        {driver.drs && (
          <motion.span
            className="text-[7px] font-mono bg-neon-green/20 text-neon-green px-1 rounded-sm leading-tight"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            DRS
          </motion.span>
        )}
        {isPit && (
          <motion.span
            className="text-[7px] font-mono bg-orange-500/20 text-orange-400 px-1 rounded-sm leading-tight"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          >
            PIT
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { drivers, fastestLap, flag, safetycar, vsc, currentLap, totalLaps } = useRace();

  // Compute session bests for mini-sector coloring
  const sessionBests = {
    s1: drivers.reduce((min, d) => d.sector1 && d.sector1 < min ? d.sector1 : min, Infinity),
    s2: drivers.reduce((min, d) => d.sector2 && d.sector2 < min ? d.sector2 : min, Infinity),
    s3: drivers.reduce((min, d) => d.sector3 && d.sector3 < min ? d.sector3 : min, Infinity),
  };

  const flagColor =
    flag === 'RED'    ? 'text-neon-red'    :
    flag === 'YELLOW' ? 'text-neon-yellow' :
    flag === 'SC'     ? 'text-orange-400'  : 'text-neon-green';

  const flagIcon =
    flag === 'RED'    ? '🔴' :
    flag === 'YELLOW' ? '🟡' :
    flag === 'SC'     ? '🟠' : '🟢';

  return (
    <aside className="glass rounded-xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between">
          <span className="panel-header text-neon-cyan">Timing Tower</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[9px] font-mono text-neon-green">LIVE</span>
          </div>
        </div>
        {/* Lap counter */}
        <div className="flex items-center gap-3 mt-1">
          <span className="font-mono text-[10px] text-slate-500">
            LAP <span className="text-white font-600">{currentLap}</span>
            <span className="text-slate-600"> / {totalLaps}</span>
          </span>
          <span className={`text-[9px] font-mono ${flagColor}`}>
            {flagIcon} {safetycar ? 'SAFETY CAR' : flag === 'GREEN' ? 'GREEN FLAG' : flag}
          </span>
        </div>
        {/* Column labels */}
        <div className="flex items-center gap-2 mt-1.5 px-1 text-[8px] font-mono text-slate-600 uppercase tracking-wider">
          <div className="w-0.5 shrink-0" />
          <div className="w-5 text-center shrink-0">P</div>
          <div className="w-9 shrink-0">DRV</div>
          <div className="w-5 shrink-0">TYR</div>
          <div className="w-5 shrink-0 text-center">AGE</div>
          <div className="flex gap-0.5 shrink-0">
            <div className="w-3.5">S1</div>
            <div className="w-3.5">S2</div>
            <div className="w-3.5">S3</div>
          </div>
          <div className="flex-1 text-right">TIME</div>
          <div className="w-16 text-right shrink-0">GAP</div>
          <div className="w-6 shrink-0" />
        </div>
      </div>

      {/* Driver rows */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1 space-y-0.5">
        <AnimatePresence mode="popLayout">
          {drivers.map((driver, i) => (
            <TimingRow
              key={driver.driverNumber}
              driver={driver}
              rank={i}
              isFastest={fastestLap?.driverNumber === driver.driverNumber}
              sessionBests={sessionBests}
            />
          ))}
        </AnimatePresence>

        {drivers.length === 0 && (
          <div className="flex items-center justify-center h-32 text-slate-600 text-xs font-mono">
            Awaiting data…
          </div>
        )}
      </div>

      {/* Status footer */}
      <div className="px-3 py-2 border-t border-white/5 shrink-0">
        <div className="flex justify-between text-[9px] font-mono">
          <span className={safetycar ? 'text-orange-400' : 'text-slate-600'}>
            SC: {safetycar ? 'DEPLOYED' : 'NONE'}
          </span>
          <span className={vsc ? 'text-neon-yellow' : 'text-slate-600'}>
            VSC: {vsc ? 'DEPLOYED' : 'NONE'}
          </span>
          {fastestLap && (
            <span className="text-purple-400">
              ⚡ {fastestLap.abbreviation} {formatLap(fastestLap.time)}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
