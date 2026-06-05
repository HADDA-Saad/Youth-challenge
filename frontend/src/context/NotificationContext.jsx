import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { token, user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token || !user?.userId) return;

    const getWsUrl = () => {
      if (import.meta.env.VITE_WS_URL) {
        return import.meta.env.VITE_WS_URL;
      }
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      if (window.location.port === '5173') {
        return 'ws://localhost:9696/ws';
      }
      return `${protocol}//${window.location.host}/ws`;
    };

    const client = new Client({
      brokerURL: getWsUrl(),
      connectHeaders: {
        token: token,
      },
      // SockJS fallback — use webSocketFactory for SockJS compatibility
      // Since we're using raw WebSocket with STOMP headers, this works directly
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {}, // silent debug
    });

    client.onConnect = () => {
      client.subscribe(`/topic/notifications/${user.userId}`, (message) => {
        try {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => {
            const updated = [notification, ...prev];
            return updated.slice(0, 20); // Cap at 20
          });
          setUnreadCount((prev) => prev + 1);
        } catch (e) {
          // Silently ignore parse errors
        }
      });
    };

    client.onStompError = () => {
      // Silently handle STOMP errors — do not crash the app
    };

    client.onWebSocketError = () => {
      // Silently handle WebSocket errors — do not crash the app
    };

    try {
      client.activate();
      clientRef.current = client;
    } catch (e) {
      // Silently catch activation errors
    }

    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.deactivate();
        } catch (e) {
          // Silently catch deactivation errors
        }
        clientRef.current = null;
      }
    };
  }, [isAuthenticated, token, user?.userId]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
