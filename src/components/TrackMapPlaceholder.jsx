import { motion } from 'framer-motion';

// Simplified Monaco circuit outline path points
const TRACK_PATH = `
  M 200 40
  C 250 30, 290 45, 300 80
  L 320 130
  C 330 160, 310 180, 280 175
  L 230 170
  C 210 168, 195 180, 190 200
  L 185 240
  C 182 265, 195 280, 220 278
  L 290 275
  C 320 273, 340 255, 335 225
  L 330 200
  C 325 180, 340 165, 360 170
  L 380 175
  C 400 180, 410 200, 400 220
  L 380 280
  C 365 320, 330 340, 290 335
  L 150 330
  C 110 328, 90 305, 95 270
  L 100 200
  C 105 170, 120 155, 150 155
  L 165 155
  C 185 155, 195 140, 190 120
  L 185 80
  C 180 55, 190 42, 200 40
  Z
`;

const DRIVER_DOTS = [
  { drv: 'VER', color: '#3671c6', cx: 300, cy: 100 },
  { drv: 'LEC', color: '#e8002d', cx: 280, cy: 170 },
  { drv: 'NOR', color: '#ff8000', cx: 190, cy: 205 },
  { drv: 'HAM', color: '#27f4d2', cx: 310, cy: 270 },
];

export default function TrackMapPlaceholder({ selectedDriver }) {
  return (
    <div className="glass flex flex-col h-full">
      <div className="px-3 pt-3 pb-2 ticker-border">
        <div className="flex items-center justify-between">
          <span className="panel-header">Track Map</span>
          <span className="text-[10px] font-mono text-slate-500">Circuit de Monaco</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
        <svg
          viewBox="80 20 340 330"
          className="w-full h-full max-h-full"
          style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.15))' }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dotGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Track outline — outer glow */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="rgba(0,229,255,0.12)"
            strokeWidth="18"
            strokeLinejoin="round"
          />
          {/* Track surface */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="#1a1d26"
            strokeWidth="14"
            strokeLinejoin="round"
          />
          {/* Track edge */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="rgba(0,229,255,0.35)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Start/Finish line */}
          <line x1="192" y1="48" x2="208" y2="32" stroke="#ffe600" strokeWidth="2" opacity="0.8" />
          <text x="212" y="32" fill="#ffe600" fontSize="8" fontFamily="JetBrains Mono" opacity="0.7">S/F</text>

          {/* Driver dots */}
          {DRIVER_DOTS.map((d) => (
            <g key={d.drv} filter="url(#dotGlow)">
              {/* Pulse ring for selected */}
              {selectedDriver?.abbreviation === d.drv && (
                <motion.circle
                  cx={d.cx} cy={d.cy} r={8}
                  fill="none"
                  stroke={d.color}
                  strokeWidth="1.5"
                  animate={{ r: [6, 12], opacity: [0.8, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              )}
              <circle
                cx={d.cx}
                cy={d.cy}
                r={5}
                fill={d.color}
                opacity={0.9}
              />
              <text
                x={d.cx + 7}
                y={d.cy + 3}
                fill={d.color}
                fontSize="7"
                fontFamily="Barlow Condensed"
                fontWeight="700"
                opacity="0.9"
              >
                {d.drv}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="px-3 py-1.5 border-t border-white/5">
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>TRACK: DRY</span>
          <span>GRIP: HIGH</span>
          <span>DELTA: +0.3s</span>
        </div>
      </div>
    </div>
  );
}
