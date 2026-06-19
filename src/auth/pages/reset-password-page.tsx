import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authActions } from "@/auth/auth-actions";
import { toAbsoluteUrl } from "@/lib/helpers";

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect immediately if there's no token in the URL
    useEffect(() => {
        if (!token) {
            navigate("/auth/login", { replace: true });
        }
    }, [token, navigate]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 8) {
            setError("Пароль должен содержать не менее 8 символов.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Пароли не совпадают.");
            return;
        }

        (async () => {
            setLoading(true);
            try {
                await authActions.resetPassword(token, newPassword);
                navigate("/auth/login", {
                    replace: true,
                    state: { passwordReset: true },
                });
            } catch {
                setError("Ссылка недействительна или истекла. Запросите новую.");
            } finally {
                setLoading(false);
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
                        alt="logo"
                    />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">Новый пароль</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Придумайте надёжный пароль для вашего аккаунта
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="new-password">Новый пароль</Label>
                    <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        minLength={8}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </div>

                {error && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" className="w-full h-11 rounded-lg" disabled={loading}>
                    {loading ? "Сохранение…" : "Сохранить пароль"}
                </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/auth/login" className="text-primary hover:underline">
                    ← Вернуться ко входу
                </Link>
            </p>
        </div>
    );
}
