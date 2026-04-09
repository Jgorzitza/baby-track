import { useEffect, useState } from 'react';
import { useActiveFeedSession } from '../../lib/app-hooks';
import { formatMinutesSeconds, diffSeconds } from '../../lib/time';

const computeSideSeconds = (
  segments: { side: 'left' | 'right'; startedAt: string; endedAt: string | null }[],
  side: 'left' | 'right'
): number =>
  segments
    .filter((segment) => segment.side === side)
    .reduce((sum, segment) => sum + diffSeconds(segment.startedAt, segment.endedAt), 0);

export const useFeedingTimer = () => {
  const { activeFeedSession, toggleFeedSide, undoFeedAction, resetFeedSession } = useActiveFeedSession();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!activeFeedSession?.activeSide) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 1_000);

    return () => window.clearInterval(interval);
  }, [activeFeedSession?.activeSide]);

  const leftSeconds = activeFeedSession ? computeSideSeconds(activeFeedSession.segments, 'left') : 0;
  const rightSeconds = activeFeedSession ? computeSideSeconds(activeFeedSession.segments, 'right') : 0;
  void tick;

  return {
    activeSide: activeFeedSession?.activeSide ?? null,
    leftSeconds,
    rightSeconds,
    toggleSide: toggleFeedSide,
    undo: undoFeedAction,
    reset: resetFeedSession,
    formatTime: formatMinutesSeconds,
    totalSeconds: leftSeconds + rightSeconds,
    canUndo: (activeFeedSession?.history.length ?? 0) > 0,
  };
};
