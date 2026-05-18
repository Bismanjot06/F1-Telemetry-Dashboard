import { motion } from 'framer-motion';

export default function LoadingSkeleton() {
  const pulseVariants = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1, transition: { duration: 2, repeat: Infinity } },
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header skeleton */}
      <div className="flex gap-3">
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="h-8 w-32 bg-gray-800 rounded-lg"
        />
        <motion.div
          variants={pulseVariants}
          initial="initial"
          animate="animate"
          className="h-8 w-24 bg-gray-800 rounded-lg"
        />
      </div>

      {/* Timing view skeleton */}
      <div className="grid gap-3" style={{ gridTemplateColumns: '300px 1fr 280px', minHeight: '580px' }}>
        {/* Left tower */}
        <div className="space-y-2">
          {Array(8).fill(0).map((_, i) => (
            <motion.div
              key={i}
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="h-10 bg-gray-800 rounded-lg"
            />
          ))}
        </div>

        {/* Center track map */}
        <div className="space-y-2">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="h-80 bg-gray-800 rounded-lg"
          />
          <div className="grid grid-cols-8 gap-2">
            {Array(8).fill(0).map((_, i) => (
              <motion.div
                key={i}
                variants={pulseVariants}
                initial="initial"
                animate="animate"
                className="h-12 bg-gray-800 rounded-lg"
              />
            ))}
          </div>
        </div>

        {/* Right control feed */}
        <div className="space-y-2">
          {Array(6).fill(0).map((_, i) => (
            <motion.div
              key={i}
              variants={pulseVariants}
              initial="initial"
              animate="animate"
              className="h-16 bg-gray-800 rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Connection status message */}
      <div className="flex justify-center items-center gap-2 text-sm text-gray-400">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 bg-blue-500 rounded-full"
        />
        <span>Connecting to live data...</span>
      </div>
    </div>
  );
}
