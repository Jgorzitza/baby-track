import type { Session } from '@supabase/supabase-js';
import { createClientId } from '../ids';
import { getMissingConfigMessage } from '../env';
import type {
  AppBootstrap,
  BabyProfile,
  DiaperEvent,
  DoctorAppointment,
  DoctorQuestion,
  DoctorSummary,
  FeedOutcomeFlags,
  FeedSegmentDraft,
  FeedSession,
  FeedSessionDraft,
  GrowthMeasurement,
  HomeSummary,
  QueueItem,
  ReportsSummary,
  SleepSession,
  SyncStatus,
  TemperatureEvent,
  MedicationEvent,
  SymptomEvent,
} from '../types';
import type { Database, Json } from './database.types';
import { getSupabaseClient } from './client';
import {
  mapBaby,
  mapBootstrap,
  mapDiaperEvent,
  mapDoctorAppointment,
  mapDoctorQuestion,
  mapDoctorSummary,
  mapFeedSession,
  mapGrowthMeasurement,
  mapHomeSummary,
  mapHousehold,
  mapMedicationEvent,
  mapReportsSummary,
  mapSleepSession,
  mapSymptomEvent,
  mapTemperatureEvent,
  mapTimelineEvent,
} from './mappers';

const getClientOrThrow = () => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(getMissingConfigMessage());
  }
  return client;
};

const unwrapRpc = async <T>(name: keyof Database['public']['Functions'], args: Record<string, unknown>, mapper: (value: Json) => T): Promise<T> => {
  const client = getClientOrThrow();
  const rpc = client.rpc.bind(client) as unknown as (
    fn: string,
    params?: Record<string, unknown>
  ) => Promise<{ data: Json | null; error: { message: string } | null }>;
  const { data, error } = await rpc(name, args);
  if (error) {
    throw new Error(error.message);
  }
  return mapper((data ?? null) as Json);
};

const unwrapVoidRpc = async (name: keyof Database['public']['Functions'], args: Record<string, unknown>): Promise<void> => {
  const client = getClientOrThrow();
  const rpc = client.rpc.bind(client) as unknown as (
    fn: string,
    params?: Record<string, unknown>
  ) => Promise<{ data: Json | null; error: { message: string } | null }>;
  const { error } = await rpc(name, args);
  if (error) {
    throw new Error(error.message);
  }
};

export const authRepository = {
  async getSession(): Promise<Session | null> {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return data.session;
  },
  async signIn(email: string, password: string): Promise<Session> {
    const client = getClientOrThrow();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error(error?.message ?? 'Unable to sign in');
    }
    return data.session;
  },
  async signUp(email: string, password: string): Promise<Session> {
    const client = getClientOrThrow();
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    if (!data.session) {
      throw new Error('Sign-up completed without a session. Disable email confirmations for this v1 project before using password sign-up.');
    }
    return data.session;
  },
  async requestPasswordReset(email: string): Promise<void> {
    const client = getClientOrThrow();
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      throw new Error(error.message);
    }
  },
  async updatePassword(nextPassword: string): Promise<void> {
    const client = getClientOrThrow();
    const { error } = await client.auth.updateUser({ password: nextPassword });
    if (error) {
      throw new Error(error.message);
    }
  },
  async signOut(): Promise<void> {
    const client = getClientOrThrow();
    const { error } = await client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },
  onAuthStateChange(callback: (session: Session | null) => void): (() => void) | null {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => callback(session));
    return () => subscription.unsubscribe();
  },
};

export const appRepository = {
  async getBootstrap(): Promise<AppBootstrap> {
    return unwrapRpc('app_get_bootstrap', {}, mapBootstrap);
  },
  async createHousehold(householdName: string): Promise<AppBootstrap> {
    await unwrapRpc(
      'app_create_household',
      {
        p_household_id: createClientId(),
        p_household_name: householdName,
        p_membership_id: createClientId(),
      },
      mapHousehold
    );
    return this.getBootstrap();
  },
  async joinHouseholdByCode(inviteCode: string): Promise<AppBootstrap> {
    await unwrapRpc(
      'app_join_household_by_code',
      {
        p_membership_id: createClientId(),
        p_invite_code: inviteCode,
      },
      mapHousehold
    );
    return this.getBootstrap();
  },
  async saveBabyProfile(payload: {
    babyId: string;
    householdId: string;
    name: string;
    birthDate: string;
    birthWeight: number | null;
    birthLength: number | null;
    clientCreatedAt: string;
  }): Promise<BabyProfile> {
    return unwrapRpc(
      'app_upsert_baby_profile',
      {
        p_baby_id: payload.babyId,
        p_household_id: payload.householdId,
        p_name: payload.name,
        p_birth_date: payload.birthDate,
        p_birth_weight: payload.birthWeight,
        p_birth_length: payload.birthLength,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapBaby
    );
  },
  async getHomeSummary(babyId: string): Promise<HomeSummary> {
    return unwrapRpc('app_get_home_summary', { p_baby_id: babyId }, mapHomeSummary);
  },
  async getReportsSummary(babyId: string, windowDays = 7): Promise<ReportsSummary> {
    return unwrapRpc(
      'app_get_reports_summary',
      { p_baby_id: babyId, p_window_days: windowDays },
      mapReportsSummary
    );
  },
  async getDoctorSummary(babyId: string, windowLabel: DoctorSummary['windowLabel']): Promise<DoctorSummary> {
    return unwrapRpc(
      'app_get_doctor_summary',
      { p_baby_id: babyId, p_window_label: windowLabel },
      mapDoctorSummary
    );
  },
  async listDoctorAppointments(babyId: string): Promise<DoctorAppointment[]> {
    const client = getClientOrThrow();
    const { data, error } = await client
      .from('doctor_appointments')
      .select('*')
      .eq('baby_id', babyId)
      .neq('status', 'cancelled')
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => mapDoctorAppointment(row as unknown as Json));
  },
  async listDoctorQuestions(babyId: string, appointmentId: string): Promise<DoctorQuestion[]> {
    const client = getClientOrThrow();
    const { data, error } = await client
      .from('doctor_questions')
      .select('*')
      .eq('baby_id', babyId)
      .eq('doctor_appointment_id', appointmentId)
      .order('created_at', { ascending: true });
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []).map((row) => mapDoctorQuestion(row as unknown as Json));
  },
  async getTimeline(babyId: string, limitCount = 50) {
    return unwrapRpc(
      'app_get_medical_timeline',
      { p_baby_id: babyId, p_limit_count: limitCount },
      (value) => {
        if (!Array.isArray(value)) {
          return [];
        }
        return value.map(mapTimelineEvent);
      }
    );
  },
  async startSleep(payload: {
    sleepSessionId: string;
    householdId: string;
    babyId: string;
    startTime: string;
    clientCreatedAt: string;
    notes?: string | null;
  }): Promise<SleepSession> {
    return unwrapRpc(
      'app_start_sleep',
      {
        p_sleep_session_id: payload.sleepSessionId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_start_time: payload.startTime,
        p_client_created_at: payload.clientCreatedAt,
        p_notes: payload.notes ?? null,
      },
      mapSleepSession
    );
  },
  async finishSleep(payload: {
    sleepSessionId: string;
    householdId: string;
    babyId: string;
    endTime: string;
  }): Promise<SleepSession> {
    return unwrapRpc(
      'app_finish_sleep',
      {
        p_sleep_session_id: payload.sleepSessionId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_end_time: payload.endTime,
      },
      mapSleepSession
    );
  },
  async startFeedSession(payload: FeedSessionDraft): Promise<FeedSession> {
    return unwrapRpc(
      'app_start_feed_session',
      {
        p_feeding_session_id: payload.sessionId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_feed_type: payload.feedType,
        p_started_at: payload.startedAt,
        p_client_created_at: payload.startedAt,
      },
      mapFeedSession
    );
  },
  async upsertFeedSegment(payload: FeedSegmentDraft): Promise<void> {
    await unwrapVoidRpc('app_upsert_feed_segment', {
      p_segment_id: payload.id,
      p_feeding_session_id: payload.feedingSessionId,
      p_household_id: payload.householdId,
      p_baby_id: payload.babyId,
      p_side: payload.side,
      p_started_at: payload.startedAt,
      p_ended_at: payload.endedAt,
      p_client_created_at: payload.startedAt,
    });
  },
  async finishFeedSession(payload: {
    sessionId: string;
    householdId: string;
    babyId: string;
    finishedAt: string;
    bottleAmount: number | null;
    bottleUnit: 'ml' | 'oz' | null;
    flags: FeedOutcomeFlags;
  }): Promise<FeedSession> {
    return unwrapRpc(
      'app_finish_feed_session',
      {
        p_feeding_session_id: payload.sessionId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_finished_at: payload.finishedAt,
        p_outcome: payload.flags.outcome,
        p_latch_issue: payload.flags.latchIssue,
        p_sleepy_feed: payload.flags.sleepyFeed,
        p_refused_feed: payload.flags.refusedFeed,
        p_spit_up: payload.flags.spitUp,
        p_bottle_amount: payload.bottleAmount,
        p_bottle_unit: payload.bottleUnit,
      },
      mapFeedSession
    );
  },
  async logTemperature(payload: {
    id: string;
    householdId: string;
    babyId: string;
    value: number;
    unit: 'C' | 'F';
    notes: string | null;
    occurredAt: string;
    clientCreatedAt: string;
  }): Promise<TemperatureEvent> {
    return unwrapRpc(
      'app_log_temperature',
      {
        p_health_event_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_value: payload.value,
        p_unit: payload.unit,
        p_notes: payload.notes,
        p_occurred_at: payload.occurredAt,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapTemperatureEvent
    );
  },
  async logMedication(payload: {
    id: string;
    householdId: string;
    babyId: string;
    medicationName: string;
    dosage: string;
    notes: string | null;
    occurredAt: string;
    clientCreatedAt: string;
  }): Promise<MedicationEvent> {
    return unwrapRpc(
      'app_log_medication',
      {
        p_health_event_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_medication_name: payload.medicationName,
        p_dosage: payload.dosage,
        p_notes: payload.notes,
        p_occurred_at: payload.occurredAt,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapMedicationEvent
    );
  },
  async logSymptom(payload: {
    id: string;
    householdId: string;
    babyId: string;
    symptom: string;
    notes: string | null;
    occurredAt: string;
    clientCreatedAt: string;
  }): Promise<SymptomEvent> {
    return unwrapRpc(
      'app_log_symptom',
      {
        p_symptom_event_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_symptom: payload.symptom,
        p_notes: payload.notes,
        p_occurred_at: payload.occurredAt,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapSymptomEvent
    );
  },
  async logGrowth(payload: {
    id: string;
    householdId: string;
    babyId: string;
    weight: number | null;
    weightUnit: 'kg' | 'lb' | null;
    length: number | null;
    lengthUnit: 'cm' | 'in' | null;
    notes: string | null;
    occurredAt: string;
    clientCreatedAt: string;
  }): Promise<GrowthMeasurement> {
    return unwrapRpc(
      'app_log_growth',
      {
        p_growth_measurement_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_weight: payload.weight,
        p_weight_unit: payload.weightUnit,
        p_length: payload.length,
        p_length_unit: payload.lengthUnit,
        p_notes: payload.notes,
        p_occurred_at: payload.occurredAt,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapGrowthMeasurement
    );
  },
  async logDiaper(payload: {
    id: string;
    householdId: string;
    babyId: string;
    diaperType: 'wet' | 'dirty' | 'both';
    stoolColor: string | null;
    stoolConsistency: 'soft' | 'watery' | 'hard' | 'mucus' | 'bloody' | null;
    mucus: boolean;
    blood: boolean;
    urineNote: string | null;
    notes: string | null;
    occurredAt: string;
    clientCreatedAt: string;
  }): Promise<DiaperEvent> {
    return unwrapRpc(
      'app_log_diaper',
      {
        p_diaper_event_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_diaper_type: payload.diaperType,
        p_stool_color: payload.stoolColor,
        p_stool_consistency: payload.stoolConsistency,
        p_mucus: payload.mucus,
        p_blood: payload.blood,
        p_urine_note: payload.urineNote,
        p_notes: payload.notes,
        p_occurred_at: payload.occurredAt,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapDiaperEvent
    );
  },
  async upsertDoctorAppointment(payload: {
    id: string;
    householdId: string;
    babyId: string;
    provider: string | null;
    scheduledAt: string | null;
    location: string | null;
    planningNotes: string | null;
    visitNotes: string | null;
    status: 'planned' | 'unscheduled' | 'completed' | 'cancelled';
    clientCreatedAt: string;
  }): Promise<DoctorAppointment> {
    return unwrapRpc(
      'app_upsert_doctor_appointment',
      {
        p_appointment_id: payload.id,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_provider: payload.provider,
        p_scheduled_at: payload.scheduledAt,
        p_location: payload.location,
        p_planning_notes: payload.planningNotes,
        p_visit_notes: payload.visitNotes,
        p_status: payload.status,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapDoctorAppointment
    );
  },
  async deleteDoctorAppointment(payload: {
    appointmentId: string;
    householdId: string;
    babyId: string;
  }): Promise<void> {
    await unwrapVoidRpc('app_delete_doctor_appointment', {
      p_appointment_id: payload.appointmentId,
      p_household_id: payload.householdId,
      p_baby_id: payload.babyId,
    });
  },
  async addDoctorQuestion(payload: {
    questionId: string;
    appointmentId: string;
    householdId: string;
    babyId: string;
    question: string;
    clientCreatedAt: string;
  }): Promise<{ appointment: DoctorAppointment; question: DoctorQuestion }> {
    return unwrapRpc(
      'app_add_doctor_question',
      {
        p_question_id: payload.questionId,
        p_appointment_id: payload.appointmentId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_question: payload.question,
        p_client_created_at: payload.clientCreatedAt,
      },
      (value) => {
        const row = value as Record<string, Json>;
        return {
          appointment: mapDoctorAppointment(row.appointment as Json),
          question: mapDoctorQuestion(row.question as Json),
        };
      }
    );
  },
  async answerDoctorQuestion(payload: {
    questionId: string;
    householdId: string;
    answerNotes: string | null;
    answered: boolean;
  }): Promise<DoctorQuestion> {
    return unwrapRpc(
      'app_answer_doctor_question',
      {
        p_question_id: payload.questionId,
        p_household_id: payload.householdId,
        p_answered: payload.answered,
        p_answer_notes: payload.answerNotes,
      },
      mapDoctorQuestion
    );
  },
  async deleteDoctorQuestion(payload: { questionId: string; householdId: string }): Promise<void> {
    await unwrapVoidRpc('app_delete_doctor_question', {
      p_question_id: payload.questionId,
      p_household_id: payload.householdId,
    });
  },
  async addDoctorNote(payload: {
    appointmentId: string;
    householdId: string;
    babyId: string;
    note: string;
    clientCreatedAt: string;
  }): Promise<DoctorAppointment> {
    return unwrapRpc(
      'app_add_doctor_note',
      {
        p_appointment_id: payload.appointmentId,
        p_household_id: payload.householdId,
        p_baby_id: payload.babyId,
        p_note: payload.note,
        p_client_created_at: payload.clientCreatedAt,
      },
      mapDoctorAppointment
    );
  },
};

export const formatSyncStatus = (pendingCount: number, isOnline: boolean, lastSyncedAt: string | null, hasError: boolean): SyncStatus => {
  if (hasError) {
    return {
      state: 'error',
      pendingCount,
      message: 'Sync attention needed',
      lastSyncedAt,
    };
  }

  if (!isOnline) {
    return {
      state: 'offline',
      pendingCount,
      message: pendingCount > 0 ? `${pendingCount} changes waiting` : 'Offline cache active',
      lastSyncedAt,
    };
  }

  if (pendingCount > 0) {
    return {
      state: 'syncing',
      pendingCount,
      message: `Syncing ${pendingCount} change${pendingCount === 1 ? '' : 's'}`,
      lastSyncedAt,
    };
  }

  return {
    state: 'idle',
    pendingCount,
    message: lastSyncedAt ? 'Synced' : 'Ready',
    lastSyncedAt,
  };
};

export type PendingMutation = QueueItem;
