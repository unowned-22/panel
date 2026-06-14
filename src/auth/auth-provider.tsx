import { useEffect, useState, type ReactNode } from 'react';
import type { AuthModel, UserModel } from './auth-model';
import { AuthContext } from './auth-context';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'unowned_auth_v1';
const API_URL = import.meta.env.VITE_API_URL ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
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

    async function requestJson(path: string, opts: RequestInit = {}) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (auth?.access_token) headers['Authorization'] = `Bearer ${auth.access_token}`;
        const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
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
            saveAuth({
                access_token: body.data.access_token,
                refresh_token: body.data.refresh_token,
            });
            await verify();
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

    async function verify() {
        if (!auth) return Promise.reject(new Error('No auth'));
        setLoading(true);
        try {
            await getUser();
        } finally {
            setLoading(false);
        }
    }

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