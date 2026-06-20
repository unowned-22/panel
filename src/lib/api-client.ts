export class ApiError extends Error {
    public readonly status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export interface ApiClientConfig {
    baseUrl: string;
    getToken: () => string | undefined;
    getRefreshToken: () => string | undefined;
    onTokenRefreshed: (auth: { access_token: string; refresh_token?: string }) => void;
    onAuthFailure: () => void;
}

export default class ApiClient {
    private baseUrl: string;
    private getToken: () => string | undefined;
    private getRefreshToken: () => string | undefined;
    private onTokenRefreshed: (auth: { access_token: string; refresh_token?: string }) => void;
    private onAuthFailure: () => void;

    private refreshingPromise: Promise<boolean> | null = null;

    constructor(cfg: ApiClientConfig) {
        this.baseUrl = cfg.baseUrl.replace(/\/$/, '');
        this.getToken = cfg.getToken;
        this.getRefreshToken = cfg.getRefreshToken;
        this.onTokenRefreshed = cfg.onTokenRefreshed;
        this.onAuthFailure = cfg.onAuthFailure;
    }

    async get<T>(path: string, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.request<T>('GET', path, undefined, opts);
    }

    async post<T>(path: string, body: unknown, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.request<T>('POST', path, body, opts);
    }

    async patch<T>(path: string, body: unknown, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.request<T>('PATCH', path, body, opts);
    }

    async put<T>(path: string, body: unknown, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.request<T>('PUT', path, body, opts);
    }

    async delete<T>(path: string, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.request<T>('DELETE', path, undefined, opts);
    }

    async upload<T>(path: string, file: File, opts?: { logoutOn401?: boolean }): Promise<T> {
        return this.requestFormData<T>('POST', path, file, opts);
    }

    private async request<T>(method: string, path: string, body?: unknown, opts?: { logoutOn401?: boolean }): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string,string> = { 'Content-Type': 'application/json' };
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(url, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
        });

        if (res.status === 401) {
            const logoutOn401 = opts?.logoutOn401 ?? true;
            // Never attempt refresh for the refresh endpoint itself, or for
            // requests that were already anonymous (no token to begin with) —
            // those aren't a "session expired" event and must not trigger a
            // redirect to /auth/login (which would just loop forever on
            // public/unauthenticated pages like the login page itself).
            if (path === '/auth/refresh' || !logoutOn401 || !token) {
                const text = await safeText(res);
                throw new ApiError(res.status, text || res.statusText);
            }

            const refreshed = await this.getOrCreateRefresh();
            if (!refreshed) {
                this.onAuthFailure();
                const text = await safeText(res);
                throw new ApiError(res.status, text || res.statusText);
            }

            // retry with new token
            const newToken = this.getToken();
            const retryHeaders = { ...headers };
            if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`;

            const retryRes = await fetch(url, {
                method,
                headers: retryHeaders,
                body: body === undefined ? undefined : JSON.stringify(body),
            });

            if (!retryRes.ok) {
                const text = await safeText(retryRes);
                throw new ApiError(retryRes.status, text || retryRes.statusText);
            }

            return retryRes.json();
        }

        if (!res.ok) {
            const text = await safeText(res);
            throw new ApiError(res.status, text || res.statusText);
        }

        if (res.status === 204) return undefined as T;

        return res.json();
    }

    private async requestFormData<T>(method: string, path: string, file: File, opts?: { logoutOn401?: boolean }): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {};
        const token = this.getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch(url, { method, headers, body: formData });

        if (res.status === 401) {
            const logoutOn401 = opts?.logoutOn401 ?? true;
            if (path === '/auth/refresh' || !logoutOn401 || !token) {
                const text = await safeText(res);
                throw new ApiError(res.status, text || res.statusText);
            }

            const refreshed = await this.getOrCreateRefresh();
            if (!refreshed) {
                this.onAuthFailure();
                const text = await safeText(res);
                throw new ApiError(res.status, text || res.statusText);
            }

            const newToken = this.getToken();
            const retryHeaders = { ...headers };
            if (newToken) retryHeaders['Authorization'] = `Bearer ${newToken}`;

            const retryFormData = new FormData();
            retryFormData.append('file', file);

            const retryRes = await fetch(url, { method, headers: retryHeaders, body: retryFormData });
            if (!retryRes.ok) {
                const text = await safeText(retryRes);
                throw new ApiError(retryRes.status, text || retryRes.statusText);
            }
            return retryRes.json();
        }

        if (!res.ok) {
            const text = await safeText(res);
            throw new ApiError(res.status, text || res.statusText);
        }

        return res.json();
    }

    private async getOrCreateRefresh(): Promise<boolean> {
        if (this.refreshingPromise) return this.refreshingPromise;

        this.refreshingPromise = (async () => {
            try {
                const refreshToken = this.getRefreshToken();
                if (!refreshToken) return false;

                const res = await fetch(`${this.baseUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (!res.ok) return false;

                const body = await res.json();
                const newAuth = { access_token: body.data.access_token, refresh_token: body.data.refresh_token };
                this.onTokenRefreshed(newAuth);
                return true;
            } catch {
                return false;
            } finally {
                // clear promise after completion so subsequent refreshes may run
                this.refreshingPromise = null;
            }
        })();

        return this.refreshingPromise;
    }
}

async function safeText(res: Response): Promise<string> {
    try {
        const txt = await res.text();
        if (!txt) return '';
        try {
            const j = JSON.parse(txt);
            if (j?.message) return String(j.message);
            if (j?.error) return String(j.error);
            return typeof j === 'string' ? j : JSON.stringify(j);
        } catch {
            return txt;
        }
    } catch {
        return '';
    }
}

import type { AuthModel } from '@/auth/auth-model';
import { useAuthStore } from '@/auth/auth.store';

export const apiClient = new ApiClient({
    baseUrl: import.meta.env.VITE_API_URL ?? '',

    getToken: () => {
        const { tokens, activeAccountId } = useAuthStore.getState();
        if (!activeAccountId) return undefined;
        return tokens[activeAccountId]?.access_token;
    },

    getRefreshToken: () => {
        const { tokens, activeAccountId } = useAuthStore.getState();
        if (!activeAccountId) return undefined;
        return tokens[activeAccountId]?.refresh_token;
    },

    onTokenRefreshed: (newAuth) => {
        const { activeAccountId } = useAuthStore.getState();
        if (activeAccountId) {
            useAuthStore.getState().setTokens(activeAccountId, newAuth as AuthModel);
        }
    },

    onAuthFailure: () => {
        const { activeAccountId } = useAuthStore.getState();
        if (activeAccountId) {
            useAuthStore.getState().removeTokens(activeAccountId);
        }
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
    },
});