import { useState, type ReactNode } from 'react';
import type { Language, TranslationDictionary } from './types';
import { TranslationContext, dictionaries, SUPPORTED_LANGUAGES } from './translation-context';
import { en } from './en';

function getInitialLanguage(): Language {
    if (typeof navigator !== 'undefined') {
        const browserLang = navigator.language.slice(0, 2) as Language;
        if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            return browserLang;
        }
    }

    return 'en';
}

export function TranslationProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

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