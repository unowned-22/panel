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
            // If no token, skip verify and mark as not checking
            if (!auth?.access_token) {
                if (mounted) setChecking(false);
                return;
            }

            // Avoid duplicate concurrent verifications
            if (verificationStarted.current) return;
            verificationStarted.current = true;

            try {
                await verify();
            } catch (err) {
                // Token invalid or verify failed — clear auth and redirect to login
                try {
                    logout();
                } catch {}
            } finally {
                if (mounted) setChecking(false);
            }
        };

        check();
        return () => {
            mounted = false;
            verificationStarted.current = false;
        };
    }, [auth, verify, logout]);

    if (checking || globalLoading) return <ScreenLoader />;

    if (!auth?.access_token) return <Navigate to="/auth/login" replace />;

    return <Outlet />;
};