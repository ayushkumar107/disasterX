import { create } from 'zustand';
import api from '../services/api';

export const useChatStore = create((set, get) => ({
  isOpen: false,
  rooms: [],
  activeRoom: null,
  messages: [],
  isLoadingRooms: false,
  isLoadingMessages: false,
  isSending: false,
  unreadCount: 0,

  setOpen: (isOpen) => {
    set({ isOpen });
    if (isOpen) {
      set({ unreadCount: 0 });
      if (get().rooms.length === 0) {
        get().fetchRooms();
      }
    }
  },

  toggleOpen: () => {
    const next = !get().isOpen;
    get().setOpen(next);
  },

  fetchRooms: async () => {
    set({ isLoadingRooms: true });
    try {
      const res = await api.get('/chat/rooms');
      if (res.data && res.data.success) {
        const rooms = res.data.data;
        set({ rooms, isLoadingRooms: false });
        if (!get().activeRoom && rooms.length > 0) {
          get().selectRoom(rooms[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err);
      set({ isLoadingRooms: false });
    }
  },

  selectRoom: async (room) => {
    set({ activeRoom: room, isLoadingMessages: true });
    try {
      const res = await api.get(`/chat/rooms/${room.slug || room._id}/messages`);
      if (res.data && res.data.success) {
        set({
          messages: res.data.data.messages || [],
          isLoadingMessages: false
        });
      }
    } catch (err) {
      console.error('Failed to load room messages:', err);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, options = {}) => {
    const { activeRoom } = get();
    if (!activeRoom || !content.trim()) return false;

    set({ isSending: true });
    try {
      const payload = {
        content: content.trim(),
        senderName: options.senderName,
        senderRole: options.senderRole,
        type: options.type || 'TEXT',
        location: options.location,
        locationLabel: options.locationLabel
      };

      const res = await api.post(`/chat/rooms/${activeRoom.slug || activeRoom._id}/messages`, payload);
      if (res.data && res.data.success) {
        const newMsg = res.data.data;
        // Avoid duplicate if socket broadcast also appends
        set((state) => {
          const exists = state.messages.some((m) => m._id === newMsg._id);
          return exists ? {} : { messages: [...state.messages, newMsg] };
        });
        set({ isSending: false });
        return true;
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      set({ isSending: false });
      return false;
    }
  },

  handleIncomingSocketMessage: (msg) => {
    const { activeRoom, isOpen } = get();
    if (activeRoom && (msg.chatRoom === activeRoom._id || msg.roomSlug === activeRoom.slug)) {
      set((state) => {
        const exists = state.messages.some((m) => m._id === msg._id);
        return exists ? {} : { messages: [...state.messages, msg] };
      });
    }

    if (!isOpen) {
      set((state) => ({ unreadCount: state.unreadCount + 1 }));
    }
  }
}));
