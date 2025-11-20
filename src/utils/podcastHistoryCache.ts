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

import { PodcastDetailsItem } from '../types';

const CACHE_KEY_PODCAST_HISTORY = 'podcastHistory';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in ms

export const setCache = (data: PodcastDetailsItem[]) => {
  const cacheData = {
    timestamp: Date.now(),
    data,
  };
  localStorage.setItem(CACHE_KEY_PODCAST_HISTORY, JSON.stringify(cacheData));
};

export const invalidateCache = () => {
  localStorage.removeItem(CACHE_KEY_PODCAST_HISTORY);
};

export const getCache = (): PodcastDetailsItem[] | null => {
  const cacheData = localStorage.getItem(CACHE_KEY_PODCAST_HISTORY);
  if (!cacheData) return null;
  try {
    const parsed = JSON.parse(cacheData);
    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
      return parsed.data;
    }
    invalidateCache();
    return null;
  } catch (error) {
    invalidateCache();
    return null;
  }
};
