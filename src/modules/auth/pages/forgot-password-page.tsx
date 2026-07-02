import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/api/auth";
import { useTranslation } from "@/hooks/use-translation";
import { toAbsoluteUrl } from "@/lib/helpers";

export function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        (async () => {
            setLoading(true);
            try {
                await authApi.requestPasswordReset(email.trim());
            } catch {
                // intentionally silent — we never reveal whether the email exists
            } finally {
                setLoading(false);
                setSubmitted(true);
            }
        })();
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="flex flex-col items-center text-center mb-6">
                <span className="w-12 h-12 flex items-center justify-center">
                    <img
                        className="h-12 max-w-none"
                        src={toAbsoluteUrl('/u.png')}
                        alt={t('name')}
                    />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">{t('page.auth.forgot-password.title')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('page.auth.forgot-password.subtitle')}
                </p>
            </div>

            {submitted ? (
                <div className="space-y-4">
                    <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                        {t('page.auth.forgot-password.submitted-message').split('{email}')[0]}
                        <span className="font-medium text-foreground">{email}</span>
                        {t('page.auth.forgot-password.submitted-message').split('{email}')[1]}
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                        {t('page.auth.forgot-password.no-email')}{" "}
                        <button
                            type="button"
                            onClick={() => setSubmitted(false)}
                            className="text-primary hover:underline"
                        >
                            {t('page.auth.forgot-password.try-again')}
                        </button>
                        .
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-lg" disabled={loading}>
                        {loading
                            ? t('page.auth.forgot-password.sending')
                            : t('page.auth.forgot-password.send-link')
                        }
                    </Button>
                </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/auth/login" className="text-primary hover:underline">
                    {t('page.auth.back-to-login')}
                </Link>
            </p>
        </div>
    );
}