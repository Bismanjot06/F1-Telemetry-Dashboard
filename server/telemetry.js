/**
 * Real-time Telemetry System for F1 Live Race Map
 * Handles location tracking, position calculation, and smooth animation data
 */

const fs = require('fs');
const path = require('path');

// ── Constants ──────────────────────────────────────────────────────────────────
const TEAM_COLORS = {
  'Red Bull Racing': '#3671c6',
  'Ferrari': '#e8002d',
  'McLaren': '#ff8000',
  'Mercedes': '#27f4d2',
  'Aston Martin': '#358c75',
  'Alpine': '#0082fa',
  'Alfa Romeo': '#900000',
  'Haas': '#ffffff',
  'AlphaTauri': '#2b4562',
  'Williams': '#005aff',
};

// Track lap lengths (in meters, approximate for 50% race distance reference)
const TRACK_LENGTHS_M = {
  'BAH': 5412, // Bahrain
  'SAU': 6174, // Saudi Arabia
  'AUS': 5303, // Australia
  'JPN': 5891, // Japan
  'CHN': 5451, // China
  'MNO': 3337, // Monaco
  'CAN': 4361, // Canada
  'SVG': 4361, // Canada
  'AUT': 4319, // Austria
  'GBR': 5891, // Silverstone
  'HUN': 4381, // Hungary
  'BEL': 7004, // Spa
  'NED': 4259, // Zandvoort
  'ITA': 5793, // Monza
  'SG': 5065, // Singapore
  'MEX': 4694, // Mexico City
  'USA': 5513, // Austin
  'BRA': 4309, // Brazil
  'ABU': 5281, // Abu Dhabi
};

// ── Telemetry Logger ──────────────────────────────────────────────────────────
class TelemetryLogger {
  constructor() {
    this.logsDir = path.join(__dirname, '../logs');
    this.enabled = process.env.TELEMETRY_LOGGING === 'true';
    
    if (this.enabled && !fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
    
    this.currentSessionLog = null;
    this.packets = [];
  }

  startSession(sessionKey) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.currentSessionLog = path.join(this.logsDir, `telemetry-${sessionKey}-${timestamp}.ndjson`);
    this.packets = [];
    console.log(`[Telemetry] Logging to ${this.currentSessionLog}`);
  }

  logPacket(driverNumber, telemetryData) {
    if (!this.enabled) return;
    
    const entry = {
      timestamp: new Date().toISOString(),
      driverNumber,
      ...telemetryData
    };
    
    this.packets.push(entry);
    
    // Append to file (newline-delimited JSON)
    if (this.currentSessionLog) {
      fs.appendFileSync(this.currentSessionLog, JSON.stringify(entry) + '\n');
    }
  }

  getPackets() {
    return this.packets;
  }

  endSession() {
    console.log(`[Telemetry] Session ended, logged ${this.packets.length} packets`);
  }
}

// ── Telemetry Normalizer ──────────────────────────────────────────────────────
class TelemetryNormalizer {
  constructor(sessionKey, circuitCode = 'MNO') {
    this.sessionKey = sessionKey;
    this.circuitCode = circuitCode;
    this.trackLength = TRACK_LENGTHS_M[circuitCode] || 5000; // default
    this.driverSessions = new Map(); // track per-driver lap progress
    this.logger = new TelemetryLogger();
    this.logger.startSession(sessionKey);
  }

  /**
   * Normalize raw OpenF1 location + car data into a unified telemetry object
   * for canvas rendering and animation
   */
  normalize(driver, locationData, carData) {
    if (!driver || !driver.driver_number) return null;

    const driverNumber = driver.driver_number;
    const abbr = driver.name_acronym || 'XX';

    // Initialize driver session if needed
    if (!this.driverSessions.has(driverNumber)) {
      this.driverSessions.set(driverNumber, {
        lastLapNumber: 0,
        lastLocationTime: 0,
        cumulativeDistance: 0,
      });
    }

    const session = this.driverSessions.get(driverNumber);
    
    // Extract location data (if available)
    let location = null;
    let progress = 0; // 0-1, normalized lap progress
    
    if (locationData) {
      location = {
        x: locationData.x || 0,
        y: locationData.y || 0,
        z: locationData.z || 0,
      };
      
      // Calculate progress on circuit: 0 = startline, 1 = completed lap
      if (locationData.distance) {
        const lapProgressM = locationData.distance % this.trackLength;
        progress = lapProgressM / this.trackLength;
      }
    }

    // Extract car telemetry (if available)
    const throttle = carData?.throttle ?? 0;
    const brake = carData?.brake ?? 0;
    const speed = carData?.speed ?? 0;
    const gear = carData?.gear ?? 0;
    const drs = carData?.drs ?? false;
    const rpm = carData?.rpm ?? 0;

    // Determine sector (0, 1, or 2)
    let sector = 0;
    if (progress < 0.33) sector = 0;
    else if (progress < 0.66) sector = 1;
    else sector = 2;

    // Build normalized telemetry packet
    const packet = {
      driverNumber,
      abbreviation: abbr,
      timestamp: new Date().toISOString(),
      
      // Position and movement
      progress,                 // 0-1, normalized lap progress
      sector,                   // 0, 1, or 2
      location,                 // { x, y, z } in meters
      
      // Car performance
      speed,                    // km/h
      throttle,                 // 0-100
      brake,                    // 0-100
      gear,                     // 1-8
      rpm,                      // engine RPM
      drs,                      // boolean
      
      // Derived state
      isAccelerating: throttle > 50,
      isBraking: brake > 50,
      isDRSActive: drs,

      // Metadata
      teamColor: driver.team_colour ? `#${driver.team_colour}` : '#888',
      teamName: driver.team_name || 'Unknown',
    };

    // Log packet
    this.logger.logPacket(driverNumber, {
      progress,
      speed,
      throttle,
      brake,
      gear,
      drs,
      sector,
    });

    return packet;
  }

  /**
   * Batch normalize multiple drivers' location and car data
   * Matches location and car_data by timestamp proximity
   */
  normalizeBatch(drivers, locations = [], carDataMap = {}) {
    const normalized = [];

    for (const driver of drivers) {
      const dNum = driver.driver_number;
      
      // Find most recent location for this driver
      const driverLocation = locations
        .filter(loc => loc.driver_number === dNum)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

      // Get car data for this driver
      const driverCarData = carDataMap[dNum]?.[0] || null;

      const packet = this.normalize(driver, driverLocation, driverCarData);
      if (packet) normalized.push(packet);
    }

    return normalized;
  }

  getLogger() {
    return this.logger;
  }

  end() {
    this.logger.endSession();
  }
}

// ── Replay System ──────────────────────────────────────────────────────────────
class TelemetryReplayer {
  constructor(logsDir = path.join(__dirname, '../logs')) {
    this.logsDir = logsDir;
  }

  /**
   * Load a telemetry log file and return packets in chronological order
   */
  loadLog(filename) {
    const filePath = path.join(this.logsDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Log file not found: ${filename}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const packets = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return packets;
  }

  /**
   * Get list of available log files
   */
  listLogs() {
    if (!fs.existsSync(this.logsDir)) return [];
    return fs.readdirSync(this.logsDir)
      .filter(f => f.startsWith('telemetry-') && f.endsWith('.ndjson'));
  }

  /**
   * Stream packets from a log file at real-time speed
   * Returns an async generator
   */
  async *streamLog(filename, speed = 1.0) {
    const packets = this.loadLog(filename);
    if (packets.length === 0) return;

    let lastTime = new Date(packets[0].timestamp).getTime();
    
    for (const packet of packets) {
      const currentTime = new Date(packet.timestamp).getTime();
      const delta = currentTime - lastTime;
      
      // Adjust delay based on replay speed
      const delayMs = delta / speed;
      if (delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      yield packet;
      lastTime = currentTime;
    }
  }
}

module.exports = {
  TelemetryLogger,
  TelemetryNormalizer,
  TelemetryReplayer,
  TEAM_COLORS,
  TRACK_LENGTHS_M,
};
