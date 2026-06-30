import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './auth.store';

export const RequireGuest = () => {
    const token = useAuthStore((s) => {
        if (!s.activeAccountId) return undefined;
        return s.tokens[s.activeAccountId]?.access_token;
    });

    if (token) return <Navigate to="/" replace />;

    return <Outlet />;
};