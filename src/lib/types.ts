export type EntryType = 'feed' | 'sleep' | 'diaper' | 'health' | 'note' | 'appointment';

export interface BaseEntry {
  id: string;
  babyId: string;
  timestamp: string;
  type: EntryType;
  notes?: string;
}

export type FeedType = 'breast' | 'bottle';
export type FeedSide = 'left' | 'right' | 'both';
export type FeedOutcome = 'good' | 'fair' | 'poor' | 'latch_issue' | 'sleepy' | 'refused' | 'spit_up';

export interface FeedEntry extends BaseEntry {
  type: 'feed';
  feedType: FeedType;
  side?: FeedSide;
  durationLeft?: number; // seconds
  durationRight?: number; // seconds
  amount?: number; // ml or oz
  unit?: 'ml' | 'oz';
  outcome?: FeedOutcome;
}

export interface SleepEntry extends BaseEntry {
  type: 'sleep';
  startTime: string;
  endTime?: string;
  duration?: number; // seconds
}

export type DiaperType = 'wet' | 'dirty' | 'both';
export type StoolConsistency = 'soft' | 'watery' | 'hard' | 'mucus' | 'bloody';

export interface DiaperEntry extends BaseEntry {
  type: 'diaper';
  diaperType: DiaperType;
  stoolColor?: string;
  stoolConsistency?: StoolConsistency;
  urineColor?: string;
}

export type HealthType = 'temperature' | 'medication' | 'growth' | 'symptom';

export interface HealthEntry extends BaseEntry {
  type: 'health';
  healthType: HealthType;
  value?: number;
  unit?: string;
  medicationName?: string;
  dosage?: string;
  symptomName?: string;
}

export interface Appointment {
  id: string;
  babyId: string;
  provider: string;
  dateTime: string;
  location?: string;
  notes?: string;
  questions: string[];
}

export interface BabyProfile {
  id: string;
  name: string;
  birthDate: string;
  birthWeight?: number;
  birthLength?: number;
}

export interface Household {
  id: string;
  name: string;
  babyIds: string[];
}
