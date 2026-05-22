/**
 * RaceMapView — Professional F1 Live Race Map Layout
 * Integrates LiveRaceMap, Leaderboard, and Telemetry panels
 */

import LiveRaceMap from './LiveRaceMap';
import LeaderboardPanel from './LeaderboardPanel';
import TelemetryPanel from './TelemetryPanel';
import './RaceMapView.css';

export default function RaceMapView() {
  return (
    <div className="race-map-view">
      {/* Left Panel: Leaderboard */}
      <div className="race-map-panel-left">
        <LeaderboardPanel />
      </div>

      {/* Center: Live Race Map */}
      <div className="race-map-center">
        <LiveRaceMap />
      </div>

      {/* Right Panel: Telemetry */}
      <div className="race-map-panel-right">
        <TelemetryPanel />
      </div>
    </div>
  );
}
