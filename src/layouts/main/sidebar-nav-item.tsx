import type { JSX } from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { NavLink } from "react-router-dom";
import type { NavItem } from './types';

export const SidebarNavItem = ({ to, label, icon: Icon, dot }: NavItem): JSX.Element => {
    const { t } = useTranslation();

    return (
        <NavLink to={to} end className={({ isActive }) => `sidebar-nav-item ${isActive ? "active" : ""}`}>
            <span className="relative">
                <Icon className="w-5 h-5 text-foreground/70" strokeWidth={1.75} />
                {dot && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-destructive" />}
            </span>
            <span>{t(label)}</span>
        </NavLink>
    )
}