// Define UUID type for consistent usage
export type UUID = string;

// Language code type for user preferences
export type LanguageCode = 'en' | 'de' | 'es' | 'fr' | 'ja' | 'zh';

// Auth model representing the authentication session
export interface AuthModel {
    access_token: string;
    refresh_token?: string;
}

// User model representing the user profile
export interface UserModel {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
    cover_url: string;
    role: string;
    phone?: string;
    language?: LanguageCode;
}