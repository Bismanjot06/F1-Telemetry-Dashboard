import { motion } from 'framer-motion';
import { tireColors } from '../data/drivers';

// Map driver abbreviation to helmet image
const HELMET_IMAGES = {
  VER: '/helmet_ver.png',
  LEC: '/helmet_lec.png',
  NOR: '/helmet_nor.png',
  HAM: '/helmet_ham.png',
};

export default function DriverCard({ driver, index, isSelected, onClick }) {
  const tire   = tireColors[driver.tire] || tireColors.M;
  const isLeader = driver.position === 1;
  const helmetSrc = HELMET_IMAGES[driver.abbreviation];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => onClick(driver)}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer
        card-hover border
        ${isSelected
          ? 'bg-neon-cyan/10 border-neon-cyan/30 glow-cyan'
          : 'hover:bg-carbon-700/50 border-transparent'
        }`}
    >
      {/* Position number */}
      <div className={`w-6 text-center font-display font-800 text-base shrink-0
        ${isLeader ? 'text-neon-yellow' : driver.position <= 3 ? 'text-slate-300' : 'text-slate-500'}`}>
        {driver.position}
      </div>

      {/* Helmet avatar OR team-colored circle fallback */}
      <div
        className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border-2"
        style={{ borderColor: driver.teamColor + '80' }}
      >
        {helmetSrc ? (
          <img
            src={helmetSrc}
            alt={driver.abbreviation}
            className="w-full h-full object-cover scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-display font-800 text-sm"
            style={{ background: driver.teamColor + '30', color: driver.teamColor }}
          >
            {driver.abbreviation[0]}
          </div>
        )}
      </div>

      {/* Team color bar */}
      <div
        className="w-0.5 h-8 rounded-full shrink-0"
        style={{ backgroundColor: driver.teamColor }}
      />

      {/* Driver info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-700 text-sm tracking-wider text-white uppercase">
            {driver.abbreviation}
          </span>
          {driver.drs && (
            <span className="text-[9px] font-mono bg-neon-green/20 text-neon-green px-1.5 py-0.5 rounded-sm leading-tight tracking-wider">
              DRS
            </span>
          )}
        </div>
        <div className="font-mono text-[10px] text-slate-500 truncate leading-tight mt-0.5">
          {driver.team}
        </div>
      </div>

      {/* Lap time + gap */}
      <div className="text-right shrink-0">
        <div className="font-mono text-xs text-white leading-tight">{driver.lapTime}</div>
        <div className={`font-mono text-[10px] leading-tight mt-0.5
          ${isLeader ? 'text-neon-yellow' : 'text-slate-500'}`}>
          {driver.gap}
        </div>
      </div>

      {/* Tire compound badge */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-display font-800 shrink-0 border-2"
        style={{ backgroundColor: tire.bg, borderColor: tire.color, color: tire.color }}
      >
        {driver.tire}
      </div>
    </motion.div>
  );
}
