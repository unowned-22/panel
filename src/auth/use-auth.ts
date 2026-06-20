import { useAuthStore } from './auth.store';
import { authActions } from './auth-actions';

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
        ...authActions,
    };
}