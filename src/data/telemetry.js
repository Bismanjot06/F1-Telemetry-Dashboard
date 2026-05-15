// Mock telemetry data — Speed & RPM over one lap (in seconds)
const generateLap = (baseSpeed, baseRpm, points = 80) => {
  const data = [];
  for (let i = 0; i < points; i++) {
    const t = i * (90 / points); // ~90s lap
    // Simulate braking zones, acceleration, straight
    const phase = (i % 20) / 20;
    const speedVariation = Math.sin(phase * Math.PI * 2) * 45 + Math.random() * 10;
    const rpmVariation   = Math.sin(phase * Math.PI * 2) * 3000 + Math.random() * 500;
    data.push({
      t: parseFloat(t.toFixed(1)),
      speed:  Math.max(80,  Math.min(340, baseSpeed + speedVariation)),
      rpm:    Math.max(4000, Math.min(13500, baseRpm + rpmVariation)),
      gear:   Math.round(Math.max(1, Math.min(8, ((baseSpeed + speedVariation) / 340) * 8))),
      throttle: Math.max(0, Math.min(100, 60 + Math.sin(phase * Math.PI) * 50 + Math.random() * 10)),
      brake:    Math.max(0, Math.min(100, phase < 0.1 || phase > 0.85 ? 80 + Math.random() * 20 : Math.random() * 5)),
    });
  }
  return data;
};

export const telemetryLaps = {
  VER: {
    lap1: generateLap(290, 10500),
    lap2: generateLap(295, 10800),
    lap3: generateLap(300, 11000),
  },
  LEC: {
    lap1: generateLap(285, 10200),
    lap2: generateLap(288, 10400),
    lap3: generateLap(292, 10600),
  },
  NOR: {
    lap1: generateLap(280, 10000),
    lap2: generateLap(284, 10300),
    lap3: generateLap(289, 10700),
  },
  HAM: {
    lap1: generateLap(278, 9800),
    lap2: generateLap(281, 10100),
    lap3: generateLap(285, 10400),
  },
};

export const lapOptions = [
  { label: 'LAP 1', value: 'lap1' },
  { label: 'LAP 2', value: 'lap2' },
  { label: 'LAP 3', value: 'lap3' },
];

export const selectedDrivers = ['VER', 'LEC', 'NOR'];
