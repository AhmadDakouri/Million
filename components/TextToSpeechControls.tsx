import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeech } from '../services/geminiService';
import { NormalPlayIconDrawn, SlowPlayIconDrawn } from './icons';

// --- Audio Utilities ---
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeRawAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const WebAudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioContext: AudioContext | null = null;
if (WebAudioContext) {
    try {
        audioContext = new WebAudioContext({ sampleRate: 24000 });
    } catch (e) {
        console.error("Could not create audio context", e);
    }
}

interface TextToSpeechControlsProps {
    text: string;
}

const TextToSpeechControls: React.FC<TextToSpeechControlsProps> = ({ text }) => {
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const sourceRef = useRef<AudioBufferSourceNode | null>(null);

    const fetchAndDecodeAudio = useCallback(async () => {
        if (!text || !audioContext) return;
        setIsLoading(true);
        setError(null);
        setAudioBuffer(null);

        try {
            const base64Audio = await generateSpeech(text);
            const audioData = decode(base64Audio);
            const buffer = await decodeRawAudioData(audioData, audioContext, 24000, 1);
            setAudioBuffer(buffer);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load audio.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [text]);
    
    useEffect(() => {
        if (!audioContext) {
            setError("Web Audio API is not supported in this browser.");
            return;
        }
        fetchAndDecodeAudio();

        return () => {
            if (sourceRef.current) {
                try { sourceRef.current.stop(); } catch (e) {}
            }
        };
    }, [fetchAndDecodeAudio]);

    const playAudio = (rate: number) => {
        if (!audioBuffer || isPlaying || !audioContext) return;

        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch(e) {}
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = rate;
        source.connect(audioContext.destination);
        source.onended = () => {
            setIsPlaying(false);
            sourceRef.current = null;
        };
        source.start(0);
        sourceRef.current = source;
        setIsPlaying(true);
    };

    const handlePlayClick = (e: React.MouseEvent, rate: number) => {
        e.stopPropagation();
        playAudio(rate);
    };
    
    const buttonClass = "p-1 rounded-full text-slate-300 hover:bg-slate-700/50 hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-wait";
    
    if (isLoading) {
        return <div className="flex items-center justify-center w-16 h-9" onClick={e => e.stopPropagation()}><div className="w-6 h-6 border-2 border-slate-500 border-t-yellow-400 rounded-full animate-spin"></div></div>;
    }
    
    if (error || !audioBuffer) return <div className="w-16 h-9"></div>;

    return (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
            <button onClick={(e) => handlePlayClick(e, 1)} disabled={isPlaying} className={buttonClass} aria-label="Play normal speed">
                <NormalPlayIconDrawn className="w-7 h-7" />
            </button>
            <button onClick={(e) => handlePlayClick(e, 0.75)} disabled={isPlaying} className={buttonClass} aria-label="Play slow speed">
                <SlowPlayIconDrawn className="w-7 h-7" />
            </button>
        </div>
    );
};

export default TextToSpeechControls;