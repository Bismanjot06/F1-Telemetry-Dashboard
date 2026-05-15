import { motion } from 'framer-motion';

const RACE_DATA = {
  circuit:    'Circuit de Monaco',
  location:   'Monte Carlo, MC',
  totalLaps:  78,
  raceTime:   '1:42:18.541',
  safetycar:  'NONE',
  vsc:        'NONE',
  flag:       'GREEN',
  weather: {
    condition: 'CLEAR',
    airTemp:   '24°C',
    trackTemp: '42°C',
    humidity:  '58%',
    wind:      '12 km/h NW',
  },
  fastestLap: {
    driver: 'VER',
    time:   '1:31.245',
    lap:    47,
  },
  pitStops: [
    { driver: 'HAM', lap: 18, duration: '2.4s', compound: 'M→H' },
    { driver: 'SAI', lap: 20, duration: '2.8s', compound: 'M→M' },
    { driver: 'LEC', lap: 22, duration: '2.2s', compound: 'S→M' },
  ],
};

const Row = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{label}</span>
    <span className={`text-[10px] font-mono font-500 ${accent || 'text-slate-200'}`}>{value}</span>
  </div>
);

export default function RaceInfo({ currentLap }) {
  return (
    <div className="glass flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 ticker-border">
        <span className="panel-header">Race Info</span>
        <div className="font-display font-700 text-sm text-white tracking-wide mt-1">
          {RACE_DATA.circuit}
        </div>
        <div className="text-[10px] font-mono text-slate-500">{RACE_DATA.location}</div>
      </div>

      <div className="flex-1 px-3 py-2 space-y-3 overflow-auto">
        {/* Session status */}
        <div>
          <div className="panel-header mb-1.5">Session</div>
          <Row label="Lap"     value={`${currentLap} / ${RACE_DATA.totalLaps}`} accent="text-neon-cyan" />
          <Row label="Elapsed" value={RACE_DATA.raceTime} />
          <Row label="Safety Car" value={RACE_DATA.safetycar} accent="text-neon-green" />
          <Row label="Flag"    value={`🟢 ${RACE_DATA.flag}`} accent="text-neon-green" />
        </div>

        {/* Fastest lap */}
        <div>
          <div className="panel-header mb-1.5">Fastest Lap</div>
          <motion.div
            className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded px-2 py-1.5"
            animate={{ boxShadow: ['0 0 0 rgba(191,0,255,0)', '0 0 12px rgba(191,0,255,0.3)', '0 0 0 rgba(191,0,255,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <span className="text-purple-400 text-lg">⚡</span>
            <div>
              <div className="font-display font-700 text-xs text-purple-300 tracking-wider">
                {RACE_DATA.fastestLap.driver}
              </div>
              <div className="font-mono text-xs text-white">{RACE_DATA.fastestLap.time}</div>
              <div className="text-[9px] font-mono text-slate-500">Lap {RACE_DATA.fastestLap.lap}</div>
            </div>
          </motion.div>
        </div>

        {/* Weather */}
        <div>
          <div className="panel-header mb-1.5">Weather</div>
          <Row label="Condition"  value={RACE_DATA.weather.condition} accent="text-neon-yellow" />
          <Row label="Air Temp"   value={RACE_DATA.weather.airTemp} />
          <Row label="Track Temp" value={RACE_DATA.weather.trackTemp} accent="text-orange-300" />
          <Row label="Humidity"   value={RACE_DATA.weather.humidity} />
          <Row label="Wind"       value={RACE_DATA.weather.wind} />
        </div>

        {/* Pit stops */}
        <div>
          <div className="panel-header mb-1.5">Recent Pit Stops</div>
          <div className="space-y-1">
            {RACE_DATA.pitStops.map((p, i) => (
              <motion.div
                key={i}
                className="flex items-center justify-between bg-carbon-800 rounded px-2 py-1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span className="font-display font-700 text-xs text-white w-8">{p.driver}</span>
                <span className="text-[9px] font-mono text-slate-500">Lap {p.lap}</span>
                <span className="text-[9px] font-mono text-neon-yellow">{p.duration}</span>
                <span className="text-[9px] font-mono text-slate-400">{p.compound}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
