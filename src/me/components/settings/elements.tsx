import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardConfig {
    title?: string;
    children: ReactNode;
}

export interface RowConfig {
    label: string;
    children: ReactNode;
    divider?: boolean;
}

export const Row = ({ label, children, divider = true}: RowConfig) => (
    <div
        className={cn(
            "grid grid-cols-[180px_1fr] items-start gap-6 py-4",
            divider && "border-b border-border/60 last:border-b-0",
        )}
    >
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-sm">{children}</div>
    </div>
);

export const Card = ({ title, children }: CardConfig) => (
    <section className="panel-card p-5">
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        <div className="flex flex-col">{children}</div>
    </section>
);