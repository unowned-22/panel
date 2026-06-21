import { Stories  } from "@/components/stories";
import { useTranslation } from "@/hooks/use-translation";

const FeedPage = () => {
    const { t } = useTranslation();

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 max-w-180 mx-auto w-full flex flex-col gap-3">
                <Stories />
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    <div className="flex items-center justify-between px-3 py-2">
                        <span className="font-semibold text-sm">{t('sidebar.feed')}</span>
                    </div>
                </div>
            </aside>
        </div>
    )
};

export default FeedPage;