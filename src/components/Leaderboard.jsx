import { motion, AnimatePresence } from 'framer-motion';
import DriverCard from './DriverCard';

export default function Leaderboard({ drivers, selectedDriver, onSelect }) {
  return (
    <aside className="glass rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 ticker-border">
        <div className="flex items-center justify-between">
          <span className="panel-header text-neon-cyan">Timing Tower</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-[10px] font-mono text-neon-green">LIVE</span>
          </div>
        </div>
        {/* Column labels */}
        <div className="flex items-center gap-3 mt-2 px-1 text-[9px] font-mono text-carbon-500 uppercase tracking-wider">
          <span className="w-6 text-center">P</span>
          <span className="w-9" />
          <span className="w-0.5" />
          <span className="flex-1 pl-1">Driver</span>
          <span>Time</span>
          <span className="w-6 text-center">Tyr</span>
        </div>
      </div>

      {/* Driver list — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        <AnimatePresence>
          {drivers.map((driver, i) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              index={i}
              isSelected={selectedDriver?.id === driver.id}
              onClick={onSelect}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Race status footer */}
      <div className="px-4 py-3 border-t border-white/5 rounded-b-xl">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span className="text-neon-green">SC: NONE</span>
          <span>VSC: NONE</span>
          <span className="text-neon-green">🟢 GREEN FLAG</span>
        </div>
      </div>
    </aside>
  );
}
