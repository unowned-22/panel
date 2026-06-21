import { Navigate, Route, Routes } from 'react-router';
import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { MainLayout } from '@/layouts/main/layout';
import Home from "@/me/pages/home";
import Settings from "@/me/pages/settings";
import Account from "@/me/pages/account";
import AddAccountPage from "@/me/pages/add-account";
import FeedPage from "@/me/pages/feed";

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
                </Route>
            </Route>
            <Route path="error/*" element={<ErrorRouting />} />
            <Route path="auth/*" element={<AuthRouting />} />
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    );
}