import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<Status>('loading');
    const [message, setMessage] = useState('');
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return; // строгий режим React — не делать дважды
        called.current = true;

        if (!token) {
            setStatus('error');
            setMessage('Токен не найден в ссылке.');
            return;
        }

        fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                if (res.ok) {
                    setStatus('success');
                } else {
                    const body = await res.json().catch(() => ({}));
                    setStatus('error');
                    setMessage(body?.error?.message ?? 'Неверный или истёкший токен.');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Не удалось соединиться с сервером.');
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
                        <Button asChild variant="outline" className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">На страницу входа</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}