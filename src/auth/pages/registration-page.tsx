import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { toAbsoluteUrl } from "@/lib/helpers";

export function RegistrationPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedUser = username.trim();
        const trimmedName = name.trim();

        if (!trimmedName || !trimmedUser || !phone || !password || !confirm) {
            toast({ title: t('page.auth.registration.fill-all-fields'), variant: "destructive" });
            return;
        }
        if (password !== confirm) {
            toast({ title: t('page.auth.registration.passwords-mismatch'), variant: "destructive" });
            return;
        }
        if (password.length < 8) {
            toast({ title: t('page.auth.registration.password-too-short'), variant: "destructive" });
            return;
        }
        (async () => {
            try {
                await register(email.trim(), password, name.trim(), username.trim(), phone || undefined);
                navigate(`/auth/verify-email?mode=pending&email=${encodeURIComponent(email.trim())}`);
            } catch {
                // error shown by AuthProvider
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
                <h1 className="mt-4 text-2xl font-semibold">{t('page.auth.registration')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('page.auth.registration.subtitle')}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">{t('page.auth.registration.full-name')}</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        autoComplete="name"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="username">{t('page.auth.registration.username')}</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                        autoComplete="username"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">{t('page.auth.registration.phone')}</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (999) 000-0000"
                        autoComplete="tel"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="password">{t('page.auth.registration.password')}</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="confirm">{t('page.auth.registration.confirm-password')}</Label>
                    <Input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />
                </div>

                <Button type="submit" className="w-full h-11 rounded-lg">
                    {t('page.auth.registration.submit')}
                </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                {t('page.auth.registration.have-account')}{" "}
                <Link to="/auth/login" className="text-primary">
                    {t('page.auth.login')}
                </Link>
            </p>
        </div>
    );
}