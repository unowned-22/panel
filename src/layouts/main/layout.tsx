import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { TopBar } from "@/layouts/main/top-bar";
import { Sidebar } from "@/layouts/main/sidebar";

export function MainLayout() {
    return (
        <>
            <Helmet>
                <title>Unowned</title>
            </Helmet>
            <div className="min-h-screen bg-background">
                <TopBar />
                <div className="max-w-7xl mx-auto px-4 flex gap-4">
                    <Sidebar />
                    <main className="flex-1 min-w-0 py-3 flex flex-col gap-3">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}