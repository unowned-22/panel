import { useContext } from 'react';
import { TranslationContext, type TranslationContextType } from '@/context/translation-context';

export function useTranslation(): TranslationContextType {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
}