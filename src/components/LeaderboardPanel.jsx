/**
 * LeaderboardPanel — Live Race Order with Gaps, Intervals, and Tyre Info
 */

import { useMemo } from 'react';
import { useRace } from '../context/RaceContext';
import './LeaderboardPanel.css';

export default function LeaderboardPanel() {
  const { drivers, selectedDriver, setSelectedDriver, currentLap, totalLaps } = useRace();

  const sortedDrivers = useMemo(() => {
    return [...drivers].sort((a, b) => (a.position || 999) - (b.position || 999));
  }, [drivers]);

  const getTyreColor = (compound) => {
    if (!compound) return '#888';
    const c = compound.toUpperCase();
    if (c === 'SOFT' || c === 'S') return '#FF1744';
    if (c === 'MEDIUM' || c === 'M') return '#FFD600';
    if (c === 'HARD' || c === 'H') return '#E0E0E0';
    if (c === 'INTERMEDIATE' || c === 'I') return '#64DD17';
    if (c === 'WET' || c === 'W') return '#00B0FF';
    return '#888';
  };

  const getCompoundName = (compound) => {
    if (!compound) return '-';
    const c = compound.toUpperCase();
    if (c === 'SOFT' || c === 'S') return 'S';
    if (c === 'MEDIUM' || c === 'M') return 'M';
    if (c === 'HARD' || c === 'H') return 'H';
    if (c === 'INTERMEDIATE' || c === 'I') return 'I';
    if (c === 'WET' || c === 'W') return 'W';
    return c[0] || '-';
  };

  return (
    <div className="leaderboard-panel">
      <div className="leaderboard-header">
        <h3>🏆 Live Order</h3>
        <div className="lap-counter">
          <span className="lap-label">Lap</span>
          <span className="lap-value">{currentLap || 0}</span>
          <span className="lap-total">/ {totalLaps || 78}</span>
        </div>
      </div>

      <div className="leaderboard-scroll">
        <div className="leaderboard-list">
          {sortedDrivers.map((driver, idx) => {
            const isSelected = selectedDriver?.driverNumber === driver.driverNumber;
            const isLeading = driver.position === 1;
            const isDeltaSmall = driver.interval && driver.interval < 0.5;

            return (
              <div
                key={driver.driverNumber}
                className={`leaderboard-row ${isSelected ? 'selected' : ''} ${isLeading ? 'leading' : ''}`}
                onClick={() => setSelectedDriver(driver)}
                style={{ '--team-color': driver.teamColor }}
              >
                {/* Position */}
                <div className="col-position">
                  <span className={`position-badge ${isLeading ? 'p1' : ''}`}>
                    {driver.position || idx + 1}
                  </span>
                </div>

                {/* Driver Info */}
                <div className="col-driver">
                  <div className="driver-color" style={{ backgroundColor: driver.teamColor }} />
                  <div className="driver-name-abbr">
                    <div className="driver-name">{driver.abbreviation}</div>
                    <div className="driver-team">{driver.teamName?.split(' ')[0] || 'Unknown'}</div>
                  </div>
                </div>

                {/* Gap/Interval */}
                <div className="col-gap">
                  {isLeading ? (
                    <span className="gap-leader">LEADER</span>
                  ) : driver.gap !== null && driver.gap !== undefined ? (
                    <span className={`gap-value ${isDeltaSmall ? 'close' : ''}`}>
                      +{driver.gap.toFixed(3)}
                    </span>
                  ) : (
                    <span className="gap-value">-</span>
                  )}
                </div>

                {/* Interval (gap to car ahead) */}
                <div className="col-interval">
                  {driver.interval !== null && driver.interval !== undefined ? (
                    <span className={`interval-value ${isDeltaSmall ? 'close' : ''}`}>
                      +{driver.interval.toFixed(3)}
                    </span>
                  ) : (
                    <span className="interval-value">-</span>
                  )}
                </div>

                {/* Lap Time */}
                <div className="col-lap-time">
                  {driver.lapDuration ? (
                    <span className="lap-time">{driver.lapDuration.toFixed(3)}</span>
                  ) : (
                    <span className="lap-time">-</span>
                  )}
                </div>

                {/* Tyre Compound */}
                <div className="col-tyre">
                  <div
                    className="tyre-indicator"
                    style={{ backgroundColor: getTyreColor(driver.compound) }}
                    title={driver.compound || 'Unknown'}
                  >
                    {getCompoundName(driver.compound)}
                  </div>
                  <span className="stint-info">{driver.stintLapCount || 0}L</span>
                </div>

                {/* DRS Status */}
                <div className="col-drs">
                  {driver.drs ? (
                    <span className="drs-active">⚡</span>
                  ) : (
                    <span className="drs-closed">-</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="leaderboard-legend">
        <div className="legend-item">
          <span className="legend-symbol soft">S</span>
          <span>Soft</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol medium">M</span>
          <span>Medium</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol hard">H</span>
          <span>Hard</span>
        </div>
        <div className="legend-item">
          <span className="legend-symbol wet">W</span>
          <span>Wet</span>
        </div>
      </div>
    </div>
  );
}
