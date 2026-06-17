import { createContext } from 'react';
import type { Language, TranslationDictionary } from './types';
import { en } from './en';
import { ru } from './ru';
import { ua } from './ua';
import { it } from './it';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';

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