import type { LucideIcon } from 'lucide-react';
import type { TranslationDictionary } from "@/i18n/types";

export interface NavItem {
    to: string;
    label: keyof TranslationDictionary;
    icon: LucideIcon;
    dot?: boolean;
}

export type NavConfig = NavItem[];