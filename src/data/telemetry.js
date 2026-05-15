// Rich telemetry data — 8 drivers, 5 laps, realistic Monaco-style trace
// Speed/RPM/Throttle/Brake/Gear simulating tight hairpins + straights

function generateLap(baseSpeed, baseRpm, lapStyle = 'normal', points = 120) {
  const data = [];
  for (let i = 0; i < points; i++) {
    const t = parseFloat((i * (90 / points)).toFixed(2));
    const progress = i / points;

    // Monaco-style profile: short straights, heavy braking, slow corners
    // Zones: 0-15% straight, 15-20% braking, 20-35% slow corner, 35-50% mid-str, 50-55% brake, 55-70% hairpin, 70-85% tunnel-straight, 85-95% chicane, 95-100% SF straight
    let speedMultiplier, throttle, brake, gear;

    if (progress < 0.12) {
      // S/F straight — full throttle, top speed
      speedMultiplier = 0.95 + progress * 0.5;
      throttle = 95 + Math.random() * 5;
      brake = Math.random() * 3;
      gear = 7 + (baseSpeed > 280 ? 1 : 0);
    } else if (progress < 0.18) {
      // Braking zone — Casino
      const brakeProgress = (progress - 0.12) / 0.06;
      speedMultiplier = 0.95 - brakeProgress * 0.55;
      throttle = Math.max(0, 95 - brakeProgress * 95);
      brake = brakeProgress * 92 + Math.random() * 8;
      gear = Math.max(2, 7 - Math.round(brakeProgress * 5));
    } else if (progress < 0.32) {
      // Casino complex — slow
      speedMultiplier = 0.32 + Math.sin((progress - 0.18) / 0.14 * Math.PI) * 0.12;
      throttle = 30 + Math.sin((progress - 0.18) / 0.14 * Math.PI) * 50 + Math.random() * 10;
      brake = Math.max(0, 15 - Math.sin((progress - 0.18) / 0.14 * Math.PI) * 15);
      gear = 2;
    } else if (progress < 0.48) {
      // Mid-track straight + Mirabeau
      speedMultiplier = 0.45 + (progress - 0.32) / 0.16 * 0.35;
      throttle = 70 + Math.random() * 20;
      brake = Math.random() * 5;
      gear = 4 + Math.round((progress - 0.32) / 0.16 * 2);
    } else if (progress < 0.56) {
      // Hairpin braking — hardest braking zone in F1
      const bp = (progress - 0.48) / 0.08;
      speedMultiplier = 0.80 - bp * 0.62;
      throttle = Math.max(0, 90 - bp * 90);
      brake = bp * 98 + Math.random() * 2;
      gear = Math.max(1, 6 - Math.round(bp * 5));
    } else if (progress < 0.68) {
      // Hairpin exit + Portier
      const ep = (progress - 0.56) / 0.12;
      speedMultiplier = 0.18 + ep * 0.42;
      throttle = 20 + ep * 70 + Math.random() * 10;
      brake = Math.max(0, 10 - ep * 10);
      gear = 1 + Math.round(ep * 3);
    } else if (progress < 0.82) {
      // Tunnel straight — highest speed section
      speedMultiplier = 0.88 + (progress - 0.68) / 0.14 * 0.2;
      throttle = 98 + Math.random() * 2;
      brake = Math.random() * 2;
      gear = 8;
    } else if (progress < 0.92) {
      // Nouvelle chicane — heavy braking
      const cp = (progress - 0.82) / 0.10;
      speedMultiplier = cp < 0.3 ? (1.08 - cp * 2.0) : (0.42 + (cp - 0.3) * 0.6);
      throttle = cp < 0.3 ? Math.max(0, 100 - cp / 0.3 * 100) : (cp - 0.3) / 0.7 * 85;
      brake = cp < 0.3 ? cp / 0.3 * 90 : Math.max(0, 90 - (cp - 0.3) / 0.7 * 90);
      gear = cp < 0.3 ? Math.max(2, 8 - Math.round(cp / 0.3 * 6)) : 2 + Math.round((cp - 0.3) / 0.7 * 2);
    } else {
      // Rascasse + return to SF
      const fp = (progress - 0.92) / 0.08;
      speedMultiplier = 0.55 + fp * 0.40;
      throttle = 40 + fp * 55 + Math.random() * 5;
      brake = Math.max(0, 20 - fp * 20);
      gear = 3 + Math.round(fp * 2);
    }

    const speed = Math.max(60, Math.min(340, baseSpeed * speedMultiplier + (Math.random() - 0.5) * 8));
    const rpm   = Math.max(3500, Math.min(13500, baseRpm * speedMultiplier + (Math.random() - 0.5) * 400));

    data.push({
      t,
      speed:    parseFloat(speed.toFixed(1)),
      rpm:      parseFloat(rpm.toFixed(0)),
      throttle: parseFloat(Math.max(0, Math.min(100, throttle)).toFixed(1)),
      brake:    parseFloat(Math.max(0, Math.min(100, brake)).toFixed(1)),
      gear:     Math.max(1, Math.min(8, gear || 1)),
    });
  }
  return data;
}

export const telemetryLaps = {
  VER: {
    lap1: generateLap(325, 11200, 'aggressive'),
    lap2: generateLap(328, 11400, 'normal'),
    lap3: generateLap(330, 11500, 'push'),
    lap4: generateLap(322, 11000, 'save'),
    lap5: generateLap(331, 11600, 'push'),
  },
  LEC: {
    lap1: generateLap(318, 10900, 'normal'),
    lap2: generateLap(321, 11100, 'push'),
    lap3: generateLap(323, 11200, 'push'),
    lap4: generateLap(316, 10700, 'save'),
    lap5: generateLap(324, 11300, 'push'),
  },
  NOR: {
    lap1: generateLap(314, 10700, 'normal'),
    lap2: generateLap(317, 10900, 'push'),
    lap3: generateLap(319, 11000, 'push'),
    lap4: generateLap(312, 10500, 'save'),
    lap5: generateLap(320, 11100, 'push'),
  },
  HAM: {
    lap1: generateLap(310, 10500, 'smooth'),
    lap2: generateLap(313, 10700, 'normal'),
    lap3: generateLap(315, 10800, 'push'),
    lap4: generateLap(308, 10300, 'save'),
    lap5: generateLap(316, 10900, 'push'),
  },
  RUS: {
    lap1: generateLap(308, 10300, 'normal'),
    lap2: generateLap(310, 10500, 'normal'),
    lap3: generateLap(312, 10600, 'push'),
    lap4: generateLap(306, 10100, 'save'),
    lap5: generateLap(313, 10700, 'push'),
  },
  SAI: {
    lap1: generateLap(312, 10600, 'normal'),
    lap2: generateLap(314, 10800, 'push'),
    lap3: generateLap(316, 10900, 'push'),
    lap4: generateLap(310, 10400, 'save'),
    lap5: generateLap(317, 11000, 'push'),
  },
  ALO: {
    lap1: generateLap(306, 10200, 'smooth'),
    lap2: generateLap(308, 10400, 'normal'),
    lap3: generateLap(310, 10500, 'push'),
    lap4: generateLap(304, 10000, 'save'),
    lap5: generateLap(311, 10600, 'push'),
  },
  PIA: {
    lap1: generateLap(309, 10400, 'normal'),
    lap2: generateLap(311, 10600, 'push'),
    lap3: generateLap(313, 10700, 'push'),
    lap4: generateLap(307, 10200, 'save'),
    lap5: generateLap(314, 10800, 'push'),
  },
};

export const lapOptions = [
  { label: 'LAP 1', value: 'lap1' },
  { label: 'LAP 2', value: 'lap2' },
  { label: 'LAP 3', value: 'lap3' },
  { label: 'LAP 4', value: 'lap4' },
  { label: 'LAP 5', value: 'lap5' },
];

export const selectedDrivers = ['VER', 'LEC', 'NOR'];
