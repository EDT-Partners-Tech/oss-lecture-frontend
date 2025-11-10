// © [2025] EDT&Partners. Licensed under CC BY 4.0.
export const getLocalStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(key);
  }
  return null;
};

export const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, value);
  }
};

export const removeLocalStorageItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
};
