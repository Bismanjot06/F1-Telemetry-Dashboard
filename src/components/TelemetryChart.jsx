import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { telemetryLaps, lapOptions } from '../data/telemetry';

const DRIVER_COLORS = {
  VER: '#3671c6',
  LEC: '#e8002d',
  NOR: '#ff8000',
  HAM: '#27f4d2',
};

const CHART_TYPES = [
  { key: 'speed',    label: 'SPEED',    unit: 'km/h', color: '#00e5ff', domain: [80, 340] },
  { key: 'rpm',      label: 'RPM',      unit: 'RPM',  color: '#bf00ff', domain: [4000, 14000] },
  { key: 'throttle', label: 'THROTTLE', unit: '%',    color: '#00e676', domain: [0, 100] },
  { key: 'brake',    label: 'BRAKE',    unit: '%',    color: '#ff1e1e', domain: [0, 100] },
];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-bright px-3 py-2 rounded text-xs font-mono border border-neon-cyan/20">
      <div className="text-slate-400 mb-1">t = {label}s</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: p.color }}>{p.dataKey}</span>
          <span className="text-white ml-auto pl-4">{Math.round(p.value)} {unit}</span>
        </div>
      ))}
    </div>
  );
};

export default function TelemetryChart({ selectedDrivers = ['VER', 'LEC', 'NOR'] }) {
  const [activeLap,   setActiveLap]   = useState('lap1');
  const [activeChart, setActiveChart] = useState('speed');

  const chart = CHART_TYPES.find(c => c.key === activeChart);

  // Merge telemetry for all selected drivers into one dataset
  const data = useMemo(() => {
    const base = telemetryLaps[selectedDrivers[0]]?.[activeLap] || [];
    return base.map((point, i) => {
      const entry = { t: point.t };
      selectedDrivers.forEach(drv => {
        const drvPoint = telemetryLaps[drv]?.[activeLap]?.[i];
        if (drvPoint) entry[drv] = parseFloat(drvPoint[activeChart].toFixed(1));
      });
      return entry;
    });
  }, [selectedDrivers, activeLap, activeChart]);

  return (
    <motion.div
      className="glass flex flex-col h-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 ticker-border">
        <div>
          <span className="panel-header">Telemetry Analysis</span>
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
            {selectedDrivers.join(' · ')} — {chart.label} over lap
          </div>
        </div>

        {/* Chart type selector */}
        <div className="flex gap-1">
          {CHART_TYPES.map(c => (
            <button
              key={c.key}
              onClick={() => setActiveChart(c.key)}
              className={`px-2.5 py-1 text-[10px] font-display font-600 tracking-wider rounded-sm transition-all duration-200
                ${activeChart === c.key
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lap selector */}
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-white/5">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Lap:</span>
        {lapOptions.map(l => (
          <button
            key={l.value}
            onClick={() => setActiveLap(l.value)}
            className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all
              ${activeLap === l.value
                ? 'text-white bg-white/10'
                : 'text-slate-500 hover:text-slate-300'
              }`}
          >
            {l.label}
          </button>
        ))}

        {/* Unit badge */}
        <span className="ml-auto font-mono text-[10px] text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-sm">
          {chart.unit}
        </span>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 py-3 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <defs>
              {selectedDrivers.map(drv => (
                <linearGradient key={drv} id={`grad-${drv}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={DRIVER_COLORS[drv]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DRIVER_COLORS[drv]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="t"
              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
              label={{ value: 'Time (s)', position: 'insideBottom', fill: '#475569', fontSize: 9 }}
            />
            <YAxis
              domain={chart.domain}
              tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip unit={chart.unit} />}
              cursor={{ stroke: 'rgba(0,229,255,0.2)', strokeWidth: 1 }}
            />
            <Legend
              wrapperStyle={{ fontSize: '10px', fontFamily: 'JetBrains Mono', paddingTop: '4px' }}
              formatter={(value) => (
                <span style={{ color: DRIVER_COLORS[value] || '#94a3b8' }}>{value}</span>
              )}
            />

            {selectedDrivers.map(drv => (
              <Line
                key={drv}
                type="monotone"
                dataKey={drv}
                stroke={DRIVER_COLORS[drv]}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: DRIVER_COLORS[drv], strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
