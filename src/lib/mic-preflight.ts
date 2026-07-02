export type MicPreflightResult = "ok" | "denied" | "no-device" | "muted-last-time";

const MUTE_PREF_KEY = "call:default-muted";

export const rememberMutePreference = (muted: boolean) => {
    try { localStorage.setItem(MUTE_PREF_KEY, muted ? "1" : "0"); } catch { /* noop */ }
};

export async function checkMicBeforeCall(): Promise<MicPreflightResult> {
    try {
        if (navigator.permissions) {
            const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
            if (status.state === "denied") return "denied";
        }
    } catch { /* Permissions API для microphone поддерживается не везде — просто идём дальше */ }

    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        if (!devices.some((d) => d.kind === "audioinput")) return "no-device";
    } catch { /* noop */ }

    if (localStorage.getItem(MUTE_PREF_KEY) === "1") return "muted-last-time";
    return "ok";
}