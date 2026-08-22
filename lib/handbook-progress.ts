import { storage } from '@/lib/storage';
import type { TestId } from '@/lib/tests';

export type HandbookProgress = {
  pageIndex: number;
  pageCount: number;
};

const key = (testId: TestId) => `driving-bible.handbook.${testId}`;

export function getHandbookProgress(testId: TestId): HandbookProgress | null {
  const value = storage.get<HandbookProgress | null>(key(testId), null);
  if (
    !value ||
    typeof value.pageIndex !== 'number' ||
    typeof value.pageCount !== 'number' ||
    value.pageCount < 1
  ) {
    return null;
  }
  return {
    pageIndex: Math.max(0, Math.min(value.pageIndex, value.pageCount - 1)),
    pageCount: value.pageCount,
  };
}

export function setHandbookProgress(testId: TestId, progress: HandbookProgress) {
  storage.set(key(testId), progress);
}

export function progressPercent(progress: HandbookProgress | null) {
  if (!progress || progress.pageCount < 1) {
    return 0;
  }
  return Math.round(((progress.pageIndex + 1) / progress.pageCount) * 100);
}
