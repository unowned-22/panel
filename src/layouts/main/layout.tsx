import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { useSettings } from "@/hooks/use-settings";
import { TopBar } from "@/layouts/main/top-bar";
import { Sidebar } from "@/layouts/main/sidebar";
import { SettingsModal } from "@/me/components/settings/settings-modal";

export function MainLayout() {
    const { visible, save, modalOpen, closeModal } = useSettings();

    return (
        <>
            <Helmet>
                <title>Unowned</title>
            </Helmet>

            <div className="min-h-screen bg-background">
                <TopBar />
                <div className="max-w-7xl mx-auto px-4 flex gap-4">
                    <Sidebar visible={visible}/>
                    <main className="flex-1 min-w-0 py-3 flex flex-col gap-3">
                        <Outlet />
                    </main>
                </div>
            </div>

            <SettingsModal
                open={modalOpen}
                onClose={closeModal}
                visible={visible}
                onSave={save}
            />
        </>
    );
}