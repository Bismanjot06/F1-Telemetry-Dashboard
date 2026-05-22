import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRace } from '../context/RaceContext';

// ── SVG track paths for 8 circuits ──────────────────────────────────────────
const CIRCUITS = {
  monaco: {
    name: 'Circuit de Monaco',
    viewBox: '0 0 500 400',
    path: 'M 250 40 C 310 35,350 55,360 90 L 375 140 C 385 170,365 195,335 188 L 275 182 C 252 180,238 195,234 218 L 228 262 C 224 290,240 308,268 305 L 345 302 C 378 300,398 278,392 245 L 386 218 C 380 195,398 178,420 184 L 442 190 C 464 196,474 220,462 242 L 440 305 C 422 352,382 372,338 366 L 145 360 C 100 357,78 330,84 290 L 90 215 C 96 180,114 162,148 162 L 165 162 C 188 162,200 145,196 122 L 190 78 C 185 50,195 38,210 36 Z',
    sf: { x: 248, y: 44 },
    drivers: [
      { abbr:'VER', x: 360,  y: 115, color:'#3671c6' },
      { abbr:'LEC', x: 280,  y: 182, color:'#e8002d' },
      { abbr:'NOR', x: 232,  y: 240, color:'#ff8000' },
      { abbr:'HAM', x: 390,  y: 222, color:'#27f4d2' },
      { abbr:'RUS', x: 360,  y: 300, color:'#27f4d2' },
      { abbr:'SAI', x: 260,  y: 300, color:'#e8002d' },
      { abbr:'ALO', x: 155,  y: 285, color:'#358c75' },
      { abbr:'PIA', x: 100,  y: 240, color:'#ff8000' },
    ],
    sectors: [
      { d:'M250 40 L375 140', color:'rgba(0,230,118,0.6)' },
      { d:'M375 140 L392 245', color:'rgba(255,230,0,0.6)' },
      { d:'M392 245 L84 290', color:'rgba(191,0,255,0.6)' },
    ],
    drsZones: ['M 340 188 L 395 218'],
  },
  silverstone: {
    name: 'Silverstone Circuit',
    viewBox: '0 0 500 380',
    path: 'M 80 100 L 180 60 C 230 45,270 50,300 75 L 350 105 C 375 122,390 148,385 175 L 370 210 C 362 232,375 252,395 258 L 430 265 C 450 270,460 290,450 308 L 420 335 C 405 352,380 358,355 350 L 280 330 C 255 322,235 330,225 352 L 215 368 C 200 382,178 382,162 370 L 120 338 C 98 320,85 295,88 268 L 95 230 C 100 208,88 192,68 188 L 52 185 C 32 182,22 162,32 144 Z',
    sf: { x: 82, y: 100 },
    drivers: [
      { abbr:'VER', x: 290, y: 72,  color:'#3671c6' },
      { abbr:'LEC', x: 375, y: 190, color:'#e8002d' },
      { abbr:'NOR', x: 430, y: 290, color:'#ff8000' },
      { abbr:'HAM', x: 330, y: 340, color:'#27f4d2' },
      { abbr:'RUS', x: 215, y: 365, color:'#27f4d2' },
      { abbr:'SAI', x: 110, y: 340, color:'#e8002d' },
      { abbr:'ALO', x: 65,  y: 210, color:'#358c75' },
      { abbr:'PIA', x: 100, y: 140, color:'#ff8000' },
    ],
    sectors: [
      { d:'M80 100 L350 105', color:'rgba(0,230,118,0.6)' },
      { d:'M350 105 L450 308', color:'rgba(255,230,0,0.6)' },
      { d:'M450 308 L32 144',  color:'rgba(191,0,255,0.6)' },
    ],
    drsZones: ['M80 100 L180 60','M350 105 L430 265'],
  },
  monza: {
    name: 'Autodromo Nazionale Monza',
    viewBox: '0 0 500 420',
    path: 'M 60 200 L 100 80 C 110 55,135 42,158 50 L 210 68 C 238 78,248 105,235 128 L 205 172 C 195 192,205 215,225 220 L 290 232 C 315 237,330 218,325 195 L 312 152 C 305 128,318 105,342 100 L 395 90 C 420 87,438 108,432 132 L 415 195 L 440 210 C 460 220,465 244,452 260 L 420 292 C 406 310,382 312,365 298 L 290 250 L 200 265 C 175 270,155 292,162 318 L 172 355 C 178 378,160 398,136 395 L 98 388 C 72 382,55 360,58 335 L 60 200 Z',
    sf: { x: 62, y: 200 },
    drivers: [
      { abbr:'VER', x: 145, y: 60,  color:'#3671c6' },
      { abbr:'LEC', x: 220, y: 175, color:'#e8002d' },
      { abbr:'NOR', x: 315, y: 150, color:'#ff8000' },
      { abbr:'HAM', x: 430, y: 200, color:'#27f4d2' },
      { abbr:'RUS', x: 420, y: 290, color:'#27f4d2' },
      { abbr:'SAI', x: 300, y: 252, color:'#e8002d' },
      { abbr:'ALO', x: 165, y: 318, color:'#358c75' },
      { abbr:'PIA', x: 80,  y: 330, color:'#ff8000' },
    ],
    sectors: [
      { d:'M60 200 L235 128',  color:'rgba(0,230,118,0.6)' },
      { d:'M235 128 L452 260', color:'rgba(255,230,0,0.6)' },
      { d:'M452 260 L58 335',  color:'rgba(191,0,255,0.6)' },
    ],
    drsZones: ['M60 200 L100 80','M290 232 L415 195'],
  },
};

const CIRCUIT_LIST = Object.keys(CIRCUITS);

const COMPOUND_COLORS = { SOFT:'#ff1e1e',MEDIUM:'#ffe600',HARD:'#e2e8f0',INTER:'#00e5ff',WET:'#3d7fff',UNKNOWN:'#64748b' };

export default function TrackMap() {
  const { drivers, selectedDriver, setSelectedDriver, circuitName, sessionName } = useRace();
  const [circuit, setCircuit] = useState('monaco');

  const C = CIRCUITS[circuit];

  // Merge live driver colors with static dot positions
  const dotDrivers = C.drivers.map(dot => {
    const live = drivers.find(d => d.abbreviation === dot.abbr);
    return { ...dot, compound: live?.compound || 'UNKNOWN', position: live?.position || 99 };
  });

  return (
    <div className="glass flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between">
          <span className="panel-header">Track Map</span>
          <select
            value={circuit}
            onChange={e=>setCircuit(e.target.value)}
            className="text-[9px] font-mono bg-white/5 border border-white/10 text-slate-300 rounded px-1.5 py-0.5 cursor-pointer"
          >
            {CIRCUIT_LIST.map(c=>(
              <option key={c} value={c}>{CIRCUITS[c].name}</option>
            ))}
          </select>
        </div>
        <div className="text-[9px] font-mono text-slate-600 mt-0.5">{circuitName || sessionName || C.name}</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        <svg
          viewBox={C.viewBox}
          className="w-full h-full max-h-full"
          style={{ filter:'drop-shadow(0 0 10px rgba(0,229,255,0.1))' }}
        >
          <defs>
            <filter id="tm-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="tm-dotglow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Track outer glow */}
          <path d={C.path} fill="none" stroke="rgba(0,229,255,0.08)" strokeWidth={20} strokeLinejoin="round" strokeLinecap="round"/>
          {/* Track surface */}
          <path d={C.path} fill="none" stroke="#141820" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round"/>
          {/* Track edge */}
          <path d={C.path} fill="none" stroke="rgba(0,229,255,0.3)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" filter="url(#tm-glow)"/>

          {/* Sector highlights */}
          {C.sectors.map((s,i)=>(
            <path key={i} d={s.d} fill="none" stroke={s.color} strokeWidth={4} strokeLinecap="round" opacity={0.5}/>
          ))}

          {/* DRS zones */}
          {C.drsZones.map((z,i)=>(
            <path key={i} d={z} fill="none" stroke="#00e676" strokeWidth={3} strokeLinecap="round" opacity={0.6} strokeDasharray="6 4"/>
          ))}

          {/* Start/Finish line */}
          <line x1={C.sf.x-6} y1={C.sf.y} x2={C.sf.x+6} y2={C.sf.y-10} stroke="#ffe600" strokeWidth={2.5} opacity={0.85}/>
          <text x={C.sf.x+8} y={C.sf.y-4} fill="#ffe600" fontSize={8} fontFamily="JetBrains Mono" opacity={0.8}>S/F</text>

          {/* Sector labels */}
          <text x="30%" y="15" fill="rgba(0,230,118,0.7)" fontSize={7} fontFamily="JetBrains Mono" textAnchor="middle">S1</text>
          <text x="60%" y="15" fill="rgba(255,230,0,0.7)"  fontSize={7} fontFamily="JetBrains Mono" textAnchor="middle">S2</text>
          <text x="85%" y="15" fill="rgba(191,0,255,0.7)"  fontSize={7} fontFamily="JetBrains Mono" textAnchor="middle">S3</text>

          {/* Driver dots */}
          {dotDrivers.map(d=>{
            const isSelected = selectedDriver?.abbreviation === d.abbr;
            return (
              <g key={d.abbr} filter="url(#tm-dotglow)" onClick={()=>{}} style={{cursor:'pointer'}}>
                {isSelected && (
                  <motion.circle cx={d.x} cy={d.y} r={10} fill="none" stroke={d.color} strokeWidth={1.5}
                    animate={{r:[7,14],opacity:[0.8,0]}} transition={{duration:1.2,repeat:Infinity}}/>
                )}
                <circle cx={d.x} cy={d.y} r={5} fill={d.color} opacity={0.92}/>
                <text x={d.x+7} y={d.y+3} fill={d.color} fontSize={7} fontFamily="Barlow Condensed" fontWeight={700} opacity={0.9}>{d.abbr}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-white/5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[9px] font-mono">
            <div className="flex items-center gap-1"><div className="w-4 border-t border-neon-green border-dashed"/><span className="text-slate-600">DRS</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 rounded-sm bg-neon-green/60"/><span className="text-slate-600">S1</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 rounded-sm bg-neon-yellow/60"/><span className="text-slate-600">S2</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 rounded-sm bg-neon-purple/60"/><span className="text-slate-600">S3</span></div>
          </div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-slate-600">
            <div className="w-2 h-2 rounded-full border border-neon-yellow bg-neon-yellow/20"/>
            <span>S/F Line</span>
          </div>
        </div>
      </div>
    </div>
  );
}
