import type {
  ActiveFeedSession,
  BabyProfile,
  DiaperEvent,
  DoctorAppointment,
  DoctorQuestion,
  DoctorSummary,
  FeedSession,
  FeedingSegment,
  GrowthMeasurement,
  HomeSummary,
  Household,
  HouseholdMember,
  MedicationEvent,
  MedicalTimelineEvent,
  ParentProfile,
  ReportsSummary,
  SleepSession,
  SymptomEvent,
  TemperatureEvent,
} from '../types';
import type { Json } from './database.types';

const asObject = (value: Json): Record<string, Json> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Expected object response');
  }
  return value as Record<string, Json>;
};

const asArray = (value: Json | null | undefined): Json[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value;
};

const asString = (value: Json | undefined | null): string => (typeof value === 'string' ? value : '');
const asNullableString = (value: Json | undefined | null): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;
const asNumber = (value: Json | undefined | null): number =>
  typeof value === 'number' ? value : 0;
const asNullableNumber = (value: Json | undefined | null): number | null =>
  typeof value === 'number' ? value : null;
const asBoolean = (value: Json | undefined | null): boolean => value === true;

export const mapProfile = (value: Json): ParentProfile => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    email: asString(row.email),
    fullName: asNullableString(row.full_name),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
};

export const mapHousehold = (value: Json): Household => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    name: asString(row.name),
    inviteCode: asString(row.invite_code),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
};

export const mapHouseholdMember = (value: Json): HouseholdMember => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    profileId: asString(row.profile_id),
    role: 'parent',
    status: 'active',
    joinedAt: asString(row.joined_at),
  };
};

export const mapBaby = (value: Json): BabyProfile => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    name: asString(row.name),
    birthDate: asString(row.birth_date),
    birthWeight: asNullableNumber(row.birth_weight),
    birthLength: asNullableNumber(row.birth_length),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
};

export const mapSleepSession = (value: Json): SleepSession => {
  const row = asObject(value);
  const startedAt = asString(row.start_time);
  const endedAt = asNullableString(row.end_time);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    startedAt,
    endedAt,
    durationSeconds:
      startedAt && endedAt
        ? Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000))
        : null,
    createdBy: asString(row.created_by),
    notes: asNullableString(row.notes),
  };
};

export const mapFeedingSegment = (value: Json): FeedingSegment => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    feedingSessionId: asString(row.feeding_session_id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    side: asString(row.side) === 'right' ? 'right' : 'left',
    startedAt: asString(row.started_at),
    endedAt: asNullableString(row.ended_at),
  };
};

export const mapFeedSession = (value: Json): FeedSession => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    feedType: asString(row.feed_type) === 'bottle' ? 'bottle' : 'breast',
    startedAt: asString(row.started_at),
    finishedAt: asNullableString(row.finished_at),
    outcome:
      asString(row.outcome) === 'fair' || asString(row.outcome) === 'poor' ? (asString(row.outcome) as 'fair' | 'poor') : asString(row.outcome) === 'good' ? 'good' : null,
    latchIssue: asBoolean(row.latch_issue),
    sleepyFeed: asBoolean(row.sleepy_feed),
    refusedFeed: asBoolean(row.refused_feed),
    spitUp: asBoolean(row.spit_up),
    bottleAmount: asNullableNumber(row.bottle_amount),
    bottleUnit: asString(row.bottle_unit) === 'oz' ? 'oz' : asString(row.bottle_unit) === 'ml' ? 'ml' : null,
    createdBy: asString(row.created_by),
    segments: asArray(row.segments).map(mapFeedingSegment),
  };
};

export const mapActiveFeedSession = (value: Json): ActiveFeedSession => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.householdId),
    babyId: asString(row.babyId),
    feedType: asString(row.feedType) === 'bottle' ? 'bottle' : 'breast',
    startedAt: asString(row.startedAt),
    activeSide: asString(row.activeSide) === 'left' || asString(row.activeSide) === 'right' ? (asString(row.activeSide) as 'left' | 'right') : null,
    activeSegmentId: asNullableString(row.activeSegmentId),
    segments: asArray(row.segments).map(mapFeedingSegment),
    history: [],
  };
};

export const mapDiaperEvent = (value: Json): DiaperEvent => {
  const row = asObject(value);
  const diaperType = asString(row.diaper_type);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    diaperType: diaperType === 'dirty' || diaperType === 'both' ? diaperType : 'wet',
    stoolColor: asNullableString(row.stool_color),
    stoolConsistency: asNullableString(row.stool_consistency) as DiaperEvent['stoolConsistency'],
    mucus: asBoolean(row.mucus),
    blood: asBoolean(row.blood),
    urineNote: asNullableString(row.urine_note),
    notes: asNullableString(row.notes),
    occurredAt: asString(row.occurred_at),
    createdBy: asString(row.created_by),
  };
};

export const mapTemperatureEvent = (value: Json): TemperatureEvent => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    value: asNumber(row.value_numeric),
    unit: asString(row.unit) === 'F' ? 'F' : 'C',
    occurredAt: asString(row.occurred_at),
    notes: asNullableString(row.notes),
    createdBy: asString(row.created_by),
  };
};

export const mapMedicationEvent = (value: Json): MedicationEvent => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    medicationName: asString(row.medication_name),
    dosage: asString(row.dosage),
    occurredAt: asString(row.occurred_at),
    notes: asNullableString(row.notes),
    createdBy: asString(row.created_by),
  };
};

export const mapSymptomEvent = (value: Json): SymptomEvent => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    symptom: asString(row.symptom),
    notes: asNullableString(row.notes),
    occurredAt: asString(row.occurred_at),
    createdBy: asString(row.created_by),
  };
};

export const mapGrowthMeasurement = (value: Json): GrowthMeasurement => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    weight: asNullableNumber(row.weight),
    weightUnit: asString(row.weight_unit) === 'lb' ? 'lb' : asString(row.weight_unit) === 'kg' ? 'kg' : null,
    length: asNullableNumber(row.length),
    lengthUnit: asString(row.length_unit) === 'in' ? 'in' : asString(row.length_unit) === 'cm' ? 'cm' : null,
    occurredAt: asString(row.occurred_at),
    notes: asNullableString(row.notes),
    createdBy: asString(row.created_by),
  };
};

export const mapDoctorAppointment = (value: Json): DoctorAppointment => {
  const row = asObject(value);
  const status = asString(row.status);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    provider: asNullableString(row.provider),
    scheduledAt: asNullableString(row.scheduled_at),
    location: asNullableString(row.location),
    planningNotes: asNullableString(row.planning_notes),
    visitNotes: asNullableString(row.visit_notes),
    status:
      status === 'planned' || status === 'completed' || status === 'cancelled' ? status : 'unscheduled',
    createdBy: asString(row.created_by),
    createdAt: asString(row.created_at),
    updatedAt: asString(row.updated_at),
  };
};

export const mapDoctorQuestion = (value: Json): DoctorQuestion => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    doctorAppointmentId: asString(row.doctor_appointment_id),
    question: asString(row.question),
    createdAt: asString(row.created_at),
    createdBy: asString(row.created_by),
  };
};

export const mapTimelineEvent = (value: Json): MedicalTimelineEvent => {
  const row = asObject(value);
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    babyId: asString(row.baby_id),
    sourceTable: asString(row.source_table),
    sourceId: asString(row.source_id),
    eventType: asString(row.event_type) as MedicalTimelineEvent['eventType'],
    occurredAt: asString(row.occurred_at),
    title: asString(row.title),
    summary: asNullableString(row.summary),
  };
};

export const mapBootstrap = (value: Json) => {
  const row = asObject(value);
  return {
    profile: mapProfile(row.profile as Json),
    household: row.household ? mapHousehold(row.household as Json) : null,
    members: asArray(row.members).map(mapHouseholdMember),
    baby: row.baby ? mapBaby(row.baby as Json) : null,
  };
};

export const mapHomeSummary = (value: Json): HomeSummary => {
  const row = asObject(value);
  return {
    todaySleepSeconds: asNumber(row.todaySleepSeconds),
    todayFeedCount: asNumber(row.todayFeedCount),
    todayDiaperCount: asNumber(row.todayDiaperCount),
    activeSleepSession: row.activeSleepSession ? mapSleepSession(row.activeSleepSession as Json) : null,
    activeFeedSession: row.activeFeedSession ? mapActiveFeedSession(row.activeFeedSession as Json) : null,
  };
};

export const mapReportsSummary = (value: Json): ReportsSummary => {
  const row = asObject(value);
  return {
    windowLabel: asString(row.windowLabel),
    sleepDailyAverageSeconds: asNumber(row.sleepDailyAverageSeconds),
    feedDailyAverage: asNumber(row.feedDailyAverage),
    diaperDailyAverage: asNumber(row.diaperDailyAverage),
    medicationCount: asNumber(row.medicationCount),
    symptomCount: asNumber(row.symptomCount),
    lastMedicationSummary: asNullableString(row.lastMedicationSummary),
    latestSymptomSummary: asNullableString(row.latestSymptomSummary),
    timeline: asArray(row.timeline).map(mapTimelineEvent),
  };
};

export const mapDoctorSummary = (value: Json): DoctorSummary => {
  const row = asObject(value);
  const diaperCounts = asObject((row.diaperCounts ?? {}) as Json);
  return {
    windowLabel: asString(row.windowLabel) === '24h' || asString(row.windowLabel) === '7d' ? (asString(row.windowLabel) as '24h' | '7d') : '48h',
    appointment: row.appointment ? mapDoctorAppointment(row.appointment as Json) : null,
    questions: asArray(row.questions).map(mapDoctorQuestion),
    feedSessionCount: asNumber(row.feedSessionCount),
    sleepTotalSeconds: asNumber(row.sleepTotalSeconds),
    diaperCounts: {
      wet: asNumber(diaperCounts.wet),
      dirty: asNumber(diaperCounts.dirty),
      both: asNumber(diaperCounts.both),
    },
    temperatures: asArray(row.temperatures).map(mapTemperatureEvent),
    medications: asArray(row.medications).map(mapMedicationEvent),
    symptoms: asArray(row.symptoms).map(mapSymptomEvent),
    growthMeasurements: asArray(row.growthMeasurements).map(mapGrowthMeasurement),
    timeline: asArray(row.timeline).map(mapTimelineEvent),
  };
};
