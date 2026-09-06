// WebViews can reject access to localStorage itself, not only setItem.
// Keep the existing keys/serialization; never silently clear an unreadable save.
let storageFailed = false;
const subscribers = new Set<() => void>();
const unreadableKeys = new Set<string>();

function reportFailure() {
  storageFailed = true;
  subscribers.forEach((notify) => notify());
}

export function subscribeToStorageFailure(notify: () => void) {
  subscribers.add(notify);
  return () => { subscribers.delete(notify); };
}
export const getStorageFailure = () => storageFailed;
export const getServerStorageFailure = () => false;

export const browserStorage = {
  getItem(key: string): string | null {
    try {
      const value = window.localStorage.getItem(key);
      unreadableKeys.delete(key);
      return value;
    }
    catch { unreadableKeys.add(key); reportFailure(); return null; }
  },
  setItem(key: string, value: string): boolean {
    // A failed initial read must not turn a previously saved game into a new save
    // if write access later becomes available. Read successfully or explicitly reset first.
    if (unreadableKeys.has(key)) { reportFailure(); return false; }
    try { window.localStorage.setItem(key, value); return true; }
    catch { reportFailure(); return false; }
  },
  removeItem(key: string): boolean {
    try { window.localStorage.removeItem(key); unreadableKeys.delete(key); return true; }
    catch { reportFailure(); return false; }
  },
};
