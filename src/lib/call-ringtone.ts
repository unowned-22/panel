/**
 * Зацикленные гудки звонка на Web Audio API. Возвращает функцию остановки —
 * обязательно вызывайте её (например, в cleanup эффекта), иначе AudioContext
 * останется висеть.
 */
export const playRingtone = (): (() => void) => {
    let ctx: AudioContext | null = null;
    try {
        ctx = new AudioContext();
    } catch {
        return () => {};
    }

    const gain = ctx.createGain();
    gain.gain.value = 0.12;
    gain.connect(ctx.destination);

    const tone = (freq: number, t0: number, dur: number) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, t0);
        env.gain.linearRampToValueAtTime(1, t0 + 0.05);
        env.gain.setValueAtTime(1, t0 + dur - 0.05);
        env.gain.linearRampToValueAtTime(0, t0 + dur);
        osc.connect(env);
        env.connect(gain);
        osc.start(t0);
        osc.stop(t0 + dur);
    };

    const scheduleCycle = () => {
        if (!ctx) return;
        const base = ctx.currentTime;
        tone(440, base, 0.4);
        tone(480, base + 0.5, 0.4);
    };

    scheduleCycle();
    const interval = setInterval(scheduleCycle, 3000);

    return () => {
        clearInterval(interval);
        ctx?.close();
        ctx = null;
    };
};