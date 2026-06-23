import type { ReactNode } from 'react';
import {
    Heart, MessageSquare, Share2, Gift,
    AtSign, Users, UserPlus, UserCheck, Bell, ShieldAlert, LogIn,
} from 'lucide-react';
import type { ApiNotification, SectionKey } from '@/api/notifications';
import { typeToSection } from '@/api/notifications';

export interface NotificationMeta {
    icon: ReactNode;
    iconBg: string;
    title: ReactNode;
    section: SectionKey;
}

export function formatRelativeTime(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHour < 24) return `${diffHour} ч назад`;
    if (diffDay === 1) return 'вчера';
    if (diffDay < 7) return `${diffDay} д назад`;
    return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(new Date(isoString));
}

function actor(n: ApiNotification): string {
    if (!n.payload) return 'Кто-то';
    return (n.payload.actor_name as string) ?? (n.payload.name as string) ?? 'Кто-то';
}

export function notificationMeta(n: ApiNotification): NotificationMeta {
    const section = typeToSection(n.type);
    const name = actor(n);
    const entityTitle = n.payload?.entity_title as string | undefined;

    switch (n.type) {
        case 'friend_request_received':
            return {
                section, iconBg: 'hsl(210 90% 55%)',
                icon: <UserPlus className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> хочет добавить вас в друзья</>,
            };
        case 'friend_request_accepted':
            return {
                section, iconBg: 'hsl(140 60% 45%)',
                icon: <UserCheck className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> принял(а) вашу заявку в друзья</>,
            };
        case 'story_published':
            return {
                section, iconBg: 'hsl(265 70% 55%)',
                icon: <Users className="h-5 w-5 text-white" />,
                title: entityTitle
                    ? <><span className="font-semibold">{name}</span> опубликовал(а) историю «{entityTitle}»</>
                    : <><span className="font-semibold">{name}</span> опубликовал(а) новую историю</>,
            };
        case 'story_like':
            return {
                section, iconBg: 'hsl(345 80% 60%)',
                icon: <Heart className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> оценил(а) вашу историю</>,
            };
        case 'story_comment':
            return {
                section, iconBg: 'hsl(140 60% 45%)',
                icon: <MessageSquare className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> прокомментировал(а) вашу историю</>,
            };
        case 'story_reply':
            return {
                section, iconBg: 'hsl(200 80% 55%)',
                icon: <Share2 className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> ответил(а) на вашу историю</>,
            };
        case 'mention':
            return {
                section, iconBg: 'hsl(165 70% 45%)',
                icon: <AtSign className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">{name}</span> упомянул(а) вас</>,
            };
        case 'message':
            return {
                section, iconBg: 'hsl(165 70% 45%)',
                icon: <MessageSquare className="h-5 w-5 text-white" />,
                title: <>Новое сообщение от <span className="font-semibold">{name}</span></>,
            };
        case 'new_login':
            return {
                section, iconBg: 'hsl(28 95% 55%)',
                icon: <LogIn className="h-5 w-5 text-white" />,
                title: <>Был выполнен вход с нового устройства</>,
            };
        case 'account_security':
            return {
                section, iconBg: 'hsl(0 80% 55%)',
                icon: <ShieldAlert className="h-5 w-5 text-white" />,
                title: <><span className="font-semibold">Защитите свой аккаунт.</span> Соблюдайте простые правила, и ваши данные будут в безопасности.</>,
            };
        case 'sticker':
        case 'service':
            return {
                section, iconBg: 'hsl(200 80% 55%)',
                icon: <Gift className="h-5 w-5 text-white" />,
                title: <>Новые возможности доступны для вас</>,
            };
        default:
            return {
                section, iconBg: 'hsl(28 95% 55%)',
                icon: <Bell className="h-5 w-5 text-white" />,
                title: <>Новое уведомление</>,
            };
    }
}