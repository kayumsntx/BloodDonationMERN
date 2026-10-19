import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import SOSAlertNotification from '../components/SOS/SOSAlertNotification';
import SOSResponseNotification from '../components/Common/SOSResponseNotification';
import { requestNotificationPermission, setupForegroundMessages } from '../utils/firebase';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

// Emergency sound
const playEmergencySound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const now = audioCtx.currentTime;

        // Three rapid beeps
        [0, 0.3, 0.6].forEach(delay => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now + delay);
            gain.gain.setValueAtTime(0.0001, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.3, now + delay + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.2);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.25);
        });
    } catch (e) {
        console.warn('Sound not available', e);
    }
};

// Vibration
const vibrateDevice = () => {
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [sosAlert, setSosAlert] = useState(null); // Currently displayed SOS notification
    const [sosResponse, setSosResponse] = useState(null); // When someone responds to your SOS
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('🟢 Socket connected:', newSocket.id);
                newSocket.emit('user-join', { userId: user._id });
            });

            // Push notifications (FCM)
            requestNotificationPermission();
            setupForegroundMessages((notification) => {
                toast(notification?.body || notification?.title || 'Emergency Notification', {
                    icon: '🔔',
                    duration: 5000
                });
            });

            // 🆕 SOS alert received
            newSocket.on('sos-alert', (alert) => {
                console.log('🚨 SOS Alert received:', alert);
                setSosAlert(alert);
                playEmergencySound();
                vibrateDevice();
            });

            // 🆕 Someone responded to your SOS
            newSocket.on('sos-response', (response) => {
                console.log('🎉 SOS response received:', response);
                setSosResponse(response);
                playEmergencySound();
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
            {/* SOS Alert Notification - rendered globally */}
            {sosAlert && (
                <SOSAlertNotification
                    alert={sosAlert}
                    onClose={() => setSosAlert(null)}
                />
            )}
            {/* SOS Response Notification - for requester */}
            {sosResponse && (
                <SOSResponseNotification
                    response={sosResponse}
                    onClose={() => setSosResponse(null)}
                />
            )}
        </SocketContext.Provider>
    );
};
