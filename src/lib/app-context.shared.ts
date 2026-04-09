import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AppConfigError, BabyProfile, DiaperEvent, DoctorAppointment, DoctorSummary, FeedOutcome, FeedType, HomeSummary, Household, HouseholdMember, MedicalTimelineEvent, ParentProfile, ReportsSummary, SyncStatus } from './types';

type AuthStatus = 'loading' | 'signed_out' | 'signed_in';

export interface AppContextValue {
  authStatus: AuthStatus;
  session: Session | null;
  isLoading: boolean;
  isRefreshing: boolean;
  isOnline: boolean;
  configError: AppConfigError | null;
  actionError: string | null;
  profile: ParentProfile | null;
  household: Household | null;
  members: HouseholdMember[];
  baby: BabyProfile | null;
  homeSummary: HomeSummary;
  reportsSummary: ReportsSummary;
  doctorSummary: DoctorSummary;
  timeline: MedicalTimelineEvent[];
  syncStatus: SyncStatus;
  doctorWindow: DoctorSummary['windowLabel'];
  selectedDoctorAppointmentId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearActionError: () => void;
  createHousehold: (name: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  saveBabyProfile: (input: {
    name: string;
    birthDate: string;
    birthWeight: number | null;
    birthLength: number | null;
  }) => Promise<void>;
  startSleep: () => Promise<void>;
  finishSleep: () => Promise<void>;
  toggleFeedSide: (side: 'left' | 'right', feedType?: Extract<FeedType, 'breast' | 'pumping'>) => Promise<void>;
  finishFeedSession: (input: {
    feedType: FeedType;
    outcome: FeedOutcome;
    latchIssue: boolean;
    sleepyFeed: boolean;
    refusedFeed: boolean;
    spitUp: boolean;
    bottleAmount: number | null;
    bottleUnit: 'ml' | 'oz' | null;
  }) => Promise<void>;
  undoFeedAction: () => Promise<void>;
  resetFeedSession: () => Promise<void>;
  logDiaper: (input: {
    diaperType: 'wet' | 'dirty' | 'both';
    stoolColor: string | null;
    stoolConsistency: DiaperEvent['stoolConsistency'];
    mucus: boolean;
    blood: boolean;
    urineNote: string | null;
    notes: string | null;
  }) => Promise<void>;
  logTemperature: (input: { value: number; unit: 'C' | 'F'; notes: string | null }) => Promise<void>;
  logMedication: (input: { medicationName: string; dosage: string; notes: string | null }) => Promise<void>;
  logSymptom: (input: { symptom: string; notes: string | null }) => Promise<void>;
  logGrowth: (input: {
    weight: number | null;
    weightUnit: 'kg' | 'lb' | null;
    length: number | null;
    lengthUnit: 'cm' | 'in' | null;
    notes: string | null;
  }) => Promise<void>;
  saveDoctorAppointment: (input: {
    id?: string;
    provider: string | null;
    scheduledAt: string | null;
    location: string | null;
    planningNotes: string | null;
    visitNotes: string | null;
    status: DoctorAppointment['status'];
  }) => Promise<void>;
  deleteDoctorAppointment: (appointmentId: string) => Promise<void>;
  addDoctorQuestion: (question: string, appointmentId?: string) => Promise<void>;
  deleteDoctorQuestion: (questionId: string) => Promise<void>;
  addDoctorNote: (note: string, appointmentId?: string) => Promise<void>;
  setSelectedDoctorAppointment: (appointmentId: string | null) => Promise<void>;
  setDoctorWindow: (windowLabel: DoctorSummary['windowLabel']) => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextValue | null>(null);
