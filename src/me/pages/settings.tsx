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

            <Row label="Тема">
                <button className="text-primary hover:underline">Системная</button>
            </Row>

            <Row label="Аккаунты">
                <Link to="/me/account" className="text-primary hover:underline">Управление аккаунтами</Link>
            </Row>

            <Row label="Настройки профиля">
                <div className="flex flex-col gap-3">
                    <CheckboxItem
                        checked={profileFlags.showPosts}
                        onChange={() => toggleProfile("showPosts")}
                        label="При открытии профиля показывать мои посты"
                        hint
                    />
                    <CheckboxItem
                        checked={profileFlags.disableComments}
                        onChange={() => toggleProfile("disableComments")}
                        label="Отключить комментирование постов"
                        hint
                    />
                    <CheckboxItem
                        checked={profileFlags.accessibility}
                        onChange={() => toggleProfile("accessibility")}
                        label="Специальные возможности"
                        hint
                    />
                </div>
            </Row>

            <Row label="Настройки контента">
                <div className="flex flex-col gap-3">
                    <CheckboxItem
                        checked={contentFlags.autoplay}
                        onChange={() => toggleContent("autoplay")}
                        label="Автоматически включать видео и музыку в ленте"
                        hint
                    />
                    <CheckboxItem
                        checked={contentFlags.autoGif}
                        onChange={() => toggleContent("autoGif")}
                        label="Автоматически воспроизводить GIF-анимации"
                    />
                    <CheckboxItem
                        checked={contentFlags.suggestStickers}
                        onChange={() => toggleContent("suggestStickers")}
                        label="Подсказывать стикеры в полях ввода"
                    />
                    <CheckboxItem
                        checked={contentFlags.showInteresting}
                        onChange={() => toggleContent("showInteresting")}
                        label="Показывать «Интересное» в историях"
                    />
                    <CheckboxItem
                        checked={contentFlags.translatePosts}
                        onChange={() => toggleContent("translatePosts")}
                        label="Переводить посты"
                        hint
                    />

                    <div className="mt-2">
                        <div className="text-xs text-muted-foreground">Порядок постов в ленте новостей:</div>
                        <button className="mt-1 text-sm font-medium text-primary hover:underline">
                            По времени публикации
                        </button>
                    </div>
                    <div>
                        <div className="text-xs text-muted-foreground">Сортировка комментариев:</div>
                        <button className="mt-1 text-sm font-medium text-primary hover:underline">
                            Сначала интересные
                        </button>
                    </div>
                </div>
            </Row>

            <Row label="Фильтр нецензурных выражений" divider={false}>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-foreground/90">Отключён</span>
                    <button className="text-sm font-medium text-primary hover:underline">Изменить</button>
                </div>
            </Row>
        </Card>
    );
};


type Frequency = "instant" | "daily" | "weekly" | "off";

const FREQ_LABEL: Record<Frequency, string> = {
    instant: "Мгновенно",
    daily: "Ежедневная сводка",
    weekly: "Еженедельная сводка",
    off: "Отключено",
};

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
    title: string;
    description: string;
    icon: ReactNode;
    color: string;
}[] = [
    {
        key: "messages",
        title: "Личные сообщения",
        description: "Новые сообщения в ваших личных чатах",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "hsl(140 60% 45%)",
    },
    {
        key: "mentions",
        title: "Упоминания",
        description: "Когда вас упоминают в постах, комментариях или чатах",
        icon: <AtSign className="h-4 w-4" />,
        color: "hsl(200 80% 55%)",
    },
    {
        key: "likes",
        title: "Реакции и лайки",
        description: "Реакции на ваши посты, комментарии, фото и видео",
        icon: <Heart className="h-4 w-4" />,
        color: "hsl(345 80% 60%)",
    },
    {
        key: "shares",
        title: "Поделились",
        description: "Когда вашими записями делятся друзья и сообщества",
        icon: <Share2 className="h-4 w-4" />,
        color: "hsl(210 90% 55%)",
    },
    {
        key: "comments",
        title: "Комментарии",
        description: "Новые комментарии к вашим постам и фото",
        icon: <MessageSquare className="h-4 w-4" />,
        color: "hsl(0 75% 60%)",
    },
    {
        key: "friends",
        title: "Друзья",
        description: "Заявки в друзья и новые подписчики",
        icon: <UserPlus className="h-4 w-4" />,
        color: "hsl(265 70% 55%)",
    },
    {
        key: "groups",
        title: "Сообщества",
        description: "Новости и публикации в ваших сообществах",
        icon: <UsersIcon className="h-4 w-4" />,
        color: "hsl(28 90% 55%)",
    },
];

const NotificationsSection = () => {
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

    return (
        <div className="flex flex-col gap-3">
            <Card title="Уведомления на сайте">
                <SwitchRow
                    icon={<Zap className="h-4 w-4" />}
                    title="Показывать мгновенные уведомления"
                    checked={flags.instant}
                    onCheckedChange={() => toggle("instant")}
                />
                <SwitchRow
                    icon={<Volume2 className="h-4 w-4" />}
                    title="Получать уведомления со звуком"
                    checked={flags.sound}
                    onCheckedChange={() => toggle("sound")}
                />
                <SwitchRow
                    icon={<MessageSquare className="h-4 w-4" />}
                    title="Показывать текст сообщений"
                    checked={flags.showText}
                    onCheckedChange={() => toggle("showText")}
                />
                <div className="flex items-center gap-3 pt-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">Браузерные уведомления</div>
                        <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                            Уведомления, которые вы будете получать, можно настроить ниже
                        </div>
                    </div>
                    <button className="text-sm font-medium text-primary hover:underline">Отключены</button>
                </div>
            </Card>

            <Card title="Типы уведомлений и частота">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <p className="text-xs text-muted-foreground max-w-md">
                        Выберите, о чём уведомлять и как часто получать сводки. Изменения применяются ко всем
                        устройствам.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Для всех:</span>
                        <Select onValueChange={(v) => setAllFrequency(v as Frequency)}>
                            <SelectTrigger className="h-8 w-42.5 text-xs">
                                <SelectValue placeholder="Применить ко всем" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => (
                                    <SelectItem key={f} value={f}>
                                        {FREQ_LABEL[f]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {NOTIF_TYPES.map((t) => (
                    <NotifPrefRow
                        key={t.key}
                        icon={t.icon}
                        color={t.color}
                        title={t.title}
                        description={t.description}
                        pref={prefs[t.key]}
                        onChange={(next) => updatePref(t.key, next)}
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
                          onChange,
                      }: {
    icon: ReactNode;
    color: string;
    title: string;
    description: string;
    pref: NotifPref;
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
                {(Object.keys(FREQ_LABEL) as Frequency[]).map((f) => (
                    <SelectItem key={f} value={f}>
                        {FREQ_LABEL[f]}
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




const SecuritySection = () => (
    <Card title="Безопасность">
        <Row label="Пароль">
            <div className="flex items-center justify-between">
                <span className="text-foreground/90">Был изменён 4 месяца назад</span>
                <button className="text-sm font-medium text-primary hover:underline">Изменить</button>
            </div>
        </Row>
        <Row label="Двухфакторная аутентификация">
            <div className="flex items-center justify-between">
                <span className="text-foreground/90">Не подключена</span>
                <button className="text-sm font-medium text-primary hover:underline">Подключить</button>
            </div>
        </Row>
        <Row label="Активные сеансы">
            <button className="text-sm font-medium text-primary hover:underline">
                Завершить на других устройствах
            </button>
        </Row>
        <Row label="История входов" divider={false}>
            <button className="text-sm font-medium text-primary hover:underline">Показать</button>
        </Row>
    </Card>
);

const PrivacySection = () => {
    const items: { label: string; value: string; locked?: boolean }[] = [
        { label: "Кто видит основную информацию моей страницы", value: "Все пользователи" },
        { label: "Кто видит мою дату рождения", value: "Все пользователи" },
        { label: "Кто видит мои сохранённые фотографии", value: "Только я", locked: true },
        { label: "Кто видит список моих сообществ", value: "Все пользователи" },
        { label: "Кто видит список моих аудиозаписей", value: "Все пользователи" },
        { label: "Кто видит список моих видеозаписей", value: "Все пользователи" },
        { label: "Кто видит список моих подарков", value: "Все пользователи" },
        { label: "Кого видно в списке моих друзей и подписок", value: "Всех друзей" },
    ];

    return (
        <Card title="Моя страница">
            <div className="mb-2 flex items-start gap-3 rounded-xl bg-secondary/60 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Heart className="h-5 w-5" />
                </div>
                <div className="flex-1 text-sm">
                    <div className="font-semibold">Неделя без непрошеного внимания</div>
                    <p className="mt-1 text-muted-foreground leading-snug">
                        Если нужна пауза в общении с незнакомцами, попробуйте режим «Личное пространство»
                    </p>
                    <button className="mt-3 text-sm font-medium text-primary hover:underline">
                        Подробнее
                    </button>
                </div>
            </div>

            {items.map((i) => (
                <div
                    key={i.label}
                    className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-border/60 py-4 last:border-b-0"
                >
                    <div className="text-sm text-muted-foreground">{i.label}</div>
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                        {i.locked && <Lock className="h-3.5 w-3.5" />}
                        {i.value}
                    </button>
                </div>
            ))}
        </Card>
    );
};

const BlacklistSection = () => (
    <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Чёрный список</h2>
            <button className="button-pill rounded-lg px-4">Добавить в чёрный список</button>
        </div>
        <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
                type="text"
                placeholder="Поиск"
                className="h-10 w-full rounded-lg bg-secondary pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
        </div>
        <div className="flex flex-col items-center px-4 py-10 text-center">
            <div className="text-base font-semibold">Ваш чёрный список пуст</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground leading-relaxed">
                Люди из чёрного списка не могут просматривать вашу страницу, оставлять комментарии и
                отправлять вам личные сообщения
            </p>
        </div>
    </Card>
);

const AppsSection = () => (
    <Card title="Настройки приложений">
        <Row label="Подключённые приложения">
            <span className="text-foreground/90">Нет подключённых приложений</span>
        </Row>
        <Row label="Игровые приложения" divider={false}>
            <button className="text-sm font-medium text-primary hover:underline">Управлять</button>
        </Row>
    </Card>
);

const VoicesSection = () => (
    <div className="flex flex-col gap-3">
        <Card title="Состояние личного счёта">
            <p className="text-sm text-foreground/90 leading-relaxed">
                Голоса — универсальная условная единица для приобретения платных возможностей приложений
                ВКонтакте, а также подарков и стикеров. Голосами нельзя оплатить рекламу.
            </p>
            <p className="mt-3 text-sm text-foreground/90 leading-relaxed">
                Обратите внимание, что право использования голосов предоставляется на условиях{" "}
                <a href="#!" className="text-primary hover:underline">
                    Лицензионного соглашения
                </a>
                . Возврат средств невозможен.
            </p>

            <div className="mt-5">
                <Row label="На вашем счёте">
                    <span className="text-foreground/90">0 голосов</span>
                </Row>
                <Row label="Способы оплаты">
                    <button className="text-sm font-medium text-primary hover:underline">Показать</button>
                </Row>
                <Row label="Баланс" divider={false}>
                    <button className="button-pill gap-2 rounded-lg px-4">
                        <Plus className="h-4 w-4" />
                        Пополнить баланс
                    </button>
                </Row>
            </div>

            <div className="mt-4 flex flex-col items-start gap-3 border-t border-border/60 pt-4">
                <button className="text-sm font-medium text-primary hover:underline">
                    Получить голоса у партнёров
                </button>
                <button className="text-sm font-medium text-primary hover:underline">
                    Активировать промокод
                </button>
                <div className="pt-2 text-xs text-muted-foreground">
                    Если у вас возникли проблемы, обратитесь в{" "}
                    <a href="#!" className="text-primary hover:underline">
                        платёжную Поддержку
                    </a>
                    .
                </div>
            </div>
        </Card>

        <Card>
            <div className="mb-3 inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold">
                Подписки
            </div>
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
                    <Volume2 className="h-5 w-5" />
                </div>
                <div className="flex-1 text-sm font-medium">Подписка на музыку</div>
                <button className="button-pill rounded-lg px-4">Оформить</button>
            </div>
        </Card>
    </div>
);

export default Settings;
