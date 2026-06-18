let audioCtx = null;

export function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function getContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, type, duration, vol = 0.1) {
    try {
        const ctx = getContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) {
        console.error("Audio error", e);
    }
}

export const playCountdownBeep = () => playTone(600, 'sine', 0.2, 0.1);
export const playCountdownGo = () => playTone(1200, 'sine', 0.4, 0.15);
export const playTick = () => playTone(800, 'square', 0.05, 0.05);

export const playSuccess = () => {
    try {
        // C Major Arpeggio
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => playTone(freq, 'sine', 0.3, 0.1), i * 100);
        });
    } catch (e) { /* ignore error */ }
};

export const playError = () => {
    try {
        playTone(300, 'sawtooth', 0.3, 0.1);
        setTimeout(() => playTone(280, 'sawtooth', 0.4, 0.1), 150);
    } catch (e) { /* ignore error */ }
};
