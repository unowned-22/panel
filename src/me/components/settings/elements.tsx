import type { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {HelpCircle} from "lucide-react";

export interface CardConfig {
    title?: string;
    children: ReactNode;
}

export interface RowConfig {
    label: string;
    children: ReactNode;
    divider?: boolean;
}

interface SwitchRowProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
}

interface CheckboxItemProps {
    checked: boolean;
    onChange: () => void;
    label: string;
    hint?: boolean;
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

export const CheckboxItem = ({ checked, onChange, label, hint }: CheckboxItemProps) => (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
        <Checkbox
            checked={checked}
            onCheckedChange={onChange}
            className="h-4 w-4 rounded-[3px] border-muted-foreground/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="flex-1 text-foreground/90">{label}</span>
        {hint && <HelpCircle className="h-4 w-4 text-muted-foreground" />}
    </label>
);

export const SwitchRow = ({ icon, title, description, checked, onCheckedChange }: SwitchRowProps) => (
    <div className="flex items-center gap-3 border-b border-border/60 py-4 last:border-b-0">
        {icon && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                {icon}
            </div>
        )}
        <div className="min-w-0 flex-1">
            <div className="text-sm font-medium">{title}</div>
            {description && (
                <div className="text-xs text-muted-foreground leading-snug mt-0.5">{description}</div>
            )}
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
);