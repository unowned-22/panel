import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from "@/layouts/auth/layout";
import { LoginPage } from "@/auth/pages/login-page";
import { RegistrationPage } from "@/auth/pages/registration-page";
import { QRLoginPage } from "./pages/qr-login-page";
import { VerifyEmailPage } from "@/auth/pages/verify-email-page";

/**
 * Handles all authentication related routes.
 * This component is mounted at /auth/* in the main application router.
 */
export function AuthRouting() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route index element={<Navigate to="login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="registration" element={<RegistrationPage />} />
                <Route path="qr-login" element={<QRLoginPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
            </Route>
        </Routes>
    );
}