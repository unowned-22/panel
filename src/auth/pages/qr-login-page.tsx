import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RefreshCw, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccount } from "@/hooks/use-account";
import { toast } from "@/hooks/use-toast";

const QRPlaceholder = ({ value }: { value: string }) => {
    const size = 200;
    const cells = 21;
    const cellSize = size / cells;

    // Deterministic-ish pattern from value string
    const seed = value.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const modules: boolean[][] = Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
            // Finder patterns (top-left, top-right, bottom-left corners)
            const inFinder =
                (r < 7 && c < 7) ||
                (r < 7 && c >= cells - 7) ||
                (r >= cells - 7 && c < 7);
            if (inFinder) {
                const lr = r < 7 ? r : r - (cells - 7);
                const lc = c < 7 ? c : c - (cells - 7);
                if (r < 7 && c >= cells - 7) {
                    return (lr <= 0 || lr >= 6 || lc <= 0 || lc >= 6) || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
                }
                return (lr <= 0 || lr >= 6 || lc <= 0 || lc >= 6) || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
            }
            // Data modules — pseudo-random based on seed
            return ((r * cells + c + seed) * 2654435761) % 2 === 0;
        })
    );

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            xmlns="http://www.w3.org/2000/svg"
            className="rounded-lg"
        >
            <rect width={size} height={size} fill="white" />
            {modules.map((row, r) =>
                row.map((on, c) =>
                    on ? (
                        <rect
                            key={`${r}-${c}`}
                            x={c * cellSize}
                            y={r * cellSize}
                            width={cellSize}
                            height={cellSize}
                            fill="black"
                        />
                    ) : null
                )
            )}
        </svg>
    );
};

type QRStatus = "waiting" | "scanned" | "confirmed" | "expired";
import { toAbsoluteUrl } from "@/lib/helpers";

export function QRLoginPage() {
    const navigate = useNavigate();
    const { addAccount } = useAccount();

    const [qrKey, setQrKey] = useState(() => Math.random().toString(36).slice(2));
    const [status, setStatus] = useState<QRStatus>("waiting");
    const [secondsLeft, setSecondsLeft] = useState(60);

    // Count down to expiry
    useEffect(() => {
        if (status !== "waiting") return;
        if (secondsLeft <= 0) {
            return;
        }
        const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [secondsLeft, status]);

    // Simulate scan after 4 s, confirm after 7 s (demo only)
    useEffect(() => {
        if (status !== "waiting") return;
        const scanTimer = setTimeout(() => setStatus("scanned"), 4000);
        const confirmTimer = setTimeout(() => {
            setStatus("confirmed");
            const acc = addAccount({ name: "QR Пользователь", username: `@qr_${qrKey.slice(0, 5)}` });
            toast({ title: "Вход выполнен", description: acc.name });
            navigate("/feed");
        }, 7000);
        return () => {
            clearTimeout(scanTimer);
            clearTimeout(confirmTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [qrKey]);

    const refresh = () => {
        setQrKey(Math.random().toString(36).slice(2));
        setStatus("waiting");
        setSecondsLeft(60);
    };

    const statusLabel: Record<QRStatus, string> = {
        waiting: "Ожидание сканирования…",
        scanned: "QR-код отсканирован. Подтвердите вход в приложении.",
        confirmed: "Вход подтверждён!",
        expired: "Срок действия QR-кода истёк.",
    };

    const statusColor: Record<QRStatus, string> = {
        waiting: "text-muted-foreground",
        scanned: "text-blue-500",
        confirmed: "text-green-500",
        expired: "text-destructive",
    };

    return (
        <div className="rounded-2xl border border-border bg-card p-8 shadow-elevated">
            <div className="flex flex-col items-center text-center mb-6">
                <span className="w-12 h-12 flex items-center justify-center">
                    <img
                        className="h-12 max-w-none"
                        src={toAbsoluteUrl('/u.png')}
                        alt="Unowned"
                    />
                </span>
                <h1 className="mt-4 text-2xl font-semibold">Login by QR</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    let's chat
                </p>
            </div>

            <div className="flex flex-col items-center gap-4">
                <div
                    className={`relative rounded-2xl p-3 border-2 transition-colors ${
                        status === "expired"
                            ? "border-destructive/40 opacity-40"
                            : status === "scanned"
                                ? "border-blue-500"
                                : "border-border"
                    }`}
                >
                    <QRPlaceholder value={qrKey} />
                    {status === "expired" && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
                            <Button size="sm" variant="secondary" onClick={refresh} className="gap-2">
                                <RefreshCw className="w-4 h-4" /> Обновить
                            </Button>
                        </div>
                    )}
                </div>

                {/* Status */}
                <p className={`text-sm font-medium ${statusColor[status]}`}>
                    {statusLabel[status]}
                </p>

                {/* Timer */}
                {status === "waiting" && (
                    <p className="text-xs text-muted-foreground">
                        Код действителен ещё {secondsLeft} с
                    </p>
                )}

                {status === "expired" && (
                    <Button onClick={refresh} variant="outline" className="gap-2 rounded-lg">
                        <RefreshCw className="w-4 h-4" /> Получить новый код
                    </Button>
                )}
            </div>
            <div className="mt-7 rounded-xl bg-secondary/60 p-4 space-y-2">
                <p className="text-xs font-medium">Как войти:</p>
                <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                    <li>Откройте приложение ВКонтакте на телефоне</li>
                    <li>
                        Нажмите значок{" "}
                        <Smartphone className="inline w-3 h-3 -mt-0.5" />{" "}
                        в меню навигации
                    </li>
                    <li>Наведите камеру на QR-код</li>
                    <li>Подтвердите вход</li>
                </ol>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
                Нет приложения?{" "}
                <Link to="/auth/login" className="text-primary">
                    Войти с паролем
                </Link>
            </p>
        </div>
    );
}