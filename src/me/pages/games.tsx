import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Trophy, MessageSquare, Users } from "lucide-react";

type Tab = "main" | "mine" | "profile";

type Game = {
    id: string;
    title: string;
    category: string;
    players: string;
    cover: string; // gradient
    badge?: string;
};

type Achievement = {
    id: string;
    title: string;
    desc: string;
    cover: string;
};

const FEATURED = {
    title: "Кровь Титанов: Возрождение",
    subtitle: "Собери непобедимую колоду!",
    cover:
        "from-emerald-700 via-emerald-900 to-emerald-950",
};

const QUICK: Game[] = [
    { id: "q1", title: "Кисс Ми 💋 виртуаль...", category: "Симулятор", players: "12M", cover: "from-pink-500 to-rose-700" },
    { id: "q2", title: "ProjectH", category: "Шутер", players: "8M", cover: "from-zinc-700 to-zinc-900" },
    { id: "q3", title: "Рыцари и Принцес...", category: "Стратегия", players: "5M", cover: "from-sky-500 to-indigo-700" },
    { id: "q4", title: "Инди Кот", category: "Головоломка", players: "9M", cover: "from-amber-500 to-orange-700" },
];

const FOR_YOU: Game[] = [
    { id: "g1", title: "Аватария", category: "Симулятор", players: "18M игроков", cover: "from-pink-400 via-rose-500 to-rose-700" },
    { id: "g2", title: "Метро: Война кланов", category: "Приключения", players: "9M игроков", cover: "from-orange-600 via-red-700 to-zinc-900" },
    { id: "g3", title: "World Poker Club — Покер", category: "Азартная", players: "12M игроков", cover: "from-zinc-800 via-zinc-900 to-black" },
    { id: "g4", title: "Аквамир 2", category: "Симулятор", players: "69K игроков", cover: "from-cyan-400 via-teal-500 to-emerald-700" },
    { id: "g5", title: "Нано-Ферма", category: "Симулятор", players: "4M игроков", cover: "from-lime-400 via-green-500 to-emerald-700" },
    { id: "g6", title: "Монеточка", category: "Казуальная", players: "2M игроков", cover: "from-yellow-400 via-amber-500 to-orange-600" },
    { id: "g7", title: "Ёлочка", category: "Казуальная", players: "1M игроков", cover: "from-fuchsia-500 via-pink-500 to-rose-600" },
    { id: "g8", title: "Wild West", category: "Приключения", players: "800K игроков", cover: "from-amber-700 via-orange-800 to-red-900" },
];

const ACHIEVEMENTS: Achievement[] = [
    { id: "a1", title: "Subscribe and chill", desc: "Оформить подписку в игре", cover: "from-zinc-600 to-zinc-800" },
    { id: "a2", title: "Всегда на связи", desc: "Разрешить двум играм писать в личку", cover: "from-zinc-500 to-zinc-700" },
    { id: "a3", title: "Царь горы", desc: "Войти в топ-100 игроков", cover: "from-amber-600 to-yellow-700" },
];

const GameCover = ({ game }: { game: Game }) => (
    <div
        className={`relative aspect-4/3 rounded-2xl bg-linear-to-br ${game.cover} overflow-hidden cursor-pointer group`}
    >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        {game.players && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur text-white text-[11px] font-medium">
                {game.players}
            </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center text-white/90 text-3xl font-bold opacity-30">
            {game.title.charAt(0)}
        </div>
    </div>
);

const GameCard = ({ game }: { game: Game }) => (
    <div className="flex flex-col gap-2">
        <GameCover game={game} />
        <div>
            <div className="text-sm font-medium truncate">{game.title}</div>
            <div className="text-xs text-muted-foreground">{game.category}</div>
        </div>
    </div>
);

const QuickGame = ({ game }: { game: Game }) => (
    <div className="flex flex-col items-center gap-2 w-20 shrink-0 cursor-pointer">
        <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${game.cover} flex items-center justify-center text-white font-bold text-xl`}>
            {game.title.charAt(0)}
        </div>
        <div className="text-[11px] text-center leading-tight line-clamp-2">{game.title}</div>
    </div>
);

const FeaturedBanner = () => (
    <div className={`relative aspect-video md:aspect-21/9 rounded-2xl bg-linear-to-br ${FEATURED.cover} overflow-hidden`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
        <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur flex items-center justify-center text-white">
            <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur flex items-center justify-center text-white">
            <ChevronRight className="w-5 h-5" />
        </button>
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="text-white">
                <div className="text-xl md:text-2xl font-bold">{FEATURED.title}</div>
                <div className="text-sm opacity-90">{FEATURED.subtitle}</div>
            </div>
            <button className="px-5 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors">
                Играть
            </button>
        </div>
    </div>
);

const MainTab = () => (
    <>
        <div className="panel-card p-4 flex flex-col md:flex-row gap-4 md:items-stretch">
            <div className="flex-1 min-w-0 panel-card bg-secondary/40 p-5 flex flex-col justify-between min-h-65">
                <div className="text-center my-auto">
                    <div className="text-lg font-semibold mb-1">Здесь будут ваши игры</div>
                    <div className="text-sm text-muted-foreground">
                        Попробуйте сыграть в игры
                        <br />
                        из подборки — они многим нравятся
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pt-3">
                    {QUICK.map((g) => (
                        <QuickGame key={g.id} game={g} />
                    ))}
                </div>
            </div>
            <div className="md:w-[55%] shrink-0">
                <FeaturedBanner />
            </div>
        </div>

        <Section title="Для вас">
            <Grid games={FOR_YOU} />
        </Section>

        <Section title="Новинки">
            <Grid games={[...FOR_YOU].reverse()} />
        </Section>
    </>
);

const MineTab = () => (
    <div className="panel-card p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-secondary flex items-center justify-center mb-3">
            <Trophy className="w-7 h-7 text-muted-foreground" />
        </div>
        <div className="text-lg font-semibold mb-1">Здесь будут игры, которые вы уже запускали</div>
        <div className="text-sm text-muted-foreground">Вдруг захочется поиграть ещё?</div>
    </div>
);

const ProfileTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="panel-card p-5 min-h-105 flex flex-col">
            <div className="font-semibold mb-3">Продолжить играть</div>
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                <Users className="w-10 h-10 mb-2 opacity-60" />
                Здесь будут игры, которые вы уже запускали.
                <br />
                Вдруг захочется поиграть ещё?
            </div>
        </div>
        <div className="panel-card p-5 min-h-105 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Уведомления</div>
                <button className="text-vk-blue text-sm hover:underline">Чёрный список</button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground text-sm">
                <MessageSquare className="w-10 h-10 mb-2 opacity-60" />
                Здесь появятся уведомления о достижениях
                <br />и победах, а ещё — приглашения в игры
            </div>
        </div>
        <div className="panel-card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
                <div>
                    <div className="font-semibold">Достижения</div>
                    <div className="text-xs text-muted-foreground">Получено 0 из 19</div>
                </div>
                <button className="text-vk-blue text-sm hover:underline">Показать все</button>
            </div>
            <div className="flex flex-col divide-y divide-border/60">
                {ACHIEVEMENTS.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 py-3">
                        <div className={`w-12 h-12 rounded-xl bg-linear-to-br ${a.cover} grayscale opacity-70`} />
                        <div>
                            <div className="text-sm font-medium">{a.title}</div>
                            <div className="text-xs text-muted-foreground">{a.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">{title}</div>
            <button className="text-vk-blue text-sm hover:underline">Показать все</button>
        </div>
        {children}
    </div>
);

const Grid = ({ games }: { games: Game[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {games.map((g) => (
            <GameCard key={g.id} game={g} />
        ))}
    </div>
);

const Games = () => {
    const [tab, setTab] = useState<Tab>("main");

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <div className="panel-card p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
                        {[
                            { id: "main" as Tab, label: "Главная" },
                            { id: "mine" as Tab, label: "Мои игры" },
                            { id: "profile" as Tab, label: "Профиль" },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Баланс: <span className="text-foreground font-medium">0 голосов</span>
                    </div>
                </div>

                <div className="panel-card p-3">
                    <div className="flex items-center gap-2 bg-secondary/60 rounded-xl px-3 h-10">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Поиск игр"
                            className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {tab === "main" && <MainTab />}
                {tab === "mine" && <MineTab />}
                {tab === "profile" && <ProfileTab />}
            </div>
        </div>
    );
};

export default Games;
