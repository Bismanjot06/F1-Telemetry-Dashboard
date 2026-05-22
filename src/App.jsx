import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar             from './components/Navbar';
import HeroBanner         from './components/HeroBanner';
import SessionControl     from './components/SessionControl';
import Leaderboard        from './components/Leaderboard';
import TelemetryWorkspace from './components/TelemetryWorkspace';
import DriverComparison   from './components/DriverComparison';
import TrackMap           from './components/TrackMap';
import RaceMapView        from './components/RaceMapView';
import RaceControlFeed    from './components/RaceControlFeed';
import TireStrategy       from './components/TireStrategy';
import StatCard           from './components/StatCard';
import SelectedDriverBar  from './components/SelectedDriverBar';
import LoadingSkeleton    from './components/LoadingSkeleton';
import { ErrorBoundary }  from './components/ErrorBoundary';
import { useRace }        from './context/RaceContext';

// ── Stat cards driven by live context ─────────────────────────────────────────
function LiveStatCards() {
  const { weather, selectedDriver, currentLap, totalLaps } = useRace();
  const cards = [
    { icon:'⚡', label:'Track Temp',  value:`${weather.track_temperature||42}°C`, unit:'',         accent:'text-orange-300' },
    { icon:'🌡️', label:'Air Temp',   value:`${weather.air_temperature||24}°C`,   unit:'',         accent:'text-slate-300'  },
    { icon:'💧', label:'Humidity',    value:`${weather.humidity||58}%`,           unit:'',         accent:'text-blue-300'   },
    { icon:'🌬️', label:'Wind',       value:`${Math.round((weather.wind_speed||3.3)*3.6)}`, unit:'km/h', accent:'text-slate-300' },
    { icon:'🏁', label:'Lap',         value:currentLap,  unit:`/ ${totalLaps}`,   accent:'text-neon-yellow' },
    { icon:'🌧️', label:'Rainfall',   value:weather.rainfall?'YES':'NONE',        unit:'',         accent:weather.rainfall?'text-blue-400':'text-neon-green' },
    { icon:'📡', label:'DRS',         value:selectedDriver?.drs?'ACTIVE':'CLOSED', unit:selectedDriver?.abbreviation||'', accent:selectedDriver?.drs?'text-neon-green':'text-slate-500', pulse:selectedDriver?.drs },
    { icon:'🔴', label:'Tire',        value:selectedDriver?.compound?.charAt(0)||'M', unit:`${selectedDriver?.stintLapCount||0}L`, accent:'text-slate-200' },
  ];
  return (
    <div className="grid grid-cols-4 xl:grid-cols-8 gap-2">
      {cards.map((c,i) => <StatCard key={c.label} {...c} index={i}/>)}
    </div>
  );
}

// ── Main view tabs ─────────────────────────────────────────────────────────────
const VIEWS = [
  { key:'racemap',  label:'🗺 Race Map',  desc:'Professional Live Race Track Map with Real-time Driver Animation' },
  { key:'timing',   label:'⏱ Timing',    desc:'Live Timing Tower + Track Map + Race Control' },
  { key:'telemetry',label:'📈 Telemetry', desc:'6-Channel Engineering Telemetry Analysis'    },
  { key:'compare',  label:'⚡ Compare',   desc:'Driver vs Driver Delta Timing Comparison'     },
  { key:'strategy', label:'🛞 Strategy',  desc:'Tire Strategy & Stint Timeline'               },
];

// ── Timing view — 3-column layout (responsive) ────────────────────────────────
function RaceMapViewComponent() {
  return <RaceMapView />;
}

// ── Timing view — 3-column layout (responsive) ────────────────────────────────
function TimingView() {
  return (
    <div className="grid gap-2 h-full lg:grid-cols-[280px_1fr_240px]" style={{ minHeight:'560px' }}>
      {/* LEFT — Timing Tower (tall) - hidden on mobile */}
      <div className="hidden lg:block lg:row-span-2">
        <Leaderboard />
      </div>

      {/* CENTER TOP — Track Map */}
      <div className="col-span-full lg:col-span-1" style={{ minHeight:'280px' }}>
        <TrackMap />
      </div>

      {/* RIGHT — Race Control Feed (tall) - hidden on mobile */}
      <div className="hidden lg:block lg:row-span-2" style={{ minHeight:'560px' }}>
        <RaceControlFeed />
      </div>

      {/* CENTER BOTTOM — Stat cards */}
      <div className="col-span-full lg:col-span-1 flex flex-col gap-2">
        <LiveStatCards />
        <SelectedDriverBar />
      </div>
    </div>
  );
}

// ── Telemetry view — 2-column layout (responsive) ────────────────────────────
function TelemetryView() {
  return (
    <div className="grid gap-3 lg:grid-cols-[280px_1fr]" style={{ minHeight:'620px' }}>
      <div className="hidden lg:block">
        <Leaderboard />
      </div>
      <TelemetryWorkspace />
    </div>
  );
}

// ── Comparison view (responsive) ──────────────────────────────────────────────
function CompareView() {
  return (
    <div className="grid gap-3 lg:grid-cols-[280px_1fr]" style={{ minHeight:'620px' }}>
      <div className="hidden lg:block">
        <Leaderboard />
      </div>
      <DriverComparison />
    </div>
  );
}

// ── Strategy view (responsive) ─────────────────────────────────────────────────
function StrategyView() {
  return (
    <div className="grid gap-3 lg:grid-cols-[280px_1fr_280px]" style={{ minHeight:'580px' }}>
      <div className="hidden lg:block">
        <Leaderboard />
      </div>
      <TireStrategy />
      <div className="hidden lg:block">
        <RaceControlFeed />
      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────────
function AppContent() {
  const { activeView, setActiveView, currentLap, totalLaps, sessionName, isLive, snapshot, status } = useRace();
  const isConnecting = status === 'connecting';

  return (
    <div className="min-h-screen bg-carbon-950 flex flex-col">

      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar currentLap={currentLap} totalLaps={totalLaps} sessionName={sessionName} isLive={isLive}/>
      </div>

      {/* Hero */}
      <HeroBanner />

      {/* Session Control Bar */}
      <div className="px-4 pt-2">
        <SessionControl />
      </div>

      {/* View tabs */}
      <div className="px-4 pt-2">
        <div className="glass rounded-lg px-3 py-2 flex items-center gap-2 flex-wrap">
          {VIEWS.map(v => (
            <button
              key={v.key}
              onClick={() => setActiveView(v.key)}
              className={`px-3 py-1 text-[11px] font-display font-600 tracking-wide rounded-md transition-all duration-200
                ${activeView === v.key
                  ? 'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/35 shadow-lg shadow-neon-cyan/10'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/10'
                }`}
            >
              {v.label}
            </button>
          ))}
          <div className="ml-auto text-[9px] font-mono text-slate-600 hidden lg:block">
            {VIEWS.find(v => v.key === activeView)?.desc}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 pb-4 pt-2">
        {isConnecting || !snapshot ? (
          <LoadingSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.22 }}
              className="h-full"
            >
              {activeView === 'racemap'  && <RaceMapViewComponent />}
              {activeView === 'timing'    && <TimingView />}
              {activeView === 'telemetry' && <TelemetryView />}
              {activeView === 'compare'   && <CompareView />}
              {activeView === 'strategy'  && <StrategyView />}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
