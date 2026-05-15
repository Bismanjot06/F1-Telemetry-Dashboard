import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRace } from '../context/RaceContext';

const SESSION_TYPES = [
  { key:'Practice 1', label:'FP1',  icon:'🟦' },
  { key:'Practice 2', label:'FP2',  icon:'🟦' },
  { key:'Practice 3', label:'FP3',  icon:'🟦' },
  { key:'Qualifying', label:'QUALI',icon:'🟨' },
  { key:'Sprint',     label:'SPR',  icon:'🟧' },
  { key:'Race',       label:'RACE', icon:'🟥' },
];

const PLAYBACK_SPEEDS = [1, 2, 5];

// Simulated season rounds for selector
const ROUNDS = [
  { round:1,  name:'Bahrain',     date:'2024-03-02' },
  { round:2,  name:'Saudi Arabia',date:'2024-03-09' },
  { round:3,  name:'Australia',   date:'2024-03-24' },
  { round:4,  name:'Japan',       date:'2024-04-07' },
  { round:5,  name:'China',       date:'2024-04-21' },
  { round:6,  name:'Miami',       date:'2024-05-05' },
  { round:8,  name:'Monaco',      date:'2024-05-26' },
  { round:9,  name:'Canada',      date:'2024-06-09' },
  { round:12, name:'Britain',     date:'2024-07-07' },
  { round:14, name:'Belgium',     date:'2024-07-28' },
  { round:16, name:'Italy',       date:'2024-09-01' },
  { round:22, name:'Las Vegas',   date:'2024-11-23' },
  { round:24, name:'Abu Dhabi',   date:'2024-12-08' },
];

export default function SessionControl() {
  const { sessionType, setSessionType, isLive, isMock, currentLap, totalLaps, replayLap, setReplayLap, status } = useRace();

  const [isReplay,       setIsReplay]       = useState(false);
  const [scrubLap,       setScrubLap]       = useState(1);
  const [playing,        setPlaying]        = useState(false);
  const [playbackSpeed,  setPlaybackSpeed]  = useState(1);
  const [selectedRound,  setSelectedRound]  = useState(8); // Monaco

  // Auto-advance scrubber in replay mode
  useEffect(() => {
    if (!playing || !isReplay) return;
    const interval = setInterval(() => {
      setScrubLap(l => {
        if (l >= totalLaps) { setPlaying(false); return l; }
        return l + 1;
      });
    }, 1000 / playbackSpeed);
    return () => clearInterval(interval);
  }, [playing, isReplay, playbackSpeed, totalLaps]);

  // Sync scrubLap into context when in replay
  useEffect(() => {
    setReplayLap(isReplay ? scrubLap : null);
  }, [isReplay, scrubLap, setReplayLap]);

  const connectionColors = {
    live:       'text-neon-green bg-neon-green/10 border-neon-green/30',
    polling:    'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30',
    connecting: 'text-slate-400 bg-white/5 border-white/10',
    error:      'text-neon-red bg-neon-red/10 border-neon-red/30',
  };

  return (
    <motion.div
      className="glass ticker-border"
      initial={{ opacity:0, y:-8 }}
      animate={{ opacity:1, y:0 }}
      transition={{ duration:0.3 }}
    >
      <div className="flex items-center gap-3 px-4 py-2 flex-wrap">

        {/* Session type tabs */}
        <div className="flex items-center gap-1">
          {SESSION_TYPES.map(s => (
            <button
              key={s.key}
              onClick={() => setSessionType(s.key)}
              className={`px-2.5 py-1 text-[9px] font-display font-700 tracking-widest rounded transition-all border
                ${sessionType === s.key
                  ? 'bg-neon-cyan/15 text-neon-cyan border-neon-cyan/30'
                  : 'text-slate-600 hover:text-slate-300 border-transparent hover:border-white/10'
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="w-px h-4 bg-white/10" />

        {/* Round selector */}
        <select
          value={selectedRound}
          onChange={e => setSelectedRound(Number(e.target.value))}
          className="text-[9px] font-mono bg-white/5 border border-white/10 text-slate-300 rounded px-2 py-1 cursor-pointer"
        >
          {ROUNDS.map(r => (
            <option key={r.round} value={r.round}>R{r.round} {r.name}</option>
          ))}
        </select>

        <div className="w-px h-4 bg-white/10" />

        {/* Live / Replay toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setIsReplay(false); setPlaying(false); }}
            className={`px-2 py-1 text-[9px] font-mono rounded border transition-all
              ${!isReplay?'text-neon-green bg-neon-green/10 border-neon-green/30':'text-slate-600 border-transparent hover:border-white/10'}`}
          >
            🔴 LIVE
          </button>
          <button
            onClick={() => { setIsReplay(true); setScrubLap(1); setPlaying(false); }}
            className={`px-2 py-1 text-[9px] font-mono rounded border transition-all
              ${isReplay?'text-neon-yellow bg-neon-yellow/10 border-neon-yellow/30':'text-slate-600 border-transparent hover:border-white/10'}`}
          >
            ⏪ REPLAY
          </button>
        </div>

        {/* Replay controls */}
        <AnimatePresence>
          {isReplay && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity:0, width:0 }}
              animate={{ opacity:1, width:'auto' }}
              exit={{ opacity:0, width:0 }}
              transition={{ duration:0.2 }}
            >
              <div className="w-px h-4 bg-white/10" />
              {/* Transport buttons */}
              <button onClick={() => { setScrubLap(1); setPlaying(false); }}
                className="text-slate-500 hover:text-white text-xs transition-colors" title="Reset">⏮</button>
              <button onClick={() => setPlaying(p=>!p)}
                className={`text-sm transition-colors ${playing?'text-neon-yellow hover:text-white':'text-neon-green hover:text-white'}`}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={() => setScrubLap(l=>Math.min(totalLaps, l+5))}
                className="text-slate-500 hover:text-white text-xs transition-colors" title="Skip +5 laps">⏭</button>

              {/* Scrub slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-slate-600">L</span>
                <input
                  type="range" min={1} max={totalLaps} value={scrubLap}
                  onChange={e => { setScrubLap(Number(e.target.value)); setPlaying(false); }}
                  className="w-24 h-1 accent-neon-cyan cursor-pointer"
                />
                <span className="text-[9px] font-mono text-white w-8">{scrubLap}/{totalLaps}</span>
              </div>

              {/* Speed */}
              <div className="flex items-center gap-1">
                {PLAYBACK_SPEEDS.map(spd => (
                  <button key={spd} onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 text-[9px] font-mono rounded border transition-all
                      ${playbackSpeed===spd?'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30':'text-slate-600 border-transparent'}`}>
                    {spd}×
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right side — connection status */}
        <div className="ml-auto flex items-center gap-2">
          {isMock && (
            <span className="text-[8px] font-mono text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/25 px-2 py-0.5 rounded">
              MOCK DATA
            </span>
          )}
          <div className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${connectionColors[status] || connectionColors.connecting}`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1 animate-pulse" />
            {status === 'live'    ? 'WS LIVE'    :
             status === 'polling' ? 'POLLING'    :
             status === 'error'   ? 'OFFLINE'    : 'CONNECTING'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
