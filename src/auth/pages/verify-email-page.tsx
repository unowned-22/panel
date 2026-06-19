import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toAbsoluteUrl } from '@/lib/helpers';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from "@/hooks/use-translation";

type Status = 'loading' | 'success' | 'error' | 'pending';

export function VerifyEmailPage() {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const mode = searchParams.get('mode');
    const emailParam = searchParams.get('email');

    const [status, setStatus] = useState<Status>(
        token ? 'loading' : mode === 'pending' ? 'pending' : 'error'
    );
    const [message, setMessage] = useState(
        token
            ? ''
            : mode === 'pending'
                ? t('page.auth.verify-email.sent-message').replace('{email}', emailParam ?? t('page.auth.verify-email.no-email-toast'))
                : t('page.auth.verify-email.token-missing')
    );
    const [isResending, setIsResending] = useState(false);
    const COOLDOWN_SECONDS = 60;
    const [cooldown, setCooldown] = useState(0);

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
            toast({ title: t('page.auth.verify-email.no-email-toast'), variant: 'destructive' });
            return;
        }
        try {
            setIsResending(true);
            await apiClient.post('/auth/resend-verification', { email: emailParam });
            try {
                const key = `resend_verification_${emailParam}`;
                sessionStorage.setItem(key, String(Date.now()));
            } catch {
                // ignore storage errors
            }
            setCooldown(COOLDOWN_SECONDS);
            setMessage(t('page.auth.verify-email.sent-message').replace('{email}', emailParam));
            toast({
                title: t('page.auth.verify-email.sent-toast-title'),
                description: t('page.auth.verify-email.sent-toast-desc').replace('{email}', emailParam),
            });
        } catch (err: any) {
            toast({
                title: err?.message ?? t('page.auth.verify-email.error-send-failed'),
                variant: 'destructive',
            });
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
                setMessage(err?.message ?? t('page.auth.verify-email.error-default'));
                setStatus('error');
            });
    }, [token]);

    const resendLabel = isResending
        ? t('page.auth.verify-email.sending')
        : cooldown > 0
            ? t('page.auth.verify-email.resend-cooldown').replace('{seconds}', String(cooldown))
            : t('page.auth.verify-email.resend');

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="flex flex-col items-center text-center mb-6">
                <img className="h-12" src={toAbsoluteUrl('/u.png')} alt={t('name')} />
                <h1 className="mt-4 text-2xl font-semibold">{t('page.auth.verify-email.title')}</h1>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{t('page.auth.verify-email.loading')}</p>
                    </>
                )}

                {status === 'pending' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-primary" />
                        <p className="text-sm font-medium">{t('page.auth.verify-email.pending-title')}</p>
                        <p className="text-xs text-muted-foreground">{message}</p>
                        <Button
                            onClick={handleResend}
                            disabled={isResending || cooldown > 0}
                            variant="outline"
                            className="w-full h-11 rounded-lg mt-2"
                        >
                            {resendLabel}
                        </Button>
                        <Button asChild className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">{t('page.auth.verify-email.go-to-login')}</Link>
                        </Button>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="text-sm font-medium">{t('page.auth.verify-email.success-title')}</p>
                        <p className="text-xs text-muted-foreground">{t('page.auth.verify-email.success-message')}</p>
                        <Button asChild className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">{t('page.auth.verify-email.login')}</Link>
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-destructive" />
                        <p className="text-sm font-medium">{t('page.auth.verify-email.error-title')}</p>
                        <p className="text-xs text-muted-foreground">{message}</p>
                        {emailParam && (
                            <Button
                                onClick={handleResend}
                                disabled={isResending || cooldown > 0}
                                variant="outline"
                                className="w-full h-11 rounded-lg mt-2"
                            >
                                {resendLabel}
                            </Button>
                        )}
                        <Button asChild variant="outline" className="w-full h-11 rounded-lg mt-2">
                            <Link to="/auth/login">{t('page.auth.verify-email.to-login')}</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}