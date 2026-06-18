import { useState, useEffect, useCallback } from 'react';

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [supported, setSupported] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
            setTimeout(() => setSupported(false), 0);
        }
        
        // Stop speaking when component unmounts
        return () => {
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const speak = useCallback((text) => {
        if (!supported) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Try to pick a female Hindi or English voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('hi-IN') || v.lang.includes('en-IN')) || voices[0];
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, [supported]);

    const stop = useCallback(() => {
        if (supported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [supported]);

    return { speak, stop, isSpeaking, supported };
}
