import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from "@/layouts/auth/layout";
import { LoginPage } from "@/auth/pages/login-page";
import { RegistrationPage } from "@/auth/pages/registration-page";
import { VerifyEmailPage } from "@/auth/pages/verify-email-page";
import { ForgotPasswordPage } from "@/auth/pages/forgot-password-page";
import { ResetPasswordPage } from "@/auth/pages/reset-password-page";

export function AuthRouting() {
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