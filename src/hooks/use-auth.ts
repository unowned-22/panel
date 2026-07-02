import { useAuthStore } from '@/modules/auth/auth.store';
import { authApi } from "@/api/auth";

export function useAuth() {
    const tokens         = useAuthStore((s) => s.tokens);
    const activeAccountId = useAuthStore((s) => s.activeAccountId);
    const user    = useAuthStore((s) => s.user);
    const isAdmin = useAuthStore((s) => s.isAdmin);

    const auth = activeAccountId ? tokens[activeAccountId] : undefined;

    return {
        auth,
        user,
        isAdmin,
        ...authApi,
    };
}