import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useAuthStore } from './auth.store';
import { authActions } from './auth-actions';

export const RequireAuth = () => {
    const token = useAuthStore((s) => {
        if (!s.activeAccountId) return undefined;
        return s.tokens[s.activeAccountId]?.access_token;
    });
    const [checking, setChecking] = useState(!!token);
    const verifiedRef = useRef(false);

    useEffect(() => {
        if (!token || verifiedRef.current) return;
        verifiedRef.current = true;
        authActions.getUser().finally(() => setChecking(false));
    }, [token]);

    if (checking) return <ScreenLoader />;
    if (!token) return <Navigate to="/auth/login" replace />;

    return <Outlet />;
};