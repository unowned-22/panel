export type LanguageCode = 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh';

export interface AuthModel {
    access_token: string;
    refresh_token?: string;
}

export interface UserModel {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
    cover_url: string;
    cover_mobile_url: string;
    cover_desktop_url: string;
    role: string;
    phone?: string;
    language?: LanguageCode;
}