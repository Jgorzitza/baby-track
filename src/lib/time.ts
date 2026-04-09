export const getNowIso = (): string => new Date().toISOString();

export const formatElapsedClock = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
};

export const formatMinutesSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const diffSeconds = (startedAt: string, endedAt?: string | null): number => {
  const startMs = new Date(startedAt).getTime();
  const endMs = new Date(endedAt ?? getNowIso()).getTime();
  return Math.max(0, Math.floor((endMs - startMs) / 1000));
};

export const isoHoursAgo = (hours: number): string => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

export const isRetryableError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('network') ||
    normalized.includes('failed to fetch') ||
    normalized.includes('fetch') ||
    normalized.includes('timed out') ||
    normalized.includes('offline') ||
    normalized.includes('service unavailable')
  );
};
