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
  {
    id: 'f5', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'left',
    durationLeft: 450, timestamp: new Date(twoDaysAgo.setHours(18, 45)).toISOString(), outcome: 'fair'
  },
  {
    id: 'f6', babyId: 'baby-1', type: 'feed', feedType: 'breast', side: 'right',
    durationRight: 400, timestamp: new Date(twoDaysAgo.setHours(19, 20)).toISOString(), outcome: 'fair'
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
  {
    id: 'd1', babyId: 'baby-1', type: 'diaper', diaperType: 'wet',
    timestamp: new Date(yesterday.setHours(5, 45)).toISOString()
  },
  {
    id: 'd2', babyId: 'baby-1', type: 'diaper', diaperType: 'dirty',
    stoolColor: 'yellow', stoolConsistency: 'soft',
    timestamp: new Date(yesterday.setHours(9, 15)).toISOString()
  },
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
];

export const mockAppointments: Appointment[] = [
  {
    id: 'a1',
    babyId: 'baby-1',
    provider: 'Dr. Smith (Pediatrician)',
    dateTime: new Date(today.getTime() + 86400000 * 2).toISOString(), // 2 days from now
    location: '123 Medical Dr.',
    notes: '2-week checkup',
    questions: [
      'Is his weight gain normal?',
      'How often should he be feeding at night?',
      'Skin rash on his neck - normal?'
    ]
  }
];
