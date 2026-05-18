import { motion, AnimatePresence } from 'framer-motion';
import { useRace } from '../context/RaceContext';

const TIRE_COLORS = { SOFT:'#ff1e1e',MEDIUM:'#ffe600',HARD:'#c8cdd4',INTER:'#00e5ff',WET:'#3d7fff',UNKNOWN:'#64748b' };

function formatLap(s) {
  if (!s) return '--:--.---';
  const m = Math.floor(s/60);
  return `${m}:${(s%60).toFixed(3).padStart(6,'0')}`;
}

export default function SelectedDriverBar() {
  const { selectedDriver, fastestLap } = useRace();
  if (!selectedDriver) return null;

  const items = [
    { label:'Position', value:`P${selectedDriver.position||'—'}`,       color:'#ffe600' },
    { label:'Lap Time',  value:formatLap(selectedDriver.lapDuration),    color:'#00e5ff' },
    { label:'Gap',       value:selectedDriver.gap ? `+${Number(selectedDriver.gap).toFixed(3)}` : 'LEADER', color:'#94a3b8' },
    { label:'Interval',  value:selectedDriver.interval ? `+${Number(selectedDriver.interval).toFixed(3)}` : '—', color:'#64748b' },
    { label:'Tire',      value:selectedDriver.compound||'?',             color:TIRE_COLORS[selectedDriver.compound]||'#64748b' },
    { label:'Tire Age',  value:`${selectedDriver.stintLapCount||0} laps`,color:'#94a3b8' },
    { label:'DRS',       value:selectedDriver.drs?'ACTIVE':'CLOSED',     color:selectedDriver.drs?'#00e676':'#475569' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key={selectedDriver.driverNumber}
        className="mt-2 glass rounded-lg px-3 py-2 flex items-center gap-3 overflow-x-auto text-sm"
        initial={{ opacity:0, y:10 }}
        animate={{ opacity:1, y:0 }}
        exit={{ opacity:0, y:10 }}
        transition={{ duration:0.3 }}
        style={{ borderLeft:`3px solid ${selectedDriver.teamColor}` }}
      >
        {/* Driver identity */}
        <div className="shrink-0">
          <div className="font-display font-800 text-lg tracking-wider" style={{color:selectedDriver.teamColor}}>
            {selectedDriver.abbreviation}
          </div>
          <div className="font-mono text-[8px] text-slate-400 leading-tight">{selectedDriver.fullName}</div>
          <div className="font-mono text-[7px] text-slate-600 leading-tight">{selectedDriver.teamName}</div>
        </div>
        <div className="w-px h-8 bg-white/10 shrink-0"/>
        {items.map(item=>(
          <div key={item.label} className="text-center shrink-0">
            <div className="font-mono text-xs font-600" style={{color:item.color}}>{item.value}</div>
            <div className="panel-header mt-0.5 text-[7px]">{item.label}</div>
          </div>
        ))}
        {fastestLap?.driverNumber===selectedDriver.driverNumber && (
          <motion.div
            className="ml-auto shrink-0 px-2 py-1 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-[8px]"
            animate={{ boxShadow:['0 0 0 rgba(191,0,255,0)','0 0 16px rgba(191,0,255,0.4)','0 0 0 rgba(191,0,255,0)'] }}
            transition={{ duration:2, repeat:Infinity }}
          >
            ⚡ FASTEST LAP
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
