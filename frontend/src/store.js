import { create } from 'zustand';
import { z } from 'zod';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Translations
export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      discover: 'Discover',
      feed: 'Feed',
      projects: 'Projects',
      messages: 'Messages',
      dashboard: 'Dashboard',
      statistics: 'Statistics',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      logout: 'Logout',
      institutionAccess: 'Institutional Access'
    },
    // Home page
    home: {
      tagline: 'African Artistic Ecosystem',
      title1: 'Connect.',
      title2: 'Create.',
      title3: 'Collaborate.',
      subtitle: 'The first platform dedicated to African artists. Showcase your work, find collaborators, and join a vibrant creative community across the continent.',
      exploreArtists: 'Explore Artists',
      joinCommunity: 'Join the Community',
      featuredArtists: 'Featured Artists',
      viewAll: 'View All',
      stats: {
        artists: 'Artists',
        countries: 'Countries',
        sectors: 'Artistic Sectors',
        projects: 'Collaborations'
      },
      features: {
        portfolio: {
          title: 'Digital Portfolio',
          desc: 'Showcase your work with documents, images, and videos'
        },
        network: {
          title: 'Pan-African Network',
          desc: 'Connect with artists from all over Africa'
        },
        collaborate: {
          title: 'Collaborate',
          desc: 'Find partners for your artistic projects'
        }
      }
    },
    // Auth
    auth: {
      login: 'Sign In',
      register: 'Create Account',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      country: 'Country',
      subregion: 'Sub-region',
      gender: 'Gender',
      sector: 'Artistic Sector',
      domain: 'Domain/Specialty',
      yearStarted: 'Year Started',
      bio: 'Biography',
      additionalInfo: 'Additional Information',
      website: 'Website',
      alreadyAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      createOne: 'Create one',
      signInHere: 'Sign in here',
      selectCountry: 'Select your country',
      selectSector: 'Select your sector',
      selectDomain: 'Select your domain',
      selectGender: 'Select gender'
    },
    // Profile
    profile: {
      portfolio: 'Portfolio',
      about: 'About',
      contact: 'Contact',
      sendMessage: 'Send Message',
      editProfile: 'Edit Profile',
      uploadDocument: 'Upload Document',
      uploadImage: 'Upload Image',
      addVideo: 'Add Video Link',
      documents: 'Documents',
      images: 'Images',
      videos: 'Videos',
      memberSince: 'Member since',
      yearsExperience: 'years of experience'
    },
    // Projects
    projects: {
      title: 'Collaboration Projects',
      createProject: 'Create Project',
      lookingFor: 'Looking for',
      apply: 'Apply',
      applications: 'applications',
      openProjects: 'Open Projects',
      myProjects: 'My Projects'
    },
    // Statistics
    statistics: {
      title: 'Statistics & Analytics',
      overview: 'Overview',
      byGender: 'By Gender',
      byCountry: 'By Country',
      byRegion: 'By Region',
      bySector: 'By Sector',
      requestAccess: 'Request Institutional Access',
      totalArtists: 'Total Artists',
      detailedStats: 'Detailed Statistics'
    },
    // Messages
    messages: {
      title: 'Messages',
      noConversations: 'No conversations yet',
      findArtists: 'Find Artists',
      typeMessage: 'Type a message...',
      selectConversation: 'Select a conversation'
    },
    // Common
    common: {
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      noResults: 'No results found',
      viewProfile: 'View Profile'
    }
  },
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      discover: 'Découvrir',
      feed: 'Fil',
      projects: 'Projets',
      messages: 'Messages',
      dashboard: 'Tableau de bord',
      statistics: 'Statistiques',
      signIn: 'Connexion',
      getStarted: 'Commencer',
      logout: 'Déconnexion',
      institutionAccess: 'Accès Institutionnel'
    },
    // Home page
    home: {
      tagline: 'Écosystème Artistique Africain',
      title1: 'Connecter.',
      title2: 'Créer.',
      title3: 'Collaborer.',
      subtitle: 'La première plateforme dédiée aux artistes africains. Présentez vos œuvres, trouvez des collaborateurs et rejoignez une communauté créative vibrante à travers le continent.',
      exploreArtists: 'Explorer les Artistes',
      joinCommunity: 'Rejoindre la Communauté',
      featuredArtists: 'Artistes en Vedette',
      viewAll: 'Voir Tout',
      stats: {
        artists: 'Artistes',
        countries: 'Pays',
        sectors: 'Secteurs Artistiques',
        projects: 'Collaborations'
      },
      features: {
        portfolio: {
          title: 'Portfolio Numérique',
          desc: 'Présentez vos travaux avec documents, images et vidéos'
        },
        network: {
          title: 'Réseau Panafricain',
          desc: 'Connectez-vous avec des artistes de toute l\'Afrique'
        },
        collaborate: {
          title: 'Collaborer',
          desc: 'Trouvez des partenaires pour vos projets artistiques'
        }
      }
    },
    // Auth
    auth: {
      login: 'Connexion',
      register: 'Créer un compte',
      email: 'Email',
      password: 'Mot de passe',
      firstName: 'Prénom',
      lastName: 'Nom',
      country: 'Pays',
      subregion: 'Sous-région',
      gender: 'Genre',
      sector: 'Secteur Artistique',
      domain: 'Domaine/Spécialité',
      yearStarted: 'Année de début',
      bio: 'Biographie',
      additionalInfo: 'Informations complémentaires',
      website: 'Site web',
      alreadyAccount: 'Vous avez déjà un compte ?',
      noAccount: "Vous n'avez pas de compte ?",
      createOne: 'Créer un compte',
      signInHere: 'Connectez-vous ici',
      selectCountry: 'Sélectionnez votre pays',
      selectSector: 'Sélectionnez votre secteur',
      selectDomain: 'Sélectionnez votre domaine',
      selectGender: 'Sélectionnez le genre'
    },
    // Profile
    profile: {
      portfolio: 'Portfolio',
      about: 'À propos',
      contact: 'Contact',
      sendMessage: 'Envoyer un Message',
      editProfile: 'Modifier le Profil',
      uploadDocument: 'Télécharger un Document',
      uploadImage: 'Télécharger une Image',
      addVideo: 'Ajouter un Lien Vidéo',
      documents: 'Documents',
      images: 'Images',
      videos: 'Vidéos',
      memberSince: 'Membre depuis',
      yearsExperience: "ans d'expérience"
    },
    // Projects
    projects: {
      title: 'Projets de Collaboration',
      createProject: 'Créer un Projet',
      lookingFor: 'Recherche',
      apply: 'Postuler',
      applications: 'candidatures',
      openProjects: 'Projets Ouverts',
      myProjects: 'Mes Projets'
    },
    // Statistics
    statistics: {
      title: 'Statistiques & Analyses',
      overview: 'Vue d\'ensemble',
      byGender: 'Par Genre',
      byCountry: 'Par Pays',
      byRegion: 'Par Région',
      bySector: 'Par Secteur',
      requestAccess: 'Demander un Accès Institutionnel',
      totalArtists: 'Total Artistes',
      detailedStats: 'Statistiques Détaillées'
    },
    // Messages
    messages: {
      title: 'Messages',
      noConversations: 'Aucune conversation',
      findArtists: 'Trouver des Artistes',
      typeMessage: 'Écrivez un message...',
      selectConversation: 'Sélectionnez une conversation'
    },
    // Common
    common: {
      search: 'Rechercher',
      filter: 'Filtrer',
      all: 'Tout',
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      noResults: 'Aucun résultat trouvé',
      viewProfile: 'Voir le Profil'
    }
  }
};

// Language Store
export const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('aca_language') || 'fr',
  t: translations[localStorage.getItem('aca_language') || 'fr'],
  
  setLanguage: (lang) => {
    localStorage.setItem('aca_language', lang);
    set({ language: lang, t: translations[lang] });
  },
  
  toggleLanguage: () => {
    const newLang = get().language === 'fr' ? 'en' : 'fr';
    localStorage.setItem('aca_language', newLang);
    set({ language: newLang, t: translations[newLang] });
  }
}));

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('aca_token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('aca_token', token);
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      let message = 'Login failed';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
        }
      }
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/register`, data);
      const { token, user } = response.data;
      localStorage.setItem('aca_token', token);
      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error) {
      let message = 'Registration failed';
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (typeof detail === 'string') {
          message = detail;
        } else if (Array.isArray(detail)) {
          message = detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(', ');
        }
      }
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
    useInstitutionStore.getState().reset();
    localStorage.removeItem('aca_token');
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
      useInstitutionStore.getState().hydrateFromBackend();
    } catch (error) {
      localStorage.removeItem('aca_token');
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
  },

  uploadAvatar: async (file) => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/artists/me/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ user: response.data });
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Upload failed' };
    }
  }
}));

// Theme Store
export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('aca_theme') || 'dark',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('aca_theme', newTheme);
    return { theme: newTheme };
  }),
  
  setTheme: (theme) => {
    localStorage.setItem('aca_theme', theme);
    set({ theme });
  }
}));

// Reference Data Store
export const useReferenceStore = create((set, get) => ({
  countries: [],
  subregions: [],
  sectors: [],
  domains: {},
  genders: [],
  isLoaded: false,

  fetchReferenceData: async () => {
    if (get().isLoaded) return;
    
    try {
      const [countriesRes, subregionsRes, sectorsRes, domainsRes, gendersRes] = await Promise.all([
        axios.get(`${API}/reference/countries`),
        axios.get(`${API}/reference/subregions`),
        axios.get(`${API}/reference/sectors`),
        axios.get(`${API}/reference/domains`),
        axios.get(`${API}/reference/genders`)
      ]);
      
      set({
        countries: countriesRes.data,
        subregions: subregionsRes.data,
        sectors: sectorsRes.data,
        domains: domainsRes.data,
        genders: gendersRes.data,
        isLoaded: true
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }
}));

// Artists Store
export const useArtistsStore = create((set, get) => ({
  artists: [],
  featuredArtists: [],
  currentArtist: null,
  total: 0,
  isLoading: false,
  filters: {
    search: '',
    country: '',
    subregion: '',
    sector: '',
    domain: '',
    gender: ''
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  resetFilters: () => set({
    filters: { search: '', country: '', subregion: '', sector: '', domain: '', gender: '' }
  }),

  fetchArtists: async () => {
    set({ isLoading: true });
    const { filters } = get();
    
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await axios.get(`${API}/artists?${params}`);
      set({ artists: response.data.artists, total: response.data.total, isLoading: false });
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
  }
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
      
      set((state) => ({
        currentMessages: [...state.currentMessages, response.data]
      }));
      
      get().fetchConversations();
      
      return { success: true, message: response.data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.response?.data?.detail || 'Failed to send message' };
    }
  },

  clearCurrentMessages: () => set({ currentMessages: [] })
}));

// Projects Store
export const useProjectsStore = create((set, get) => ({
  projects: [],
  isLoading: false,

  fetchProjects: async (sector = null) => {
    set({ isLoading: true });
    try {
      const params = sector ? `?sector=${sector}` : '';
      const response = await axios.get(`${API}/projects${params}`);
      set({ projects: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching projects:', error);
      set({ isLoading: false });
    }
  },

  createProject: async (projectData) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      const response = await axios.post(`${API}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchProjects();
      return { success: true, project: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create project' };
    }
  },

  applyToProject: async (projectId, message) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      await axios.post(`${API}/projects/${projectId}/apply?message=${encodeURIComponent(message)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to apply' };
    }
  }
}));

// Statistics Store
export const useStatisticsStore = create((set) => ({
  overview: null,
  detailed: null,
  isLoading: false,
  hasInstitutionAccess: false,

  fetchOverview: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/statistics/overview`);
      set({ overview: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      set({ isLoading: false });
    }
  },

  fetchDetailed: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/statistics/detailed`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ detailed: response.data, hasInstitutionAccess: true, isLoading: false });
    } catch (error) {
      console.error('Error fetching detailed statistics:', error);
      set({ isLoading: false, hasInstitutionAccess: false });
    }
  },

  requestAccess: async (data) => {
    try {
      const response = await axios.post(`${API}/institution/request-access`, data);
      return { success: true, requestId: response.data.request_id };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Request failed' };
    }
  },

  simulatePayment: async (requestId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      await axios.post(`${API}/institution/simulate-payment?request_id=${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Payment failed' };
    }
  }
}));

// Feed/Posts Store
export const useFeedStore = create((set, get) => ({
  posts: [],
  isLoading: false,
  hasMore: true,

  fetchPosts: async (reset = false) => {
    const { posts } = get();
    if (!reset && !get().hasMore) return;
    
    set({ isLoading: true });
    
    try {
      const before = reset ? '' : posts[posts.length - 1]?.created_at || '';
      const params = before ? `?before=${before}&limit=10` : '?limit=10';
      const token = useAuthStore.getState().token;
      
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API}/posts${params}`, { headers });
      
      const newPosts = response.data;
      
      set({
        posts: reset ? newPosts : [...posts, ...newPosts],
        hasMore: newPosts.length === 10,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ isLoading: false });
    }
  },

  createPost: async (postData) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await axios.post(`${API}/posts`, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Add to beginning of posts
      set((state) => ({
        posts: [response.data, ...state.posts]
      }));
      
      return { success: true, post: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to create post' };
    }
  },

  uploadPost: async (file, contentType, textContent) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('content_type', contentType);
    formData.append('text_content', textContent);

    try {
      const response = await axios.post(`${API}/posts/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      set((state) => ({
        posts: [response.data, ...state.posts]
      }));
      
      return { success: true, post: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to upload post' };
    }
  },

  toggleLike: async (postId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await axios.post(`${API}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update post in state
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, is_liked: response.data.liked, likes_count: response.data.likes_count }
            : post
        )
      }));
      
      return { success: true, ...response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to toggle like' };
    }
  },

  deletePost: async (postId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      await axios.delete(`${API}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        posts: state.posts.filter(post => post.id !== postId)
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to delete post' };
    }
  },

  resetPosts: () => set({ posts: [], hasMore: true })
}));

// Comments Store
export const useCommentsStore = create((set, get) => ({
  comments: {},
  isLoading: false,

  fetchComments: async (postId) => {
    set({ isLoading: true });
    
    try {
      const response = await axios.get(`${API}/posts/${postId}/comments`);
      
      set((state) => ({
        comments: { ...state.comments, [postId]: response.data },
        isLoading: false
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      set({ isLoading: false });
      return [];
    }
  },

  addComment: async (postId, content) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await axios.post(`${API}/posts/${postId}/comments`, 
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: [...(state.comments[postId] || []), response.data]
        }
      }));
      
      return { success: true, comment: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add comment' };
    }
  },

  deleteComment: async (postId, commentId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      await axios.delete(`${API}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      set((state) => ({
        comments: {
          ...state.comments,
          [postId]: (state.comments[postId] || []).filter(c => c.id !== commentId)
        }
      }));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to delete comment' };
    }
  }
}));

// Portfolio Store
export const usePortfolioStore = create((set) => ({
  isUploading: false,

  uploadFile: async (file, fileType, title, description) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    set({ isUploading: true });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await axios.post(`${API}/portfolio/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      set({ isUploading: false });
      
      // Refresh user data
      await useAuthStore.getState().fetchUser();
      
      return { success: true, file: response.data };
    } catch (error) {
      set({ isUploading: false });
      return { success: false, error: error.response?.data?.detail || 'Upload failed' };
    }
  },

  addVideo: async (url, title, description) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    const formData = new FormData();
    formData.append('url', url);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await axios.post(`${API}/portfolio/video`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await useAuthStore.getState().fetchUser();
      
      return { success: true, video: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add video' };
    }
  },

  deleteItem: async (itemType, itemId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };

    try {
      await axios.delete(`${API}/portfolio/${itemType}/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await useAuthStore.getState().fetchUser();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Delete failed' };
    }
  }
  
}));

export const useInstitutionStore = create((set, get) => ({
  hasPaid: false,
  accessCode: null,

  setPayment: (code) => {
    set({
      hasPaid: true,
      accessCode: code,
    });

    localStorage.setItem("institution_paid", "true");
    localStorage.setItem("institution_code", code);
  },

  hydrateFromBackend: () => {
    const paid = localStorage.getItem("institution_paid");
    const code = localStorage.getItem("institution_code");

    if (paid && code) {
      set({
        hasPaid: true,
        accessCode: code,
      });
    }
  },

  reset: () => {
    set({
      hasPaid: false,
      accessCode: null,
    });

    localStorage.removeItem("institution_paid");
    localStorage.removeItem("institution_code");
  },
}));
