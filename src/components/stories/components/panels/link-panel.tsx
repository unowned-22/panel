import { useState } from "react";
import { Link2 } from "lucide-react";
import { PanelHeader } from "../PanelHeader";
import { useTranslation } from "@/hooks/use-translation";

export type LinkDisplayStyle = "pill" | "card";

export interface LinkPayload {
    url: string;
    displayStyle: LinkDisplayStyle;
    title?: string;
}

interface LinkPanelProps {
    onAdd: (payload: LinkPayload) => void;
    onClose: () => void;
}

function extractHostname(raw: string): string {
    try {
        const full = raw.startsWith("http") ? raw : `https://${raw}`;
        return new URL(full).hostname;
    } catch {
        return "";
    }
}

function normalizeUrl(raw: string): string {
    return raw.startsWith("http") ? raw : `https://${raw}`;
}

function PillPreview({ label }: { label: string }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1.5 border border-white/20 max-w-full">
            <span className="text-base leading-none">🔗</span>
            <span className="text-sm text-white font-medium truncate">{label}</span>
        </div>
    );
}

function CardPreview({ hostname, label }: { hostname: string; label: string }) {
    return (
        <div className="flex items-center gap-2.5 rounded-xl bg-black/60 backdrop-blur-sm px-3 py-2.5 border border-white/20 max-w-full">
            <img
                src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 rounded-md shrink-0 bg-zinc-700"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div className="min-w-0">
                <p className="text-[13px] text-white font-semibold truncate">{label}</p>
                <p className="text-[11px] text-white/55 truncate">{hostname}</p>
            </div>
        </div>
    );
}

export function LinkPanel({ onAdd, onClose }: LinkPanelProps) {
    const { t } = useTranslation();
    const [url, setUrl] = useState("");
    const [style, setStyle] = useState<LinkDisplayStyle>("pill");
    const [title, setTitle] = useState("");

    const hostname = extractHostname(url);
    const label = title.trim() || hostname;
    const canAdd = !!hostname;

    const handleAdd = () => {
        if (!canAdd) return;
        onAdd({ url: normalizeUrl(url), displayStyle: style, title: title.trim() || undefined });

        setUrl("");
        setTitle("");
    };

    return (
        <div>
            <PanelHeader title={t("stories.editor.link.title")} onClose={onClose} />

            <div className="p-4 space-y-5">
                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500">URL</label>
                    <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2.5 focus-within:ring-1 focus-within:ring-white/30">
                        <Link2 className="h-4 w-4 text-zinc-400 shrink-0" />
                        <input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-500"
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500">{t("stories.editor.link.style.label")}</label>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setStyle("pill")}
                            className={`rounded-xl p-3 text-left border transition-colors ${
                                style === "pill"
                                    ? "border-white/40 bg-white/10"
                                    : "border-white/10 bg-zinc-800/60 hover:bg-zinc-800"
                            }`}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                <span className="text-xl">🔗</span>
                                <span className="text-xs font-medium text-zinc-100 truncate">
                  {hostname || "example.com"}
                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">{t("stories.editor.link.style.pill.desc")}</p>
                        </button>

                        <button
                            onClick={() => setStyle("card")}
                            className={`rounded-xl p-3 text-left border transition-colors ${
                                style === "card"
                                    ? "border-white/40 bg-white/10"
                                    : "border-white/10 bg-zinc-800/60 hover:bg-zinc-800"
                            }`}
                        >
                            <div className="mb-2 flex items-center gap-2">
                                {hostname ? (
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                                        alt=""
                                        className="h-5 w-5 rounded bg-zinc-600"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                ) : (
                                    <div className="h-5 w-5 rounded bg-zinc-600" />
                                )}
                                <span className="text-xs font-medium text-zinc-100 truncate">
                  {hostname || "example.com"}
                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">{t("stories.editor.link.style.card.desc")}</p>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-xs uppercase tracking-wider text-zinc-500">
                        {t("stories.editor.link.caption.label")}{" "}
                        <span className="normal-case text-zinc-600">{t("stories.editor.link.optional")}</span>
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={hostname || t("stories.editor.link.caption.placeholder")}
                        className="mt-1.5 w-full rounded-lg bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-white/30 placeholder:text-zinc-500"
                    />
                </div>

                {hostname && (
                    <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">
                            {t("stories.editor.link.preview.label")}
                        </label>
                        <div className="rounded-xl bg-zinc-800/50 p-3 flex items-center justify-center min-h-14">
                            {style === "pill" ? (
                                <PillPreview label={label} />
                            ) : (
                                <CardPreview hostname={hostname} label={label} />
                            )}
                        </div>
                    </div>
                )}

                <button
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                    {t("stories.editor.link.add")}
                </button>
            </div>
        </div>
    );
}