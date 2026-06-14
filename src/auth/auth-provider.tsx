import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react';
import type { AuthModel, UserModel } from './auth-model';
import { AuthContext } from './auth-context';
import { toast } from '@/hooks/use-toast';
import ApiClient from '@/lib/api-client';

const STORAGE_KEY = 'unowned_auth_v1';
const API_URL = import.meta.env.VITE_API_URL ?? '';

export function AuthProvider({ children }: { children: ReactNode }) {
    const verifyingRef = useRef(false);
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

    const clientRef = useRef<ApiClient | null>(null);
    const authRef = useRef(auth);
    useEffect(() => { authRef.current = auth; }, [auth]);

    useEffect(() => {
        if (!clientRef.current) {
            clientRef.current = new ApiClient({
                baseUrl: API_URL,
                getToken: () => authRef.current?.access_token,
                getRefreshToken: () => authRef.current?.refresh_token,
                onTokenRefreshed: (newAuth) => saveAuth(newAuth as AuthModel),
                onAuthFailure: () => { saveAuth(undefined); setUser(undefined); },
            });
        }
    }, []);

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const client = clientRef.current;
            if (!client) throw new Error('Api client not initialized');
            const body = await client.post<{ data: AuthModel }>('/auth/login', { email, password }, { logoutOn401: false });
            saveAuth(body.data);
            const me = await client.get<{ data: UserModel }>('/users/me');
            setUser(me.data);
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
            const client = clientRef.current;
            if (!client) throw new Error('Api client not initialized');
            await client.post('/auth/register', { email, password, full_name, username, ...(phone ? { phone } : {}) });
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
            const client = clientRef.current;
            if (!client) throw new Error('Api client not initialized');
            const data = await client.get<{ data: UserModel }>('/users/me');
            setUser(data.data);
            return data.data;
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
    }, [auth]);

    async function requestPasswordReset(email: string) {
        const client = clientRef.current;
        if (!client) throw new Error('Api client not initialized');
        await client.post('/auth/password/request', { email });
    }

    async function resetPassword(password: string, password_confirmation: string) {
        const client = clientRef.current;
        if (!client) throw new Error('Api client not initialized');
        await client.post('/auth/password/reset', { password, password_confirmation });
    }

    async function resendVerificationEmail(email: string) {
        const client = clientRef.current;
        if (!client) throw new Error('Api client not initialized');
        await client.post('/auth/resend-verification', { email });
    }

    async function updateProfile(userData: Partial<UserModel>): Promise<UserModel> {
        const client = clientRef.current;
        if (!client) throw new Error('Api client not initialized');
        const updated = await client.put<{ data: UserModel }>('/auth/me', userData);
        setUser(updated.data as UserModel);
        return updated.data as UserModel;
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