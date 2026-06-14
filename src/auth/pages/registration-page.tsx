import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/auth/auth-context";
import { toAbsoluteUrl } from "@/lib/helpers";

export function RegistrationPage() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [email, setEmail] = useState("");
    const [name, setName] = useState("");       // full_name
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");

    const handleSubmit = (e: FormEvent)=> {
        e.preventDefault();
        const trimmedUser = username.trim();
        const trimmedName = name.trim();

        if (!trimmedName || !trimmedUser || !phone || !password || !confirm) {
            toast({ title: "Заполните все поля", variant: "destructive" });
            return;
        }
        if (password !== confirm) {
            toast({ title: "Пароли не совпадают", variant: "destructive" });
            return;
        }
        if (password.length < 8) {
            toast({ title: "Пароль должен быть не менее 8 символов", variant: "destructive" });
            return;
        }
        (async () => {
            try {
                await register(email.trim(), password, name.trim(), username.trim(), phone || undefined);
                navigate('/auth/login');
            } catch (err) {
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
                        alt="Unowned"
                    />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">Registration</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create an account Unowned, to connect
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Имя и фамилия</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Иван Иванов"
                        autoComplete="name"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="user@example.com" required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="@username"
                        autoComplete="username"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Номер телефона</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+7 (999) 000-00-00"
                        autoComplete="tel"
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
                        placeholder="Минимум 6 символов"
                        autoComplete="new-password"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="confirm">Повторите пароль</Label>
                    <Input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                    />
                </div>

                <p className="text-xs text-muted-foreground">
                    Регистрируясь, вы принимаете{" "}
                    <span className="text-primary cursor-pointer">Пользовательское соглашение</span> и{" "}
                    <span className="text-primary cursor-pointer">Политику конфиденциальности</span>.
                </p>

                <Button type="submit" className="w-full h-11 rounded-lg">
                    Создать аккаунт
                </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary">
                    Login
                </Link>
            </p>
        </div>
    );
}