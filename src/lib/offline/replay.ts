import { getPendingMutations, removePendingMutation, updatePendingMutation } from './queue';
import { isRetryableError } from '../time';
import type { QueueItem } from '../types';

export interface ReplayResult {
  processedCount: number;
  didStopOnFatal: boolean;
  lastError: string | null;
}

export type MutationExecutor = (item: QueueItem) => Promise<void>;

const nextBackoffMs = (attemptCount: number): number => Math.min(60_000, 2 ** attemptCount * 1_000);

export const replayPendingMutations = async (executor: MutationExecutor): Promise<ReplayResult> => {
  const pending = await getPendingMutations();
  let processedCount = 0;
  let lastError: string | null = null;

  for (const item of pending) {
    if (item.nextRetryAt && new Date(item.nextRetryAt).getTime() > Date.now()) {
      continue;
    }

    try {
      await executor(item);
      await removePendingMutation(item.id);
      processedCount += 1;
      lastError = null;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown replay error';
      lastError = message;

      if (!isRetryableError(message)) {
        await updatePendingMutation({
          ...item,
          attemptCount: item.attemptCount + 1,
          lastError: message,
          nextRetryAt: null,
        });
        return {
          processedCount,
          didStopOnFatal: true,
          lastError: message,
        };
      }

      const nextRetryAt = new Date(Date.now() + nextBackoffMs(item.attemptCount + 1)).toISOString();
      await updatePendingMutation({
        ...item,
        attemptCount: item.attemptCount + 1,
        lastError: message,
        nextRetryAt,
      });
    }
  }

  return {
    processedCount,
    didStopOnFatal: false,
    lastError,
  };
};
