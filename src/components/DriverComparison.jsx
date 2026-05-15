import { useState, useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { telemetryLaps, lapOptions } from '../data/telemetry';

const DRIVER_COLORS = { VER:'#3671c6',LEC:'#e8002d',NOR:'#ff8000',HAM:'#27f4d2',RUS:'#27f4d2',SAI:'#e8002d',ALO:'#358c75',PIA:'#ff8000' };
const ALL_DRIVERS = ['VER','LEC','NOR','HAM','RUS','SAI','ALO','PIA'];

const METRICS = [
  { key:'speed',    label:'SPEED',    unit:'km/h' },
  { key:'throttle', label:'THROTTLE', unit:'%'    },
  { key:'brake',    label:'BRAKE',    unit:'%'    },
  { key:'delta',    label:'Δ DELTA',  unit:'s'    },
];

function buildComparisonData(drvA, drvB, lap) {
  const lapA = telemetryLaps[drvA]?.[lap] || [];
  const lapB = telemetryLaps[drvB]?.[lap] || [];
  return lapA.map((ptA, i) => {
    const ptB = lapB[i] || ptA;
    // cumulative time delta: positive = A is ahead (faster), negative = B is ahead
    const timeA = ptA.t > 0 ? ptA.t : 1;
    const timeB = ptB.t > 0 ? ptB.t : 1;
    const delta  = parseFloat(((timeA - timeB) * 0.012).toFixed(3));
    return {
      t:        ptA.t,
      [drvA]:   ptA.speed,
      [drvB]:   ptB.speed,
      tA:       ptA.throttle,
      tB:       ptB.throttle,
      bA:       ptA.brake,
      bB:       ptB.brake,
      delta,
      deltaFill: delta,
    };
  });
}

function StatBadge({ label, valA, valB, unitA='', drvA, drvB }) {
  const diff = valA - valB;
  const winner = diff > 0 ? drvA : diff < 0 ? drvB : null;
  return (
    <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-white/5 border border-white/8">
      <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-mono font-600" style={{color: DRIVER_COLORS[drvA]||'#888'}}>{Math.round(valA)}{unitA}</span>
        <span className="text-[8px] font-mono text-slate-600">vs</span>
        <span className="text-[10px] font-mono font-600" style={{color: DRIVER_COLORS[drvB]||'#888'}}>{Math.round(valB)}{unitA}</span>
      </div>
      {winner && (
        <span className="text-[8px] font-mono" style={{color: DRIVER_COLORS[winner]||'#888'}}>▲ {winner} +{Math.abs(Math.round(diff))}</span>
      )}
    </div>
  );
}

const DeltaTooltip = ({ active, payload, label, drvA, drvB }) => {
  if (!active||!payload?.length) return null;
  const delta = payload.find(p=>p.dataKey==='delta')?.value || 0;
  const favors = delta > 0 ? drvA : delta < 0 ? drvB : '—';
  return (
    <div className="glass-bright px-2.5 py-1.5 rounded text-[10px] font-mono border border-white/10">
      <div className="text-slate-500 mb-1">t={label}s</div>
      <div className="flex items-center gap-2">
        <span className="text-neon-cyan">Δ</span>
        <span className={delta>0?'text-neon-green':delta<0?'text-neon-red':'text-white'}>
          {delta>0?'+':''}{delta.toFixed(3)}s
        </span>
        <span className="text-slate-500">→ {favors}</span>
      </div>
    </div>
  );
};

export default function DriverComparison() {
  const [drvA, setDrvA] = useState('VER');
  const [drvB, setDrvB] = useState('LEC');
  const [lapA, setLapA] = useState('lap1');
  const [lapB, setLapB] = useState('lap1');
  const [activeMetric, setActiveMetric] = useState('speed');

  const data = useMemo(()=>buildComparisonData(drvA, drvB, lapA),[drvA,drvB,lapA]);

  const stats = useMemo(()=>({
    topSpeedA: Math.max(...data.map(d=>d[drvA]||0)),
    topSpeedB: Math.max(...data.map(d=>d[drvB]||0)),
    avgThrotA: data.reduce((s,d)=>s+(d.tA||0),0)/data.length,
    avgThrotB: data.reduce((s,d)=>s+(d.tB||0),0)/data.length,
    maxBrakeA: Math.max(...data.map(d=>d.bA||0)),
    maxBrakeB: Math.max(...data.map(d=>d.bB||0)),
    totalDelta: data[data.length-1]?.delta||0,
  }),[data,drvA,drvB]);

  const yKeyA = activeMetric==='speed'?drvA:activeMetric==='throttle'?'tA':'bA';
  const yKeyB = activeMetric==='speed'?drvB:activeMetric==='throttle'?'tB':'bB';
  const yDomain= activeMetric==='speed'?[80,340]:[0,100];
  const isDelta = activeMetric==='delta';

  return (
    <motion.div className="glass flex flex-col h-full" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.3}}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="panel-header">Driver Comparison</span>
          <span className="text-[9px] font-mono text-slate-600">Select 2 drivers · same or different laps</span>
        </div>

        {/* Driver selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-600">A:</span>
            {ALL_DRIVERS.map(drv=>(
              <button key={drv} onClick={()=>setDrvA(drv)}
                className={`px-1.5 py-0.5 text-[9px] font-display font-700 rounded border transition-all ${drvA===drv?'border-current':'border-transparent text-slate-600 hover:text-slate-400'}`}
                style={drvA===drv?{color:DRIVER_COLORS[drv],borderColor:DRIVER_COLORS[drv]+'66',background:DRIVER_COLORS[drv]+'18'}:{}}>{drv}</button>
            ))}
            {lapOptions.map(l=>(
              <button key={l.value} onClick={()=>setLapA(l.value)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${lapA===l.value?'bg-white/12 text-white':'text-slate-600'}`}>{l.label}</button>
            ))}
          </div>
          <span className="text-slate-600 font-mono text-xs">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-slate-600">B:</span>
            {ALL_DRIVERS.map(drv=>(
              <button key={drv} onClick={()=>setDrvB(drv)}
                className={`px-1.5 py-0.5 text-[9px] font-display font-700 rounded border transition-all ${drvB===drv?'border-current':'border-transparent text-slate-600 hover:text-slate-400'}`}
                style={drvB===drv?{color:DRIVER_COLORS[drv],borderColor:DRIVER_COLORS[drv]+'66',background:DRIVER_COLORS[drv]+'18'}:{}}>{drv}</button>
            ))}
            {lapOptions.map(l=>(
              <button key={l.value} onClick={()=>setLapB(l.value)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${lapB===l.value?'bg-white/12 text-white':'text-slate-600'}`}>{l.label}</button>
            ))}
          </div>
        </div>

        {/* Metric tabs */}
        <div className="flex items-center gap-1 mt-2">
          {METRICS.map(m=>(
            <button key={m.key} onClick={()=>setActiveMetric(m.key)}
              className={`px-2.5 py-1 text-[9px] font-mono tracking-wider rounded transition-all
                ${activeMetric===m.key?'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30':'text-slate-600 hover:text-slate-300 border border-transparent'}`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main chart */}
      <div className="flex-1 px-3 py-2 min-h-0" style={{minHeight:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{top:4,right:12,bottom:4,left:0}} syncId="compare">
            <defs>
              <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={DRIVER_COLORS[drvA]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={DRIVER_COLORS[drvA]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={DRIVER_COLORS[drvB]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={DRIVER_COLORS[drvB]} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradDeltaPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#00e676" stopOpacity={0.35}/>
                <stop offset="100%" stopColor="#00e676" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gradDeltaNeg" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"  stopColor="#ff1e1e" stopOpacity={0.35}/>
                <stop offset="100%" stopColor="#ff1e1e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false}/>
            <XAxis dataKey="t" tick={{fill:'#475569',fontSize:8,fontFamily:'JetBrains Mono'}} tickLine={false} axisLine={{stroke:'rgba(255,255,255,0.06)'}}
              label={{value:'Time (s)',position:'insideBottom',fill:'#475569',fontSize:8}}/>
            <YAxis domain={isDelta?[-0.5,0.5]:yDomain} tick={{fill:'#475569',fontSize:8,fontFamily:'JetBrains Mono'}} tickLine={false} axisLine={false} width={32} tickCount={5}/>
            <Tooltip content={isDelta?<DeltaTooltip drvA={drvA} drvB={drvB}/>:undefined}
              cursor={{stroke:'rgba(255,255,255,0.15)',strokeWidth:1}}/>
            {isDelta && <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"/>}
            {!isDelta && <>
              <Area type="monotone" dataKey={yKeyA} stroke={DRIVER_COLORS[drvA]} strokeWidth={2} fill="url(#gradA)" dot={false} activeDot={{r:3,strokeWidth:0}} name={drvA}/>
              <Area type="monotone" dataKey={yKeyB} stroke={DRIVER_COLORS[drvB]} strokeWidth={2} fill="url(#gradB)" dot={false} activeDot={{r:3,strokeWidth:0}} name={drvB}/>
            </>}
            {isDelta && <>
              <Area type="monotone" dataKey="delta" stroke="#00e676" strokeWidth={1.5} fill="url(#gradDeltaPos)" dot={false} activeDot={{r:3}}
                name="delta" fillOpacity={1} baseValue={0}/>
            </>}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="px-3 pb-3 shrink-0">
        <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">Comparison Metrics</div>
        <div className="grid grid-cols-4 gap-2">
          <StatBadge label="Top Speed" valA={stats.topSpeedA} valB={stats.topSpeedB} unitA=" km/h" drvA={drvA} drvB={drvB}/>
          <StatBadge label="Avg Throttle" valA={stats.avgThrotA} valB={stats.avgThrotB} unitA="%" drvA={drvA} drvB={drvB}/>
          <StatBadge label="Max Brake" valA={stats.maxBrakeA} valB={stats.maxBrakeB} unitA="%" drvA={drvA} drvB={drvB}/>
          <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded bg-white/5 border border-white/8">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">Lap Delta</span>
            <span className={`text-[11px] font-mono font-700 ${stats.totalDelta>0?'text-neon-green':stats.totalDelta<0?'text-neon-red':'text-white'}`}>
              {stats.totalDelta>0?'+':''}{stats.totalDelta.toFixed(3)}s
            </span>
            <span className="text-[8px] font-mono text-slate-600">{stats.totalDelta>0?drvA:drvB} faster</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
