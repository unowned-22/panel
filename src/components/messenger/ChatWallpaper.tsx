/**
 * Декоративный фон чата: диагональный градиент + лёгкий паттерн из
 * иконок-дудлов (как в нативных мессенджерах). Рисуется один раз как
 * SVG-тайл и повторяется через CSS background-repeat — никакой логики,
 * чисто оформление. Не зависит от темы (всегда тёмный градиент), потому
 * что задача — дать чату собственный "обойный" фон, а не подстраиваться
 * под акцентный цвет интерфейса.
 */

const ICONS = `
  <g stroke="#ffffff" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
    <g transform="translate(15,20) rotate(-8)">
      <path d="M0 4C0 1 3 -1 5 1.5 7 -1 10 1 10 4 10 7 5 11 5 11 5 11 0 7 0 4Z"/>
    </g>
    <g transform="translate(95,10) rotate(10)">
      <path d="M6 0 7.8 4 12 4.3 8.8 7 9.8 11 6 8.7 2.2 11 3.2 7 0 4.3 4.2 4Z"/>
    </g>
    <g transform="translate(170,35) rotate(-5)">
      <rect x="0" y="4" width="12" height="8" rx="1"/>
      <line x1="6" y1="4" x2="6" y2="12"/>
      <path d="M0 4h12"/>
      <path d="M3 4C3 2 4.5 1 6 1S9 2 9 4"/>
    </g>
    <g transform="translate(20,95) rotate(6)">
      <rect x="0" y="0" width="14" height="10" rx="3"/>
      <path d="M3 10l-1 3 4-3"/>
    </g>
    <g transform="translate(110,80) rotate(-10)">
      <circle cx="2" cy="10" r="2"/>
      <circle cx="10" cy="9" r="2"/>
      <path d="M4 10V2l6-1v8"/>
    </g>
    <g transform="translate(190,100) rotate(12)">
      <path d="M7 0 1 8h4l-1 6 7-9H7l1-5Z"/>
    </g>
    <g transform="translate(60,150) rotate(-6)">
      <circle cx="6" cy="6" r="6"/>
      <circle cx="4" cy="5" r="0.8"/>
      <circle cx="8" cy="5" r="0.8"/>
      <path d="M3 8c1 1.5 5 1.5 6 0"/>
    </g>
    <g transform="translate(150,160) rotate(8)">
      <rect x="0" y="3" width="14" height="9" rx="2"/>
      <circle cx="7" cy="7.5" r="3"/>
      <rect x="4" y="0" width="5" height="3" rx="1"/>
    </g>
    <g transform="translate(210,190) rotate(-12)">
      <path d="M0 7 14 0l-4 14-3-5-5-2Z"/>
    </g>
    <g transform="translate(30,200) rotate(5)">
      <rect x="0" y="0" width="14" height="9" rx="1"/>
      <path d="M-2 9h18l-2 2H0Z"/>
    </g>
    <g transform="translate(110,210) rotate(-4)">
      <path d="M1 11V6a5 5 0 0110 0v5l-1.5-1.5L8 11l-1.5-1.5L5 11l-1.5-1.5L2 11Z"/>
      <circle cx="4" cy="6" r="0.7"/>
      <circle cx="8" cy="6" r="0.7"/>
    </g>
    <g transform="translate(190,30)">
      <path d="M5 0v10M0 5h10M1.5 1.5l7 7M8.5 1.5l-7 7"/>
    </g>
  </g>
`.trim();

const TILE = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">${ICONS}</svg>`;
const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

export const ChatWallpaper = () => (
    <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
            backgroundImage: `linear-gradient(135deg, hsl(265 60% 22%) 0%, hsl(235 60% 20%) 45%, hsl(200 65% 24%) 100%), ${PATTERN_URL}`,
            backgroundSize: "cover, 240px 240px",
            backgroundRepeat: "no-repeat, repeat",
        }}
    />
);

export default ChatWallpaper;