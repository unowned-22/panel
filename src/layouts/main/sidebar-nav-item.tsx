import type { JSX } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { NavLink } from "react-router-dom";
import type { NavItem } from './types';

export const SidebarNavItem = ({ to, label, icon: Icon, dot, badge }: NavItem): JSX.Element => {
    const { t } = useTranslation();

    return (
        <NavLink to={to} end className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
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
    )
}