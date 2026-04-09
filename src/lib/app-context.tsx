import { startTransition, useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authRepository, appRepository, formatSyncStatus, type PendingMutation } from './supabase/repository';
import { createClientId } from './ids';
import { getMissingConfigMessage, isSupabaseConfigured } from './env';
import {
  cacheDoctorSummary,
  cacheHomeSummary,
  cacheReportsSummary,
  cacheTimeline,
  clearActiveFeedCache,
  clearActiveSleepCache,
  getActiveFeedCache,
  getActiveSleepCache,
  getCachedDoctorSummary,
  getCachedHomeSummary,
  getCachedReportsSummary,
  getCachedTimeline,
  getSyncMeta,
  setActiveFeedCache,
  setActiveSleepCache,
  setSyncMeta,
} from './offline/cache';
import { countPendingMutations, enqueueMutation } from './offline/queue';
import { replayPendingMutations } from './offline/replay';
import { defaultSyncStatus, SyncStatusContext } from './offline/sync-context';
import { diffSeconds, formatElapsedClock, getNowIso } from './time';
import type {
  ActiveFeedSession,
  AppBootstrap,
  AppConfigError,
  BabyProfile,
  DiaperEvent,
  DoctorAppointment,
  DoctorQuestion,
  DoctorSummary,
  FeedOutcome,
  FeedOutcomeFlags,
  FeedSegmentDraft,
  FeedSide,
  FeedType,
  HomeSummary,
  Household,
  HouseholdMember,
  MedicalTimelineEvent,
  ParentProfile,
  QueueItem,
  ReportsSummary,
  SleepSession,
} from './types';
import { AppContext, type AppContextValue } from './app-context.shared';

const emptyHomeSummary: HomeSummary = {
  todaySleepSeconds: 0,
  todayFeedCount: 0,
  todayDiaperCount: 0,
  activeSleepSession: null,
  activeFeedSession: null,
};

const emptyReportsSummary: ReportsSummary = {
  windowLabel: '7 days',
  sleepDailyAverageSeconds: 0,
  feedDailyAverage: 0,
  diaperDailyAverage: 0,
  medicationCount: 0,
  symptomCount: 0,
  lastMedicationSummary: null,
  latestSymptomSummary: null,
  timeline: [],
};

const emptyDoctorSummary = (windowLabel: DoctorSummary['windowLabel']): DoctorSummary => ({
  windowLabel,
  appointment: null,
  appointments: [],
  questions: [],
  feedSessionCount: 0,
  sleepTotalSeconds: 0,
  diaperCounts: {
    wet: 0,
    dirty: 0,
    both: 0,
  },
  temperatures: [],
  medications: [],
  symptoms: [],
  growthMeasurements: [],
  timeline: [],
});

const bootstrapMetaKey = 'bootstrap';
const lastSyncedMetaKey = 'last_synced_at';

const readCachedBootstrap = async (): Promise<AppBootstrap | null> => {
  const value = await getSyncMeta(bootstrapMetaKey);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as AppBootstrap;
  } catch {
    return null;
  }
};

const cloneSegments = (segments: ActiveFeedSession['segments']): ActiveFeedSession['segments'] =>
  segments.map((segment) => ({ ...segment }));

const buildHistorySnapshot = (session: ActiveFeedSession) => ({
  activeSide: session.activeSide,
  activeSegmentId: session.activeSegmentId,
  segments: cloneSegments(session.segments),
});

const buildFeedFlags = (input: {
  outcome: FeedOutcome;
  latchIssue: boolean;
  sleepyFeed: boolean;
  refusedFeed: boolean;
  spitUp: boolean;
}): FeedOutcomeFlags => ({
  outcome:
    input.outcome === 'good' || input.outcome === 'fair' || input.outcome === 'poor'
      ? input.outcome
      : input.outcome === 'refused'
        ? 'poor'
        : 'fair',
  latchIssue: input.latchIssue,
  sleepyFeed: input.sleepyFeed,
  refusedFeed: input.refusedFeed,
  spitUp: input.spitUp,
});

const orderAppointments = (appointments: DoctorAppointment[]): DoctorAppointment[] =>
  [...appointments].sort((left, right) => {
    const leftPriority = left.status === 'planned' ? 0 : 1;
    const rightPriority = right.status === 'planned' ? 0 : 1;
    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftTime = left.scheduledAt ?? left.createdAt;
    const rightTime = right.scheduledAt ?? right.createdAt;
    return leftTime.localeCompare(rightTime);
  });

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [authStatus, setAuthStatus] = useState<'loading' | 'signed_out' | 'signed_in'>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [configError] = useState<AppConfigError | null>(() =>
    isSupabaseConfigured
      ? null
      : {
          title: 'Supabase Not Configured',
          message: getMissingConfigMessage(),
        }
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [homeSummary, setHomeSummary] = useState<HomeSummary>(emptyHomeSummary);
  const [reportsSummary, setReportsSummary] = useState<ReportsSummary>(emptyReportsSummary);
  const [doctorWindowState, setDoctorWindowState] = useState<DoctorSummary['windowLabel']>('48h');
  const [doctorSummary, setDoctorSummary] = useState<DoctorSummary>(() => emptyDoctorSummary('48h'));
  const [selectedDoctorAppointmentId, setSelectedDoctorAppointmentId] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<MedicalTimelineEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState(() => defaultSyncStatus);
  const sessionRef = useRef<Session | null>(null);
  const isOnlineRef = useRef(isOnline);
  const householdRef = useRef<Household | null>(null);
  const babyRef = useRef<BabyProfile | null>(null);
  const doctorWindowRef = useRef<DoctorSummary['windowLabel']>(doctorWindowState);
  const selectedDoctorAppointmentIdRef = useRef<string | null>(selectedDoctorAppointmentId);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    householdRef.current = household;
  }, [household]);

  useEffect(() => {
    babyRef.current = baby;
  }, [baby]);

  useEffect(() => {
    doctorWindowRef.current = doctorWindowState;
  }, [doctorWindowState]);

  useEffect(() => {
    selectedDoctorAppointmentIdRef.current = selectedDoctorAppointmentId;
  }, [selectedDoctorAppointmentId]);

  const refreshSyncLabel = useCallback(async (hasError = false): Promise<void> => {
    const pendingCount = await countPendingMutations();
    const lastSyncedAt = await getSyncMeta(lastSyncedMetaKey);
    setSyncStatus(formatSyncStatus(pendingCount, isOnlineRef.current, lastSyncedAt, hasError));
  }, []);

  const persistBootstrap = async (nextBootstrap: AppBootstrap): Promise<void> => {
    await setSyncMeta(bootstrapMetaKey, JSON.stringify(nextBootstrap));
  };

  const setBootstrap = (nextBootstrap: AppBootstrap): void => {
    setProfile(nextBootstrap.profile);
    setHousehold(nextBootstrap.household);
    setMembers(nextBootstrap.members);
    setBaby(nextBootstrap.baby);
  };

  const hydrateCachedData = useCallback(async (nextHousehold: Household | null, nextBaby: BabyProfile | null): Promise<void> => {
    if (!nextBaby || !nextHousehold) {
      setHomeSummary(emptyHomeSummary);
      setReportsSummary(emptyReportsSummary);
      setDoctorSummary(emptyDoctorSummary(doctorWindowRef.current));
      setSelectedDoctorAppointmentId(null);
      setTimeline([]);
      return;
    }

    const [cachedHome, cachedReports, cachedDoctor, cachedTimeline, cachedSleep, cachedFeed] = await Promise.all([
      getCachedHomeSummary(nextBaby.id),
      getCachedReportsSummary(nextBaby.id),
      getCachedDoctorSummary(nextBaby.id),
      getCachedTimeline(nextBaby.id),
      getActiveSleepCache(nextBaby.id),
      getActiveFeedCache(nextBaby.id),
    ]);

    setHomeSummary(
      cachedHome
        ? {
            ...cachedHome,
            activeSleepSession: cachedSleep ?? cachedHome.activeSleepSession,
            activeFeedSession: cachedFeed ?? cachedHome.activeFeedSession,
          }
        : {
            ...emptyHomeSummary,
            activeSleepSession: cachedSleep,
            activeFeedSession: cachedFeed,
          }
    );
    setReportsSummary(cachedReports ?? emptyReportsSummary);
    setDoctorSummary(cachedDoctor ?? emptyDoctorSummary(doctorWindowRef.current));
    setSelectedDoctorAppointmentId(cachedDoctor?.appointment?.id ?? null);
    setTimeline(cachedTimeline);
  }, []);

  const refreshRemoteData = useCallback(async (targetBaby: BabyProfile, targetHousehold: Household, windowLabel: DoctorSummary['windowLabel']): Promise<void> => {
    const [nextHome, nextReports, nextDoctorBase, nextTimeline, cachedSleep, cachedFeed, appointments] = await Promise.all([
      appRepository.getHomeSummary(targetBaby.id),
      appRepository.getReportsSummary(targetBaby.id),
      appRepository.getDoctorSummary(targetBaby.id, windowLabel),
      appRepository.getTimeline(targetBaby.id),
      getActiveSleepCache(targetBaby.id),
      getActiveFeedCache(targetBaby.id),
      appRepository.listDoctorAppointments(targetBaby.id),
    ]);

    const mergedHome: HomeSummary = {
      ...nextHome,
      activeSleepSession: nextHome.activeSleepSession ?? cachedSleep,
      activeFeedSession: nextHome.activeFeedSession ?? cachedFeed,
    };

    const sortedAppointments = orderAppointments(appointments);
    const nextSelectedAppointmentId =
      (selectedDoctorAppointmentIdRef.current &&
      sortedAppointments.some((appointment) => appointment.id === selectedDoctorAppointmentIdRef.current))
        ? selectedDoctorAppointmentIdRef.current
        : nextDoctorBase.appointment?.id ?? null;
    const nextQuestions = nextSelectedAppointmentId
      ? await appRepository.listDoctorQuestions(targetBaby.id, nextSelectedAppointmentId)
      : [];
    const nextSelectedAppointment =
      sortedAppointments.find((appointment) => appointment.id === nextSelectedAppointmentId) ?? null;
    const nextDoctor: DoctorSummary = {
      ...nextDoctorBase,
      appointment: nextSelectedAppointment,
      appointments: sortedAppointments,
      questions: nextQuestions,
    };

    await Promise.all([
      cacheHomeSummary(targetHousehold.id, targetBaby.id, mergedHome),
      cacheReportsSummary(targetHousehold.id, targetBaby.id, nextReports),
      cacheDoctorSummary(targetHousehold.id, targetBaby.id, nextDoctor),
      cacheTimeline(targetHousehold.id, targetBaby.id, nextTimeline),
      setSyncMeta(lastSyncedMetaKey, getNowIso()),
    ]);

    startTransition(() => {
      setHomeSummary(mergedHome);
      setReportsSummary(nextReports);
      setDoctorSummary(nextDoctor);
      setSelectedDoctorAppointmentId(nextSelectedAppointmentId);
      setTimeline(nextTimeline);
    });
  }, []);

  const executeMutation = async (item: QueueItem): Promise<void> => {
    switch (item.operation) {
      case 'start_sleep':
        await appRepository.startSleep(item.payload as Parameters<typeof appRepository.startSleep>[0]);
        return;
      case 'finish_sleep':
        await appRepository.finishSleep(item.payload as Parameters<typeof appRepository.finishSleep>[0]);
        return;
      case 'start_feed_session':
        await appRepository.startFeedSession(item.payload as unknown as Parameters<typeof appRepository.startFeedSession>[0]);
        return;
      case 'upsert_feed_segment':
        await appRepository.upsertFeedSegment(item.payload as unknown as FeedSegmentDraft);
        return;
      case 'finish_feed_session': {
        const payload = item.payload as unknown as {
          sessionId: string;
          householdId: string;
          babyId: string;
          finishedAt: string;
          bottleAmount: number | null;
          bottleUnit: 'ml' | 'oz' | null;
          flags: FeedOutcomeFlags;
        };
        await appRepository.finishFeedSession(payload);
        return;
      }
      case 'log_diaper':
        await appRepository.logDiaper(item.payload as Parameters<typeof appRepository.logDiaper>[0]);
        return;
      case 'log_temperature':
        await appRepository.logTemperature(item.payload as Parameters<typeof appRepository.logTemperature>[0]);
        return;
      case 'log_medication':
        await appRepository.logMedication(item.payload as Parameters<typeof appRepository.logMedication>[0]);
        return;
      case 'log_symptom':
        await appRepository.logSymptom(item.payload as Parameters<typeof appRepository.logSymptom>[0]);
        return;
      case 'log_growth':
        await appRepository.logGrowth(item.payload as Parameters<typeof appRepository.logGrowth>[0]);
        return;
      case 'upsert_doctor_appointment':
        await appRepository.upsertDoctorAppointment(item.payload as Parameters<typeof appRepository.upsertDoctorAppointment>[0]);
        return;
      case 'delete_doctor_appointment':
        await appRepository.deleteDoctorAppointment(item.payload as Parameters<typeof appRepository.deleteDoctorAppointment>[0]);
        return;
      case 'add_doctor_question':
        await appRepository.addDoctorQuestion(item.payload as Parameters<typeof appRepository.addDoctorQuestion>[0]);
        return;
      case 'delete_doctor_question':
        await appRepository.deleteDoctorQuestion(item.payload as Parameters<typeof appRepository.deleteDoctorQuestion>[0]);
        return;
      case 'add_doctor_note':
        await appRepository.addDoctorNote(item.payload as Parameters<typeof appRepository.addDoctorNote>[0]);
        return;
      default:
        return;
    }
  };

  const replayAndRefresh = useCallback(async (
    targetBaby = babyRef.current,
    targetHousehold = householdRef.current,
    windowLabel = doctorWindowRef.current
  ): Promise<void> => {
    if (!isOnlineRef.current || !sessionRef.current || isSyncingRef.current) {
      await refreshSyncLabel();
      return;
    }

    isSyncingRef.current = true;
    try {
      const replayResult = await replayPendingMutations(executeMutation);
      if (targetBaby && targetHousehold) {
        await refreshRemoteData(targetBaby, targetHousehold, windowLabel);
      }
      await refreshSyncLabel(replayResult.didStopOnFatal);
      if (replayResult.didStopOnFatal && replayResult.lastError) {
        setActionError(replayResult.lastError);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [refreshRemoteData, refreshSyncLabel]);

  const loadSessionState = useEffectEvent(async (nextSession: Session | null): Promise<void> => {
    setSession(nextSession);

    if (!nextSession) {
      setAuthStatus('signed_out');
      setProfile(null);
      setHousehold(null);
      setMembers([]);
      setBaby(null);
      setHomeSummary(emptyHomeSummary);
      setReportsSummary(emptyReportsSummary);
      setDoctorSummary(emptyDoctorSummary(doctorWindowRef.current));
      setSelectedDoctorAppointmentId(null);
      setTimeline([]);
      await refreshSyncLabel();
      return;
    }

    setAuthStatus('signed_in');

    const cachedBootstrap = await readCachedBootstrap();
    if (cachedBootstrap) {
      setBootstrap(cachedBootstrap);
      await hydrateCachedData(cachedBootstrap.household, cachedBootstrap.baby);
    }

    try {
      const nextBootstrap = await appRepository.getBootstrap();
      setBootstrap(nextBootstrap);
      await persistBootstrap(nextBootstrap);
      await hydrateCachedData(nextBootstrap.household, nextBootstrap.baby);
      if (nextBootstrap.household && nextBootstrap.baby) {
        await replayAndRefresh(nextBootstrap.baby, nextBootstrap.household, doctorWindowRef.current);
      } else {
        await refreshSyncLabel();
      }
    } catch (error) {
      if (!cachedBootstrap) {
        setActionError(error instanceof Error ? error.message : 'Unable to load app data');
      }
    }
  });

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      setIsLoading(true);
      if (!isSupabaseConfigured) {
        setAuthStatus('signed_out');
        setIsLoading(false);
        return;
      }

      try {
        const nextSession = await authRepository.getSession();
        if (isMounted) {
          await loadSessionState(nextSession);
        }
      } catch (error) {
        if (isMounted) {
          setActionError(error instanceof Error ? error.message : 'Unable to initialize session');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    const unsubscribe = authRepository.onAuthStateChange((nextSession) => {
      void loadSessionState(nextSession);
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, []);

  const handleOnline = useEffectEvent(() => {
    setIsOnline(true);
    void replayAndRefresh();
  });

  const handleOffline = useEffectEvent(() => {
    setIsOnline(false);
    void refreshSyncLabel();
  });

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    void refreshSyncLabel();
  }, [isOnline, refreshSyncLabel]);

  const queueAndMaybeReplay = async (item: PendingMutation): Promise<void> => {
    await enqueueMutation(item);
    await refreshSyncLabel();
    if (isOnline) {
      await replayAndRefresh();
    }
  };

  const withMutation = async (fn: () => Promise<void>): Promise<void> => {
    setActionError(null);
    setIsRefreshing(true);
    try {
      await fn();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Action failed');
      throw error;
    } finally {
      setIsRefreshing(false);
    }
  };

  const requireBootstrap = (): { profile: ParentProfile; household: Household; baby: BabyProfile } => {
    if (!profile || !household || !baby) {
      throw new Error('Finish household and baby setup first');
    }
    return { profile, household, baby };
  };

  const updateHomeState = (updater: (previous: HomeSummary) => HomeSummary): void => {
    startTransition(() => setHomeSummary((previous) => updater(previous)));
  };

  const upsertTimelineEvent = (nextEvent: MedicalTimelineEvent): void => {
    startTransition(() =>
      setTimeline((previous) => {
        const filtered = previous.filter(
          (event) => !(event.sourceTable === nextEvent.sourceTable && event.sourceId === nextEvent.sourceId)
        );
        return [nextEvent, ...filtered].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
      })
    );
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    await withMutation(async () => {
      await authRepository.signIn(email, password);
    });
  };

  const signUp = async (email: string, password: string): Promise<void> => {
    await withMutation(async () => {
      await authRepository.signUp(email, password);
    });
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    await withMutation(async () => {
      await authRepository.requestPasswordReset(email);
    });
  };

  const updatePassword = async (password: string): Promise<void> => {
    await withMutation(async () => {
      await authRepository.updatePassword(password);
    });
  };

  const signOut = async (): Promise<void> => {
    await withMutation(async () => {
      await authRepository.signOut();
    });
  };

  const createHousehold = async (name: string): Promise<void> => {
    await withMutation(async () => {
      const nextBootstrap = await appRepository.createHousehold(name);
      setBootstrap(nextBootstrap);
      await persistBootstrap(nextBootstrap);
      await hydrateCachedData(nextBootstrap.household, nextBootstrap.baby);
      await refreshSyncLabel();
    });
  };

  const joinHousehold = async (inviteCode: string): Promise<void> => {
    await withMutation(async () => {
      const nextBootstrap = await appRepository.joinHouseholdByCode(inviteCode);
      setBootstrap(nextBootstrap);
      await persistBootstrap(nextBootstrap);
      await hydrateCachedData(nextBootstrap.household, nextBootstrap.baby);
      await refreshSyncLabel();
    });
  };

  const saveBabyProfile = async (input: {
    name: string;
    birthDate: string;
    birthWeight: number | null;
    birthLength: number | null;
  }): Promise<void> => {
    await withMutation(async () => {
      if (!household) {
        throw new Error('Create or join a household first');
      }
      const savedBaby = await appRepository.saveBabyProfile({
        babyId: baby?.id ?? createClientId(),
        householdId: household.id,
        name: input.name,
        birthDate: input.birthDate,
        birthWeight: input.birthWeight,
        birthLength: input.birthLength,
        clientCreatedAt: getNowIso(),
      });
      const nextBootstrap = {
        profile: profile!,
        household,
        members,
        baby: savedBaby,
      };
      setBaby(savedBaby);
      await persistBootstrap(nextBootstrap);
      await hydrateCachedData(household, savedBaby);
      await replayAndRefresh(savedBaby, household, doctorWindowState);
    });
  };

  const startSleep = async (): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      if (homeSummary.activeSleepSession) {
        return;
      }

      const now = getNowIso();
      const activeSession: SleepSession = {
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        startedAt: now,
        endedAt: null,
        durationSeconds: null,
        createdBy: base.profile.id,
        notes: null,
      };

      await setActiveSleepCache(base.household.id, base.baby.id, activeSession);
      updateHomeState((previous) => ({ ...previous, activeSleepSession: activeSession }));
      upsertTimelineEvent({
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        sourceTable: 'sleep_sessions',
        sourceId: activeSession.id,
        eventType: 'sleep',
        occurredAt: now,
        title: 'Sleep session',
        summary: 'In progress',
      });

      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'sleep_session',
        entityId: activeSession.id,
        operation: 'start_sleep',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          sleepSessionId: activeSession.id,
          householdId: base.household.id,
          babyId: base.baby.id,
          startTime: now,
          clientCreatedAt: now,
          notes: null,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const finishSleep = async (): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const activeSession = homeSummary.activeSleepSession;
      if (!activeSession) {
        return;
      }
      const now = getNowIso();
      const durationSeconds = diffSeconds(activeSession.startedAt, now);
      await clearActiveSleepCache(base.baby.id);
      updateHomeState((previous) => ({
        ...previous,
        todaySleepSeconds: previous.todaySleepSeconds + durationSeconds,
        activeSleepSession: null,
      }));
      upsertTimelineEvent({
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        sourceTable: 'sleep_sessions',
        sourceId: activeSession.id,
        eventType: 'sleep',
        occurredAt: activeSession.startedAt,
        title: 'Sleep session',
        summary: formatElapsedClock(durationSeconds),
      });
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'sleep_session',
        entityId: activeSession.id,
        operation: 'finish_sleep',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          sleepSessionId: activeSession.id,
          householdId: base.household.id,
          babyId: base.baby.id,
          endTime: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const writeActiveFeed = async (nextSession: ActiveFeedSession | null): Promise<void> => {
    const base = requireBootstrap();
    if (nextSession) {
      await setActiveFeedCache(base.household.id, base.baby.id, nextSession);
    } else {
      await clearActiveFeedCache(base.baby.id);
    }
    updateHomeState((previous) => ({ ...previous, activeFeedSession: nextSession }));
  };

  const toggleFeedSide = async (side: FeedSide, feedType: Extract<FeedType, 'breast' | 'pumping'> = 'breast'): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      let nextSession = homeSummary.activeFeedSession;

      if (!nextSession) {
        const sessionId = createClientId();
        nextSession = {
          id: sessionId,
          householdId: base.household.id,
          babyId: base.baby.id,
          feedType,
          startedAt: now,
          activeSide: null,
          activeSegmentId: null,
          segments: [],
          history: [],
        };
        await queueAndMaybeReplay({
          id: createClientId(),
          entityType: 'feeding_session',
          entityId: sessionId,
          operation: 'start_feed_session',
          householdId: base.household.id,
          babyId: base.baby.id,
          payload: {
            sessionId,
            householdId: base.household.id,
            babyId: base.baby.id,
            startedAt: now,
            feedType,
          },
          createdAt: now,
          attemptCount: 0,
          lastError: null,
          nextRetryAt: null,
        });
      }

      const history = [...nextSession.history, buildHistorySnapshot(nextSession)].slice(-20);
      const nextSegments = cloneSegments(nextSession.segments);

      if (nextSession.activeSide === side && nextSession.activeSegmentId) {
        const endingSegment = nextSegments.find((segment) => segment.id === nextSession!.activeSegmentId);
        if (endingSegment) {
          endingSegment.endedAt = now;
          await queueAndMaybeReplay({
            id: createClientId(),
            entityType: 'feeding_segment',
            entityId: endingSegment.id,
            operation: 'upsert_feed_segment',
            householdId: base.household.id,
            babyId: base.baby.id,
            payload: endingSegment,
            createdAt: now,
            attemptCount: 0,
            lastError: null,
            nextRetryAt: null,
          });
        }

        await writeActiveFeed({
          ...nextSession,
          activeSide: null,
          activeSegmentId: null,
          segments: nextSegments,
          history,
        });
        return;
      }

      if (nextSession.activeSide && nextSession.activeSegmentId) {
        const endingSegment = nextSegments.find((segment) => segment.id === nextSession!.activeSegmentId);
        if (endingSegment) {
          endingSegment.endedAt = now;
          await queueAndMaybeReplay({
            id: createClientId(),
            entityType: 'feeding_segment',
            entityId: endingSegment.id,
            operation: 'upsert_feed_segment',
            householdId: base.household.id,
            babyId: base.baby.id,
            payload: endingSegment,
            createdAt: now,
            attemptCount: 0,
            lastError: null,
            nextRetryAt: null,
          });
        }
      }

      const nextSegment: FeedSegmentDraft = {
        id: createClientId(),
        feedingSessionId: nextSession.id,
        householdId: base.household.id,
        babyId: base.baby.id,
        side,
        startedAt: now,
        endedAt: null,
      };
      nextSegments.push(nextSegment);
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'feeding_segment',
        entityId: nextSegment.id,
        operation: 'upsert_feed_segment',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: nextSegment,
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });

      await writeActiveFeed({
        ...nextSession,
        activeSide: side,
        activeSegmentId: nextSegment.id,
        segments: nextSegments,
        history,
      });
    });
  };

  const resetFeedSession = async (): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      await clearActiveFeedCache(base.baby.id);
      updateHomeState((previous) => ({ ...previous, activeFeedSession: null }));
    });
  };

  const undoFeedAction = async (): Promise<void> => {
    await withMutation(async () => {
      const activeSession = homeSummary.activeFeedSession;
      if (!activeSession || activeSession.history.length === 0) {
        return;
      }

      const lastSnapshot = activeSession.history[activeSession.history.length - 1];
      const nextSession: ActiveFeedSession = {
        ...activeSession,
        activeSide: lastSnapshot.activeSide,
        activeSegmentId: lastSnapshot.activeSegmentId,
        segments: cloneSegments(lastSnapshot.segments),
        history: activeSession.history.slice(0, -1),
      };
      await writeActiveFeed(nextSession);
    });
  };

  const finishFeedSession = async (input: {
    feedType: FeedType;
    outcome: FeedOutcome;
    latchIssue: boolean;
    sleepyFeed: boolean;
    refusedFeed: boolean;
    spitUp: boolean;
    bottleAmount: number | null;
    bottleUnit: 'ml' | 'oz' | null;
  }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      let activeSession = homeSummary.activeFeedSession;

      if (!activeSession && input.feedType === 'bottle') {
        const draftSession: ActiveFeedSession = {
          id: createClientId(),
          householdId: base.household.id,
          babyId: base.baby.id,
          feedType: 'bottle',
          startedAt: now,
          activeSide: null,
          activeSegmentId: null,
          segments: [],
          history: [],
        };
        activeSession = draftSession;
        await queueAndMaybeReplay({
          id: createClientId(),
          entityType: 'feeding_session',
          entityId: draftSession.id,
          operation: 'start_feed_session',
          householdId: base.household.id,
          babyId: base.baby.id,
          payload: {
            sessionId: draftSession.id,
            householdId: base.household.id,
            babyId: base.baby.id,
            startedAt: draftSession.startedAt,
            feedType: 'bottle',
          },
          createdAt: now,
          attemptCount: 0,
          lastError: null,
          nextRetryAt: null,
        });
      }

      if (!activeSession) {
        throw new Error('No active feed session to finish');
      }

      const nextSegments = cloneSegments(activeSession.segments);
      if (activeSession.activeSide && activeSession.activeSegmentId) {
        const endingSegment = nextSegments.find((segment) => segment.id === activeSession!.activeSegmentId);
        if (endingSegment) {
          endingSegment.endedAt = now;
          await queueAndMaybeReplay({
            id: createClientId(),
            entityType: 'feeding_segment',
            entityId: endingSegment.id,
            operation: 'upsert_feed_segment',
            householdId: base.household.id,
            babyId: base.baby.id,
            payload: endingSegment,
            createdAt: now,
            attemptCount: 0,
            lastError: null,
            nextRetryAt: null,
          });
        }
      }

      const totalSeconds = nextSegments.reduce(
        (sum, segment) => sum + (segment.endedAt ? diffSeconds(segment.startedAt, segment.endedAt) : 0),
        0
      );

      await clearActiveFeedCache(base.baby.id);
      updateHomeState((previous) => ({
        ...previous,
        todayFeedCount: previous.todayFeedCount + 1,
        activeFeedSession: null,
      }));
      upsertTimelineEvent({
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        sourceTable: 'feeding_sessions',
        sourceId: activeSession.id,
        eventType: 'feed',
        occurredAt: activeSession.startedAt,
        title:
          input.feedType === 'bottle'
            ? 'Bottle feed'
            : input.feedType === 'pumping'
              ? 'Pumping session'
              : 'Breastfeed',
        summary:
          input.feedType === 'bottle'
            ? `${input.bottleAmount ?? 0}${input.bottleUnit ?? 'ml'}`
            : `${Math.round(totalSeconds / 60)}m total`,
      });

      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'feeding_session',
        entityId: activeSession.id,
        operation: 'finish_feed_session',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          sessionId: activeSession.id,
          householdId: base.household.id,
          babyId: base.baby.id,
          finishedAt: now,
          bottleAmount: input.bottleAmount,
          bottleUnit: input.bottleUnit,
          flags: buildFeedFlags(input),
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const logDiaper = async (input: {
    diaperType: 'wet' | 'dirty' | 'both';
    stoolColor: string | null;
    stoolConsistency: DiaperEvent['stoolConsistency'];
    mucus: boolean;
    blood: boolean;
    urineNote: string | null;
    notes: string | null;
  }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const id = createClientId();
      updateHomeState((previous) => ({
        ...previous,
        todayDiaperCount: previous.todayDiaperCount + 1,
      }));
      upsertTimelineEvent({
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        sourceTable: 'diaper_events',
        sourceId: id,
        eventType: 'diaper',
        occurredAt: now,
        title: `${input.diaperType[0].toUpperCase()}${input.diaperType.slice(1)} diaper`,
        summary: input.stoolColor ?? input.urineNote,
      });
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'diaper_event',
        entityId: id,
        operation: 'log_diaper',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id,
          householdId: base.household.id,
          babyId: base.baby.id,
          diaperType: input.diaperType,
          stoolColor: input.stoolColor,
          stoolConsistency: input.stoolConsistency,
          mucus: input.mucus,
          blood: input.blood,
          urineNote: input.urineNote,
          notes: input.notes,
          occurredAt: now,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const logTemperature = async (input: { value: number; unit: 'C' | 'F'; notes: string | null }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const id = createClientId();
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          temperatures: [
            {
              id,
              householdId: base.household.id,
              babyId: base.baby.id,
              value: input.value,
              unit: input.unit,
              occurredAt: now,
              notes: input.notes,
              createdBy: base.profile.id,
            },
            ...previous.temperatures,
          ],
        }))
      );
      upsertTimelineEvent({
        id: createClientId(),
        householdId: base.household.id,
        babyId: base.baby.id,
        sourceTable: 'health_events',
        sourceId: id,
        eventType: 'temperature',
        occurredAt: now,
        title: 'Temperature',
        summary: `${input.value}${input.unit}`,
      });
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'temperature_event',
        entityId: id,
        operation: 'log_temperature',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id,
          householdId: base.household.id,
          babyId: base.baby.id,
          value: input.value,
          unit: input.unit,
          notes: input.notes,
          occurredAt: now,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const logMedication = async (input: { medicationName: string; dosage: string; notes: string | null }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const id = createClientId();
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          medications: [
            {
              id,
              householdId: base.household.id,
              babyId: base.baby.id,
              medicationName: input.medicationName,
              dosage: input.dosage,
              occurredAt: now,
              notes: input.notes,
              createdBy: base.profile.id,
            },
            ...previous.medications,
          ],
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'medication_event',
        entityId: id,
        operation: 'log_medication',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id,
          householdId: base.household.id,
          babyId: base.baby.id,
          medicationName: input.medicationName,
          dosage: input.dosage,
          notes: input.notes,
          occurredAt: now,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const logSymptom = async (input: { symptom: string; notes: string | null }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const id = createClientId();
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          symptoms: [
            {
              id,
              householdId: base.household.id,
              babyId: base.baby.id,
              symptom: input.symptom,
              notes: input.notes,
              occurredAt: now,
              createdBy: base.profile.id,
            },
            ...previous.symptoms,
          ],
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'symptom_event',
        entityId: id,
        operation: 'log_symptom',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id,
          householdId: base.household.id,
          babyId: base.baby.id,
          symptom: input.symptom,
          notes: input.notes,
          occurredAt: now,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const logGrowth = async (input: {
    weight: number | null;
    weightUnit: 'kg' | 'lb' | null;
    length: number | null;
    lengthUnit: 'cm' | 'in' | null;
    notes: string | null;
  }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const id = createClientId();
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          growthMeasurements: [
            {
              id,
              householdId: base.household.id,
              babyId: base.baby.id,
              weight: input.weight,
              weightUnit: input.weightUnit,
              length: input.length,
              lengthUnit: input.lengthUnit,
              occurredAt: now,
              notes: input.notes,
              createdBy: base.profile.id,
            },
            ...previous.growthMeasurements,
          ],
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'growth_measurement',
        entityId: id,
        operation: 'log_growth',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id,
          householdId: base.household.id,
          babyId: base.baby.id,
          weight: input.weight,
          weightUnit: input.weightUnit,
          length: input.length,
          lengthUnit: input.lengthUnit,
          notes: input.notes,
          occurredAt: now,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const saveDoctorAppointment = async (input: {
    id?: string;
    provider: string | null;
    scheduledAt: string | null;
    location: string | null;
    planningNotes: string | null;
    visitNotes: string | null;
    status: DoctorAppointment['status'];
  }): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const appointmentId = input.id ?? selectedDoctorAppointmentIdRef.current ?? createClientId();
      const currentAppointment =
        doctorSummary.appointments.find((appointment) => appointment.id === appointmentId) ??
        (doctorSummary.appointment?.id === appointmentId ? doctorSummary.appointment : null);
      const optimisticAppointment: DoctorAppointment = {
        id: appointmentId,
        householdId: base.household.id,
        babyId: base.baby.id,
        provider: input.provider,
        scheduledAt: input.scheduledAt,
        location: input.location,
        planningNotes: input.planningNotes,
        visitNotes: input.visitNotes,
        status: input.status,
        createdBy: base.profile.id,
        createdAt: currentAppointment?.createdAt ?? now,
        updatedAt: now,
      };
      selectedDoctorAppointmentIdRef.current = appointmentId;
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          appointment: optimisticAppointment,
          appointments: orderAppointments([
            optimisticAppointment,
            ...previous.appointments.filter((appointment) => appointment.id !== appointmentId),
          ]),
          questions: previous.appointment?.id === appointmentId ? previous.questions : [],
        }))
      );
      setSelectedDoctorAppointmentId(appointmentId);
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'doctor_appointment',
        entityId: appointmentId,
        operation: 'upsert_doctor_appointment',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          id: appointmentId,
          householdId: base.household.id,
          babyId: base.baby.id,
          provider: input.provider,
          scheduledAt: input.scheduledAt,
          location: input.location,
          planningNotes: input.planningNotes,
          visitNotes: input.visitNotes,
          status: input.status,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const deleteDoctorAppointment = async (appointmentId: string): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const remainingAppointments = doctorSummary.appointments.filter((appointment) => appointment.id !== appointmentId);
      const nextAppointment = remainingAppointments[0] ?? null;
      selectedDoctorAppointmentIdRef.current = nextAppointment?.id ?? null;
      setSelectedDoctorAppointmentId(nextAppointment?.id ?? null);
      startTransition(() => {
        setDoctorSummary((previous) => ({
          ...previous,
          appointment: previous.appointment?.id === appointmentId ? nextAppointment : previous.appointment,
          appointments: remainingAppointments,
          questions:
            previous.appointment?.id === appointmentId
              ? []
              : previous.questions.filter((question) => question.doctorAppointmentId !== appointmentId),
          timeline: previous.timeline.filter(
            (event) => !(event.sourceTable === 'doctor_appointments' && event.sourceId === appointmentId)
          ),
        }));
        setTimeline((previous) =>
          previous.filter(
            (event) => !(event.sourceTable === 'doctor_appointments' && event.sourceId === appointmentId)
          )
        );
      });
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'doctor_appointment',
        entityId: appointmentId,
        operation: 'delete_doctor_appointment',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          appointmentId,
          householdId: base.household.id,
          babyId: base.baby.id,
        },
        createdAt: getNowIso(),
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const addDoctorQuestion = async (question: string, appointmentIdOverride?: string): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const appointmentId = appointmentIdOverride ?? selectedDoctorAppointmentIdRef.current ?? createClientId();
      const questionId = createClientId();
      const optimisticAppointment: DoctorAppointment = doctorSummary.appointment?.id === appointmentId
        ? doctorSummary.appointment
        : {
            id: appointmentId,
            householdId: base.household.id,
            babyId: base.baby.id,
            provider: null,
            scheduledAt: null,
            location: null,
            planningNotes: null,
            visitNotes: null,
            status: 'unscheduled',
            createdBy: base.profile.id,
            createdAt: now,
            updatedAt: now,
          };
      const optimisticQuestion: DoctorQuestion = {
        id: questionId,
        householdId: base.household.id,
        babyId: base.baby.id,
        doctorAppointmentId: appointmentId,
        question,
        createdAt: now,
        createdBy: base.profile.id,
      };
      selectedDoctorAppointmentIdRef.current = appointmentId;
      setSelectedDoctorAppointmentId(appointmentId);
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          appointment: optimisticAppointment,
          appointments: orderAppointments([
            optimisticAppointment,
            ...previous.appointments.filter((appointment) => appointment.id !== appointmentId),
          ]),
          questions:
            previous.appointment?.id === appointmentId || previous.appointment == null
              ? [...previous.questions, optimisticQuestion]
              : [optimisticQuestion],
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'doctor_question',
        entityId: questionId,
        operation: 'add_doctor_question',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          questionId,
          appointmentId,
          householdId: base.household.id,
          babyId: base.baby.id,
          question,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const deleteDoctorQuestion = async (questionId: string): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          questions: previous.questions.filter((question) => question.id !== questionId),
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'doctor_question',
        entityId: questionId,
        operation: 'delete_doctor_question',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          questionId,
          householdId: base.household.id,
        },
        createdAt: getNowIso(),
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const addDoctorNote = async (note: string, appointmentIdOverride?: string): Promise<void> => {
    await withMutation(async () => {
      const base = requireBootstrap();
      const now = getNowIso();
      const appointmentId = appointmentIdOverride ?? selectedDoctorAppointmentIdRef.current ?? createClientId();
      const currentAppointment = doctorSummary.appointments.find((appointment) => appointment.id === appointmentId) ?? doctorSummary.appointment;
      const nextVisitNotes = [currentAppointment?.visitNotes, `${new Date(now).toLocaleString()} ${note}`]
        .filter((value) => Boolean(value && value.trim().length > 0))
        .join('\n');
      const optimisticAppointment: DoctorAppointment = currentAppointment ?? {
        id: appointmentId,
        householdId: base.household.id,
        babyId: base.baby.id,
        provider: null,
        scheduledAt: null,
        location: null,
        planningNotes: null,
        visitNotes: null,
        status: 'unscheduled',
        createdBy: base.profile.id,
        createdAt: now,
        updatedAt: now,
      };
      selectedDoctorAppointmentIdRef.current = appointmentId;
      setSelectedDoctorAppointmentId(appointmentId);
      startTransition(() =>
        setDoctorSummary((previous) => ({
          ...previous,
          appointment: {
            ...optimisticAppointment,
            visitNotes: nextVisitNotes,
            updatedAt: now,
          },
          appointments: orderAppointments([
            {
              ...optimisticAppointment,
              visitNotes: nextVisitNotes,
              updatedAt: now,
            },
            ...previous.appointments.filter((appointment) => appointment.id !== appointmentId),
          ]),
        }))
      );
      await queueAndMaybeReplay({
        id: createClientId(),
        entityType: 'doctor_note',
        entityId: appointmentId,
        operation: 'add_doctor_note',
        householdId: base.household.id,
        babyId: base.baby.id,
        payload: {
          appointmentId,
          householdId: base.household.id,
          babyId: base.baby.id,
          note,
          clientCreatedAt: now,
        },
        createdAt: now,
        attemptCount: 0,
        lastError: null,
        nextRetryAt: null,
      });
    });
  };

  const setSelectedDoctorAppointment = async (appointmentId: string | null): Promise<void> => {
    setSelectedDoctorAppointmentId(appointmentId);
    selectedDoctorAppointmentIdRef.current = appointmentId;

    if (!baby) {
      return;
    }

    const selectedAppointment = appointmentId
      ? doctorSummary.appointments.find((appointment) => appointment.id === appointmentId) ?? null
      : null;
    const nextQuestions =
      selectedAppointment ? await appRepository.listDoctorQuestions(baby.id, selectedAppointment.id) : [];
    startTransition(() =>
      setDoctorSummary((previous) => ({
        ...previous,
        appointment: selectedAppointment,
        questions: nextQuestions,
      }))
    );
  };

  const setDoctorWindow = async (windowLabel: DoctorSummary['windowLabel']): Promise<void> => {
    setDoctorWindowState(windowLabel);
    if (baby && household && session && isOnline) {
      await withMutation(async () => {
        await refreshRemoteData(baby, household, windowLabel);
      });
    } else {
      setDoctorSummary((previous) => ({ ...previous, windowLabel }));
    }
  };

  const refreshData = async (): Promise<void> => {
    await withMutation(async () => {
      if (baby && household) {
        await replayAndRefresh(baby, household, doctorWindowState);
      }
    });
  };

  const value: AppContextValue = {
    authStatus,
    session,
    isLoading,
    isRefreshing,
    isOnline,
    configError,
    actionError,
    profile,
    household,
    members,
    baby,
    homeSummary,
    reportsSummary,
    doctorSummary,
    timeline,
    syncStatus,
    doctorWindow: doctorWindowState,
    selectedDoctorAppointmentId,
    signIn,
    signUp,
    requestPasswordReset,
    updatePassword,
    signOut,
    clearActionError: () => setActionError(null),
    createHousehold,
    joinHousehold,
    saveBabyProfile,
    startSleep,
    finishSleep,
    toggleFeedSide,
    finishFeedSession,
    undoFeedAction,
    resetFeedSession,
    logDiaper,
    logTemperature,
    logMedication,
    logSymptom,
    logGrowth,
    saveDoctorAppointment,
    deleteDoctorAppointment,
    addDoctorQuestion,
    deleteDoctorQuestion,
    addDoctorNote,
    setSelectedDoctorAppointment,
    setDoctorWindow,
    refreshData,
  };

  return (
    <SyncStatusContext value={syncStatus}>
      <AppContext value={value}>{children}</AppContext>
    </SyncStatusContext>
  );
};
