import { useAuthStore } from './auth.store';
import { authActions } from './auth-actions';

export function useAuth() {
    const auth    = useAuthStore((s) => s.auth);
    const user    = useAuthStore((s) => s.user);
    const isAdmin = useAuthStore((s) => s.isAdmin);

    return {
        auth,
        user,
        isAdmin,
        ...authActions,
    };
}