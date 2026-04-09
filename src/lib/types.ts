export type EntryType =
  | 'feed'
  | 'sleep'
  | 'diaper'
  | 'temperature'
  | 'medication'
  | 'symptom'
  | 'growth'
  | 'appointment'
  | 'note';

export type FeedType = 'breast' | 'bottle';
export type FeedSide = 'left' | 'right';
export type FeedSideState = FeedSide | null;
export type FeedOutcome = 'good' | 'fair' | 'poor' | 'latch_issue' | 'sleepy' | 'refused' | 'spit_up';
export type DiaperType = 'wet' | 'dirty' | 'both';
export type StoolConsistency = 'soft' | 'watery' | 'hard' | 'mucus' | 'bloody';
export type HealthType = 'temperature' | 'medication' | 'growth' | 'symptom';
export type AppointmentStatus = 'planned' | 'unscheduled' | 'completed' | 'cancelled';
export type SyncState = 'idle' | 'syncing' | 'offline' | 'error';

export interface ParentProfile {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  profileId: string;
  role: 'parent';
  status: 'active';
  joinedAt: string;
}

export interface BabyProfile {
  id: string;
  householdId: string;
  name: string;
  birthDate: string;
  birthWeight: number | null;
  birthLength: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSleepSession {
  id: string;
  householdId: string;
  babyId: string;
  startedAt: string;
  createdBy: string;
  notes?: string | null;
}

export interface SleepSession extends ActiveSleepSession {
  endedAt: string | null;
  durationSeconds: number | null;
}

export interface FeedingSegment {
  id: string;
  feedingSessionId: string;
  householdId: string;
  babyId: string;
  side: FeedSide;
  startedAt: string;
  endedAt: string | null;
}

export interface FeedUndoSnapshot {
  activeSide: FeedSideState;
  activeSegmentId: string | null;
  segments: FeedingSegment[];
}

export interface ActiveFeedSession {
  id: string;
  householdId: string;
  babyId: string;
  feedType: FeedType;
  startedAt: string;
  activeSide: FeedSideState;
  activeSegmentId: string | null;
  segments: FeedingSegment[];
  history: FeedUndoSnapshot[];
}

export interface FeedSession {
  id: string;
  householdId: string;
  babyId: string;
  feedType: FeedType;
  startedAt: string;
  finishedAt: string | null;
  outcome: FeedOutcome | null;
  latchIssue: boolean;
  sleepyFeed: boolean;
  refusedFeed: boolean;
  spitUp: boolean;
  bottleAmount: number | null;
  bottleUnit: 'ml' | 'oz' | null;
  createdBy: string;
  segments: FeedingSegment[];
}

export interface DiaperEvent {
  id: string;
  householdId: string;
  babyId: string;
  diaperType: DiaperType;
  stoolColor: string | null;
  stoolConsistency: StoolConsistency | null;
  mucus: boolean;
  blood: boolean;
  urineNote: string | null;
  notes: string | null;
  occurredAt: string;
  createdBy: string;
}

export interface TemperatureEvent {
  id: string;
  householdId: string;
  babyId: string;
  value: number;
  unit: 'C' | 'F';
  occurredAt: string;
  notes: string | null;
  createdBy: string;
}

export interface MedicationEvent {
  id: string;
  householdId: string;
  babyId: string;
  medicationName: string;
  dosage: string;
  occurredAt: string;
  notes: string | null;
  createdBy: string;
}

export interface SymptomEvent {
  id: string;
  householdId: string;
  babyId: string;
  symptom: string;
  notes: string | null;
  occurredAt: string;
  createdBy: string;
}

export interface GrowthMeasurement {
  id: string;
  householdId: string;
  babyId: string;
  weight: number | null;
  weightUnit: 'kg' | 'lb' | null;
  length: number | null;
  lengthUnit: 'cm' | 'in' | null;
  occurredAt: string;
  notes: string | null;
  createdBy: string;
}

export interface DoctorAppointment {
  id: string;
  householdId: string;
  babyId: string;
  provider: string | null;
  scheduledAt: string | null;
  location: string | null;
  planningNotes: string | null;
  visitNotes: string | null;
  status: AppointmentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorQuestion {
  id: string;
  householdId: string;
  babyId: string;
  doctorAppointmentId: string;
  question: string;
  createdAt: string;
  createdBy: string;
}

export interface MedicalTimelineEvent {
  id: string;
  householdId: string;
  babyId: string;
  sourceTable: string;
  sourceId: string;
  eventType: EntryType;
  occurredAt: string;
  title: string;
  summary: string | null;
}

export interface HomeSummary {
  todaySleepSeconds: number;
  todayFeedCount: number;
  todayDiaperCount: number;
  activeSleepSession: SleepSession | null;
  activeFeedSession: ActiveFeedSession | null;
}

export interface ReportsSummary {
  windowLabel: string;
  sleepDailyAverageSeconds: number;
  feedDailyAverage: number;
  diaperDailyAverage: number;
  medicationCount: number;
  symptomCount: number;
  lastMedicationSummary: string | null;
  latestSymptomSummary: string | null;
  timeline: MedicalTimelineEvent[];
}

export interface DoctorSummary {
  windowLabel: '24h' | '48h' | '7d';
  appointment: DoctorAppointment | null;
  questions: DoctorQuestion[];
  feedSessionCount: number;
  sleepTotalSeconds: number;
  diaperCounts: {
    wet: number;
    dirty: number;
    both: number;
  };
  temperatures: TemperatureEvent[];
  medications: MedicationEvent[];
  symptoms: SymptomEvent[];
  growthMeasurements: GrowthMeasurement[];
  timeline: MedicalTimelineEvent[];
}

export interface AppBootstrap {
  profile: ParentProfile;
  household: Household | null;
  members: HouseholdMember[];
  baby: BabyProfile | null;
}

export interface SyncStatus {
  state: SyncState;
  pendingCount: number;
  message: string;
  lastSyncedAt: string | null;
}

export type MutationEntityType =
  | 'household'
  | 'baby'
  | 'sleep_session'
  | 'feeding_session'
  | 'feeding_segment'
  | 'diaper_event'
  | 'temperature_event'
  | 'medication_event'
  | 'symptom_event'
  | 'growth_measurement'
  | 'doctor_appointment'
  | 'doctor_question'
  | 'doctor_note';

export type MutationOperation =
  | 'create_household'
  | 'join_household'
  | 'upsert_baby'
  | 'start_sleep'
  | 'finish_sleep'
  | 'start_feed_session'
  | 'upsert_feed_segment'
  | 'finish_feed_session'
  | 'log_diaper'
  | 'log_temperature'
  | 'log_medication'
  | 'log_symptom'
  | 'log_growth'
  | 'upsert_doctor_appointment'
  | 'add_doctor_question'
  | 'delete_doctor_question'
  | 'add_doctor_note';

export interface QueueItem<TPayload = unknown> {
  id: string;
  entityType: MutationEntityType;
  entityId: string;
  operation: MutationOperation;
  householdId: string | null;
  babyId: string | null;
  payload: TPayload;
  createdAt: string;
  attemptCount: number;
  lastError: string | null;
  nextRetryAt: string | null;
}

export interface AppConfigError {
  title: string;
  message: string;
}

export interface FeedSessionDraft {
  sessionId: string;
  householdId: string;
  babyId: string;
  startedAt: string;
  feedType: FeedType;
}

export interface FeedSegmentDraft {
  id: string;
  feedingSessionId: string;
  householdId: string;
  babyId: string;
  side: FeedSide;
  startedAt: string;
  endedAt: string | null;
}

export interface FeedOutcomeFlags {
  outcome: FeedOutcome;
  latchIssue: boolean;
  sleepyFeed: boolean;
  refusedFeed: boolean;
  spitUp: boolean;
}
