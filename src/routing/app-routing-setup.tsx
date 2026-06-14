import { AuthRouting } from '@/auth/auth-routing';
import { RequireAuth } from '@/auth/require-auth';
import { ErrorRouting } from '@/errors/error-routing';
import { MainLayout } from '@/layouts/main/layout';
import { GetStarterPage } from "@/me/pages/get-starter";
import { Navigate, Route, Routes } from 'react-router';

export function AppRoutingSetup() {
    return (
        <Routes>
            <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<GetStarterPage />} />
                    <Route path="/me/get-started" element={<GetStarterPage />} />
                </Route>
            </Route>
            <Route path="error/*" element={<ErrorRouting />} />
            <Route path="auth/*" element={<AuthRouting />} />
            <Route path="*" element={<Navigate to="/error/404" />} />
        </Routes>
    );
}