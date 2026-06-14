import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import type { AuthModel, UserModel } from './auth-model';
import { AuthContext } from './auth-context';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'unowned_auth_v1';
const API_URL = import.meta.env.VITE_API_URL ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
    const verifyingRef = useRef(false);
    const refreshingRef = useRef(false);
    const [loading, setLoading] = useState(false);
    const [auth, setAuth] = useState<AuthModel | undefined>(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch {}
        return undefined;
    });
    const [user, setUser] = useState<UserModel | undefined>(undefined);

    useEffect(() => {
        try {
            if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
            else localStorage.removeItem(STORAGE_KEY);
        } catch {}
    }, [auth]);

    const saveAuth = (a: AuthModel | undefined) => setAuth(a);

    async function requestJson(path: string, opts: RequestInit = {}, logoutOn401 = true) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (auth?.access_token) headers['Authorization'] = `Bearer ${auth.access_token}`;

        const res = await fetch(`${API_URL}${path}`, { ...opts, headers });

        if (res.status === 401 && logoutOn401) {
            const newToken = await refreshToken();
            if (newToken) {
                const retryRes = await fetch(`${API_URL}${path}`, {
                    ...opts,
                    headers: { ...headers, 'Authorization': `Bearer ${newToken}` },
                });
                if (retryRes.ok) return retryRes.json();
            }

            saveAuth(undefined);
            setUser(undefined);
            const text = await res.text();
            throw new Error(text || res.statusText);
        }

        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || res.statusText);
        }

        return res.json();
    }

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const body = await requestJson(`/auth/login`, {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            const newAuth = {
                access_token: body.data.access_token,
                refresh_token: body.data.refresh_token,
            };
            saveAuth(newAuth);
            await getUserWithToken(newAuth.access_token);
            toast({ title: 'Вход выполнен' });
        } catch (err: any) {
            toast({ title: 'Ошибка входа', description: err?.message ?? String(err), variant: 'destructive' });
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function register(
        email: string,
        password: string,
        full_name: string,
        username: string,
        phone?: string,
    ) {
        setLoading(true);
        try {
            await requestJson(`/auth/register`, {
                method: 'POST',
                body: JSON.stringify({ email, password, full_name, username, ...(phone ? { phone } : {}) }),
            });
            toast({ title: 'Аккаунт создан', description: 'Проверьте почту для подтверждения' });
        } catch (err: any) {
            toast({ title: 'Ошибка регистрации', description: err?.message, variant: 'destructive' });
            throw err;
        } finally {
            setLoading(false);
        }
    }

    async function refreshToken(): Promise<string | null> {
        if (refreshingRef.current) return null;
        if (!auth?.refresh_token) return null;

        refreshingRef.current = true;
        try {
            const res = await fetch(`${API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: auth.refresh_token }),
            });
            if (!res.ok) return null;

            const body = await res.json();
            const newAuth = {
                access_token: body.data.access_token,
                refresh_token: body.data.refresh_token,
            };
            saveAuth(newAuth);
            return newAuth.access_token;
        } catch {
            return null;
        } finally {
            refreshingRef.current = false;
        }
    }

    async function getUserWithToken(token: string): Promise<UserModel | null> {
        try {
            const res = await fetch(`${API_URL}/users/me`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            setUser(data);
            return data;
        } catch {
            setUser(undefined);
            return null;
        }
    }

    async function getUser(): Promise<UserModel | null> {
        try {
            const data = await requestJson("/users/me");
            setUser(data as UserModel);
            return data as UserModel;
        } catch {
            setUser(undefined);
            return null;
        }
    }

    const verify = useCallback(async () => {
        if (!auth) return Promise.reject(new Error('No auth'));
        if (verifyingRef.current) return;
        verifyingRef.current = true;
        setLoading(true);
        try {
            await getUser();
        } finally {
            setLoading(false);
            verifyingRef.current = false;
        }
    }, [auth, getUser]);

    async function requestPasswordReset(email: string) {
        await requestJson(`/auth/password/request`, { method: 'POST', body: JSON.stringify({ email }) });
    }

    async function resetPassword(password: string, password_confirmation: string) {
        await requestJson(`/auth/password/reset`, { method: 'POST', body: JSON.stringify({ password, password_confirmation }) });
    }

    async function resendVerificationEmail(email: string) {
        await requestJson(`/auth/resend-verification`, { method: 'POST', body: JSON.stringify({ email }) });
    }

    async function updateProfile(userData: Partial<UserModel>): Promise<UserModel> {
        const updated = await requestJson(`/auth/me`, { method: 'PUT', body: JSON.stringify(userData) });
        setUser(updated as UserModel);
        return updated as UserModel;
    }

    function logout() {
        saveAuth(undefined);
        setUser(undefined);
    }

    const isAdmin = user?.role !== "user";

    return (
        <AuthContext.Provider
            value={{
                loading,
                setLoading,
                auth,
                saveAuth,
                user,
                setUser,
                login,
                register,
                requestPasswordReset,
                resetPassword,
                resendVerificationEmail,
                getUser,
                updateProfile,
                logout,
                verify,
                isAdmin,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}