import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import Navbar              from './components/Navbar';
import HeroBanner          from './components/HeroBanner';
import Leaderboard         from './components/Leaderboard';
import TelemetryChart      from './components/TelemetryChart';
import TireCard            from './components/TireCard';
import SectorComparison    from './components/SectorComparison';
import RaceInfo            from './components/RaceInfo';
import StatCard            from './components/StatCard';
import TrackMapPlaceholder from './components/TrackMapPlaceholder';

import { drivers as initialDrivers } from './data/drivers';
import { tireData }                  from './data/tires';

const TOTAL_LAPS = 78;
const START_LAP  = 47;

function jitterLapTime(base) {
  const [min, rest] = base.split(':');
  const secs = parseFloat(rest) + (Math.random() - 0.5) * 0.4;
  return `${min}:${Math.max(0, secs).toFixed(3).padStart(6, '0')}`;
}

function jitterGap(base) {
  if (base === 'LEADER') return 'LEADER';
  const v = parseFloat(base) + (Math.random() - 0.5) * 0.05;
  return `+${Math.max(0.001, v).toFixed(3)}`;
}

export default function App() {
  const [currentLap,     setCurrentLap]     = useState(START_LAP);
  const [drivers,        setDrivers]        = useState(initialDrivers);
  const [selectedDriver, setSelectedDriver] = useState(initialDrivers[0]);
  const [topSpeed,       setTopSpeed]       = useState(324);
  const [avgSpeed,       setAvgSpeed]       = useState(218);
  const [fuelLoad,       setFuelLoad]       = useState(42.4);
  const [activeTab,      setActiveTab]      = useState('telemetry');

  // Live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLap(l => Math.min(TOTAL_LAPS, l + 1));
      setDrivers(prev => prev.map(d => ({
        ...d,
        lapTime: jitterLapTime(d.lapTime),
        gap:     jitterGap(d.gap),
        speed:   Math.round(d.speed + (Math.random() - 0.5) * 4),
      })));
      setTopSpeed(s  => Math.round(Math.max(300, Math.min(342, s + (Math.random() - 0.5) * 6))));
      setAvgSpeed(s  => Math.round(Math.max(200, Math.min(240, s + (Math.random() - 0.5) * 3))));
      setFuelLoad(f  => parseFloat(Math.max(0, f - 0.08 + Math.random() * 0.04).toFixed(1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDriverSelect = useCallback((driver) => {
    setSelectedDriver(prev => prev?.id === driver.id ? null : driver);
  }, []);

  const selectedAbbr = selectedDriver?.abbreviation || 'VER';

  const statCards = [
    { icon: '⚡', label: 'Top Speed',   value: topSpeed,  unit: 'km/h',           accent: 'text-neon-cyan'   },
    { icon: '📊', label: 'Avg Speed',   value: avgSpeed,  unit: 'km/h',           accent: 'text-slate-200'   },
    { icon: '🏁', label: 'Laps Done',   value: currentLap,unit: `/ ${TOTAL_LAPS}`,accent: 'text-neon-yellow' },
    { icon: '💨', label: 'DRS',
      value: selectedDriver?.drs ? 'ACTIVE' : 'CLOSED',
      unit: selectedDriver?.abbreviation || 'VER',
      accent: selectedDriver?.drs ? 'text-neon-green' : 'text-slate-500',
      pulse: selectedDriver?.drs },
    { icon: '🌡️', label: 'Track Temp', value: '42°C',    unit: 'Air: 24°C',      accent: 'text-orange-300'  },
    { icon: '⛽', label: 'Fuel Load',   value: `${fuelLoad}`, unit: 'kg remaining', accent: 'text-amber-300' },
    { icon: '🌬️', label: 'Wind Speed', value: '12',      unit: 'km/h NW',        accent: 'text-slate-300'   },
    { icon: '🔄', label: 'Pit Stops',   value: 3,         unit: 'total today',    accent: 'text-slate-200'   },
  ];

  const TABS = [
    { key: 'telemetry', label: '📈 Telemetry' },
    { key: 'tires',     label: '🔴 Tires'     },
    { key: 'sectors',   label: '⏱ Sectors'   },
    { key: 'map',       label: '🗺 Track Map' },
  ];

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col">

      {/* ── Sticky Navbar ── */}
      <div className="sticky top-0 z-50">
        <Navbar currentLap={currentLap} totalLaps={TOTAL_LAPS} />
      </div>

      {/* ── Hero Banner ── */}
      <HeroBanner />

      {/* ── Main content area ── */}
      <div className="flex-1 px-4 pb-6">

        {/* ── 3-column grid ── */}
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: '280px 1fr 260px' }}
        >

          {/* ── LEFT — Leaderboard (tall, spans main + stats rows) ── */}
          <div className="row-span-2" style={{ minHeight: '600px' }}>
            <Leaderboard
              drivers={drivers}
              selectedDriver={selectedDriver}
              onSelect={handleDriverSelect}
            />
          </div>

          {/* ── CENTER TOP — Tabbed panel ── */}
          <div className="flex flex-col gap-3" style={{ minHeight: '480px' }}>

            {/* Tab strip */}
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-1.5 text-xs font-display font-700 tracking-wider rounded-lg transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/35 shadow-lg'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className="panel-header">Focus:</span>
                <span
                  className="font-display font-800 text-sm tracking-wider"
                  style={{ color: selectedDriver?.teamColor || '#00e5ff' }}
                >
                  {selectedAbbr}
                </span>
                {selectedDriver && (
                  <img
                    src={`/helmet_${selectedAbbr.toLowerCase()}.png`}
                    alt={selectedAbbr}
                    className="w-7 h-7 rounded-full object-cover border border-white/10"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0">
              <motion.div
                key={activeTab}
                className="h-full"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ minHeight: '420px' }}
              >
                {activeTab === 'telemetry' && (
                  <TelemetryChart selectedDrivers={['VER', 'LEC', 'NOR']} />
                )}
                {activeTab === 'tires' && (
                  <div className="glass rounded-xl h-full p-5 overflow-auto">
                    <div className="panel-header mb-4 text-neon-cyan">Tire Status — All Drivers</div>
                    <div className="grid grid-cols-2 xl:grid-cols-2 gap-4">
                      {tireData.map((t, i) => (
                        <TireCard key={t.driver} tire={t} index={i} />
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 'sectors' && (
                  <SectorComparison driverAbbr={selectedAbbr} />
                )}
                {activeTab === 'map' && (
                  <TrackMapPlaceholder selectedDriver={selectedDriver} />
                )}
              </motion.div>
            </div>
          </div>

          {/* ── RIGHT — Race Info ── */}
          <div className="row-span-2" style={{ minHeight: '600px' }}>
            <RaceInfo currentLap={currentLap} />
          </div>

          {/* ── CENTER BOTTOM — Stat cards row ── */}
          <div className="grid grid-cols-4 gap-3" style={{ height: '108px' }}>
            {statCards.slice(0, 8).map((card, i) => (
              <StatCard key={card.label} {...card} index={i} />
            ))}
          </div>

        </div>

        {/* ── Full-width bottom strip — selected driver detail ── */}
        {selectedDriver && (
          <motion.div
            className="mt-4 glass rounded-xl p-5 flex items-center gap-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Helmet */}
            <img
              src={`/helmet_${selectedDriver.abbreviation.toLowerCase()}.png`}
              alt={selectedDriver.name}
              className="w-16 h-16 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: selectedDriver.teamColor }}
              onError={e => {
                e.target.style.display = 'none';
              }}
            />

            {/* Driver name */}
            <div className="shrink-0">
              <div className="font-display font-800 text-2xl text-white tracking-wider" style={{ color: selectedDriver.teamColor }}>
                {selectedDriver.abbreviation}
              </div>
              <div className="font-mono text-xs text-slate-400">{selectedDriver.name}</div>
              <div className="font-mono text-[10px] text-slate-500">{selectedDriver.team}</div>
            </div>

            <div className="w-px h-12 bg-white/10" />

            {/* Quick stats */}
            {[
              { label: 'Position', value: `P${selectedDriver.position}`, color: '#ffe600' },
              { label: 'Lap Time', value: selectedDriver.lapTime, color: '#00e5ff' },
              { label: 'Gap',      value: selectedDriver.gap,     color: '#94a3b8' },
              { label: 'Speed',    value: `${selectedDriver.speed} km/h`, color: '#00e676' },
              { label: 'Tire',     value: selectedDriver.tire,    color: tireColors_map[selectedDriver.tire] },
              { label: 'Tire Age', value: `${selectedDriver.tireAge} laps`, color: '#94a3b8' },
              { label: 'DRS',      value: selectedDriver.drs ? 'ACTIVE ✓' : 'CLOSED', color: selectedDriver.drs ? '#00e676' : '#475569' },
            ].map(item => (
              <div key={item.label} className="text-center shrink-0">
                <div className="font-mono font-600 text-sm" style={{ color: item.color }}>{item.value}</div>
                <div className="panel-header mt-0.5">{item.label}</div>
              </div>
            ))}

            {/* Flag */}
            <div className="ml-auto text-3xl">{selectedDriver.flag}</div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

// tire color lookup for the detail strip
const tireColors_map = { S: '#ff1e1e', M: '#ffe600', H: '#c8cdd4', I: '#00e5ff', W: '#3d7fff' };
