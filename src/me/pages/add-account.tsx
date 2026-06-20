import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { authActions } from "@/auth/auth-actions";
import { useAccount } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";

const AddAccountPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { addAccount, switchAccount } = useAccount();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        (async () => {
            try {
                const newId = `acc_${Date.now().toString(36)}`;
                const user = await authActions.addAccount(email.trim(), password, newId);

                addAccount({
                    id: newId,
                    name: user.full_name,
                    username: user.username,
                    user,
                });

                await switchAccount(newId);

                navigate('/me/account');
            } catch {
                toast({ title: t('page.account.add.error'), variant: "destructive" });
            } finally {
                setSubmitting(false);
            }
        })();
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated max-w-md mx-auto">
            <div className="flex flex-col items-center text-center mb-6">
                <h1 className="mt-4 text-2xl font-semibold">{t('page.account.add.title')}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t('page.account.add.subtitle')}
                </p>
            </div>

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
                <div className="space-y-1.5">
                    <Label htmlFor="password">{t('page.auth.login.password')}</Label>
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

                <Button type="submit" className="w-full h-11 rounded-lg" disabled={submitting}>
                    {t('page.account.add.submit')}
                </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                <Link to="/me/account" className="text-primary">
                    {t('page.account.add.back')}
                </Link>
            </p>
        </div>
    );
};

export default AddAccountPage;
