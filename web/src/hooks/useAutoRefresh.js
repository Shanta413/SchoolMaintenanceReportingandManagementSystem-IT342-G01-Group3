import { useEffect, useRef } from "react";

// intervalMs = milliseconds between refreshes (default 1s)
export default function useAutoRefresh(refreshFn, intervalMs = 1000, enabled = true) {
  const savedCallback = useRef();

  // Remember the latest callback (refreshFn)
  useEffect(() => {
    savedCallback.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    if (!enabled) return;
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
