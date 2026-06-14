import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useAuth } from './auth-context';

/**
 * Component to protect routes that require authentication.
 * If user is not authenticated, redirects to the login page.
 */
export const RequireAuth = () => {
    const { auth, verify, loading: globalLoading, logout } = useAuth();
    const [checking, setChecking] = useState(true);
    const verificationStarted = useRef(false);

    useEffect(() => {
        let mounted = true;
        const check = async () => {
            if (!auth?.access_token) {
                if (mounted) setChecking(false);
                return;
            }
            if (verificationStarted.current) return;
            verificationStarted.current = true;
            try {
                await verify();
            } catch {
                try { logout(); } catch {}
            } finally {
                if (mounted) setChecking(false);
            }
        };
        check();
        return () => {
            mounted = false;
            verificationStarted.current = false;
        };
    }, [auth]);

    if (checking || globalLoading) return <ScreenLoader />;

    if (!auth?.access_token) return <Navigate to="/auth/login" replace />;

    return <Outlet />;
};