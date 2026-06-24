import { ApiError } from '@/lib/api-client';

export function extractApiError(e: unknown): string {
    if (!e) return 'Unknown error';
    if (e instanceof ApiError) {
        const msg = e.message || '';
        try {
            const parsed = JSON.parse(msg);
            if (parsed?.message) return String(parsed.message);
            if (parsed?.error) return String(parsed.error);
            if (parsed?.data?.error?.message) return String(parsed.data.error.message);
            if (typeof parsed === 'string') return parsed;
            return JSON.stringify(parsed);
        } catch {
            return msg || 'Server error';
        }
    }

    if (e instanceof Error) return e.message;
    try {
        return String(e);
    } catch {
        return 'Unknown error';
    }
}

export function isApiErrorCode(e: unknown, code: string): boolean {
    if (!(e instanceof ApiError)) return false;
    const msg = e.message || '';
    try {
        const parsed = JSON.parse(msg);
        const errCode = parsed?.data?.error?.code ?? parsed?.code ?? parsed?.error?.code;
        return String(errCode) === code;
    } catch {
        return false;
    }
}
