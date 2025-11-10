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
