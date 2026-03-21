import { create } from 'zustand';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('artsync_token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('artsync_token', token);
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/register`, data);
      const { token, user } = response.data;
      localStorage.setItem('artsync_token', token);
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    const { token } = get();
    if (token) {
      try {
        await axios.post(`${API}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('artsync_token');
    set({ user: null, token: null });
  },

  fetchUser: async () => {
    const { token } = get();
    if (!token) return;
    
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data });
    } catch (error) {
      localStorage.removeItem('artsync_token');
      set({ user: null, token: null });
    }
  },

  updateProfile: async (data) => {
    const { token } = get();
    try {
      const response = await axios.put(`${API}/artists/me`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Update failed' };
    }
  }
}));

// Theme Store
export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('artsync_theme') || 'dark',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('artsync_theme', newTheme);
    return { theme: newTheme };
  }),
  
  setTheme: (theme) => {
    localStorage.setItem('artsync_theme', theme);
    set({ theme });
  }
}));

// Artists Store
export const useArtistsStore = create((set, get) => ({
  artists: [],
  featuredArtists: [],
  currentArtist: null,
  isLoading: false,
  searchQuery: '',
  artistTypeFilter: 'All',

  fetchArtists: async (params = {}) => {
    set({ isLoading: true });
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.artist_type && params.artist_type !== 'All') {
        queryParams.append('artist_type', params.artist_type);
      }
      
      const response = await axios.get(`${API}/artists?${queryParams}`);
      set({ artists: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching artists:', error);
      set({ isLoading: false });
    }
  },

  fetchFeaturedArtists: async () => {
    try {
      const response = await axios.get(`${API}/artists/featured`);
      set({ featuredArtists: response.data });
    } catch (error) {
      console.error('Error fetching featured artists:', error);
    }
  },

  fetchArtist: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/artists/${id}`);
      set({ currentArtist: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      console.error('Error fetching artist:', error);
      set({ isLoading: false, currentArtist: null });
      return null;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setArtistTypeFilter: (type) => set({ artistTypeFilter: type })
}));

// Messages Store
export const useMessagesStore = create((set, get) => ({
  conversations: [],
  currentMessages: [],
  isLoading: false,

  fetchConversations: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ conversations: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoading: false });
    }
  },

  fetchMessages: async (userId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ currentMessages: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (receiverId, content) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      const response = await axios.post(`${API}/messages`, 
        { receiver_id: receiverId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Add message to current messages
      set((state) => ({
        currentMessages: [...state.currentMessages, response.data]
      }));
      
      // Refresh conversations
      get().fetchConversations();
      
      return { success: true, message: response.data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to send message' };
    }
  },

  clearCurrentMessages: () => set({ currentMessages: [] })
}));
