import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';

type Status = 'loading' | 'success' | 'error' | 'pending';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const mode = searchParams.get('mode');
    const emailParam = searchParams.get('email');

    const [status, setStatus] = useState<Status>(
        token ? 'loading' : mode === 'pending' ? 'pending' : 'error'
    );
    const [message, setMessage] = useState(
        token ? '' : mode === 'pending' ? `Мы отправили письмо на ${emailParam ?? 'указанный адрес'}. Проверьте почту и следуйте инструкциям.` : 'Токен не найден в ссылке.'
    );
    const [isResending, setIsResending] = useState(false);
    const COOLDOWN_SECONDS = 60;
    const [cooldown, setCooldown] = useState(0);

    // initialize cooldown from sessionStorage per email
    useEffect(() => {
        if (!emailParam) {
            setCooldown(0);
            return;
        }
        try {
            const key = `resend_verification_${emailParam}`;
            const last = sessionStorage.getItem(key);
            if (last) {
                const elapsed = Math.floor((Date.now() - Number(last)) / 1000);
                const remain = Math.max(0, COOLDOWN_SECONDS - elapsed);
                setCooldown(remain);
            }
        } catch {
            setCooldown(0);
        }
    }, [emailParam]);

    // countdown interval
    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    const handleResend = async () => {
        if (!emailParam) {
            toast({ title: 'Email не указан', variant: 'destructive' });
            return;
        }
        try {
            setIsResending(true);
            await apiClient.post('/auth/resend-verification', { email: emailParam });
            // set cooldown
            try {
                const key = `resend_verification_${emailParam}`;
                sessionStorage.setItem(key, String(Date.now()));
            } catch {
                // ignore storage errors
            }
            setCooldown(COOLDOWN_SECONDS);
            setMessage(`Мы отправили письмо на ${emailParam}. Проверьте почту.`);
            toast({ title: 'Письмо отправлено', description: `Письмо отправлено на ${emailParam}` });
        } catch (err: any) {
            toast({ title: err?.message ?? 'Не удалось отправить письмо', variant: 'destructive' });
        } finally {
            setIsResending(false);
        }
    };
    const called = useRef(false);

    useEffect(() => {
        if (!token || called.current) return;
        called.current = true;

        apiClient
            .get(`/auth/verify-email?token=${encodeURIComponent(token)}`, { logoutOn401: false })
            .then(() => setStatus('success'))
            .catch((err: any) => {
                setMessage(err?.message ?? 'Неверный или истёкший токен.');
                setStatus('error');
            });
    }, [token]);

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="flex flex-col items-center text-center mb-6">
                <img className="h-12" src={toAbsoluteUrl('/u.png')} alt="Unowned" />
                <h1 className="mt-4 text-2xl font-semibold">Подтверждение email</h1>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Проверяем токен…</p>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-primary" />
                        <p className="text-sm font-medium">Подтвердите email</p>
                        <p className="text-xs text-muted-foreground">{message}</p>
                        <Button onClick={handleResend} disabled={isResending || cooldown > 0} variant="outline" className="w-full h-11 rounded-lg mt-2">
                            {isResending ? 'Отправляем…' : cooldown > 0 ? `Отправить повторно (${cooldown}s)` : 'Отправить повторно'}
                        </Button>
                        <Button asChild className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">Перейти на страницу входа</Link>
                        </Button>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm font-medium">Email подтверждён!</p>
                        <p className="text-xs text-muted-foreground">Теперь вы можете войти в аккаунт.</p>
                        <Button asChild className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">Войти</Link>
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-destructive" />
                        <p className="text-sm font-medium">Не удалось подтвердить email</p>
                        <p className="text-xs text-muted-foreground">{message}</p>
                        {emailParam && (
                            <Button onClick={handleResend} disabled={isResending || cooldown > 0} variant="outline" className="w-full h-11 rounded-lg mt-2">
                                {isResending ? 'Отправляем…' : cooldown > 0 ? `Отправить повторно (${cooldown}s)` : 'Отправить повторно'}
                            </Button>
                        )}
                        <Button asChild variant="outline" className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">На страницу входа</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}