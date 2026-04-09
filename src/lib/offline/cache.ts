import { getOfflineDb, type ActiveSessionRecord } from './db';
import type {
  ActiveFeedSession,
  DoctorSummary,
  HomeSummary,
  MedicalTimelineEvent,
  ReportsSummary,
  SleepSession,
} from '../types';

const summaryKey = (kind: 'home' | 'reports' | 'doctor', babyId: string) => `${kind}:${babyId}`;
const timelineKey = (babyId: string) => `timeline:${babyId}`;
const sleepKey = (babyId: string) => `sleep:${babyId}` as const;
const feedKey = (babyId: string) => `feed:${babyId}` as const;

export const cacheHomeSummary = async (householdId: string, babyId: string, data: HomeSummary): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('summary_cache', {
    key: summaryKey('home', babyId),
    householdId,
    babyId,
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const cacheReportsSummary = async (householdId: string, babyId: string, data: ReportsSummary): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('summary_cache', {
    key: summaryKey('reports', babyId),
    householdId,
    babyId,
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const cacheDoctorSummary = async (householdId: string, babyId: string, data: DoctorSummary): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('summary_cache', {
    key: summaryKey('doctor', babyId),
    householdId,
    babyId,
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const getCachedHomeSummary = async (babyId: string): Promise<HomeSummary | null> => {
  const db = await getOfflineDb();
  return (await db.get('summary_cache', summaryKey('home', babyId)))?.data as HomeSummary | undefined ?? null;
};

export const getCachedReportsSummary = async (babyId: string): Promise<ReportsSummary | null> => {
  const db = await getOfflineDb();
  return (await db.get('summary_cache', summaryKey('reports', babyId)))?.data as ReportsSummary | undefined ?? null;
};

export const getCachedDoctorSummary = async (babyId: string): Promise<DoctorSummary | null> => {
  const db = await getOfflineDb();
  return (await db.get('summary_cache', summaryKey('doctor', babyId)))?.data as DoctorSummary | undefined ?? null;
};

export const cacheTimeline = async (householdId: string, babyId: string, data: MedicalTimelineEvent[]): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('query_cache', {
    key: timelineKey(babyId),
    householdId,
    babyId,
    data,
    updatedAt: new Date().toISOString(),
  });
};

export const getCachedTimeline = async (babyId: string): Promise<MedicalTimelineEvent[]> => {
  const db = await getOfflineDb();
  return (await db.get('query_cache', timelineKey(babyId)))?.data ?? [];
};

export const setActiveSleepCache = async (householdId: string, babyId: string, data: SleepSession): Promise<void> => {
  const db = await getOfflineDb();
  const record: ActiveSessionRecord = {
    key: sleepKey(babyId),
    householdId,
    babyId,
    type: 'sleep',
    data,
    updatedAt: new Date().toISOString(),
  };
  await db.put('active_sessions', record);
};

export const clearActiveSleepCache = async (babyId: string): Promise<void> => {
  const db = await getOfflineDb();
  await db.delete('active_sessions', sleepKey(babyId));
};

export const getActiveSleepCache = async (babyId: string): Promise<SleepSession | null> => {
  const db = await getOfflineDb();
  const record = await db.get('active_sessions', sleepKey(babyId));
  return record?.type === 'sleep' ? record.data : null;
};

export const setActiveFeedCache = async (householdId: string, babyId: string, data: ActiveFeedSession): Promise<void> => {
  const db = await getOfflineDb();
  const record: ActiveSessionRecord = {
    key: feedKey(babyId),
    householdId,
    babyId,
    type: 'feed',
    data,
    updatedAt: new Date().toISOString(),
  };
  await db.put('active_sessions', record);
};

export const clearActiveFeedCache = async (babyId: string): Promise<void> => {
  const db = await getOfflineDb();
  await db.delete('active_sessions', feedKey(babyId));
};

export const getActiveFeedCache = async (babyId: string): Promise<ActiveFeedSession | null> => {
  const db = await getOfflineDb();
  const record = await db.get('active_sessions', feedKey(babyId));
  return record?.type === 'feed' ? record.data : null;
};

export const setSyncMeta = async (key: string, value: string): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('sync_meta', { key, value });
};

export const getSyncMeta = async (key: string): Promise<string | null> => {
  const db = await getOfflineDb();
  return (await db.get('sync_meta', key))?.value ?? null;
};
