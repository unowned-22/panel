import type { ReactNode } from 'react';
import {
    Heart, MessageSquare, Share2, Gift,
    AtSign, Users, UserPlus, UserCheck, Bell, ShieldAlert, LogIn,
} from 'lucide-react';
import type { ApiNotification, SectionKey } from '@/api/notifications';
import { typeToSection } from '@/api/notifications';
import type { TranslationDictionary } from '@/i18n/types';

type T = (key: keyof TranslationDictionary) => string;

export interface NotificationActor {
    name: string;
    username: string | null;
    avatarUrl: string | null;
}

export interface NotificationMeta {
    icon: ReactNode;
    iconBg: string;
    titleTemplate: string;
    section: SectionKey;
    actor: NotificationActor | null;
}

export function formatRelativeTime(isoString: string, t: T): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return t('notif.time.now');
    if (diffMin < 60) return t('notif.time.minutes').replace('{n}', String(diffMin));
    if (diffHour < 24) return t('notif.time.hours').replace('{n}', String(diffHour));
    if (diffDay === 1) return t('notif.time.yesterday');
    if (diffDay < 7) return t('notif.time.days').replace('{n}', String(diffDay));
    return new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(new Date(isoString));
}

function getActor(n: ApiNotification, t: T): NotificationActor {
    const name = n.payload?.actor_name ?? t('notif.someone');
    return {
        name,
        username: n.payload?.actor_username ?? null,
        avatarUrl: n.payload?.actor_avatar_url ?? null,
    };
}

export function renderNotificationTitle(
    meta: Pick<NotificationMeta, 'titleTemplate' | 'actor'>,
    profileHref: string | null,
    LinkComponent: React.ComponentType<{ to: string; className?: string; children: ReactNode }>,
): ReactNode {
    const { titleTemplate, actor } = meta;
    const nameNode: ReactNode = actor
        ? profileHref
            ? <LinkComponent to={profileHref} className="font-semibold hover:underline">{actor.name}</LinkComponent>
            : <span className="font-semibold">{actor.name}</span>
        : null;

    const segments = titleTemplate.split(/(\{name\}|\*\*[^*]+\*\*)/g).filter(Boolean);

    return segments.map((seg, i) => {
        if (seg === '{name}') return <span key={i}>{nameNode}</span>;
        const boldMatch = seg.match(/^\*\*([^*]+)\*\*$/);
        if (boldMatch) return <span key={i} className="font-semibold">{boldMatch[1]}</span>;
        return <span key={i}>{seg}</span>;
    });
}

export function notificationMeta(n: ApiNotification, t: T): NotificationMeta {
    const section = typeToSection(n.type);
    const actor = getActor(n, t);
    const entityTitle = n.payload?.entity_title;

    switch (n.type) {
        case 'friend_request_received':
            return {
                section, actor, iconBg: 'hsl(210 90% 55%)',
                icon: <UserPlus className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.friendRequestReceived'),
            };
        case 'friend_request_accepted':
            return {
                section, actor, iconBg: 'hsl(140 60% 45%)',
                icon: <UserCheck className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.friendRequestAccepted'),
            };
        case 'story_published':
            return {
                section, actor, iconBg: 'hsl(265 70% 55%)',
                icon: <Users className="h-3.5 w-3.5 text-white" />,
                titleTemplate: entityTitle
                    ? t('notif.type.storyPublishedTitled').replace('{title}', entityTitle)
                    : t('notif.type.storyPublished'),
            };
        case 'story_like':
            return {
                section, actor, iconBg: 'hsl(345 80% 60%)',
                icon: <Heart className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.storyLike'),
            };
        case 'story_comment':
            return {
                section, actor, iconBg: 'hsl(140 60% 45%)',
                icon: <MessageSquare className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.storyComment'),
            };
        case 'story_reply':
            return {
                section, actor, iconBg: 'hsl(200 80% 55%)',
                icon: <Share2 className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.storyReply'),
            };
        case 'mention':
            return {
                section, actor, iconBg: 'hsl(165 70% 45%)',
                icon: <AtSign className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.mention'),
            };
        case 'message':
            return {
                section, actor, iconBg: 'hsl(165 70% 45%)',
                icon: <MessageSquare className="h-3.5 w-3.5 text-white" />,
                titleTemplate: t('notif.type.message'),
            };
        case 'new_login':
            return {
                section, actor: null, iconBg: 'hsl(28 95% 55%)',
                icon: <LogIn className="h-5 w-5 text-white" />,
                titleTemplate: t('notif.type.newLogin'),
            };
        case 'account_security':
            return {
                section, actor: null, iconBg: 'hsl(0 80% 55%)',
                icon: <ShieldAlert className="h-5 w-5 text-white" />,
                titleTemplate: `**${t('notif.type.accountSecurity.title')}** ${t('notif.type.accountSecurity.desc')}`,
            };
        case 'sticker':
        case 'service':
            return {
                section, actor: null, iconBg: 'hsl(200 80% 55%)',
                icon: <Gift className="h-5 w-5 text-white" />,
                titleTemplate: t('notif.type.service'),
            };
        default:
            return {
                section, actor: null, iconBg: 'hsl(28 95% 55%)',
                icon: <Bell className="h-5 w-5 text-white" />,
                titleTemplate: t('notif.type.default'),
            };
    }
}