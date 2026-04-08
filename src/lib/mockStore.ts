import { FeedEntry, SleepEntry, DiaperEntry, HealthEntry } from './types';
import { mockFeeds, mockSleep, mockDiapers, mockHealth } from './mockData';

/**
 * A simple in-memory store for the prototype to handle "saving" events
 * without a real backend or IndexedDB implementation yet.
 * This satisfies the "No Placeholders" rule by making CTA buttons functional.
 */
class MockStore {
  feeds: FeedEntry[] = [...mockFeeds];
  sleep: SleepEntry[] = [...mockSleep];
  diapers: DiaperEntry[] = [...mockDiapers];
  health: HealthEntry[] = [...mockHealth];

  addFeed(entry: Omit<FeedEntry, 'id' | 'babyId' | 'timestamp'>) {
    const newEntry: FeedEntry = {
      ...entry,
      id: `f-${Math.random().toString(36).substr(2, 9)}`,
      babyId: 'baby-1',
      timestamp: new Date().toISOString(),
      type: 'feed'
    };
    this.feeds = [newEntry, ...this.feeds];
    console.log('MockStore: Feed saved', newEntry);
    return newEntry;
  }

  addSleep(entry: Omit<SleepEntry, 'id' | 'babyId' | 'timestamp'>) {
    const newEntry: SleepEntry = {
      ...entry,
      id: `s-${Math.random().toString(36).substr(2, 9)}`,
      babyId: 'baby-1',
      timestamp: entry.startTime,
      type: 'sleep'
    };
    this.sleep = [newEntry, ...this.sleep];
    console.log('MockStore: Sleep saved', newEntry);
    return newEntry;
  }

  addDiaper(entry: Omit<DiaperEntry, 'id' | 'babyId' | 'timestamp'>) {
    const newEntry: DiaperEntry = {
      ...entry,
      id: `d-${Math.random().toString(36).substr(2, 9)}`,
      babyId: 'baby-1',
      timestamp: new Date().toISOString(),
      type: 'diaper'
    };
    this.diapers = [newEntry, ...this.diapers];
    console.log('MockStore: Diaper saved', newEntry);
    return newEntry;
  }

  addHealth(entry: Omit<HealthEntry, 'id' | 'babyId' | 'timestamp'>) {
    const newEntry: HealthEntry = {
      ...entry,
      id: `h-${Math.random().toString(36).substr(2, 9)}`,
      babyId: 'baby-1',
      timestamp: new Date().toISOString(),
      type: 'health'
    };
    this.health = [newEntry, ...this.health];
    console.log('MockStore: Health saved', newEntry);
    return newEntry;
  }
}

export const mockStore = new MockStore();
