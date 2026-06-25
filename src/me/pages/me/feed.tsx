import { Stories } from "@/components/stories";
import { CreatePost } from "@/components/feed/CreatePost";
import { PostCard } from "@/components/feed/PostCard";
// import { FeedFilters, GameAdCard } from "@/components/feed/RightPanel";
import { useReposts } from "@/components/feed/RepostsContext";
import type { Post } from "@/components/feed/types";

const wave = (n: number, seed = 1) =>
    Array.from({ length: n }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin((i + seed) * 1.7)));

const posts: Post[] = [
    {
        id: "1",
        author: { id: "evgenia-shabaeva", kind: "user", name: "Евгения Шабаева", avatar: "/avatar-2.jpg", subtitle: "5 д назад · Москва" },
        time: "5 д",
        text: "74-летняя Алла Пугачёва появилась на концерте группы «Машина времени», вызвав бурное обсуждение в сети. Она вышла на сцену, чтобы поддержать музыкантов, когда звучала фонограмма её песни «Я сюда ещё вернусь».",
        media: [{ type: "photo", images: ["/post-1.jpg", "/post-photo-1.jpg", "/post-photo-4.jpg"] }],
        stats: { likes: 23900, comments: 14500, shares: 4700 },
        comments: [
            { id: "c1", author: { name: "Иван П.", avatar: "/avatar-3.jpg" }, text: "Легенда!", time: "2 ч", likes: 142 },
            { id: "c2", author: { name: "Мария К.", avatar: "/avatar-4.jpg" }, text: "Любим её всем сердцем ❤️", time: "1 ч", likes: 56 },
            { id: "c3", author: { name: "Олег С.", avatar: "/avatar-5.jpg" }, text: "Спасибо за репортаж", time: "40 м", likes: 9 },
        ],
    },
    {
        id: "2",
        author: { id: "artem-levin", kind: "user", name: "Артём Левин", avatar: "/avatar-1.jpg", subtitle: "Только что" },
        time: "только что",
        text: "Записал короткое голосовое — расскажу про новый альбом 🎙️",
        media: [{ type: "audio", audio: { kind: "voice", duration: "0:34", waveform: wave(36, 2) } }],
        stats: { likes: 312, comments: 27, shares: 4 },
    },
    {
        id: "3",
        author: { id: "travel-photo", kind: "group", name: "Travel & Photo", avatar: "/avatar-3.jpg", subtitle: "Сообщество · 2 ч" },
        time: "2 ч",
        text: "Фото недели — мы собрали лучшие снимки нашего сообщества. Какой бы вы поставили на обложку?",
        media: [{ type: "photo", images: ["/post-photo-1.jpg", "/post-photo-2.jpg", "/post-photo-3.jpg", "/post-photo-4.jpg"] }],
        stats: { likes: 8400, comments: 312, shares: 178 },
        liked: true,
    },
    {
        id: "4",
        author: { id: "lo-fi-beats", kind: "group", name: "Lo-Fi Beats", avatar: "/avatar-4.jpg", subtitle: "Музыкальная подборка" },
        time: "вчера",
        text: "Подборка треков для концентрации — слушайте, пока работаете 🎧",
        media: [
            {
                type: "audio-collection",
                tracks: [
                    { kind: "track", title: "Midnight Drive", artist: "Lo-Fi Bear", duration: "3:24", cover: "/post-music-cover.jpg" },
                    { kind: "track", title: "Soft Rain", artist: "Aurora", duration: "2:58", cover: "/post-music-cover.jpg" },
                    { kind: "track", title: "Coffee & Code", artist: "Nordic Loops", duration: "4:12", cover: "/post-music-cover.jpg" },
                    { kind: "track", title: "Tokyo Lights", artist: "Neon Tape", duration: "3:47", cover: "/post-music-cover.jpg" },
                ],
            },
        ],
        stats: { likes: 1820, comments: 96, shares: 245 },
    },
    {
        id: "5",
        author: { id: "kinohronika", kind: "group", name: "Кинохроника", avatar: "/avatar-5.jpg", subtitle: "12 ч назад" },
        time: "12 ч",
        text: "Свежий трейлер от Christopher Nolan — обсуждаем в комментариях.",
        media: [
            {
                type: "video",
                video: { kind: "youtube", videoId: "dQw4w9WgXcQ", title: "Trailer" },
            },
        ],
        stats: { likes: 5400, comments: 421, shares: 89 },
    },
    {
        id: "6",
        author: { id: "mobile-photo", kind: "group", name: "Мобильная фотография", avatar: "/avatar-6.jpg", subtitle: "Сообщество" },
        time: "3 ч",
        text: "Один кадр — одна история. Сегодняшний победитель конкурса.",
        media: [{ type: "photo", images: ["/post-photo-3.jpg"] }],
        stats: { likes: 1200, comments: 89, shares: 24 },
    },
    {
        id: "7",
        author: { id: "chef-dima", kind: "user", name: "Шеф-повар Дима", avatar: "/avatar-7.jpg", subtitle: "Кулинарный блог" },
        time: "вчера",
        text: "Рецепт идеального латте — снял короткое видео из своего кафе ☕",
        media: [
            {
                type: "video",
                video: { kind: "upload", thumbnail: "/post-video-thumb.jpg", duration: "1:24" },
            },
        ],
        stats: { likes: 940, comments: 58, shares: 12 },
    },
    {
        id: "8",
        author: { id: "anna-morozova", kind: "user", name: "Анна Морозова", avatar: "/avatar-2.jpg", subtitle: "Личный блог" },
        time: "2 д",
        text: "Иногда лучший пост — это просто текст. Сегодня хочется поделиться мыслью: не бойтесь начинать с малого. Любой большой проект начинался с одной маленькой идеи и одного решительного шага.",
        stats: { likes: 4200, comments: 215, shares: 67 },
    },
];

const Feed = () => {
    const { reposts } = useReposts();
    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-150 mx-auto w-full flex flex-col gap-3">
                <Stories />
                <CreatePost />
                {reposts.map((p) => (
                    <PostCard key={p.id} post={p} />
                ))}
                {posts.map((p) => (
                    <PostCard key={p.id} post={p} />
                ))}
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                {/*<FeedFilters />*/}
                {/*<GameAdCard />*/}
            </aside>
        </div>
    );
};

export default Feed;
