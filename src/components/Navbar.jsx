import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_NAME = 'MONACO GRAND PRIX';
const SESSION_TYPE = 'RACE';

export default function Navbar({ currentLap, totalLaps }) {
  const [time, setTime] = useState(new Date());
  const [live, setLive] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <header className="relative z-50 glass ticker-border">
      <div className="flex items-center justify-between px-4 py-2">

        {/* LEFT — Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-6 bg-neon-red rounded-full" />
            <div className="w-1 h-6 bg-neon-amber rounded-full opacity-70" />
          </div>
          <span className="font-display font-800 text-xl tracking-widest text-white uppercase">
            PIT<span className="text-neon-cyan">WALL</span>
          </span>
          <span className="hidden sm:block text-xs font-mono text-carbon-500 border border-carbon-600 px-2 py-0.5 rounded">
            v2.0
          </span>
        </div>

        {/* CENTER — Race info */}
        <div className="hidden md:flex flex-col items-center">
          <span className="font-display text-white font-700 text-base tracking-widest">
            {SESSION_NAME}
          </span>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="panel-header text-neon-cyan">{SESSION_TYPE}</span>
            <span className="text-carbon-500 text-xs">•</span>
            <span className="font-mono text-xs text-slate-400">
              LAP <span className="text-white font-600">{currentLap}</span>
              <span className="text-carbon-500"> / {totalLaps}</span>
            </span>
          </div>
        </div>

        {/* RIGHT — Status + clock */}
        <div className="flex items-center gap-4">
          <AnimatePresence>
            {live && (
              <motion.div
                className="flex items-center gap-1.5 bg-neon-red/10 border border-neon-red/30 px-3 py-1 rounded-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="block w-1.5 h-1.5 rounded-full bg-neon-red animate-blink" />
                <span className="font-display text-neon-red text-xs font-700 tracking-widest">LIVE</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="hidden sm:flex items-center gap-1 font-mono text-sm text-slate-300">
            <span className="text-neon-cyan">{hh}</span>
            <span className="text-carbon-500 animate-blink">:</span>
            <span className="text-neon-cyan">{mm}</span>
            <span className="text-carbon-500 animate-blink">:</span>
            <span className="text-neon-cyan">{ss}</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
            <span className="text-xs text-slate-500 hidden lg:block">TELEMETRY</span>
          </div>
        </div>
      </div>
    </header>
  );
}
