import { createContext } from 'react';
import type { Language, TranslationDictionary } from '@/i18n/types';
import { en } from '@/i18n/en';
import { ru } from '@/i18n/ru';
import { ua } from '@/i18n/ua';
import { it } from '@/i18n/it';
import { es } from '@/i18n/es';
import { fr } from '@/i18n/fr';
import { de } from '@/i18n/de';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ua', 'it', 'es', 'fr', 'ru', 'de'];

export const dictionaries: Record<Language, TranslationDictionary> = {
    en, ru, ua, it, es, fr, de,
};

export interface TranslationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof TranslationDictionary) => string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);