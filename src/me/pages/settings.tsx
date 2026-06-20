import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { Row, Card } from "@/me/components/settings/elements";
import { useTranslation } from "@/hooks/use-translation";
import type { TranslationDictionary } from "@/i18n/types";

type SectionKey =
    | "account";

const SECTIONS: { key: SectionKey; label: keyof TranslationDictionary; }[] = [
    { key: "account", label: "page.settings.section.account" },
];

const Settings = () => {
    const [section, setSection] = useState<SectionKey>("account");
    const { t } = useTranslation();

    return (
        <div className="flex gap-4">
            <div className="flex-1 min-w-0 w-full flex flex-col gap-3">
                {section === "account" && <AccountSection />}
            </div>
            <aside className="hidden xl:flex flex-col w-70 shrink-0 py-0 gap-3 sticky top-18 self-start max-h-[calc(100vh-72px)]">
                <div className="panel-card p-2">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            onClick={() => setSection(s.key)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors",
                                section === s.key
                                    ? "bg-secondary font-semibold text-foreground"
                                    : "text-foreground/85 hover:bg-secondary/60",
                            )}
                        >
                            <span>{t(s.label)}</span>
                        </button>
                    ))}
                </div>
            </aside>
        </div>
    );
};

const AccountSection = () => {
    const { openModal } = useSettings();
    const { t } = useTranslation();

    return (
        <Card title={t('page.settings.general')}>
            <Row label={t('page.settings.menu.settings')}>
                <button className="text-primary hover:underline" onClick={openModal}>
                    {t('page.settings.setup.menu.items')}
                </button>
            </Row>
        </Card>
    );
};

export default Settings;
