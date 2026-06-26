import { BarChart3, CalendarDays, Download, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {toAbsoluteUrl} from "@/lib/helpers.ts";

const sections = ["Профиль", "Посты", "Истории", "Клипы", "Видео"];
const subTabs = ["Общее", "Аудитория", "Контент"];
const stats = ["Охват", "Просмотры", "Лайки", "Комментарии", "Поделились"];

const EmptyChart = () => (
    <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-muted-foreground/70">
            <BarChart3 className="h-7 w-7" />
        </div>
        <div className="text-sm font-semibold">За этот период нет данных</div>
    </div>
);

const Analytics = () => {
    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                <section className="panel-card overflow-hidden rounded-xl border border-border/70">
                    <header className="flex items-center justify-between border-b border-border px-5 py-4">
                        <div className="flex items-center gap-4">
                            <img src={toAbsoluteUrl("/avatar-me.jpg")} alt="Mark Roberts" className="h-11 w-11 rounded-full object-cover" />
                            <h1 className="text-2xl font-bold">Mark Roberts</h1>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <HelpCircle className="h-4 w-4" />
                            <Download className="h-4 w-4" />
                            <button className="button-pill gap-2 rounded-lg border border-border bg-transparent py-1.5 text-foreground hover:bg-secondary">
                                18.04–24.04 <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </button>
                        </div>
                    </header>

                    <div className="flex gap-2 px-5 pt-3">
                        {sections.map((section, index) => (
                            <button key={section} className={cn("rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground", index === 0 && "bg-secondary text-foreground shadow-card")}>{section}</button>
                        ))}
                    </div>

                    <div className="m-4 rounded-2xl bg-card px-5 py-4 shadow-card">
                        <div className="mb-4 flex gap-2">
                            {subTabs.map((tab, index) => <button key={tab} className={cn("rounded-lg px-3 py-1.5 text-sm font-semibold text-muted-foreground", index === 0 && "bg-secondary text-foreground")}>{tab}</button>)}
                        </div>

                        <div className="grid max-w-3xl grid-cols-3 gap-x-16 gap-y-4">
                            {stats.map((stat) => (
                                <div key={stat}>
                                    <div className="text-sm font-medium text-muted-foreground">{stat}</div>
                                    <div className="mt-1 text-3xl font-bold">0 <span className="text-lg font-medium text-muted-foreground">—</span></div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 border-t border-border pt-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold">Охват и просмотры</h2>
                                    <p className="text-sm text-muted-foreground">Уникальные пользователи, которые видели профиль, и общее количество просмотров</p>
                                </div>
                                <button className="text-sm font-semibold">По дням⌄</button>
                            </div>
                            <EmptyChart />
                        </div>

                        <div className="border-t border-border pt-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold">Взаимодействия</h2>
                                    <p className="text-sm text-muted-foreground">Как пользователи взаимодействуют с материалами профиля</p>
                                </div>
                                <div className="flex gap-4 text-sm font-semibold"><button>Вся аудитория⌄</button><button>По дням⌄</button></div>
                            </div>
                            <EmptyChart />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Analytics;