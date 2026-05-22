/**
 * RaceContext — central state for all live race data
 * Wraps the app so every component can access live data
 * without prop-drilling.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useRealtime } from '../hooks/useRealtime';

const RaceContext = createContext(null);

export function RaceProvider({ children }) {
  const { snapshot, status } = useRealtime();

  // UI state — selected driver, lap, session type, active view
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [sessionType,    setSessionType]    = useState('Race');
  const [activeView,     setActiveView]     = useState('racemap');    // racemap | timing | telemetry | compare | strategy
  const [replayLap,      setReplayLap]      = useState(null);        // null = live
  const [compDriverA,    setCompDriverA]    = useState('VER');
  const [compDriverB,    setCompDriverB]    = useState('LEC');

  const toggleDriver = useCallback((driver) => {
    setSelectedDriver(prev => prev?.driverNumber === driver.driverNumber ? null : driver);
  }, []);

  const drivers = useMemo(() => snapshot?.drivers || [], [snapshot]);
  const selectedDriverLive = useMemo(
    () => drivers.find(d => d.driverNumber === selectedDriver?.driverNumber) || selectedDriver,
    [drivers, selectedDriver]
  );

  const value = {
    // Live data
    snapshot,
    status,
    drivers,
    weather:      snapshot?.weather      || {},
    raceControl:  snapshot?.raceControl  || [],
    pitStops:     snapshot?.pitStops     || [],
    stints:       snapshot?.stints       || [],
    currentLap:   snapshot?.currentLap   || 1,
    totalLaps:    snapshot?.totalLaps    || 78,
    sessionName:  snapshot?.sessionName  || 'Monaco Grand Prix',
    circuitName:  snapshot?.circuitName  || 'Circuit de Monaco',
    isLive:       snapshot?.isLive       ?? false,
    isMock:       snapshot?.isMock       ?? true,
    flag:         snapshot?.flag         || 'GREEN',
    safetycar:    snapshot?.safetycar    || false,
    fastestLap:   snapshot?.fastestLap   || null,

    // UI state
    selectedDriver: selectedDriverLive,
    sessionType,
    activeView,
    replayLap,
    compDriverA,
    compDriverB,

    // Actions
    setSelectedDriver: toggleDriver,
    setSessionType,
    setActiveView,
    setReplayLap,
    setCompDriverA,
    setCompDriverB,
  };

  return <RaceContext.Provider value={value}>{children}</RaceContext.Provider>;
}

export const useRace = () => {
  const ctx = useContext(RaceContext);
  if (!ctx) throw new Error('useRace must be used within RaceProvider');
  return ctx;
};
