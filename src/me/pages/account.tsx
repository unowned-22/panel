import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle2, LogOut, Plus, Shield, Trash2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import { useAccount, getInitials } from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { useState } from "react";

const Account = () => {
    const { t } = useTranslation()
    const { accounts, activeId, switchAccount, removeAccount } = useAccount();
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    console.table(
        accounts.map(acc => ({
            id: acc.id,
            username: acc.username,
            name: acc.name
        }))
    );

    const handleSwitch = (id: string) => {
        if (id !== activeId) {
            switchAccount(id);
        }
    };

    const handleRemove = (id: string) => {
        if (confirmDelete === id) {
            removeAccount(id);
            setConfirmDelete(null);
        } else {
            setConfirmDelete(id);
            setTimeout(() => setConfirmDelete((prev) => (prev === id ? null : prev)), 3000);
        }
    };

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="panel-card p-5">
                    <div className="flex items-center gap-3 mb-6">
                        <Link
                            to="/me/settings"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-4 h-4" /> {t('page.account.back')}
                        </Link>
                    </div>
                    <h1 className="text-2xl font-semibold mb-1">{t('page.account.manage.accounts')}</h1>
                    <p className="text-sm text-muted-foreground mb-6">
                        {t('page.account.manage.accounts.desc')}
                    </p>

                    <div className="flex flex-col gap-3">
                        {accounts.map((acc) => {
                            const isActive = acc.id === activeId;
                            const isConfirming = confirmDelete === acc.id;
                            return (
                                <div
                                    key={acc.id}
                                    className={cn(
                                        "group relative flex items-center gap-4 rounded-xl border p-4 transition-colors",
                                        isActive
                                            ? "border-primary/30 bg-primary/3"
                                            : "border-border bg-card hover:bg-secondary/30"
                                    )}
                                >
                                    <div className="relative">
                                        <div
                                            className={cn(
                                                "flex items-center overflow-hidden justify-center rounded-full text-white font-semibold",
                                                isActive ? "w-14 h-14 text-lg ring-2 ring-primary" : "w-12 h-12 text-sm"
                                            )}
                                            style={{ background: acc.user?.avatar_url ? "hsl(var(--background))" : acc.avatarColor }}
                                        >
                                            {acc.user?.avatar_url
                                                ? <img src={acc.user.avatar_url} alt={acc.name} className="h-full w-full object-cover" />
                                                : getInitials(acc.name)
                                            }
                                        </div>
                                        {acc.hasNotifications && (
                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-destructive border-2 border-card" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("font-semibold", isActive ? "text-foreground" : "text-foreground/90")}>
                                              {acc.name}
                                            </span>
                                            {isActive && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                    <CheckCircle2 className="w-3 h-3" /> {t('page.account.manage.account.active')}
                                                  </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground mt-0.5">{acc.username}</div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!isActive && (
                                            <>
                                                <button
                                                    onClick={() => handleSwitch(acc.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 rotate-180" />
                                                    {t('page.account.manage.account.switch')}
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(acc.id)}
                                                    className={cn(
                                                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                                        isConfirming
                                                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            : "bg-secondary text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                    )}
                                                >
                                                    {isConfirming ? (
                                                        <span className="flex items-center gap-1.5">
                                                        <Trash2 className="w-4 h-4" /> {t('page.account.manage.account.confirm')}
                                                      </span>
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        <Link
                            to="/me/login"
                            className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-muted-foreground hover:border-primary/30 hover:bg-primary/3 hover:text-foreground transition-colors"
                        >
                            <span className="flex w-10 h-10 items-center justify-center rounded-full bg-secondary">
                              <Plus className="w-5 h-5" />
                            </span>
                            <span className="text-sm font-medium">{t('page.account.manage.account.add')}</span>
                        </Link>
                    </div>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-secondary/40 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">
                                    {t('page.account.manage.accounts.security')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('page.account.manage.accounts.security.desc')}
                            </p>
                        </div>
                        <div className="rounded-xl bg-secondary/40 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Bell className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">
                                    {t('page.account.manage.accounts.notifications')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {t('page.account.manage.accounts.notifications.desc')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Account