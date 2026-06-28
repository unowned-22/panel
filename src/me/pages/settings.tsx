import {type ReactNode, useState} from "react";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { Row, Card, SwitchRow, CheckboxItem } from "@/me/components/settings/elements";
import { useTranslation } from "@/hooks/use-translation";
import { Link } from "react-router-dom";
import type { TranslationDictionary } from "@/i18n/types";
import {
    AtSign,
    Bell,
    Heart,
    MessageSquare,
    Plus, Search,
    Share2,
    UserPlus,
    Users as UsersIcon,
    Volume2,
    Lock,
    Zap
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Switch } from "@/components/ui/switch.tsx";

type SectionKey =
    | "account"
    | "security"
    | "privacy"
    | "notifications"
    | "blacklist"
    | "apps"
    | "voices";

const SECTIONS: { key: SectionKey; label: keyof TranslationDictionary; }[] = [
    { key: "account", label: "page.settings.section.account" },
    { key: "security", label: "page.settings.section.security" },
    { key: "privacy", label: "page.settings.section.privacy" },
    { key: "notifications", label: "page.settings.section.notifications" },
    { key: "blacklist", label: "page.settings.section.blacklist" },
    { key: "apps", label: "page.settings.section.apps" },
    { key: "voices", label: "page.settings.section.voices" },
];

const Settings = () => {
    const [section, setSection] = useState<SectionKey>("account");
    const { t } = useTranslation();

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                {section === "account" && <AccountSection />}
                {section === "security" && <SecuritySection />}
                {section === "privacy" && <PrivacySection />}
                {section === "notifications" && <NotificationsSection />}
                {section === "blacklist" && <BlacklistSection />}
                {section === "apps" && <AppsSection />}
                {section === "voices" && <VoicesSection />}
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                                section === s.key
                                    ? "bg-secondary font-semibold text-foreground"
                                    : "text-foreground/85 hover:bg-secondary/60",
                            )}
                        >
                            <span>{t(s.label)}</span>
                        </button>
                    ))}
                </div>
            </aside>
        </div>
    );
};

const AccountSection = () => {
    const { openModal } = useSettings();
    const { t } = useTranslation();
    const [profileFlags, setProfileFlags] = useState({
        showPosts: false,
        disableComments: false,
        accessibility: false,
    });
    const [contentFlags, setContentFlags] = useState({
        autoplay: true,
        autoGif: true,
        suggestStickers: true,
        showInteresting: true,
        translatePosts: true,
    });

    const toggleProfile = (k: keyof typeof profileFlags) =>
        setProfileFlags((p) => ({ ...p, [k]: !p[k] }));
    const toggleContent = (k: keyof typeof contentFlags) =>
        setContentFlags((p) => ({ ...p, [k]: !p[k] }));

    return (
        <Card title={t('page.settings.general')}>
            <Row label={t('page.settings.menu.settings')}>
                <button className="text-primary hover:underline" onClick={openModal}>
                    {t('page.settings.setup.menu.items')}
                </button>
            </Row>

            <Row label={t('page.settings.account.theme')}>
                <button className="text-primary hover:underline">{t('page.settings.account.theme.system')}</button>
            </Row>

            <Row label={t('page.settings.account.accounts')}>
                <Link to="/me/account" className="text-primary hover:underline">{t('page.settings.account.manage')}</Link>
            </Row>

            <Row label={t('page.settings.account.profile')}>
                <div className="flex flex-col gap-3">
                    <CheckboxItem
                        checked={profileFlags.showPosts}
                        onChange={() => toggleProfile("showPosts")}
                        label={t('page.settings.account.profile.show.posts')}
                        hint
                    />
                    <CheckboxItem
                        checked={profileFlags.disableComments}
                        onChange={() => toggleProfile("disableComments")}
                        label={t('page.settings.account.profile.disable.comments')}
                        hint
                    />
                    <CheckboxItem
                        checked={profileFlags.accessibility}
                        onChange={() => toggleProfile("accessibility")}
                        label={t('page.settings.account.profile.accessibility')}
                        hint
                    />
                </div>
            </Row>

            <Row label={t('page.settings.account.content')}>
                <div className="flex flex-col gap-3">
                    <CheckboxItem
                        checked={contentFlags.autoplay}
                        onChange={() => toggleContent("autoplay")}
                        label={t('page.settings.account.content.autoplay')}
                        hint
                    />
                    <CheckboxItem
                        checked={contentFlags.autoGif}
                        onChange={() => toggleContent("autoGif")}
                        label={t('page.settings.account.content.auto.gif')}
                    />
                    <CheckboxItem
                        checked={contentFlags.suggestStickers}
                        onChange={() => toggleContent("suggestStickers")}
                        label={t('page.settings.account.content.suggest.stickers')}
                    />
                    <CheckboxItem
                        checked={contentFlags.showInteresting}
                        onChange={() => toggleContent("showInteresting")}
                        label={t('page.settings.account.content.show.interesting')}
                    />
                    <CheckboxItem
                        checked={contentFlags.translatePosts}
                        onChange={() => toggleContent("translatePosts")}
                        label={t('page.settings.account.content.translate.posts')}
                        hint
                    />

                    <div className="mt-2">
                        <div className="text-xs text-muted-foreground">{t('page.settings.account.content.feed.order')}</div>
                        <button className="mt-1 text-sm font-medium text-primary hover:underline">
                            {t('page.settings.account.content.feed.order.value')}
                        </button>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">{t('page.settings.account.content.comments.sort')}</div>
                        <button className="mt-1 text-sm font-medium text-primary hover:underline">
                            {t('page.settings.account.content.comments.sort.value')}
                        </button>
                    </div>
                </div>
            </Row>

            <Row label={t('page.settings.account.profanity.filter')} divider={false}>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/90">{t('page.settings.account.profanity.disabled')}</span>
                    <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.account.profanity.change')}</button>
                </div>
            </Row>
        </Card>
    );
};


type Frequency = "instant" | "daily" | "weekly" | "off";

type NotifKey =
    | "messages"
    | "mentions"
    | "likes"
    | "shares"
    | "comments"
    | "friends"
    | "groups";

type NotifPref = { enabled: boolean; frequency: Frequency };

const DEFAULT_PREFS: Record<NotifKey, NotifPref> = {
    messages: { enabled: true, frequency: "instant" },
    mentions: { enabled: true, frequency: "instant" },
    likes: { enabled: true, frequency: "daily" },
    shares: { enabled: true, frequency: "daily" },
    comments: { enabled: true, frequency: "instant" },
    friends: { enabled: true, frequency: "instant" },
    groups: { enabled: false, frequency: "weekly" },
};

const NOTIF_TYPES: {
    key: NotifKey;
    titleKey: keyof TranslationDictionary;
    descKey: keyof TranslationDictionary;
    icon: ReactNode;
    color: string;
}[] = [
    { key: "messages", titleKey: "page.settings.notif.type.messages", descKey: "page.settings.notif.type.messages.desc", icon: <MessageSquare className="h-4 w-4" />, color: "hsl(140 60% 45%)" },
    { key: "mentions", titleKey: "page.settings.notif.type.mentions", descKey: "page.settings.notif.type.mentions.desc", icon: <AtSign className="h-4 w-4" />, color: "hsl(200 80% 55%)" },
    { key: "likes",    titleKey: "page.settings.notif.type.likes",    descKey: "page.settings.notif.type.likes.desc",    icon: <Heart className="h-4 w-4" />,        color: "hsl(345 80% 60%)" },
    { key: "shares",   titleKey: "page.settings.notif.type.shares",   descKey: "page.settings.notif.type.shares.desc",   icon: <Share2 className="h-4 w-4" />,       color: "hsl(210 90% 55%)" },
    { key: "comments", titleKey: "page.settings.notif.type.comments", descKey: "page.settings.notif.type.comments.desc", icon: <MessageSquare className="h-4 w-4" />, color: "hsl(0 75% 60%)" },
    { key: "friends",  titleKey: "page.settings.notif.type.friends",  descKey: "page.settings.notif.type.friends.desc",  icon: <UserPlus className="h-4 w-4" />,     color: "hsl(265 70% 55%)" },
    { key: "groups",   titleKey: "page.settings.notif.type.groups",   descKey: "page.settings.notif.type.groups.desc",   icon: <UsersIcon className="h-4 w-4" />,    color: "hsl(28 90% 55%)" },
];

const NotificationsSection = () => {
    const { t } = useTranslation();
    const [flags, setFlags] = useState({
        instant: true,
        sound: true,
        showText: true,
    });
    const toggle = (k: keyof typeof flags) => setFlags((p) => ({ ...p, [k]: !p[k] }));

    const [prefs, setPrefs] = useState<Record<NotifKey, NotifPref>>(DEFAULT_PREFS);
    const updatePref = (k: NotifKey, next: NotifPref) =>
        setPrefs((p) => ({ ...p, [k]: next }));

    const setAllFrequency = (f: Frequency) =>
        setPrefs((p) => {
            const next = { ...p };
            (Object.keys(next) as NotifKey[]).forEach((k) => {
                next[k] = { ...next[k], frequency: f };
            });
            return next;
        });

    const freqLabel: Record<Frequency, string> = {
        instant: t('page.settings.notif.freq.instant'),
        daily:   t('page.settings.notif.freq.daily'),
        weekly:  t('page.settings.notif.freq.weekly'),
        off:     t('page.settings.notif.freq.off'),
    };

    return (
        <div className="flex flex-col gap-3">
            <Card title={t('page.settings.notif.site.title')}>
                <SwitchRow
                    icon={<Zap className="h-4 w-4" />}
                    title={t('page.settings.notif.instant')}
                    checked={flags.instant}
                    onCheckedChange={() => toggle("instant")}
                />
                <SwitchRow
                    icon={<Volume2 className="h-4 w-4" />}
                    title={t('page.settings.notif.sound')}
                    checked={flags.sound}
                    onCheckedChange={() => toggle("sound")}
                />
                <SwitchRow
                    icon={<MessageSquare className="h-4 w-4" />}
                    title={t('page.settings.notif.show.text')}
                    checked={flags.showText}
                    onCheckedChange={() => toggle("showText")}
                />
                <div className="flex items-center gap-3 pt-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{t('page.settings.notif.browser')}</div>
                        <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                            {t('page.settings.notif.browser.desc')}
                        </div>
                    </div>
                    <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.notif.browser.disabled')}</button>
                </div>
            </Card>

            <Card title={t('page.settings.notif.types.title')}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <p className="text-xs text-muted-foreground max-w-md">
                        {t('page.settings.notif.types.desc')}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{t('page.settings.notif.for.all')}</span>
                        <Select onValueChange={(v) => setAllFrequency(v as Frequency)}>
                            <SelectTrigger className="h-8 w-42.5 text-xs">
                                <SelectValue placeholder={t('page.settings.notif.apply.all')} />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(freqLabel) as Frequency[]).map((f) => (
                                    <SelectItem key={f} value={f}>
                                        {freqLabel[f]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {NOTIF_TYPES.map((n) => (
                    <NotifPrefRow
                        key={n.key}
                        icon={n.icon}
                        color={n.color}
                        title={t(n.titleKey)}
                        description={t(n.descKey)}
                        pref={prefs[n.key]}
                        freqLabel={freqLabel}
                        onChange={(next) => updatePref(n.key, next)}
                    />
                ))}
            </Card>
        </div>
    );
};


const NotifPrefRow = ({
                          icon,
                          color,
                          title,
                          description,
                          pref,
                          freqLabel,
                          onChange,
                      }: {
    icon: ReactNode;
    color: string;
    title: string;
    description: string;
    pref: NotifPref;
    freqLabel: Record<Frequency, string>;
    onChange: (next: NotifPref) => void;
}) => (
    <div className="flex items-center gap-3 border-b border-border/60 py-4 last:border-b-0">
        <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: color }}
        >
            {icon}
        </div>
        <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</div>
        </div>
        <Select
            value={pref.frequency}
            onValueChange={(v) => onChange({ ...pref, frequency: v as Frequency })}
            disabled={!pref.enabled}
        >
            <SelectTrigger className="h-9 w-47.5 text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {(Object.keys(freqLabel) as Frequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                        {freqLabel[f]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Switch
            checked={pref.enabled}
            onCheckedChange={(v) => onChange({ ...pref, enabled: v })}
        />
    </div>
);




const SecuritySection = () => {
    const { t } = useTranslation();
    return (
        <Card title={t('page.settings.security.title')}>
            <Row label={t('page.settings.security.password')}>
                <div className="flex items-center justify-between">
                    <span className="text-foreground/90">{t('page.settings.security.password.changed')}</span>
                    <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.security.password.change')}</button>
                </div>
            </Row>
            <Row label={t('page.settings.security.2fa')}>
                <div className="flex items-center justify-between">
                    <span className="text-foreground/90">{t('page.settings.security.2fa.status')}</span>
                    <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.security.2fa.connect')}</button>
                </div>
            </Row>
            <Row label={t('page.settings.security.sessions')}>
                <button className="text-sm font-medium text-primary hover:underline">
                    {t('page.settings.security.sessions.terminate')}
                </button>
            </Row>
            <Row label={t('page.settings.security.login.history')} divider={false}>
                <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.security.login.history.show')}</button>
            </Row>
        </Card>
    );
};

const PrivacySection = () => {
    const { t } = useTranslation();

    const items: { labelKey: keyof TranslationDictionary; valueKey: keyof TranslationDictionary; locked?: boolean }[] = [
        { labelKey: "page.settings.privacy.item.main.info",    valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.birthday",     valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.saved.photos", valueKey: "page.settings.privacy.value.only.me", locked: true },
        { labelKey: "page.settings.privacy.item.groups",       valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.audio",        valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.video",        valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.gifts",        valueKey: "page.settings.privacy.value.all" },
        { labelKey: "page.settings.privacy.item.friends",      valueKey: "page.settings.privacy.value.all.friends" },
    ];

    return (
        <Card title={t('page.settings.privacy.title')}>
            <div className="mb-2 flex items-start gap-3 rounded-xl bg-secondary/60 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Heart className="h-5 w-5" />
                </div>
                <div className="flex-1 text-sm">
                    <div className="font-semibold">{t('page.settings.privacy.banner.title')}</div>
                    <p className="mt-1 text-muted-foreground leading-snug">
                        {t('page.settings.privacy.banner.desc')}
                    </p>
                    <button className="mt-3 text-sm font-medium text-primary hover:underline">
                        {t('page.settings.privacy.banner.more')}
                    </button>
                </div>
            </div>

            {items.map((i) => (
                <div
                    key={i.labelKey}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 py-4 last:border-b-0"
                >
                    <div className="text-sm text-muted-foreground">{t(i.labelKey)}</div>
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        {i.locked && <Lock className="h-3.5 w-3.5" />}
                        {t(i.valueKey)}
                    </button>
                </div>
            ))}
        </Card>
    );
};

const BlacklistSection = () => {
    const { t } = useTranslation();
    return (
        <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{t('page.settings.blacklist.title')}</h2>
                <button className="button-pill rounded-lg px-4">{t('page.settings.blacklist.add')}</button>
            </div>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder={t('page.settings.blacklist.search')}
                    className="h-10 w-full rounded-lg bg-secondary pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
            </div>
            <div className="flex flex-col items-center px-4 py-10 text-center">
                <div className="text-base font-semibold">{t('page.settings.blacklist.empty.title')}</div>
                <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                    {t('page.settings.blacklist.empty.desc')}
                </p>
            </div>
        </Card>
    );
};

const AppsSection = () => {
    const { t } = useTranslation();
    return (
        <Card title={t('page.settings.apps.title')}>
            <Row label={t('page.settings.apps.connected')}>
                <span className="text-foreground/90">{t('page.settings.apps.connected.none')}</span>
            </Row>
            <Row label={t('page.settings.apps.games')} divider={false}>
                <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.apps.games.manage')}</button>
            </Row>
        </Card>
    );
};

const VoicesSection = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col gap-3">
            <Card title={t('page.settings.voices.balance.title')}>
                <p className="text-sm text-foreground/90 leading-relaxed">
                    {t('page.settings.voices.desc.1')}
                </p>
                <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                    {t('page.settings.voices.desc.2')}{" "}
                    <a href="#!" className="text-primary hover:underline">
                        {t('page.settings.voices.desc.2.link')}
                    </a>
                    .
                </p>

                <div className="mt-5">
                    <Row label={t('page.settings.voices.account')}>
                        <span className="text-foreground/90">{t('page.settings.voices.balance.value')}</span>
                    </Row>
                    <Row label={t('page.settings.voices.payment')}>
                        <button className="text-sm font-medium text-primary hover:underline">{t('page.settings.voices.payment.show')}</button>
                    </Row>
                    <Row label={t('page.settings.voices.topup')} divider={false}>
                        <button className="button-pill gap-2 rounded-lg px-4">
                            <Plus className="h-4 w-4" />
                            {t('page.settings.voices.topup.btn')}
                        </button>
                    </Row>
                </div>

                <div className="mt-4 flex flex-col items-start gap-3 border-t border-border/60 pt-4">
                    <button className="text-sm font-medium text-primary hover:underline">
                        {t('page.settings.voices.partners')}
                    </button>
                    <button className="text-sm font-medium text-primary hover:underline">
                        {t('page.settings.voices.promo')}
                    </button>
                    <div className="pt-2 text-xs text-muted-foreground">
                        {t('page.settings.voices.support')}{" "}
                        <a href="#!" className="text-primary hover:underline">
                            {t('page.settings.voices.support.link')}
                        </a>
                        .
                    </div>
                </div>
            </Card>

            <Card>
                <div className="mb-3 inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold">
                    {t('page.settings.voices.subscriptions')}
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                        <Volume2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-sm font-medium">{t('page.settings.voices.music.sub')}</div>
                    <button className="button-pill rounded-lg px-4">{t('page.settings.voices.music.sub.btn')}</button>
                </div>
            </Card>
        </div>
    );
};

export default Settings;