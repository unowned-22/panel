import { ChevronDown, LogOut, Settings, Trash2, CheckCircle2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { useAccount, getInitials } from "@/hooks/use-account";
import { cn } from "@/lib/utils";
import { toAbsoluteUrl } from '@/lib/helpers';
import type { Language } from "@/i18n/types.ts";
import { useTranslation } from '@/hooks/use-translation';
import { authActions } from '@/auth/auth-actions';

const LANGUAGE_OPTIONS: { code: Language; flag: string; label: string }[] = [
    { code: 'en', flag: toAbsoluteUrl('/flags/united-states.svg'), label: 'English' },
    { code: 'ua', flag: toAbsoluteUrl('/flags/ukraine.svg'),       label: 'Українська' },
    { code: 'ru', flag: toAbsoluteUrl('/flags/russia.svg'),        label: 'Русский' },
    { code: 'it', flag: toAbsoluteUrl('/flags/italy.svg'),         label: 'Italiano' },
    { code: 'es', flag: toAbsoluteUrl('/flags/spain.svg'),         label: 'Español' },
    { code: 'fr', flag: toAbsoluteUrl('/flags/france.svg'),        label: 'Français' },
    { code: 'de', flag: toAbsoluteUrl('/flags/germany.svg'),       label: 'Deutsch' },
];

export const TopBar = () => {
    const { accounts, activeId, activeAccount, switchAccount, removeAccount } = useAccount();
    const { t, language, setLanguage } = useTranslation();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const currentLang = LANGUAGE_OPTIONS.find(l => l.code === language);
    const avatar = activeAccount.user?.avatar_url ?? null;

    const handleLanguageChange = useCallback((langCode: string) => {
        setLanguage(langCode as Language);
    }, [setLanguage]);

    const handleLogout = useCallback(async () => {
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        await authActions.logout();
        // authActions.logout() редиректит, поэтому состояние дальше не используется
    }, [isLoggingOut]);

    return (
        <header className="sticky top-0 z-40 h-15 bg-background/85 backdrop-blur-xl border-b border-border">
            <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 shrink-0 w-50">
                    <img src={toAbsoluteUrl('/unowned-d.png')} className="max-h-40" alt="unowned" />
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="ml-auto flex items-center gap-1.5 hover:bg-secondary/60 rounded-full pl-1 pr-2 py-1 transition-colors">
                            <div className="relative">
                                <div
                                    className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-white text-xs font-semibold"
                                    style={{ background: avatar ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                >
                                    {avatar
                                        ? <img src={avatar} alt={activeAccount.name} className="h-full w-full object-cover" />
                                        : getInitials(activeAccount.name)
                                    }
                                </div>
                                {activeAccount.hasNotifications && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-background" />
                                )}
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={10} className="w-75 rounded-xl border-border bg-popover p-0 shadow-elevated">
                        <div className="flex flex-col items-center px-4 py-5 text-center">
                            <div className="relative mb-3">
                                <div
                                    className="w-16 h-16 overflow-hidden rounded-full flex items-center justify-center text-white text-xl font-semibold ring-2 ring-primary"
                                    style={{ background: avatar ? "hsl(var(--background))" : activeAccount.avatarColor }}
                                >
                                    {avatar
                                        ? <img src={avatar} alt={activeAccount.name} className="h-full w-full object-cover" />
                                        : <div className="flex h-full w-full items-center justify-center text-white text-3xl font-semibold">{getInitials(activeAccount.name)}</div>
                                    }
                                </div>
                                {activeAccount.hasNotifications && (
                                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-destructive border-2 border-popover" />
                                )}
                            </div>
                            <div className="font-semibold">{activeAccount.name}</div>
                            <div className="text-xs text-muted-foreground">{activeAccount.username}</div>
                        </div>

                        {accounts.length > 1 && (
                            <div className="mx-2 mb-2 rounded-lg bg-secondary/40 p-1">
                                <div className="px-2 pt-1.5 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                    {t('topbar.menu.your.accounts')}
                                </div>
                                {accounts.map((acc) => {
                                    const isActive = acc.id === activeId;
                                    return (
                                        <div
                                            key={acc.id}
                                            className={cn(
                                                "group flex items-center gap-2.5 rounded-md px-2 py-2 cursor-pointer hover:bg-background",
                                                isActive && "bg-background",
                                            )}
                                            onClick={() => !isActive && switchAccount(acc.id)}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                                                style={{ background: acc.avatarColor }}
                                            >
                                                {getInitials(acc.name)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate">{acc.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">{acc.username}</div>
                                            </div>
                                            {isActive ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeAccount(acc.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 rounded p-1 text-muted-foreground hover:text-destructive hover:bg-secondary"
                                                    aria-label={t('topbar.menu.account.delete')}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="px-2 pb-2">
                            <DropdownMenuItem asChild className="gap-3 py-2.5">
                                <Link to="/me/account">
                                    <Users className="w-4 h-4 text-primary" />{t('topbar.menu.mine.accounts')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="gap-3 py-2.5">
                                <Link to="/me/settings">
                                    <Settings className="w-4 h-4 text-primary" />{t('topbar.menu.settings')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger className="gap-3 py-2.5 flex items-center data-[slot=dropdown-menu-sub-trigger-indicator]:hidden">
                                    <img
                                        src={currentLang?.flag}
                                        className="w-4 h-4 rounded-full object-cover shrink-0"
                                        alt={currentLang?.label}
                                    />
                                    <span className="text-sm font-medium">{currentLang?.label}</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-48">
                                    <DropdownMenuRadioGroup
                                        value={currentLang?.code}
                                        onValueChange={(value) => {
                                            const selectedLang = LANGUAGE_OPTIONS.find(l => l.code === value);
                                            if (selectedLang) handleLanguageChange(selectedLang.code);
                                        }}
                                    >
                                        {LANGUAGE_OPTIONS.map((item) => (
                                            <DropdownMenuRadioItem
                                                key={item.code}
                                                value={item.code}
                                                className="flex items-center gap-2"
                                            >
                                                <img
                                                    src={item.flag}
                                                    className="w-4 h-4 rounded-full object-cover"
                                                    alt={item.label}
                                                />
                                                <span>{item.label}</span>
                                            </DropdownMenuRadioItem>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuItem
                                className="gap-3 py-2.5"
                                disabled={isLoggingOut}
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 text-primary" />
                                {isLoggingOut ? '...' : t('topbar.menu.logout')}
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};