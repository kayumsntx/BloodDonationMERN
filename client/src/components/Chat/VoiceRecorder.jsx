import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onRecorded, onCancel }) => {
    const [recording, setRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start();
            setRecording(true);
            setSeconds(0);
            timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);

            // Auto-stop at 60 seconds
            setTimeout(() => {
                if (recorder.state === 'recording') stopRecording();
            }, 60000);
        } catch (err) {
            console.error(err);
            alert('Microphone access denied or not available');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const sendVoice = () => {
        if (!audioBlob) return;
        const reader = new FileReader();
        reader.onload = () => {
            onRecorded({
                audio: reader.result,
                audioDuration: seconds
            });
            onCancel?.();
        };
        reader.readAsDataURL(audioBlob);
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 14px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: 24,
            marginBottom: 10
        }}>
            {!recording && !audioBlob && (
                <button
                    type="button"
                    onClick={startRecording}
                    title="Start recording"
                    style={{
                        background: '#dc2626', color: 'white', border: 'none',
                        borderRadius: '50%', width: 38, height: 38, cursor: 'pointer',
                        fontSize: '1.1em', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    🎤
                </button>
            )}
            {recording && (
                <>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ 
                            width: 10, height: 10, borderRadius: '50%',
                            background: '#ef4444', animation: 'recordingPulse 1s infinite'
                        }} />
                        <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '0.9em' }}>
                            Recording... {seconds}s
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={stopRecording}
                        title="Stop recording"
                        style={{
                            background: '#10b981', color: 'white', border: 'none',
                            borderRadius: '50%', width: 34, height: 34, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        ⏹
                    </button>
                </>
            )}
            {audioBlob && (
                <>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ flex: 1, height: 36 }} />
                    <button
                        type="button"
                        onClick={sendVoice}
                        title="Send voice note"
                        style={{
                            background: '#10b981', color: 'white', border: 'none',
                            borderRadius: 18, padding: '6px 14px', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.85em'
                        }}
                    >
                        Send ✅
                    </button>
                </>
            )}
            <button
                type="button"
                onClick={onCancel}
                title="Cancel"
                style={{
                    background: '#f1f5f9', border: 'none',
                    borderRadius: '50%', width: 30, height: 30, cursor: 'pointer',
                    color: '#64748b', fontSize: '0.9em'
                }}
            >
                ✕
            </button>
            <style>{`
                @keyframes recordingPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.3); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default VoiceRecorder;
