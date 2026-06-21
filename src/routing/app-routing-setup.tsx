import { Navigate, Route, Routes } from 'react-router';
import { RequireAuth } from '@/auth/require-auth';
import { RequireUnAuth } from '../auth/require-un-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { MainLayout } from '@/layouts/main/layout';
import { AuthLayout } from "@/layouts/auth/layout";
import { LoginPage } from "@/auth/pages/login-page";
import { RegistrationPage } from "@/auth/pages/registration-page";
import { VerifyEmailPage } from "@/auth/pages/verify-email-page";
import { ForgotPasswordPage } from "@/auth/pages/forgot-password-page";
import { ResetPasswordPage } from "@/auth/pages/reset-password-page";
import Home from "@/me/pages/home";
import Settings from "@/me/pages/settings";
import Account from "@/me/pages/account";
import AddAccountPage from "@/me/pages/add-account";
import FeedPage from "@/me/pages/feed";
import ProfilePage from "@/profile/pages/profile";

export function AppRoutingSetup() {
    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/me/settings" element={<Settings />} />
                    <Route path="/me/account" element={<Account />} />
                    <Route path="/me/login" element={<AddAccountPage />} />
                    <Route path="/me/feed" element={<FeedPage />} />
                    <Route path="/profile/:id" element={<ProfilePage />} />
                </Route>
            </Route>
            <Route path="error/*" element={<ErrorRouting />} />
            <Route element={<RequireUnAuth />}>
                <Route element={<AuthLayout />}>
                    <Route index element={<Navigate to="auth/login" replace />} />
                    <Route path="auth/login" element={<LoginPage />} />
                    <Route path="auth/registration" element={<RegistrationPage />} />
                    <Route path="auth/verify-email" element={<VerifyEmailPage />} />
                    <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="auth/reset-password" element={<ResetPasswordPage />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    );
}