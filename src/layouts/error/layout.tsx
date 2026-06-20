import { Helmet } from 'react-helmet-async';
import { Link, Outlet } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useSettings } from "@/hooks/use-settings";
import { Sidebar } from "@/layouts/main/sidebar";
import { SettingsModal } from "@/me/components/settings/settings-modal";

export function ErrorLayout() {
    const { visible, save, modalOpen, closeModal } = useSettings();

    return (
        <>
            <Helmet>
                <title>Unowned</title>
            </Helmet>

            <div className="min-h-screen bg-background">
                <header className="sticky top-0 z-40 h-15 bg-background/85 backdrop-blur-xl border-b border-border">
                    <div className="max-w-7xl mx-auto h-full px-4 flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 shrink-0 w-50">
                            <img src={toAbsoluteUrl('/unowned-d.png')} className="max-h-40" alt="unowned" />
                        </Link>
                    </div>
                </header>
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