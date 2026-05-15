import { motion } from 'framer-motion';

const RACE_INFO = {
  name:     'MONACO GRAND PRIX',
  circuit:  'Circuit de Monaco',
  round:    'Round 8 of 24',
  date:     '26 May 2024',
  country:  '🇲🇨',
};

const LIVE_STATS = [
  { label: 'Leader',   value: 'VER', accent: '#3671c6' },
  { label: 'Lap',      value: '47 / 78', accent: '#00e5ff' },
  { label: 'Gap P1-P2',value: '+0.373s', accent: '#ffe600' },
  { label: 'Fastest',  value: '1:31.245', accent: '#bf00ff' },
];

export default function HeroBanner() {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: '200px' }}>
      {/* Background race image */}
      <img
        src="/hero_banner.png"
        alt="Monaco Grand Prix"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: 'brightness(0.75) saturate(1.2)' }}
      />

      {/* Gradient overlay — left to right fade */}
      <div className="glass-hero absolute inset-0" />

      {/* Bottom dark fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-16"
        style={{ background: 'linear-gradient(to bottom, transparent, #050608)' }}
      />

      {/* Top dark fade */}
      <div
        className="absolute top-0 left-0 right-0 h-8"
        style={{ background: 'linear-gradient(to top, transparent, rgba(5,6,8,0.6))' }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between px-8 py-5">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{RACE_INFO.country}</span>
              <span className="panel-header text-neon-cyan tracking-widest">{RACE_INFO.round}</span>
              <span className="text-carbon-500 text-xs">•</span>
              <span className="panel-header">{RACE_INFO.date}</span>
            </div>
            <motion.h1
              className="font-display font-800 text-white leading-none"
              style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', letterSpacing: '0.08em', textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {RACE_INFO.name}
            </motion.h1>
            <div className="font-mono text-slate-400 text-xs mt-1">{RACE_INFO.circuit}</div>
          </div>

          {/* Live badge */}
          <motion.div
            className="flex items-center gap-2 bg-neon-red/15 border border-neon-red/40 px-4 py-2 rounded-sm"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-red" />
            <span className="font-display font-700 text-neon-red text-sm tracking-widest">RACE LIVE</span>
          </motion.div>
        </div>

        {/* Bottom stats strip */}
        <div className="flex items-center gap-6">
          {LIVE_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <span className="panel-header">{s.label}</span>
              <span
                className="font-display font-700 text-base tracking-wider"
                style={{ color: s.accent, textShadow: `0 0 12px ${s.accent}66` }}
              >
                {s.value}
              </span>
            </motion.div>
          ))}

          {/* Divider */}
          <div className="flex-1 h-px bg-white/10 hidden md:block" />

          {/* Circuit type tags */}
          <div className="hidden lg:flex items-center gap-2">
            {['STREET CIRCUIT', '78 LAPS', '3.337 KM'].map(tag => (
              <span key={tag} className="text-[10px] font-mono text-slate-500 border border-white/10 px-2 py-0.5 rounded-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
