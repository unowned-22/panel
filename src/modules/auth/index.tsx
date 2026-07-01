import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { ScreenLoader } from '@/components/common/screen-loader';
import { useAuthStore } from './auth.store';
import { authApi } from "@/api/auth";
import { AuthLayout } from "@/layouts/auth/layout";
import { LoginPage } from "./pages/login-page";
import { RegistrationPage } from "./pages/registration-page";
import { VerifyEmailPage } from "./pages/verify-email-page";
import { ForgotPasswordPage } from "./pages/forgot-password-page";
import { ResetPasswordPage } from "./pages/reset-password-page";

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
        authApi.getUser().finally(() => setChecking(false));
    }, [token]);

    if (checking) return <ScreenLoader />;
    if (!token) return <Navigate to="/auth/login" replace />;

    return <Outlet />;
};

export const RequireGuest = () => {
    const token = useAuthStore((s) => {
        if (!s.activeAccountId) return undefined;
        return s.tokens[s.activeAccountId]?.access_token;
    });

    if (token) return <Navigate to="/" replace />;

    return <Outlet />;
};

export function Auth() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registration" element={<RegistrationPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>
        </Routes>
    );
}