// src/stores/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const myId = useAuthStore.getState().authUser?._id;

    try {
      // Send message via API
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      // Update local messages immediately
      set({ messages: [...messages, res.data] });

      // Emit to recipient via socket
      if (socket) {
        socket.emit("send_message", {
          toUserId: selectedUser._id,
          message: res.data,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const myId = useAuthStore.getState().authUser?._id;
    if (!socket) return;

    socket.off("receive_message"); // prevent duplicate listeners

    socket.on("receive_message", (newMessage) => {
      const isRelevant =
        selectedUser &&
        (newMessage.fromUserId === selectedUser._id ||
          newMessage.toUserId === selectedUser._id ||
          newMessage.fromUserId === myId);

      if (!isRelevant) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("receive_message");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));