/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
