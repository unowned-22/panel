import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/auth/auth-context";
import { toAbsoluteUrl } from "@/lib/helpers";

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        (async () => {
            try {
                await login(email.trim(), password);
                navigate('/feed');
            } catch (err) {
                // error handled by AuthProvider toast
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
                        alt="Unowned"
                    />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">Login</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    let's chat
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="username">Email</Label>
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
                <div className="space-y-1.5">
                    <Label htmlFor="password">Пароль</Label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <Button type="submit" className="w-full h-11 rounded-lg">
                    Войти
                </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
            </div>

            <Link
                to="/auth/qr-login"
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-secondary text-sm font-medium hover:bg-accent"
            >
                <QrCode className="w-4 h-4" /> Enter by QR
            </Link>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Нет аккаунта? <span className="text-primary cursor-pointer">
                    <Link to="/auth/registration">Registration</Link>
                </span>
            </p>
        </div>
    );
}