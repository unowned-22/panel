import { BadgeCheck, MoreHorizontal, Play, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "Interviews and shows", "Politics", "Music", "Travel", "Cars", "Technology", "Food", "Education", "Fashion and beauty", "Health", "Interactive", "Culture"];

const videos = [
    { title: "Эскорт — гламур или ад? Психолог раскрывает правду", author: "Вероника Степанова Психолог", views: "71,4 тыс просмотров", date: "1 день назад", duration: "35:55", image: "/post-photo-1.jpg", avatar: "/avatar-1.jpg", verified: true },
    { title: "Быстрые свидания #39. Мария.", author: "Мэтч", views: "4,1 млн просмотров", date: "24 дня назад", duration: "1:33:38", image: "/post-music-cover.jpg", avatar: "/avatar-2.jpg", verified: true },
    { title: "Мультики для запуска речи — большой сборник", author: "Цветняшки | развивающий сериал-мюзикл", views: "84,5 тыс просмотров", date: "8 дней назад", duration: "36:51", image: "/story-1.jpg", avatar: "/avatar-3.jpg", verified: true },
    { title: "КСТАТИ #100 — Toxi$, Любовь Успенская и Kiliana", author: "VK Видео", views: "8,3 млн просмотров", date: "27 дней назад", duration: "1:37:00", image: "/post-video-thumb.jpg", avatar: "/avatar-4.jpg", verified: true },
    { title: "Мы опять взяли Range Rover...", author: "Ильдар Авто-Подбор", views: "1,4 млн просмотров", date: "7 дней назад", duration: "1:16:30", image: "/post-photo-4.jpg", avatar: "/avatar-5.jpg" },
    { title: "ЛПШКИ | «Популярность — это удача?»", author: "ТОП", views: "1,4 млн просмотров", date: "11 дней назад", duration: "57:29", image: "/photo-1.jpg", avatar: "/avatar-6.jpg", verified: true },
    { title: "Почему быть несчастливым выгодно?", author: "Марк Бартон", views: "51,5 тыс просмотров", date: "7 дней назад", duration: "1:54:22", image: "/post-photo-2.jpg", avatar: "/avatar-7.jpg", verified: true },
    { title: "Мы с Василисой стали моделями! Разрисовали папу", author: "Кукояки", views: "225 тыс просмотров", date: "21 день назад", duration: "26:09", image: "/post-photo-3.jpg", avatar: "/avatar-1.jpg", verified: true },
    { title: "Дубай, полиция и один неожиданный день", author: "Travel Show", views: "918 тыс просмотров", date: "3 дня назад", duration: "42:18", image: "/avatar-2.jpg", avatar: "/avatar-2.jpg" },
    { title: "Новый выпуск: музыка, тренды и закулисье", author: "ХАННА", views: "302 тыс просмотров", date: "сегодня", duration: "18:44", image: "/avatar-6.jpg", avatar: "/avatar-6.jpg", verified: true },
    { title: "Истории старого города: тайные маршруты", author: "Urban Lab", views: "66 тыс просмотров", date: "5 дней назад", duration: "28:10", image: "/post-photo-4.jpg", avatar: "/avatar-3.jpg" },
    { title: "Большой разговор про технологии", author: "Tech Media", views: "412 тыс просмотров", date: "9 дней назад", duration: "1:08:03", image: "/post-video-thumb.jpg", avatar: "/avatar-4.jpg", verified: true },
];

const Video = () => (
    <div className="flex gap-4">
        <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
            <section className="panel-card rounded-xl border border-border/70 p-5">
                <header className="mb-5 flex items-center gap-3">
                    <div className="relative min-w-0 flex-1">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input className="h-10 w-full rounded-xl bg-secondary pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none" placeholder="Поиск видео" />
                    </div>
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:bg-accent" aria-label="Фильтры">
                        <SlidersHorizontal className="h-5 w-5" />
                    </button>
                </header>

                <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none" aria-label="Категории видео">
                    {categories.map((category, index) => (
                        <button key={category} className={cn("shrink-0 rounded-lg px-3 py-2 text-sm font-bold transition-colors", index === 0 ? "bg-secondary text-foreground shadow-card" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground")}>
                            {category}
                        </button>
                    ))}
                </nav>

                <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {videos.map((video) => (
                        <article key={video.title} className="group min-w-0">
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary">
                                <img src={video.image} alt={video.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" loading="lazy" />
                                <div className="absolute inset-0 bg-linear-to-t from-background/55 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-2 right-2 rounded bg-background/75 px-1.5 py-0.5 text-xs font-bold">{video.duration}</div>
                                <div className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Play className="h-4 w-4 fill-foreground" />
                                </div>
                            </div>
                            <div className="mt-3 flex gap-3">
                                <img src={video.avatar} alt={video.author} className="h-9 w-9 shrink-0 rounded-full object-cover" loading="lazy" />
                                <div className="min-w-0 flex-1">
                                    <h2 className="line-clamp-2 text-sm font-bold leading-snug">{video.title}</h2>
                                    <div className="mt-1 flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                                        <span className="truncate">{video.author}</span>
                                        {video.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-primary text-card" />}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{video.views} · {video.date}</p>
                                </div>
                                <button className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 hover:bg-secondary group-hover:opacity-100" aria-label="Меню видео">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    </div>
);

export default Video;