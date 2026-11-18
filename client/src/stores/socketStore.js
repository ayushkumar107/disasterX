import { create } from 'zustand';
import { io } from 'socket.io-client';
import { useWarningStore } from './warningStore';
import { useLandslideStore } from './landslideStore';
import { useChatStore } from './chatStore';

export const useSocketStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  connectSocket: (accessToken) => {
    if (get().socket) return;

    // Connect to Socket.IO (uses VITE_WS_URL in production, or proxy origin in dev)
    const wsEndpoint = import.meta.env.VITE_WS_URL || undefined;
    const socket = io(wsEndpoint, {
      auth: accessToken ? { token: accessToken } : {},
      reconnectionAttempts: 5,
      timeout: 10000
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('🔌 Real-time Socket.IO connection established');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    // Real-time chat message handlers
    socket.on('chat:message', (msg) => {
      useChatStore.getState().handleIncomingSocketMessage(msg);
    });

    socket.on('chat:new_message', (msg) => {
      useChatStore.getState().handleIncomingSocketMessage(msg);
    });

    // Real-time warning notification handler
    socket.on('warning:new', (warning) => {
      console.log('⚠️ New warning received:', warning);
      const { warnings } = useWarningStore.getState();
      
      // Update warning store list
      useWarningStore.setState({
        warnings: [warning, ...warnings]
      });

      // Show native/browser notification if enabled
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`🚨 Landslide ${warning.warningLevel.replace('_', ' ')}`, {
          body: warning.reason,
          icon: '/favicon.ico'
        });
      }
    });

    // Real-time risk update handler
    socket.on('risk:update', (data) => {
      console.log('🔄 Risk evaluation update received:', data);
      const { fetchZones } = useLandslideStore.getState();
      fetchZones(); // refresh risk zone states
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  }
}));
