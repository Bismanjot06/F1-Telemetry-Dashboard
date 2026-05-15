import { useState, useMemo, useCallback } from 'react';
import { ResponsiveContainer, LineChart, AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { telemetryLaps, lapOptions } from '../data/telemetry';
import { useRace } from '../context/RaceContext';

const DRIVER_COLORS = { VER:'#3671c6',LEC:'#e8002d',NOR:'#ff8000',HAM:'#27f4d2',RUS:'#27f4d2',SAI:'#e8002d',ALO:'#358c75',PIA:'#ff8000' };
const ALL_DRIVERS = ['VER','LEC','NOR','HAM','RUS','SAI','ALO','PIA'];
const CHANNELS = [
  { key:'speed',    label:'SPEED',    unit:'km/h', color:'#00e5ff', domain:[80,340],    type:'line' },
  { key:'throttle', label:'THROTTLE', unit:'%',    color:'#00e676', domain:[0,100],     type:'area' },
  { key:'brake',    label:'BRAKE',    unit:'%',    color:'#ff1e1e', domain:[0,100],     type:'area' },
  { key:'rpm',      label:'RPM',      unit:'RPM',  color:'#bf00ff', domain:[4000,14000],type:'line' },
  { key:'gear',     label:'GEAR',     unit:'G',    color:'#ffe600', domain:[1,8],       type:'step' },
  { key:'drs',      label:'DRS',      unit:'ON',   color:'#00e676', domain:[0,1],       type:'area' },
];

const CustomTooltip = ({ active, payload, label, channel }) => {
  if (!active||!payload?.length) return null;
  return (
    <div className="glass-bright px-2.5 py-1.5 rounded text-[10px] font-mono border border-white/10 shadow-xl">
      <div className="text-slate-500 mb-1">t={label}s</div>
      {payload.map(p=>(
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{background:p.color}}/>
          <span style={{color:p.color}}>{p.dataKey}</span>
          <span className="text-white ml-auto pl-3">
            {channel.key==='drs'?(p.value?'OPEN':'CLOSED'):Math.round(p.value)} {channel.unit}
          </span>
        </div>
      ))}
    </div>
  );
};

function ChannelChart({ channel, data, drivers }) {
  const Comp = channel.type==='line' ? LineChart : AreaChart;
  return (
    <div style={{height:72}}>
      <ResponsiveContainer width="100%" height="100%">
        <Comp data={data} syncId="telemetry" margin={{top:2,right:8,bottom:0,left:0}}>
          <defs>{drivers.map(drv=>(
            <linearGradient key={drv} id={`tg-${channel.key}-${drv}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={DRIVER_COLORS[drv]||'#888'} stopOpacity={0.25}/>
              <stop offset="95%" stopColor={DRIVER_COLORS[drv]||'#888'} stopOpacity={0}/>
            </linearGradient>
          ))}</defs>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false}/>
          <YAxis domain={channel.domain} tick={{fill:'#475569',fontSize:8,fontFamily:'JetBrains Mono'}} tickLine={false} axisLine={false} width={28} tickCount={3}/>
          <Tooltip content={<CustomTooltip channel={channel}/>} cursor={{stroke:'rgba(255,255,255,0.15)',strokeWidth:1}}/>
          {drivers.map(drv=>(
            channel.type==='line'
              ? <Line key={drv} type="monotone" dataKey={drv} stroke={DRIVER_COLORS[drv]||'#888'} strokeWidth={1.5} dot={false} activeDot={{r:2,strokeWidth:0}} isAnimationActive animationDuration={600}/>
              : <Area key={drv} type={channel.type==='step'?'stepAfter':'monotone'} dataKey={drv} stroke={DRIVER_COLORS[drv]||'#888'} strokeWidth={1.5} fill={`url(#tg-${channel.key}-${drv})`} dot={false} activeDot={{r:2,strokeWidth:0}} isAnimationActive animationDuration={600}/>
          ))}
        </Comp>
      </ResponsiveContainer>
    </div>
  );
}

export default function TelemetryWorkspace() {
  const [activeLap,     setActiveLap]     = useState('lap1');
  const [activeDrivers, setActiveDrivers] = useState(['VER','LEC','NOR']);
  const [focusChannel,  setFocusChannel]  = useState(null);

  const toggleDriver = useCallback(drv=>{
    setActiveDrivers(prev=>
      prev.includes(drv)
        ? prev.length>1 ? prev.filter(d=>d!==drv) : prev
        : prev.length<3 ? [...prev,drv] : prev
    );
  },[]);

  const datasets = useMemo(()=>{
    const result={};
    CHANNELS.forEach(ch=>{
      const base=telemetryLaps[activeDrivers[0]]?.[activeLap]||[];
      result[ch.key]=base.map((point,i)=>{
        const entry={t:point.t};
        activeDrivers.forEach(drv=>{
          const p=telemetryLaps[drv]?.[activeLap]?.[i];
          if(p) entry[drv]=ch.key==='drs'?(p.speed>295?1:0):parseFloat((p[ch.key]||0).toFixed(1));
        });
        return entry;
      });
    });
    return result;
  },[activeDrivers,activeLap]);

  const displayChannels = focusChannel ? CHANNELS.filter(c=>c.key===focusChannel) : CHANNELS;

  return (
    <motion.div className="glass flex flex-col h-full" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.35}}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 ticker-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="panel-header">Telemetry Workspace</span>
            <div className="text-[9px] font-mono text-slate-600 mt-0.5">{activeDrivers.join(' · ')} — 6-channel analysis</div>
          </div>
          <div className="flex gap-1">
            {lapOptions.map(l=>(
              <button key={l.value} onClick={()=>setActiveLap(l.value)}
                className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all ${activeLap===l.value?'bg-white/12 text-white':'text-slate-600 hover:text-slate-300'}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        {/* Driver + Channel toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono text-slate-600">DRV:</span>
          {ALL_DRIVERS.map(drv=>{
            const active=activeDrivers.includes(drv);
            return (
              <button key={drv} onClick={()=>toggleDriver(drv)}
                className={`px-1.5 py-0.5 text-[9px] font-display font-700 rounded border transition-all ${active?'border-current':'border-transparent text-slate-600 hover:text-slate-400'}`}
                style={active?{color:DRIVER_COLORS[drv],borderColor:DRIVER_COLORS[drv]+'66',background:DRIVER_COLORS[drv]+'18'}:{}}>
                {drv}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1">
            <button onClick={()=>setFocusChannel(null)} className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${!focusChannel?'text-neon-cyan bg-neon-cyan/10':'text-slate-600'}`}>ALL</button>
            {CHANNELS.map(c=>(
              <button key={c.key} onClick={()=>setFocusChannel(focusChannel===c.key?null:c.key)}
                className={`px-1.5 py-0.5 text-[9px] font-mono rounded transition-all ${focusChannel===c.key?'bg-white/10 text-white':'text-slate-600 hover:text-slate-400'}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
        <AnimatePresence mode="popLayout">
          {displayChannels.map(channel=>(
            <motion.div key={channel.key} layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
              <div className="flex items-center gap-2 mb-0.5 px-1">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:channel.color}}/>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{channel.label}</span>
                <span className="text-[9px] font-mono text-slate-700">{channel.unit}</span>
                <div className="flex-1 border-t border-white/5"/>
                {activeDrivers.map(drv=>{
                  const last=datasets[channel.key]?.[datasets[channel.key]?.length-1];
                  const val=last?.[drv];
                  return val!==undefined?(
                    <span key={drv} className="text-[9px] font-mono" style={{color:DRIVER_COLORS[drv]}}>
                      {drv}: {channel.key==='drs'?(val?'ON':'OFF'):Math.round(val)}
                    </span>
                  ):null;
                })}
              </div>
              <ChannelChart channel={channel} data={datasets[channel.key]} drivers={activeDrivers}/>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 py-1.5 border-t border-white/5 shrink-0">
        <div className="flex justify-between text-[9px] font-mono text-slate-700">
          <span>Hover to compare — cursors synchronized across all channels</span>
          <span>{datasets.speed?.length||0} data points · 3.7 Hz</span>
        </div>
      </div>
    </motion.div>
  );
}
