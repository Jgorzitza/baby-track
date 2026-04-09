import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { ActiveFeedSession, QueueItem, ReportsSummary, DoctorSummary, HomeSummary, SleepSession, MedicalTimelineEvent } from '../types';

interface SummaryCacheRecord<TData> {
  key: string;
  householdId: string;
  babyId: string;
  data: TData;
  updatedAt: string;
}

interface QueryCacheRecord<TData> {
  key: string;
  householdId: string;
  babyId: string;
  data: TData;
  updatedAt: string;
}

interface SyncMetaRecord {
  key: string;
  value: string;
}

export type PendingMutationRecord = QueueItem;
export type ActiveSessionRecord =
  | {
      key: `sleep:${string}`;
      householdId: string;
      babyId: string;
      type: 'sleep';
      data: SleepSession;
      updatedAt: string;
    }
  | {
      key: `feed:${string}`;
      householdId: string;
      babyId: string;
      type: 'feed';
      data: ActiveFeedSession;
      updatedAt: string;
    };

interface OfflineDbSchema extends DBSchema {
  pending_mutations: {
    key: string;
    value: PendingMutationRecord;
    indexes: {
      by_created_at: string;
      by_household_baby: string;
    };
  };
  active_sessions: {
    key: string;
    value: ActiveSessionRecord;
    indexes: {
      by_household_baby: string;
    };
  };
  summary_cache: {
    key: string;
    value: SummaryCacheRecord<HomeSummary | ReportsSummary | DoctorSummary>;
    indexes: {
      by_household_baby: string;
    };
  };
  query_cache: {
    key: string;
    value: QueryCacheRecord<MedicalTimelineEvent[]>;
    indexes: {
      by_household_baby: string;
    };
  };
  sync_meta: {
    key: string;
    value: SyncMetaRecord;
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineDbSchema>> | null = null;

export const getOfflineDb = (): Promise<IDBPDatabase<OfflineDbSchema>> => {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDbSchema>('bbtrack-offline', 1, {
      upgrade(db) {
        const pending = db.createObjectStore('pending_mutations', { keyPath: 'id' });
        pending.createIndex('by_created_at', 'createdAt');
        pending.createIndex('by_household_baby', ['householdId', 'babyId']);

        const active = db.createObjectStore('active_sessions', { keyPath: 'key' });
        active.createIndex('by_household_baby', ['householdId', 'babyId']);

        const summary = db.createObjectStore('summary_cache', { keyPath: 'key' });
        summary.createIndex('by_household_baby', ['householdId', 'babyId']);

        const query = db.createObjectStore('query_cache', { keyPath: 'key' });
        query.createIndex('by_household_baby', ['householdId', 'babyId']);

        db.createObjectStore('sync_meta', { keyPath: 'key' });
      },
    });
  }

  return dbPromise;
};
