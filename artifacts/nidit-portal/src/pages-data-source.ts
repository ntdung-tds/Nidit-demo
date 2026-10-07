import { useSyncExternalStore } from 'react';

type Source = 'live' | 'fallback' | 'snapshot';
let state: { source: Source; capturedAt: string } = { source: 'live', capturedAt: '' };
const listeners = new Set<() => void>();

export function setPagesDataSource(source: Source, capturedAt: string) {
  if (state.source === source && state.capturedAt === capturedAt) return;
  state = { source, capturedAt };
  listeners.forEach((listener) => listener());
}

export function usePagesDataSource() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => state,
    () => state,
  );
}
