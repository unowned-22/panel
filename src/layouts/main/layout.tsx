import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { TopBar } from "@/layouts/main/top-bar";

export function MainLayout() {
    return (
        <>
            <Helmet>
                <title>Unowned</title>
            </Helmet>
            <div className="min-h-screen bg-background">
                <TopBar />
                <main className="grow pt-5" role="content">
                    <Outlet />
                </main>
            </div>
        </>
    );
}