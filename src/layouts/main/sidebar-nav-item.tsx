import type { JSX } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { NavLink } from "react-router-dom";
import type { NavItem } from './types';

export const SidebarNavItem = ({ to, label, icon: Icon, dot, badge, extraTo, extraIcon: ExtraIcon }: NavItem): JSX.Element => {
    const { t } = useTranslation();

    return (
        <div className="group relative flex items-center w-full">
            {extraTo && ExtraIcon && (
                <NavLink
                    to={extraTo}
                    className="absolute -left-6 p-1 rounded-md text-foreground/60 transition-all duration-200 ease-in-out
                               opacity-0 scale-90 pointer-events-none
                               group-hover:opacity-40 group-hover:scale-100 group-hover:pointer-events-auto
                               group-hover:delay-500 hover:opacity-100! hover:text-foreground hover:delay-0
                               delay-0 flex items-center justify-center z-20"
                >
                    <ExtraIcon className="w-4 h-4" strokeWidth={2} />
                </NavLink>
            )}

            <NavLink to={to} end className={({ isActive }) => `sidebar-nav-item flex-1 ${isActive ? "active" : ""}`}>
                <span className="relative">
                    <Icon className="w-5 h-5 text-foreground/70" strokeWidth={1.75} />
                    {dot && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />}
                    {badge != null && badge > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                            {badge > 99 ? "99+" : badge}
                        </span>
                    )}
                </span>
                <span>{t(label)}</span>
            </NavLink>
        </div>
    )
}