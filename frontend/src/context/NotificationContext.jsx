import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { fireAchievementConfetti } from '../utils/confetti';
import { API_BASE } from '../constants/api';

const NotificationContext = createContext();

// Max reconnect attempts before giving up entirely (avoids infinite loops)
const MAX_RETRIES = 5;
// Backoff: 1s, 2s, 4s, 8s, 16s → then give up
const BASE_DELAY_MS = 1000;

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);

    // Refs so the effect closure always has fresh values without re-running
    const retryCount   = useRef(0);
    const retryTimeout = useRef(null);
    const wsRef        = useRef(null);
    // Track all auto-dismiss timers so we can clear them on unmount
    const dismissTimers = useRef([]);

    const addNotification = useCallback((notif) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { ...notif, id }]);
        const duration = notif.type === 'achievement_unlocked' ? 8000 : 5000;
        // 🎉 Fire confetti on achievement unlock
        if (notif.type === 'achievement_unlocked') {
            const t0 = setTimeout(() => fireAchievementConfetti(), 300);
            dismissTimers.current.push(t0);
        }
        const t1 = setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
        dismissTimers.current.push(t1);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        const apiBase = API_BASE.replace(/\/$/, '');
        const wsUrl   = apiBase.replace(/^http/, 'ws') + `/ws/${user.id}`;

        let cancelled = false; // prevent actions after cleanup

        function connect() {
            if (cancelled) return;

            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                retryCount.current = 0; // reset on successful connection
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    addNotification(data);
                } catch (e) {
                    if (import.meta.env.DEV) console.error('WS parse error:', e);
                }
            };

            ws.onerror = () => {
                // onerror always precedes onclose — let onclose handle reconnect
            };

            ws.onclose = (evt) => {
                if (cancelled) return;
                // 1000 = Normal close (e.g., server shutting down gracefully) — no reconnect
                if (evt.code === 1000) return;

                if (retryCount.current >= MAX_RETRIES) {
                    if (import.meta.env.DEV) console.warn(`WS: max retries (${MAX_RETRIES}) reached. Giving up.`);
                    return;
                }

                const delay = BASE_DELAY_MS * Math.pow(2, retryCount.current);
                retryCount.current += 1;

                if (import.meta.env.DEV) {
                    console.log(`WS: reconnecting in ${delay}ms (attempt ${retryCount.current}/${MAX_RETRIES})`);
                }

                retryTimeout.current = setTimeout(connect, delay);
            };
        }

        connect();

        return () => {
            cancelled = true;
            clearTimeout(retryTimeout.current);
            // Clear all pending auto-dismiss timers to avoid state updates after unmount
            dismissTimers.current.forEach(clearTimeout);
            dismissTimers.current = [];
            const ws = wsRef.current;
            if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
                ws.close(1000, 'Component unmounted');
            }
        };
    }, [user?.id, addNotification]);

    const showNotification = useCallback((title, description, type = 'info', icon = null) => {
        // Soporte para firma clásica showNotification(mensaje, tipo)
        if (typeof title === 'string' && (description === 'success' || description === 'error' || description === 'info' || description === 'warning')) {
            addNotification({ title: title, description: '', type: description, icon });
        } else {
            addNotification({ title, description, type, icon });
        }
    }, [addNotification]);

    const contextValue = useMemo(() => ({
        notifications,
        addNotification,
        removeNotification,
        showNotification,
    }), [notifications, addNotification, removeNotification, showNotification]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {/* Toast Container */}
            <div className="toast-container">
                {notifications.map((n) => {
                    const duration = n.type === 'achievement_unlocked' ? 8000 : 5000;
                    return (
                        <div key={n.id} className={`toast-card ${n.type}`}>
                            {/* Barra de progreso de tiempo restante */}
                            <div
                                className="toast-progress"
                                style={{ animationDuration: `${duration}ms` }}
                            />
                            <div className="toast-icon">{n.icon || '🔔'}</div>
                            <div className="toast-content">
                                <h4>{n.title}</h4>
                                <p>{n.description}</p>
                                {n.xp_bonus && <span className="xp-tag">+{n.xp_bonus} XP</span>}
                            </div>
                            <button className="toast-close" onClick={() => removeNotification(n.id)}>&times;</button>
                        </div>
                    );
                })}
            </div>
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
