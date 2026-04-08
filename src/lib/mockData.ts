import { BabyProfile, Household, FeedEntry, SleepEntry, DiaperEntry, HealthEntry, Appointment } from './types';

export const mockBaby: BabyProfile = {
  id: 'baby-1',
  name: 'Leo',
  birthDate: '2026-03-20T08:30:00Z',
  birthWeight: 3.4,
  birthLength: 51,
};

export const mockHousehold: Household = {
  id: 'household-1',
  name: 'Our Family',
  babyIds: ['baby-1'],
};

// Seeding for different days to simulate history
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

export const mockFeeds: FeedEntry[] = [
  // Poor feeding + symptom day (today)
  {
    id: 'f-poor-1', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'left',
    durationLeft: 120, timestamp: new Date(today.setHours(10, 0)).toISOString(), outcome: 'refused', notes: 'Refused after 2 mins'
  },
  {
    id: 'f-poor-2', babyId: 'baby-1', type: 'feed', feedType: 'bottle', amount: 10, unit: 'ml',
    timestamp: new Date(today.setHours(13, 0)).toISOString(), outcome: 'spit_up', notes: 'Spit up most of the bottle'
  },
  // Normal newborn day (yesterday)
  {
    id: 'f1', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'left',
    durationLeft: 900, timestamp: new Date(yesterday.setHours(2, 0)).toISOString(), outcome: 'good'
  },
  {
    id: 'f2', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'right',
    durationRight: 1000, timestamp: new Date(yesterday.setHours(5, 30)).toISOString(), outcome: 'good'
  },
  {
    id: 'f3', babyId: 'baby-1', type: 'feed', feedType: 'bottle', amount: 90, unit: 'ml',
    timestamp: new Date(yesterday.setHours(9, 0)).toISOString(), outcome: 'good'
  },
  // Cluster feeding day (two days ago)
  {
    id: 'f4', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'both',
    durationLeft: 600, durationRight: 600, timestamp: new Date(twoDaysAgo.setHours(18, 0)).toISOString(), outcome: 'fair'
  },
];

export const mockSleep: SleepEntry[] = [
  {
    id: 's1', babyId: 'baby-1', type: 'sleep',
    startTime: new Date(yesterday.setHours(0, 30)).toISOString(),
    endTime: new Date(yesterday.setHours(5, 0)).toISOString(), 
    duration: 16200,
    timestamp: new Date(yesterday.setHours(0, 30)).toISOString()
  },
  {
    id: 's2', babyId: 'baby-1', type: 'sleep',
    startTime: new Date(yesterday.setHours(6, 30)).toISOString(),
    endTime: new Date(yesterday.setHours(8, 0)).toISOString(), 
    duration: 5400,
    timestamp: new Date(yesterday.setHours(6, 30)).toISOString()
  },
];

export const mockDiapers: DiaperEntry[] = [
  // Dense medical timeline day (today)
  { id: 'd-dense-1', babyId: 'baby-1', type: 'diaper', diaperType: 'wet', timestamp: new Date(today.setHours(1, 0)).toISOString() },
  { id: 'd-dense-2', babyId: 'baby-1', type: 'diaper', diaperType: 'dirty', timestamp: new Date(today.setHours(3, 30)).toISOString() },
  { id: 'd-dense-3', babyId: 'baby-1', type: 'diaper', diaperType: 'wet', timestamp: new Date(today.setHours(6, 0)).toISOString() },
  { id: 'd-dense-4', babyId: 'baby-1', type: 'diaper', diaperType: 'both', timestamp: new Date(today.setHours(8, 45)).toISOString() },
  { id: 'd-dense-5', babyId: 'baby-1', type: 'diaper', diaperType: 'wet', timestamp: new Date(today.setHours(11, 15)).toISOString() },
];

export const mockHealth: HealthEntry[] = [
  // Fever day (today)
  {
    id: 'h1', babyId: 'baby-1', type: 'health', healthType: 'temperature',
    value: 38.2, unit: 'C', timestamp: new Date(today.setHours(7, 0)).toISOString()
  },
  {
    id: 'h2', babyId: 'baby-1', type: 'health', healthType: 'medication',
    medicationName: 'Tylenol', dosage: '1.5ml', timestamp: new Date(today.setHours(7, 15)).toISOString()
  },
  {
    id: 'h3', babyId: 'baby-1', type: 'health', healthType: 'symptom',
    symptomName: 'Fussy / Poor appetite', timestamp: new Date(today.setHours(8, 0)).toISOString()
  },
  {
    id: 'h-growth-1', babyId: 'baby-1', type: 'health', healthType: 'growth',
    value: 3.8, unit: 'kg', timestamp: new Date(yesterday.setHours(10, 0)).toISOString()
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    babyId: 'baby-1',
    provider: 'Dr. Smith (Pediatrician)',
    dateTime: new Date(today.getTime() + 86400000 * 2).toISOString(),
    location: '123 Medical Dr.',
    notes: '2-week checkup',
    // Long question list scenario
    questions: [
      'Is his weight gain normal?',
      'How often should he be feeding at night?',
      'Skin rash on his neck - normal?',
      'How long should he stay awake between naps?',
      'Vitamin D drops - which brand is best?',
      'When can we start taking him to crowded places?',
      'Is the umbilical cord stump healing correctly?',
      'Grunting sounds during sleep - normal?'
    ]
  }
];
