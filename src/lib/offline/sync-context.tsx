import { createContext, use } from 'react';
import type { SyncStatus } from '../types';

export const defaultSyncStatus: SyncStatus = {
  state: 'idle',
  pendingCount: 0,
  message: 'Ready',
  lastSyncedAt: null,
};

export const SyncStatusContext = createContext<SyncStatus>(defaultSyncStatus);

export const useSyncStatus = (): SyncStatus => use(SyncStatusContext);
