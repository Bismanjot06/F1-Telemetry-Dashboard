import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRace } from '../context/RaceContext';

const CATEGORY_CONFIG = {
  Flag:       { icon:'🚩', color:'text-neon-green',  bg:'bg-neon-green/10',   border:'border-neon-green/20'  },
  SafetyCar:  { icon:'🟠', color:'text-orange-400',  bg:'bg-orange-400/10',   border:'border-orange-400/25'  },
  Drs:        { icon:'📡', color:'text-neon-cyan',   bg:'bg-neon-cyan/10',    border:'border-neon-cyan/20'   },
  PitLane:    { icon:'🔧', color:'text-neon-cyan',   bg:'bg-neon-cyan/8',     border:'border-neon-cyan/15'   },
  Incident:   { icon:'⚠️', color:'text-neon-yellow', bg:'bg-neon-yellow/10',  border:'border-neon-yellow/20' },
  Penalty:    { icon:'⚖️', color:'text-amber-400',   bg:'bg-amber-400/10',    border:'border-amber-400/20'   },
  Weather:    { icon:'🌧️', color:'text-blue-400',    bg:'bg-blue-400/10',     border:'border-blue-400/20'    },
  TrackState: { icon:'🏁', color:'text-slate-300',   bg:'bg-white/5',         border:'border-white/10'       },
  Other:      { icon:'📋', color:'text-slate-400',   bg:'bg-white/4',         border:'border-white/8'        },
};

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-GB', { hour12:false, hour:'2-digit', minute:'2-digit', second:'2-digit' });
  } catch { return '--:--:--'; }
}

function categorize(msg) {
  const cat = msg.category || 'Other';
  return CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.Other;
}

function FeedEntry({ msg, index }) {
  const cfg = categorize(msg);
  const isAlert = msg.category==='Flag' || msg.category==='SafetyCar' || msg.category==='Incident';

  return (
    <motion.div
      layout
      initial={{ opacity:0, x:-12, height:0 }}
      animate={{ opacity:1, x:0, height:'auto' }}
      exit={{ opacity:0, x:12 }}
      transition={{ duration:0.25 }}
      className={`rounded px-2.5 py-1.5 border text-[10px] font-mono ${cfg.bg} ${cfg.border} ${isAlert?'shadow-lg':''}`}
    >
      <div className="flex items-start gap-2">
        <span className="shrink-0 text-xs leading-tight mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className={`text-[9px] font-mono font-600 uppercase tracking-wider ${cfg.color}`}>
              {msg.category || 'MSG'}
            </span>
            <span className="text-[9px] text-slate-600 shrink-0">{formatTime(msg.date)}</span>
          </div>
          <p className={`text-[10px] leading-snug ${cfg.color} break-words`}>{msg.message}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Extra mock RC messages that animate in over time
const MOCK_ADDITIONS = [
  { category:'Incident',   message:'INCIDENT: CAR 63 (RUS) REPORTED — TRACK LIMITS TURN 11',      flag:null },
  { category:'Penalty',    message:'5 SECOND TIME PENALTY — CAR 63 (RUS) — CAUSING COLLISION',    flag:null },
  { category:'PitLane',    message:'CAR 14 (ALO): PIT STOP — 2.1s — HARD COMPOUND FITTED',        flag:null },
  { category:'Flag',       message:'YELLOW FLAG — TURN 6-7 SECTOR 1 — DEBRIS ON CIRCUIT',         flag:'YELLOW' },
  { category:'TrackState', message:'TRACK CONFIRMED CLEAR — TURN 6-7',                             flag:null },
  { category:'Drs',        message:'DRS ENABLED — ALL ZONES ACTIVE',                               flag:null },
  { category:'Weather',    message:'WEATHER UPDATE: LIGHT DRIZZLE DETECTED — INTERMEDIATE TYRES POSSIBLE',flag:null },
  { category:'SafetyCar',  message:'SAFETY CAR DEPLOYED — INCIDENT TURN 15-16',                   flag:'SC' },
  { category:'Flag',       message:'GREEN FLAG — SAFETY CAR RETURNING TO PITS',                   flag:'GREEN' },
  { category:'PitLane',    message:'CAR 4 (NOR): FAST PIT STOP — 2.0s — SOFT COMPOUND',           flag:null },
];

export default function RaceControlFeed() {
  const { raceControl } = useRace();
  const [messages, setMessages]   = useState([]);
  const [filters, setFilters]     = useState(new Set());
  const [paused, setPaused]       = useState(false);
  const feedRef = useRef(null);
  const tickRef = useRef(0);

  // Seed from live race control, then add mock messages over time
  useEffect(()=>{
    if (raceControl?.length) {
      const seeded = [...raceControl].reverse().map((m,i)=>({...m,id:`live-${i}`}));
      setMessages(seeded);
    }
  },[raceControl]);

  // Add periodic mock messages to simulate live feed
  useEffect(()=>{
    const interval = setInterval(()=>{
      if (paused) return;
      const m = MOCK_ADDITIONS[tickRef.current % MOCK_ADDITIONS.length];
      tickRef.current++;
      const entry = { ...m, date: new Date().toISOString(), id:`mock-${Date.now()}` };
      setMessages(prev=>[entry,...prev].slice(0,60));
    }, 8000);
    return ()=>clearInterval(interval);
  },[paused]);

  const FILTER_OPTS = ['Flag','SafetyCar','Incident','Penalty','PitLane','Weather'];

  const toggleFilter = cat => setFilters(prev => {
    const next = new Set(prev);
    next.has(cat) ? next.delete(cat) : next.add(cat);
    return next;
  });

  const visible = messages.filter(m => filters.size===0 || filters.has(m.category));

  return (
    <div className="glass flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between">
          <span className="panel-header">Race Control</span>
          <div className="flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-neon-red"
              animate={{opacity:[1,0.3,1]}}
              transition={{duration:1.2,repeat:Infinity}}
            />
            <span className="text-[9px] font-mono text-neon-red">FIA LIVE</span>
            <button
              onClick={()=>setPaused(p=>!p)}
              className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ml-1
                ${paused?'border-neon-yellow/40 text-neon-yellow bg-neon-yellow/10':'border-white/10 text-slate-600 hover:text-slate-400'}`}
            >
              {paused?'▶ RESUME':'⏸ PAUSE'}
            </button>
          </div>
        </div>
        {/* Filter chips */}
        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
          <span className="text-[8px] font-mono text-slate-700">FILTER:</span>
          {FILTER_OPTS.map(cat=>{
            const cfg = CATEGORY_CONFIG[cat];
            const active = filters.has(cat);
            return (
              <button key={cat} onClick={()=>toggleFilter(cat)}
                className={`text-[8px] font-mono px-1.5 py-0.5 rounded border transition-all
                  ${active?`${cfg.bg} ${cfg.color} ${cfg.border}`:'border-white/8 text-slate-700 hover:text-slate-500'}`}>
                {cfg.icon} {cat}
              </button>
            );
          })}
          {filters.size>0&&(
            <button onClick={()=>setFilters(new Set())} className="text-[8px] font-mono text-slate-600 hover:text-slate-400 px-1">
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {visible.length===0 ? (
            <div className="text-center text-slate-700 text-[10px] font-mono py-8">No messages</div>
          ) : visible.map((m,i)=>(
            <FeedEntry key={m.id||i} msg={m} index={i}/>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-3 py-1.5 border-t border-white/5 shrink-0">
        <div className="text-[9px] font-mono text-slate-700">{visible.length} messages · newest first</div>
      </div>
    </div>
  );
}
