/**
 * TelemetryPanel — Professional Driver Telemetry Display
 * Shows real-time speed, throttle, brake, gear, DRS, and tyre info
 */

import { useMemo } from 'react';
import { useRace } from '../context/RaceContext';
import './TelemetryPanel.css';

export default function TelemetryPanel() {
  const { selectedDriver, drivers } = useRace();

  if (!selectedDriver) {
    return (
      <div className="telemetry-panel">
        <div className="panel-header">
          <h3>📊 Telemetry</h3>
        </div>
        <div className="panel-empty">
          <p>Select a driver to view real-time telemetry</p>
        </div>
      </div>
    );
  }

  const driver = drivers.find(d => d.driverNumber === selectedDriver.driverNumber) || selectedDriver;
  const position = driver.position || 0;
  const isLeading = position === 1;

  // Telemetry metrics grid
  const telemetryMetrics = [
    {
      label: 'Speed',
      value: Math.round(driver.speed || 0),
      unit: 'km/h',
      icon: '🏎',
      color: `hsl(${Math.min(240, (driver.speed || 0) / 3)}deg, 100%, 50%)`,
      max: 340,
    },
    {
      label: 'Throttle',
      value: Math.round(driver.throttle || 0),
      unit: '%',
      icon: '▲',
      color: driver.throttle > 80 ? '#FF6B6B' : driver.throttle > 50 ? '#FFC107' : '#4CAF50',
      max: 100,
    },
    {
      label: 'Brake',
      value: Math.round(driver.brake || 0),
      unit: '%',
      icon: '■',
      color: driver.brake > 50 ? '#FF6B6B' : '#888',
      max: 100,
    },
    {
      label: 'Gear',
      value: driver.gear || '-',
      unit: '',
      icon: '⚙',
      color: '#27F4D2',
      isBig: true,
    },
    {
      label: 'RPM',
      value: Math.round((driver.rpm || 0) / 1000),
      unit: 'k',
      icon: '↻',
      color: driver.rpm > 13000 ? '#FF6B6B' : '#FFB74D',
      max: 15,
    },
    {
      label: 'DRS',
      value: driver.drs ? 'ACTIVE' : 'CLOSED',
      unit: '',
      icon: '⚡',
      color: driver.drs ? '#00E676' : '#888',
      pulse: driver.drs,
    },
  ];

  return (
    <div className="telemetry-panel">
      <div className="panel-header">
        <h3>📊 Telemetry</h3>
        <div className="driver-badge" style={{ borderColor: driver.teamColor }}>
          <div
            className="badge-color"
            style={{ backgroundColor: driver.teamColor }}
          />
          <span>{driver.abbreviation}</span>
        </div>
      </div>

      {/* Driver Info Bar */}
      <div className="telemetry-driver-info">
        <div className="info-item">
          <span className="label">Driver</span>
          <span className="value">{driver.fullName || driver.abbreviation}</span>
        </div>
        <div className="info-item">
          <span className="label">Team</span>
          <span className="value">{driver.teamName || 'Unknown'}</span>
        </div>
        <div className="info-item">
          <span className="label">Position</span>
          <span className={`value ${isLeading ? 'leading' : ''}`}>
            {position || '-'} {isLeading && '👑'}
          </span>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="telemetry-metrics-grid">
        {telemetryMetrics.map((metric) => (
          <div
            key={metric.label}
            className={`metric-card ${metric.pulse ? 'pulse' : ''}`}
          >
            <div className="metric-header">
              <span className="metric-icon">{metric.icon}</span>
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className="metric-content">
              <span
                className="metric-value"
                style={{ color: metric.color }}
              >
                {metric.isBig ? metric.value : metric.value}
              </span>
              <span className="metric-unit" style={{ color: metric.color }}>
                {metric.unit}
              </span>
            </div>
            {metric.max && (
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min(100, (metric.value / metric.max) * 100)}%`,
                    backgroundColor: metric.color,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lap & Stint Info */}
      <div className="telemetry-lap-info">
        <div className="lap-item">
          <span className="label">Lap</span>
          <span className="value">{driver.lapNumber || 0}</span>
        </div>
        <div className="lap-item">
          <span className="label">Gap</span>
          <span className="value">
            {driver.gap !== null && driver.gap !== undefined
              ? `+${driver.gap.toFixed(3)}`
              : 'Leader'}
          </span>
        </div>
        <div className="lap-item">
          <span className="label">Interval</span>
          <span className="value">
            {driver.interval !== null && driver.interval !== undefined
              ? `+${driver.interval.toFixed(3)}`
              : '-'}
          </span>
        </div>
        <div className="lap-item">
          <span className="label">Tyre</span>
          <span className="value">
            {driver.compound?.[0] || '-'}
            <span className="stint-laps"> {driver.stintLapCount || 0}L</span>
          </span>
        </div>
      </div>

      {/* Sector Times */}
      {(driver.sector1 || driver.sector2 || driver.sector3) && (
        <div className="telemetry-sectors">
          <h4>Sector Times</h4>
          <div className="sectors-grid">
            <div className="sector">
              <span className="sector-label">S1</span>
              <span className="sector-time">{(driver.sector1 || 0).toFixed(3)}</span>
            </div>
            <div className="sector">
              <span className="sector-label">S2</span>
              <span className="sector-time">{(driver.sector2 || 0).toFixed(3)}</span>
            </div>
            <div className="sector">
              <span className="sector-label">S3</span>
              <span className="sector-time">{(driver.sector3 || 0).toFixed(3)}</span>
            </div>
          </div>
          {driver.lapDuration && (
            <div className="lap-time">
              <span>Lap: {driver.lapDuration.toFixed(3)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
