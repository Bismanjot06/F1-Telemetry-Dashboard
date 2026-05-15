import { motion } from 'framer-motion';
import { sectorData, classifySector } from '../data/sectors';

const LABEL_MAP = { session: 'SESSION BEST', best: 'PERSONAL BEST', avg: 'CURRENT' };
const CLASS_STYLE = {
  session: 'sector-session text-purple-300',
  best:    'sector-best text-neon-green',
  avg:     'sector-avg text-neon-yellow',
};

function SectorRow({ label, times, index }) {
  const { current, personal, session } = times;
  const cls = classifySector(current, personal, session);

  return (
    <motion.div
      className={`rounded px-3 py-2 flex items-center justify-between gap-3 ${CLASS_STYLE[cls]}`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display font-700 text-xs tracking-widest text-slate-300 w-4">{label}</span>
        <span className="text-[8px] font-mono opacity-60 hidden sm:block">{LABEL_MAP[cls]}</span>
      </div>
      <div className="flex items-center gap-3 font-mono text-xs">
        <div className="text-right">
          <div className="text-[9px] text-slate-500">CURR</div>
          <div>{current}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-slate-500">PB</div>
          <div className="text-slate-400">{personal}</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-slate-500">SB</div>
          <div className="text-purple-400">{session}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function SectorComparison({ driverAbbr = 'VER' }) {
  const sectors = sectorData[driverAbbr] || sectorData.VER;

  return (
    <div className="glass flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 ticker-border">
        <div className="flex items-center justify-between">
          <span className="panel-header">Sector Times</span>
          <span className="font-display font-700 text-xs text-neon-cyan tracking-wider">{driverAbbr}</span>
        </div>
        {/* Legend */}
        <div className="flex gap-3 mt-1.5">
          {[
            { label: 'Session', color: 'bg-purple-500' },
            { label: 'Personal', color: 'bg-neon-green' },
            { label: 'Current', color: 'bg-neon-yellow' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[9px] font-mono text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-2 py-2 space-y-1.5 overflow-auto">
        <SectorRow label="S1" times={sectors.s1} index={0} />
        <SectorRow label="S2" times={sectors.s2} index={1} />
        <SectorRow label="S3" times={sectors.s3} index={2} />
      </div>

      {/* Theoretical best */}
      <div className="px-3 py-2 border-t border-white/5">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Theoretical Best</span>
          <span className="font-mono text-xs text-purple-300">
            {(
              parseFloat(sectors.s1.session) +
              parseFloat(sectors.s2.session) +
              parseFloat(sectors.s3.session)
            ).toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
