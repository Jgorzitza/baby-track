import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import type { PropsWithChildren } from 'react';
import { AppContext, type AppContextValue } from './lib/app-context.shared';
import { useFeedingTimer } from './features/feed/useFeedingTimer';
import { useSleepTimer } from './features/sleep/useSleepTimer';
import { useUnitPrefs } from './lib/useUnitPrefs';
import { HomeScreen } from './routes/home/HomeScreen';
import { DoctorScreen } from './routes/doctor/DoctorScreen';
import { DoctorQuestionsScreen } from './routes/doctor/DoctorQuestionsScreen';
import { MedicalTimelineScreen } from './routes/medical-timeline/MedicalTimelineScreen';
import { clearPendingMutations, countPendingMutations, getPendingMutations, enqueueMutation } from './lib/offline/queue';
import { replayPendingMutations } from './lib/offline/replay';
import type { ActiveFeedSession, DoctorSummary, HomeSummary, QueueItem, ReportsSummary, SyncStatus } from './lib/types';

const noopAsync = async (): Promise<void> => {};

const baseSyncStatus: SyncStatus = {
  state: 'idle',
  pendingCount: 0,
  message: 'Ready',
  lastSyncedAt: null,
};

const baseHomeSummary: HomeSummary = {
  todaySleepSeconds: 8_400,
  todayFeedCount: 6,
  todayDiaperCount: 5,
  activeSleepSession: null,
  activeFeedSession: null,
};

const baseDoctorSummary: DoctorSummary = {
  windowLabel: '48h',
  appointment: null,
  appointments: [],
  questions: [],
  feedSessionCount: 3,
  sleepTotalSeconds: 12_600,
  diaperCounts: { wet: 3, dirty: 2, both: 1 },
  temperatures: [],
  medications: [],
  symptoms: [],
  growthMeasurements: [],
  timeline: [],
};

const baseReportsSummary: ReportsSummary = {
  windowLabel: '7 days',
  sleepDailyAverageSeconds: 50_400,
  feedDailyAverage: 8.5,
  diaperDailyAverage: 6.2,
  medicationCount: 2,
  symptomCount: 1,
  lastMedicationSummary: 'Tylenol (1.5ml)',
  latestSymptomSummary: 'Poor appetite',
  timeline: [],
};

const createContextValue = (overrides: Partial<AppContextValue> = {}): AppContextValue => ({
  authStatus: 'signed_in',
  session: null,
  isLoading: false,
  isRefreshing: false,
  isOnline: true,
  configError: null,
  actionError: null,
  profile: {
    id: 'profile-1',
    email: 'parent@example.com',
    fullName: 'Parent One',
    createdAt: '2026-04-08T00:00:00.000Z',
    updatedAt: '2026-04-08T00:00:00.000Z',
  },
  household: {
    id: 'household-1',
    name: 'Leo Family',
    inviteCode: 'JOIN1234',
    createdAt: '2026-04-08T00:00:00.000Z',
    updatedAt: '2026-04-08T00:00:00.000Z',
  },
  members: [
    {
      id: 'member-1',
      householdId: 'household-1',
      profileId: 'profile-1',
      role: 'parent',
      status: 'active',
      joinedAt: '2026-04-08T00:00:00.000Z',
    },
  ],
  baby: {
    id: 'baby-1',
    householdId: 'household-1',
    name: 'Leo',
    birthDate: '2026-03-20T08:30:00.000Z',
    birthWeight: 3.4,
    birthLength: 51,
    createdAt: '2026-04-08T00:00:00.000Z',
    updatedAt: '2026-04-08T00:00:00.000Z',
  },
  homeSummary: baseHomeSummary,
  reportsSummary: baseReportsSummary,
  doctorSummary: baseDoctorSummary,
  timeline: [],
  syncStatus: baseSyncStatus,
  reportsWindowDays: 7,
  doctorWindow: '48h',
  selectedDoctorAppointmentId: null,
  signIn: noopAsync,
  signUp: noopAsync,
  requestPasswordReset: noopAsync,
  updatePassword: noopAsync,
  signOut: noopAsync,
  clearActionError: () => undefined,
  createHousehold: noopAsync,
  joinHousehold: noopAsync,
  saveBabyProfile: noopAsync,
  startSleep: noopAsync,
  finishSleep: noopAsync,
  toggleFeedSide: async () => undefined,
  finishFeedSession: noopAsync,
  undoFeedAction: noopAsync,
  resetFeedSession: noopAsync,
  logDiaper: noopAsync,
  logTemperature: noopAsync,
  logMedication: noopAsync,
  logSymptom: noopAsync,
  logGrowth: noopAsync,
  saveDoctorAppointment: noopAsync,
  deleteDoctorAppointment: noopAsync,
  addDoctorQuestion: noopAsync,
  answerDoctorQuestion: noopAsync,
  deleteDoctorQuestion: noopAsync,
  addDoctorNote: noopAsync,
  setSelectedDoctorAppointment: async () => undefined,
  setReportsWindowDays: async () => undefined,
  setDoctorWindow: async () => undefined,
  refreshData: noopAsync,
  ...overrides,
});

const ContextWrapper = ({ children, value }: PropsWithChildren<{ value: AppContextValue }>) => (
  <BrowserRouter>
    <AppContext value={value}>{children}</AppContext>
  </BrowserRouter>
);

const renderWithContext = (ui: React.ReactNode, value: AppContextValue) =>
  render(<ContextWrapper value={value}>{ui}</ContextWrapper>);

describe('Offline Queue', () => {
  beforeEach(async () => {
    await clearPendingMutations();
  });

  it('replays pending mutations in FIFO order', async () => {
    const events: string[] = [];
    const first: QueueItem = {
      id: 'm-1',
      entityType: 'sleep_session',
      entityId: 'sleep-1',
      operation: 'start_sleep',
      householdId: 'household-1',
      babyId: 'baby-1',
      payload: { id: 'sleep-1' },
      createdAt: '2026-04-08T10:00:00.000Z',
      attemptCount: 0,
      lastError: null,
      nextRetryAt: null,
    };
    const second: QueueItem = {
      ...first,
      id: 'm-2',
      entityId: 'sleep-2',
      createdAt: '2026-04-08T10:00:01.000Z',
    };

    await enqueueMutation(first);
    await enqueueMutation(second);

    const result = await replayPendingMutations(async (item) => {
      events.push(item.id);
    });

    expect(result.didStopOnFatal).toBe(false);
    expect(events).toEqual(['m-1', 'm-2']);
    expect(await countPendingMutations()).toBe(0);
  });

  it('keeps retryable failures queued with backoff', async () => {
    const queued: QueueItem = {
      id: 'm-1',
      entityType: 'sleep_session',
      entityId: 'sleep-1',
      operation: 'start_sleep',
      householdId: 'household-1',
      babyId: 'baby-1',
      payload: { id: 'sleep-1' },
      createdAt: '2026-04-08T10:00:00.000Z',
      attemptCount: 0,
      lastError: null,
      nextRetryAt: null,
    };
    await enqueueMutation(queued);

    const result = await replayPendingMutations(async () => {
      throw new Error('Failed to fetch');
    });

    const pending = await getPendingMutations();
    expect(result.didStopOnFatal).toBe(false);
    expect(pending).toHaveLength(1);
    expect(pending[0].attemptCount).toBe(1);
    expect(pending[0].lastError).toMatch(/Failed to fetch/);
    expect(pending[0].nextRetryAt).not.toBeNull();
  });
});

describe('Unit Preferences', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
      clear: () => {
        storage.clear();
      },
    });
  });

  afterEach(() => {
    storage.clear();
    vi.unstubAllGlobals();
  });

  it('falls back to defaults when stored preferences are invalid JSON', () => {
    localStorage.setItem('bbtrack_unit_prefs', '{"temp":');

    const { result } = renderHook(() => useUnitPrefs());

    expect(result.current.prefs).toEqual({
      temp: 'C',
      weight: 'kg',
      volume: 'ml',
      length: 'cm',
    });
  });

  it('falls back to defaults when stored preferences have the wrong shape', () => {
    localStorage.setItem('bbtrack_unit_prefs', JSON.stringify({ temp: 'Kelvin', volume: 'ml' }));

    const { result } = renderHook(() => useUnitPrefs());

    expect(result.current.prefs).toEqual({
      temp: 'C',
      weight: 'kg',
      volume: 'ml',
      length: 'cm',
    });
  });
});

describe('Core Timer Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-08T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('useFeedingTimer derives active and completed segment totals', () => {
    const activeFeedSession: ActiveFeedSession = {
      id: 'feed-1',
      householdId: 'household-1',
      babyId: 'baby-1',
      feedType: 'breast',
      startedAt: '2026-04-08T11:45:00.000Z',
      activeSide: 'right',
      activeSegmentId: 'seg-2',
      segments: [
        {
          id: 'seg-1',
          feedingSessionId: 'feed-1',
          householdId: 'household-1',
          babyId: 'baby-1',
          side: 'left',
          startedAt: '2026-04-08T11:45:00.000Z',
          endedAt: '2026-04-08T11:50:00.000Z',
        },
        {
          id: 'seg-2',
          feedingSessionId: 'feed-1',
          householdId: 'household-1',
          babyId: 'baby-1',
          side: 'right',
          startedAt: '2026-04-08T11:55:00.000Z',
          endedAt: null,
        },
      ],
      history: [],
    };

    const value = createContextValue({
      homeSummary: {
        ...baseHomeSummary,
        activeFeedSession,
      },
    });

    const { result } = renderHook(() => useFeedingTimer(), {
      wrapper: ({ children }) => <ContextWrapper value={value}>{children}</ContextWrapper>,
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.activeSide).toBe('right');
    expect(result.current.leftSeconds).toBe(300);
    expect(result.current.rightSeconds).toBe(301);
    expect(result.current.totalSeconds).toBe(601);
  });

  it('useSleepTimer derives elapsed time from session timestamps', () => {
    const value = createContextValue({
      homeSummary: {
        ...baseHomeSummary,
        activeSleepSession: {
          id: 'sleep-1',
          householdId: 'household-1',
          babyId: 'baby-1',
          startedAt: '2026-04-08T11:50:00.000Z',
          endedAt: null,
          durationSeconds: null,
          createdBy: 'profile-1',
          notes: null,
        },
      },
    });

    const { result } = renderHook(() => useSleepTimer(), {
      wrapper: ({ children }) => <ContextWrapper value={value}>{children}</ContextWrapper>,
    });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    expect(result.current.isAsleep).toBe(true);
    expect(result.current.elapsed).toBe(601);
  });
});

describe('Connected Screens', () => {
  it('HomeScreen renders active feed and sleep sessions from app state', () => {
    const value = createContextValue({
      homeSummary: {
        ...baseHomeSummary,
        activeFeedSession: {
          id: 'feed-1',
          householdId: 'household-1',
          babyId: 'baby-1',
          feedType: 'breast',
          startedAt: '2026-04-08T11:45:00.000Z',
          activeSide: 'left',
          activeSegmentId: 'seg-1',
          segments: [
            {
              id: 'seg-1',
              feedingSessionId: 'feed-1',
              householdId: 'household-1',
              babyId: 'baby-1',
              side: 'left',
              startedAt: new Date(Date.now() - 300_000).toISOString(),
              endedAt: null,
            },
          ],
          history: [],
        },
        activeSleepSession: {
          id: 'sleep-1',
          householdId: 'household-1',
          babyId: 'baby-1',
          startedAt: new Date(Date.now() - 600_000).toISOString(),
          endedAt: null,
          durationSeconds: null,
          createdBy: 'profile-1',
          notes: null,
        },
      },
    });

    renderWithContext(<HomeScreen />, value);

    expect(screen.getByText(/Feed Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleep Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Feeding \(LEFT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Sleep Session/i)).toBeInTheDocument();
  });

  it('DoctorScreen shows no-appointment state and cached summary data', () => {
    const value = createContextValue({
      doctorSummary: {
        ...baseDoctorSummary,
        appointment: null,
        questions: [
          {
            id: 'q-1',
            householdId: 'household-1',
            babyId: 'baby-1',
            doctorAppointmentId: 'appt-1',
            question: 'Is his weight gain normal?',
            answeredAt: null,
            answerNotes: null,
            createdAt: '2026-04-08T00:00:00.000Z',
            createdBy: 'profile-1',
          },
        ],
      },
    });

    renderWithContext(<DoctorScreen />, value);
    expect(screen.getByText(/No scheduled appointment/i)).toBeInTheDocument();
    expect(screen.getByText(/1 questions ready for review/i)).toBeInTheDocument();
  });

  it('DoctorQuestionsScreen handles empty questions gracefully', () => {
    renderWithContext(<DoctorQuestionsScreen />, createContextValue());
    expect(screen.getByText(/No questions listed yet/i)).toBeInTheDocument();
  });

  it('MedicalTimelineScreen renders dense timeline entries', () => {
    const value = createContextValue({
      timeline: Array.from({ length: 6 }, (_, index) => ({
        id: `event-${index + 1}`,
        householdId: 'household-1',
        babyId: 'baby-1',
        sourceTable: index % 2 === 0 ? 'diaper_events' : 'health_events',
        sourceId: `source-${index + 1}`,
        eventType: index % 2 === 0 ? 'diaper' : 'temperature',
        occurredAt: `2026-04-08T0${index}:00:00.000Z`,
        title: index % 2 === 0 ? `Diaper ${index + 1}` : `Temperature ${index + 1}`,
        summary: index % 2 === 0 ? 'Tracked diaper' : '37.8C',
      })),
    });

    renderWithContext(<MedicalTimelineScreen />, value);
    expect(screen.getByText(/Diaper 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Temperature 2/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tracked diaper/i).length).toBeGreaterThan(2);
  });
});
