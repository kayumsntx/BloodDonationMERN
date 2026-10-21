import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
    const { user, loading } = useAuth();
    const socketRef = useRef(null);
    const currentUserIdRef = useRef(null);

    const userId = user?._id ? String(user._id) : null;

    useEffect(() => {
        // Wait until auth initialization is settled
        if (loading) return;

        // User is logged out
        if (!userId) {
            if (socketRef.current) {
                console.log('🚪 Closing socket connection (user logged out)');
                if (currentUserIdRef.current) {
                    socketRef.current.emit('user-leave', { userId: currentUserIdRef.current });
                }
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            currentUserIdRef.current = null;
            return;
        }

        // If a socket already exists for this exact user, re-confirm user-join and do NOT re-create
        if (socketRef.current && currentUserIdRef.current === userId) {
            if (socketRef.current.connected) {
                socketRef.current.emit('user-join', { userId });
                socketRef.current.emit('get-online-users');
            }
            return;
        }

        // If user ID changed (e.g., switched accounts), close old socket first
        if (socketRef.current && currentUserIdRef.current !== userId) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        currentUserIdRef.current = userId;

        console.log('🔌 Initializing persistent socket for user:', userId);
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            auth: {
                token: localStorage.getItem('token'),
                userId
            }
        });

        newSocket.on('connect', () => {
            console.log('🟢 Socket connected:', newSocket.id);
            newSocket.emit('user-join', { userId });
            newSocket.emit('get-online-users');
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Socket reconnected (attempt ${attemptNumber}):`, newSocket.id);
            newSocket.emit('user-join', { userId });
            newSocket.emit('get-online-users');
        });

        newSocket.on('connect_error', (error) => {
            console.warn('⚠️ Socket connection error:', error.message);
        });

        // Push notifications (FCM)
        requestNotificationPermission();
        setupForegroundMessages((notification) => {
            toast(notification?.body || notification?.title || 'Emergency Notification', {
                icon: '🔔',
                duration: 5000
            });
        });

        // SOS alert received
        newSocket.on('sos-alert', (alert) => {
            console.log('🚨 SOS Alert received:', alert);
            setSosAlert(alert);
            playEmergencySound();
            vibrateDevice();
        });

        // Someone responded to your SOS
        newSocket.on('sos-response', (response) => {
            console.log('🎉 SOS response received:', response);
            setSosResponse(response);
            playEmergencySound();
        });

        socketRef.current = newSocket;
        setSocket(newSocket);

        // Keep connection open; do not tear down on React strict-mode remounts
        return () => {
            // No-op cleanup during simple renders. Disconnection is controlled by userId changes.
        };
    }, [userId, loading]);

    // Ensure clean teardown when user unloads window completely
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (socketRef.current && currentUserIdRef.current) {
                // Do not emit user-leave here so reload grace period kicks in seamlessly!
                // Socket.io disconnects cleanly when window closes.
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);

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
