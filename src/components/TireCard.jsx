import { motion } from 'framer-motion';
import { compoundMeta } from '../data/tires';

function DegBar({ value }) {
  const color = value > 60 ? '#ff1e1e' : value > 35 ? '#ffe600' : '#00e676';
  return (
    <div className="relative w-full h-2 bg-carbon-700 rounded-full overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
    </div>
  );
}

export default function TireCard({ tire, index }) {
  const meta   = compoundMeta[tire.compound] || compoundMeta.M;
  const urgent = tire.pitWindow === 'NOW';

  return (
    <motion.div
      className={`glass rounded-xl p-4 flex flex-col gap-3 card-hover border
        ${urgent ? 'border-neon-red/50 glow-red' : 'border-transparent'}`}
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
    >
      {/* Header — driver + compound */}
      <div className="flex items-center justify-between">
        <span className="font-display font-800 text-lg text-white tracking-wider">{tire.driver}</span>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-base font-display font-800 border-2"
          style={{ borderColor: meta.color, color: meta.color, background: meta.bg, boxShadow: `0 0 12px ${meta.color}40` }}
        >
          {tire.compound}
        </div>
      </div>

      {/* Compound name + age */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs" style={{ color: meta.color }}>{meta.label}</span>
        <span className="text-xs font-mono text-slate-400">{tire.age} laps old</span>
      </div>

      {/* Degradation */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="panel-header">Degradation</span>
          <span className={`text-xs font-mono font-600
            ${tire.degradation > 60 ? 'text-neon-red' : tire.degradation > 35 ? 'text-neon-yellow' : 'text-neon-green'}`}>
            {tire.degradation}%
          </span>
        </div>
        <DegBar value={tire.degradation} />
      </div>

      {/* Pit window */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="panel-header">Pit Window</span>
        <span className={`text-xs font-mono font-600 px-2 py-1 rounded-md
          ${urgent
            ? 'bg-neon-red/20 text-neon-red animate-pulse border border-neon-red/30'
            : 'bg-carbon-700 text-slate-300'
          }`}>
          {urgent ? '⚠ PIT NOW' : `+${tire.pitWindow} laps`}
        </span>
      </div>

      {/* Temperatures */}
      <div className="grid grid-cols-3 gap-2">
        {[['INNER', tire.temp.inner], ['SURFACE', tire.temp.surface], ['OUTER', tire.temp.outer]].map(([lbl, val]) => (
          <div key={lbl} className="text-center bg-carbon-800/70 rounded-lg py-2">
            <div className="text-[9px] font-mono text-slate-500 mb-1">{lbl}</div>
            <div className="text-sm font-mono text-orange-300 font-600">{val}°C</div>
          </div>
        ))}
      </div>

      {/* Pressure */}
      <div className="flex justify-between items-center text-xs font-mono pt-1 border-t border-white/5">
        <span className="text-slate-500">Pressure</span>
        <span className="text-neon-cyan">{tire.pressure} psi</span>
      </div>
    </motion.div>
  );
}
