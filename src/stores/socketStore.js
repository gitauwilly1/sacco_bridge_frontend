import { create } from 'zustand';
import { getAccessToken } from '../lib/apiClient';
import env from '../config/env';

const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],

  connect: () => {
    const token = getAccessToken();
    if (!token) return;

    const wsUrl = `${env.WS_URL}/notifications/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => set({ isConnected: true });
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'notification') {
        set((state) => ({
          notifications: [data.notification, ...state.notifications],
        }));
      }
    };

    socket.onclose = () => set({ isConnected: false });
    socket.onerror = () => set({ isConnected: false });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  },

  clearNotifications: () => set({ notifications: [] }),
}));

export default useSocketStore;