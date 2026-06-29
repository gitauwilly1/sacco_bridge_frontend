import { create } from 'zustand';
import { getAccessToken } from '../lib/apiClient';
import env from '../config/env';

const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30000;

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  reconnectAttempts: 0,
  reconnectTimer: null,

  connect: () => {
    const { socket: existing, reconnectTimer } = get();
    if (existing) return;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      set({ reconnectTimer: null });
    }

    const token = getAccessToken();
    if (!token) return;

    const wsUrl = `${env.WS_URL}/notifications/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      set({ isConnected: true, reconnectAttempts: 0 });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          set((state) => ({
            notifications: [data.notification, ...state.notifications],
          }));
        }
      } catch {
        // ignore malformed messages
      }
    };

    socket.onclose = () => {
      set({ isConnected: false, socket: null });
      get().scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };

    set({ socket });
  },

  scheduleReconnect: () => {
    const { reconnectAttempts, reconnectTimer } = get();
    if (reconnectTimer) return;

    const delay = Math.min(
      RECONNECT_BASE_MS * Math.pow(2, reconnectAttempts),
      RECONNECT_MAX_MS
    );

    const timerId = setTimeout(() => {
      set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1, reconnectTimer: null }));
      get().connect();
    }, delay);

    set({ reconnectTimer: timerId });
  },

  disconnect: () => {
    const { socket, reconnectTimer } = get();
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (socket) {
      socket.close();
    }
    set({ socket: null, isConnected: false, reconnectAttempts: 0, reconnectTimer: null });
  },

  clearNotifications: () => set({ notifications: [] }),
}));

export default useSocketStore;