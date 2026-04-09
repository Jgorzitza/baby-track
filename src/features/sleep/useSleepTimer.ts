import { useEffect, useState } from 'react';
import { useActiveSleepSession } from '../../lib/app-hooks';
import { diffSeconds, formatElapsedClock } from '../../lib/time';

export const useSleepTimer = () => {
  const { activeSleepSession, startSleep, finishSleep } = useActiveSleepSession();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!activeSleepSession) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [activeSleepSession]);

  void tick;
  const elapsed = activeSleepSession ? diffSeconds(activeSleepSession.startedAt) : 0;

  const toggleSleep = async (): Promise<void> => {
    if (activeSleepSession) {
      await finishSleep();
      return;
    }
    await startSleep();
  };

  return {
    isAsleep: Boolean(activeSleepSession),
    startTime: activeSleepSession ? new Date(activeSleepSession.startedAt) : null,
    elapsed,
    toggleSleep,
    formatElapsed: formatElapsedClock,
  };
};
