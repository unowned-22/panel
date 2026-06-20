import { apiClient } from './api-client';
import type { Language } from '@/i18n/types';
import type { NavItemKey } from '@/context/settings-context';
import { DEFAULT_VISIBLE } from '@/context/settings-context';

export interface UserPreferences {
    nav_config: NavItemKey[];
    language: Language;
}

// In-memory cache — prevents double PATCH when nav_config and language save in the same tick
let cached: UserPreferences | null = null;

// Deduplication: both providers call fetchOnce(); only one HTTP request is made
let fetchPromise: Promise<UserPreferences | null> | null = null;

/**
 * Fetch preferences from API once per session.
 * Subsequent calls return the same in-flight promise or the cached result.
 */
export function fetchUserPreferences(): Promise<UserPreferences | null> {
    if (cached !== null) return Promise.resolve(cached);
    if (fetchPromise) return fetchPromise;

    fetchPromise = (async () => {
        try {
            const res = await apiClient.get<{ data: { theme: unknown } }>('/users/me/settings');
            const theme = res.data?.theme;

            if (theme && typeof theme === 'object' && !Array.isArray(theme)) {
                const t = theme as Record<string, unknown>;
                cached = {
                    nav_config: Array.isArray(t['nav_config'])
                        ? (t['nav_config'] as NavItemKey[])
                        : [...DEFAULT_VISIBLE],
                    language: (typeof t['language'] === 'string' ? t['language'] : 'en') as Language,
                };
                return cached;
            }
            return null;
        } catch {
            return null;
        } finally {
            fetchPromise = null;
        }
    })();

    return fetchPromise;
}

/**
 * Merge a partial update into the cache and PATCH to the API.
 * Both nav_config and language changes go through here so they never overwrite each other.
 */
export async function saveUserPreferences(partial: Partial<UserPreferences>): Promise<void> {
    cached = {
        nav_config: partial.nav_config ?? cached?.nav_config ?? [...DEFAULT_VISIBLE],
        language: partial.language ?? cached?.language ?? 'en',
    };

    await apiClient.patch('/users/me/settings', { theme: cached });
}

/**
 * Clear the cache on logout so the next login starts fresh.
 */
export function clearPreferencesCache(): void {
    cached = null;
    fetchPromise = null;
}