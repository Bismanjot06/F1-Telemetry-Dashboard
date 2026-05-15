import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRace } from '../context/RaceContext';

const COMPOUND_META = {
  SOFT:    { color:'#ff1e1e', bg:'rgba(255,30,30,0.2)',   label:'S', textColor:'#ff6b6b' },
  MEDIUM:  { color:'#ffe600', bg:'rgba(255,230,0,0.2)',   label:'M', textColor:'#ffe600' },
  HARD:    { color:'#c8cdd4', bg:'rgba(200,205,212,0.2)', label:'H', textColor:'#c8cdd4' },
  INTER:   { color:'#00e5ff', bg:'rgba(0,229,255,0.2)',   label:'I', textColor:'#00e5ff' },
  WET:     { color:'#3d7fff', bg:'rgba(61,127,255,0.2)',  label:'W', textColor:'#7ab8ff' },
  UNKNOWN: { color:'#64748b', bg:'rgba(100,116,139,0.2)', label:'?', textColor:'#64748b' },
};

function TireCompound({ compound, laps, isCurrent }) {
  const meta = COMPOUND_META[compound] || COMPOUND_META.UNKNOWN;
  const degradePct = Math.min(100, (laps / 40) * 100);
  const degradeColor = degradePct < 40 ? '#00e676' : degradePct < 70 ? '#ffe600' : '#ff1e1e';

  return (
    <div
      className={`relative flex items-center gap-1 px-1.5 py-1 rounded border text-[9px] font-mono ${isCurrent?'border-white/20':'border-white/8 opacity-60'}`}
      style={{ background: meta.bg, borderColor: isCurrent ? meta.color + '50' : undefined }}
      title={`${compound} — ${laps} laps`}
    >
      <div className="w-4 h-4 rounded-full flex items-center justify-center font-display font-800 text-[8px] border shrink-0"
        style={{ borderColor:meta.color, color:meta.color, background:meta.bg }}>
        {meta.label}
      </div>
      <div>
        <div style={{ color:meta.textColor }}>{laps}L</div>
        {isCurrent && (
          <div style={{ color:degradeColor }} className="text-[7px]">
            {Math.round(degradePct)}%
          </div>
        )}
      </div>
    </div>
  );
}

function StrategyBar({ driver, stints, currentLap, totalLaps, showPitWindow }) {
  const barWidth = 100; // %
  return (
    <div className="flex items-center gap-2 py-1">
      {/* Driver label */}
      <div className="w-8 shrink-0">
        <div className="font-display font-800 text-[10px] text-white tracking-wider">{driver.abbreviation}</div>
        <div className="font-mono text-[8px] text-slate-600">{driver.position ? `P${driver.position}` : ''}</div>
      </div>

      {/* Timeline bar */}
      <div className="flex-1 relative" style={{ height: 20 }}>
        <div className="absolute inset-0 bg-white/5 rounded overflow-hidden">
          {stints.map((stint, i) => {
            const start  = ((stint.lap_start - 1) / totalLaps) * 100;
            const end    = ((stint.lap_end || currentLap) / totalLaps) * 100;
            const width  = Math.max(0, end - start);
            const meta   = COMPOUND_META[stint.compound] || COMPOUND_META.UNKNOWN;
            return (
              <div
                key={i}
                title={`${stint.compound} — Lap ${stint.lap_start} to ${stint.lap_end || currentLap}`}
                className="absolute top-0 bottom-0 border-r border-black/30"
                style={{
                  left:       `${start}%`,
                  width:      `${width}%`,
                  background: meta.color,
                  opacity:    stint.lap_end ? 0.55 : 0.85,
                }}
              />
            );
          })}

          {/* Current lap marker */}
          <div
            className="absolute top-0 bottom-0 w-px bg-white/60"
            style={{ left:`${(currentLap / totalLaps) * 100}%` }}
          />

          {/* Pit window (estimate: ±5 laps around optimal) */}
          {showPitWindow && (
            <div
              className="absolute top-0 bottom-0 bg-neon-cyan/10 border-x border-neon-cyan/25"
              style={{ left:`${Math.max(0,(currentLap+5)/totalLaps*100)}%`, width:'10%' }}
            />
          )}
        </div>
      </div>

      {/* Tire indicators */}
      <div className="flex items-center gap-1 shrink-0">
        {stints.slice(-2).map((stint,i) => (
          <TireCompound
            key={i}
            compound={stint.compound}
            laps={stint.lap_end ? (stint.lap_end - stint.lap_start + 1) : (currentLap - stint.lap_start + 1)}
            isCurrent={!stint.lap_end}
          />
        ))}
      </div>
    </div>
  );
}

export default function TireStrategy() {
  const { drivers, stints, currentLap, totalLaps } = useRace();
  const [showPitWindow, setShowPitWindow] = useState(true);

  // Group stints by driver
  const stintsByDriver = useMemo(() => {
    const map = {};
    stints.forEach(s => {
      const key = s.driver_number;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    Object.values(map).forEach(arr => arr.sort((a,b) => a.stint_number - b.stint_number));
    return map;
  }, [stints]);

  const lapPct = Math.round((currentLap / totalLaps) * 100);

  return (
    <motion.div className="glass flex flex-col h-full" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between">
          <span className="panel-header">Tire Strategy</span>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-600">
              LAP {currentLap}/{totalLaps} · {lapPct}%
            </span>
            <button
              onClick={() => setShowPitWindow(p=>!p)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all
                ${showPitWindow?'border-neon-cyan/40 text-neon-cyan bg-neon-cyan/10':'border-white/10 text-slate-600'}`}
            >
              PIT WINDOW
            </button>
          </div>
        </div>
        {/* Compound legend */}
        <div className="flex items-center gap-3 mt-1.5">
          {Object.entries(COMPOUND_META).filter(([k])=>k!=='UNKNOWN').map(([key,meta])=>(
            <div key={key} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full border" style={{background:meta.bg,borderColor:meta.color}}/>
              <span className="text-[8px] font-mono text-slate-600">{key}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1">
            <div className="w-3 h-3 bg-neon-cyan/10 border-x border-neon-cyan/25 shrink-0"/>
            <span className="text-[8px] font-mono text-slate-600">Pit window</span>
          </div>
        </div>
      </div>

      {/* X-axis lap numbers */}
      <div className="px-3 pt-1 shrink-0">
        <div className="ml-10 flex justify-between text-[8px] font-mono text-slate-700">
          {[0, 20, 40, 60, totalLaps].map(l=>(
            <span key={l}>L{l}</span>
          ))}
        </div>
      </div>

      {/* Strategy bars */}
      <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5">
        {drivers.map(driver => {
          const driverStints = stintsByDriver[driver.driverNumber] || [];
          return (
            <StrategyBar
              key={driver.driverNumber}
              driver={driver}
              stints={driverStints}
              currentLap={currentLap}
              totalLaps={totalLaps}
              showPitWindow={showPitWindow}
            />
          );
        })}
        {drivers.length === 0 && (
          <div className="text-center text-slate-700 text-[10px] font-mono py-8">Awaiting strategy data…</div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-4 py-2 border-t border-white/5 shrink-0">
        <div className="flex justify-between text-[9px] font-mono text-slate-700">
          <span>Pit loss: ~21s · Undercut window: 2-3 laps</span>
          <span>Optimal window shown in cyan</span>
        </div>
      </div>
    </motion.div>
  );
}
