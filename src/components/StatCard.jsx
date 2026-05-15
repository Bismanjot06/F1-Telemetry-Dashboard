import { motion } from 'framer-motion';

export default function StatCard({ icon, label, value, unit, accent, pulse, index = 0 }) {
  return (
    <motion.div
      className="glass rounded-xl flex flex-col justify-between p-4 card-hover border border-transparent cursor-default"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        {pulse && (
          <motion.span
            className="w-2 h-2 rounded-full bg-neon-green"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Value */}
      <div>
        <div className={`font-mono font-700 text-xl leading-none ${accent || 'text-white'}`}>
          {value}
        </div>
        {unit && (
          <div className="text-[10px] font-mono text-slate-500 mt-0.5">{unit}</div>
        )}
      </div>

      {/* Label */}
      <div className="panel-header mt-2">{label}</div>
    </motion.div>
  );
}
