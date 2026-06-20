import { useEffect, useState, type ReactNode } from 'react';
import type { Language, TranslationDictionary } from '@/i18n/types';
import { TranslationContext, dictionaries, SUPPORTED_LANGUAGES } from '@/context/translation-context';
import { en } from '@/i18n/en';
import { fetchUserPreferences, saveUserPreferences } from '@/lib/user-preferences';

const LANG_STORAGE_KEY = 'lang_v1';

function getBrowserLanguage(): Language {
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.slice(0, 2) as Language;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) return browserLang;
    }
    return 'en';
}

function getInitialLanguage(): Language {
    // localStorage как моментальный fallback (избегает flash неправильного языка)
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;
    return getBrowserLanguage();
}

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    // Подгружаем язык из API при первом маунте
    useEffect(() => {
        fetchUserPreferences().then((prefs) => {
            if (prefs?.language && SUPPORTED_LANGUAGES.includes(prefs.language)) {
                setLanguageState(prefs.language);
                localStorage.setItem(LANG_STORAGE_KEY, prefs.language);
            }
        });
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        // Кэшируем локально для быстрого старта
        localStorage.setItem(LANG_STORAGE_KEY, lang);
        // Сохраняем в API
        saveUserPreferences({ language: lang });
    };

    const t = (key: keyof TranslationDictionary): string => {
        const dict = dictionaries[language];
        return dict[key] || en[key] || key;
    };

    return (
        <TranslationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </TranslationContext.Provider>
    );
}