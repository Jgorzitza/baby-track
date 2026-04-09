import { getOfflineDb, type PendingMutationRecord } from './db';

export const enqueueMutation = async (item: PendingMutationRecord): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('pending_mutations', item);
};

export const getPendingMutations = async (): Promise<PendingMutationRecord[]> => {
  const db = await getOfflineDb();
  return (await db.getAllFromIndex('pending_mutations', 'by_created_at')).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
};

export const removePendingMutation = async (id: string): Promise<void> => {
  const db = await getOfflineDb();
  await db.delete('pending_mutations', id);
};

export const updatePendingMutation = async (item: PendingMutationRecord): Promise<void> => {
  const db = await getOfflineDb();
  await db.put('pending_mutations', item);
};

export const countPendingMutations = async (): Promise<number> => {
  const db = await getOfflineDb();
  return db.count('pending_mutations');
};

export const clearPendingMutations = async (): Promise<void> => {
  const db = await getOfflineDb();
  await db.clear('pending_mutations');
};
