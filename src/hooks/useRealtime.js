/**
 * useRealtime — WebSocket hook with polling fallback
 * Connects to WS_URL from env, reconnects on drop,
 * falls back to REST polling if WebSocket unavailable.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL   = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const REST_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api') + '/snapshot';
const RECONNECT_DELAY = import.meta.env.VITE_RECONNECT_DELAY ? parseInt(import.meta.env.VITE_RECONNECT_DELAY) : 3000;
const POLL_INTERVAL   = import.meta.env.VITE_POLL_INTERVAL ? parseInt(import.meta.env.VITE_POLL_INTERVAL) : 4000;

export function useRealtime() {
  const [snapshot,   setSnapshot]   = useState(null);
  const [status,     setStatus]     = useState('connecting'); // connecting | live | polling | error
  const wsRef        = useRef(null);
  const pollTimerRef = useRef(null);
  const retryTimerRef= useRef(null);
  const mountedRef   = useRef(true);

  // ── REST fallback ──────────────────────────────────────────────────────────
  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    setStatus('polling');
    const poll = async () => {
      try {
        const res  = await fetch(REST_URL);
        const data = await res.json();
        if (mountedRef.current) setSnapshot(data);
      } catch { if (mountedRef.current) setStatus('error'); }
    };
    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL);
  }, []);

  const stopPolling = useCallback(() => {
    clearInterval(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

  // ── WebSocket connection ───────────────────────────────────────────────────
  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus('live');
        stopPolling();
        // heartbeat
        ws.send(JSON.stringify({ type: 'ping' }));
      };

      ws.onmessage = (evt) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(evt.data);
          if (msg.type === 'snapshot') setSnapshot(msg.data);
        } catch {}
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setStatus('polling');
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus('polling');
        startPolling();
        // schedule reconnect
        retryTimerRef.current = setTimeout(() => {
          stopPolling();
          connect();
        }, RECONNECT_DELAY);
      };
    } catch {
      setStatus('polling');
      startPolling();
    }
  }, [startPolling, stopPolling]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      stopPolling();
      clearTimeout(retryTimerRef.current);
    };
  }, [connect, stopPolling]);

  return { snapshot, status };
}
