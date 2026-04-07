import { create } from 'zustand';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Track visited artists to avoid duplicate view tracking per session
const _visitorViewedSet = new Set();

// Available Languages (11 African + intra-African focus)
export const availableLanguages = [
  { code: 'fr', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷', rtl: false },
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', rtl: false },
  { code: 'pt', label: 'Português', nativeLabel: 'Português', flag: '🇦🇴', rtl: false },
  { code: 'es', label: 'Español', nativeLabel: 'Español', flag: '🇬🇶', rtl: false },
  { code: 'ar', label: 'العربية', nativeLabel: 'العربية', flag: '🇪🇬', rtl: true },
  { code: 'sw', label: 'Kiswahili', nativeLabel: 'Kiswahili', flag: '🇰🇪', rtl: false },
  { code: 'af', label: 'Afrikaans', nativeLabel: 'Afrikaans', flag: '🇿🇦', rtl: false },
  { code: 'mg', label: 'Malagasy', nativeLabel: 'Malagasy', flag: '🇲🇬', rtl: false },
  { code: 'ti', label: 'ትግርኛ', nativeLabel: 'ትግርኛ', flag: '🇪🇷', rtl: false },
  { code: 'so', label: 'Somali', nativeLabel: 'Somali', flag: '🇸🇴', rtl: false },
  { code: 'am', label: 'አማርኛ', nativeLabel: 'አማርኛ', flag: '🇪🇹', rtl: false }
];

// Translations
export const translations = {
  en: {
    nav: {
      home: 'Home', discover: 'Discover', feed: 'Feed', projects: 'Projects',
      messages: 'Messages', dashboard: 'Dashboard', statistics: 'Statistics',
      signIn: 'Sign In', getStarted: 'Get Started', logout: 'Logout',
      institutionAccess: 'Institutional Access',
      visitorBadge: 'Visitor',
      languages: 'Languages'
    },

   
    home: {
      tagline: 'African Artistic Ecosystem',
      title1: 'Connect.', title2: 'Create.', title3: 'Collaborate.',
      subtitle: 'The first platform dedicated to African artists. Showcase your work, find collaborators, and join a vibrant creative community across the continent.',
      exploreArtists: 'Explore Artists', joinCommunity: 'Join the Community',
      featuredArtists: 'Featured Artists', viewAll: 'View All',
      stats: { artists: 'Artists', countries: 'Countries', sectors: 'Artistic Sectors', projects: 'Collaborations' },
      features: {
        portfolio: { title: 'Digital Portfolio', desc: 'Showcase your work with documents, images, and videos' },
        network: { title: 'Pan-African Network', desc: 'Connect with artists from all over Africa' },
        collaborate: { title: 'Collaborate', desc: 'Find partners for your artistic projects' }
      },
      joinCTA: "Join the African\nartistic community"
    },
    auth: {
      login: 'Sign In', register: 'Create Account', email: 'Email', password: 'Password',
      firstName: 'First Name', lastName: 'Last Name', country: 'Country',
      subregion: 'Sub-region', gender: 'Gender', sector: 'Artistic Sector',
      domain: 'Domain/Specialty', yearStarted: 'Year Started', bio: 'Biography / Presentation',
      additionalInfo: 'Additional Information', website: 'Website',
      profileTag: 'Profile Type', artistTag: 'Artist', professionalTag: 'Professional', mediaTag: 'Media',
      alreadyAccount: 'Already have an account?', noAccount: "Don't have an account?",
      createOne: 'Create one', signInHere: 'Sign in here',
      selectCountry: 'Select your country', selectSector: 'Select your sector',
      selectDomain: 'Select your domain', selectGender: 'Select gender',
      visitorType: 'Account Type', individual: 'Individual', organisation: 'Organisation',
      organisationName: 'Organisation Name',
      visitorInfo: 'As a visitor you can explore artist profiles and portfolios. You cannot access the Feed, post content, or send messages.',
      welcomeBack: 'Welcome back', signInTo: 'Sign in to Art Connect Africa',
      signingIn: 'Signing in...', demoAccounts: 'Demo accounts:',
      chooseAccountType: 'Choose your account type', joinACA: 'Join Art Connect Africa',
      artist: 'Artist', institution: 'Institution', visitor: 'Visitor',
      portfolioNetwork: 'Portfolio & Network', statsAccess: 'Statistics Access',
      exploreDiscover: 'Explore & Discover',
      organizationName: 'Organization Name', contactFirstName: 'Contact First Name',
      contactLastName: 'Contact Last Name', missionDescription: 'Mission / Organization Description',
      statsAccessTitle: '📊 Statistics Access',
      statsAccessInfo: 'After registration, you will need to complete a mock payment to receive your access code and view detailed statistics.',
      creating: 'Creating...', createInstitution: 'Create Institution Account',
      bioPlaceholder: 'Tell us about yourself and your art...',
      additionalInfoPlaceholder: 'Exhibitions, awards, notable collaborations...',
      orgNamePlaceholder: 'Ex: Ministry of Culture of Senegal',
      missionPlaceholder: "Describe your organization's mission...",
      emailPlaceholder: 'contact@organization.org'
    },
    profile: {
      portfolio: 'Portfolio', about: 'About', contact: 'Contact',
      sendMessage: 'Send Message', editProfile: 'Edit Profile',
      uploadDocument: 'Upload Document', uploadImage: 'Upload Image',
      addVideo: 'Add Video Link', documents: 'Documents', images: 'Images',
      videos: 'Videos', memberSince: 'Member since', yearsExperience: 'years of experience',
      collaborationsCount: 'collaboration(s)', noCollaborations: 'No collaborations yet',
      visitorBadge: 'VISITOR', backToDiscover: 'Back', 
      messageSent: 'Message sent!', messageFailed: 'Failed to send message',
      writeMessage: 'Write your message...', send: 'Send', cancel: 'Cancel',
      yrs: 'yrs', view: 'view', views: 'vues', emptyPortfolio: 'No portfolio items yet'
    },
    dashboard: {
      welcome: 'Welcome', conversations: 'Conversations', recentMessages: 'Recent Messages',
      new: 'new', findArtists: 'Find Artists', add: 'Add', title: 'Title',
      description: 'Description', upload: 'Upload', chooseFile: 'Choose File',
      noImages: 'No images yet', noDocuments: 'No documents yet', noVideos: 'No videos yet',
      fileUploaded: 'File uploaded!', videoAdded: 'Video added!', deleted: 'Deleted!',
      addVideo: 'Add Video', image: 'Image', document: 'Document', video: 'Video'
    },
    projects: {
      title: 'Collaboration Projects', createProject: 'Create Project',
      lookingFor: 'Looking for', apply: 'Apply', applications: 'applications',
      openProjects: 'Open Projects', myProjects: 'My Projects',
      upcoming: 'Upcoming', ongoing: 'Ongoing', past: 'Past', 
      typeLocal: 'Local', typeIntra: 'Intra-African',
      startDate: 'Start Date', endDate: 'End Date (Optional / Open-ended)',
      noProjects: 'No projects yet', noUpcoming: 'No upcoming projects',
      noOngoing: 'No ongoing projects', noPast: 'No past projects',
      projectCreated: 'Project created!', fillRequiredFields: 'Please fill required fields',
      applicationSent: 'Application sent!', starts: 'Starts', ends: 'Ends',
      findCollaborators: 'Find collaborators for your artistic projects',
      type: 'Collaboration Type', location: 'Location', projectTitle: 'Project Title',
      createProjectBtn: 'Create Project', sendApplication: 'Send Application'
    },
    statistics: {
      title: 'Statistics & Analytics', overview: 'Overview', byGender: 'By Gender',
      byCountry: 'By Country', byRegion: 'By Region', bySector: 'By Sector',
      requestAccess: 'Request Institutional Access', totalArtists: 'Total Artists',
      detailedStats: 'Detailed Statistics',
      projectCollaborations: 'Collaborations',
      statsByType: 'By Type', statsByStatus: 'By Status',
      statsTimeline: 'Timeline', statsTopCountries: 'Top Countries',
      interCountryGender: 'Inter-Country Collaborations by Gender',
      genderByDomain: 'Artists by Gender & Domain',
      visitorInterest: 'Visitor Interest by Profile',
      women: 'Women', men: 'Men', other: 'Other',
      countryPair: 'Country Pair', visitorViews: 'Visitor Views', artistCount: 'Artists',
      collaborations: 'Collaborations', genderDomain: 'Gender & Domain',
      visitors: 'Visitors', postsActivity: 'Posts & Activity',
      local: 'Local', intraAfrican: 'Intra-African',
      visitorMessages: 'Visitor Messages', mostMessaged: 'Most Messaged Domain',
      trendVsLastMonth: 'vs last month', topCountryPair: 'Most Active Pair',
      genderSplit: 'Gender Distribution', typeSplit: 'Type Distribution',
      monthlyEvolution: 'Monthly Evolution', countryPairs: 'Country Pairs (Intra-African)',
      detailedData: 'Detailed Data', loading: 'Loading...'
    },
    messages: {
      title: 'Messages', noConversations: 'No conversations yet',
      findArtists: 'Find Artists', typeMessage: 'Type a message...',
      selectConversation: 'Select a conversation',
      back: 'Back to conversations',
      noMessages: 'No messages'
    },
    settings: {
      title: 'Settings', profilePhoto: 'Profile Photo', changePhoto: 'Change Photo',
      updateProfile: 'Update Profile', saving: 'Saving...',
      profileUpdated: 'Profile updated!', updateFailed: 'Update failed',
      uploadFailed: 'Upload failed', photoUpdated: 'Profile photo updated!',
      invalidFileType: 'Invalid file type. Use JPG, PNG, GIF or WebP',
      fileTooLarge: 'File too large. Maximum 5MB'
    },
    feed: {
      title: 'Feed', shareSomething: 'Share something...', post: 'Post',
      noPosts: 'No posts yet', loadMore: 'Load more', 
      deletePost: 'Delete Post', deleteConfirm: 'Are you sure you want to delete this post?',
      comments: 'Comments', addComment: 'Add a comment...', commentPlaceholder: 'Write a comment...',
      community: 'Community', newPost: 'New Post', createPost: 'Create a post',
      postPublished: 'Post published!', postDeleted: 'Post deleted',
      publishing: 'Publishing...', firstToShare: 'Be the first to share!',
      seenItAll: "You've seen it all!", institutionNoInteract: 'Institutions cannot interact',
      institutionWarning: '⚠️ As an institution, you can view the feed but cannot interact (like, comment, post).',
      noComments: 'No comments yet', text: 'Text', clickToAdd: 'Click to add'
    },
    visitorProfile: {
      title: 'Visitor Profile', visitorNotFound: 'Visitor not found',
      individual: 'Individual', organization: 'Organization'
    },
    checkout: {
      title: 'Unlock Statistics', subtitle: 'Access complete demographic data of the African artistic community.',
      institutionalAccess: 'Institutional Access', demographics: 'Demographics',
      geography: 'Geography', activityTrends: 'Activity & Trends',
      demographicsDesc: 'Gender, age, country', geographyDesc: 'By African region',
      activityTrendsDesc: 'Posts, likes, sectors', 
      accessActivated: 'Access activated', mockPayment: 'Mock Payment',
      redirecting: 'Redirecting to statistics...',
      mockPaymentDesc: 'Payment simulation — no bank data required',
      accessCode: 'Access code', institutionalPlan: 'Institutional Plan',
      annual: 'Annual', total: 'Total (simulation)',
      benefit1: 'Detailed stats by gender and country',
      benefit2: 'Complete analytics dashboard',
      benefit3: 'Unique secure access code',
      benefit4: 'Unlimited data access',
      simulatePayment: 'Simulate Payment & Access',
      noRealTransaction: '🔒 Simulation only — no real transaction',
      paymentAccepted: 'Payment accepted! Access granted.',
      paymentError: 'Payment error', loginRequired: 'Login required',
      signInInstitution: 'Sign in with an institution account.',
      institutionsOnly: 'Institutions only', accessReserved: 'This access is reserved for Institution accounts.',
      viewPublicStats: 'View public stats', processing: 'Processing...'
    },
    statistics: {
      overview: 'Overview', collaborations: 'Collaborations', genderDomain: 'Gender & Domain',
      visitors: 'Visitors', totalArtists: 'Total Artists', trendVsLastMonth: 'vs last month',
      visitorViews: 'Visitor Views', visitorMessages: 'Visitor Messages',
      mostMessaged: 'Most Messaged Domain', topDomainsByMessages: 'Top Domains by Visitor Messages',
      detailedData: 'Detailed Data', typeSplit: 'Type Split', monthlyEvolution: 'Monthly Evolution',
      byGender: 'By Gender', women: 'Women', men: 'Men', other: 'Other',
      local: 'Local', intraAfrican: 'Intra-African',
      countryPairs: 'Country Pairs (Intra-African)', activePair: 'Most active pair',
      genderSplit: 'Gender Split', genderByDomain: 'Gender by Domain',
      loading: 'Loading statistics...', visitorViewsShort: 'Visitor Views', visitorMessagesShort: 'Visitor Messages',
      postsActivity: 'Posts Activity', featureInDev: 'Feature in development',
      country: 'Country', gender: 'Gender', domain: 'Domain', artists: 'Artists'
    },
    common: {
      search: 'Search', filter: 'Filter', all: 'All', save: 'Save',
      cancel: 'Cancel', delete: 'Delete', edit: 'Edit', loading: 'Loading...',
      noResults: 'No results found', viewProfile: 'View Profile',
      explore: 'Explore', discover: 'Discover', back: 'Back',
      send: 'Send', welcome: 'Welcome', success: 'Success', error: 'Error',
      isFrench: false, langCode: 'en',
      collaboration: 'collaboration', collaborations: 'collaborations',
      noCollaborations: 'No collaborations yet'
    },
    discover: {
      searchPlaceholder: 'Search by name...',
      resultsCount: 'Discover {total} artists from across Africa'
    }
  },
  fr: {
    nav: {
      home: 'Accueil', discover: 'Découvrir', feed: 'Fil', projects: 'Projets',
      messages: 'Messages', dashboard: 'Tableau de bord', statistics: 'Statistiques',
      signIn: 'Connexion', getStarted: 'Commencer', logout: 'Déconnexion',
      institutionAccess: 'Accès Institutionnel',
      visitorBadge: 'Visiteur',
      languages: 'Langues'
    },
    home: {
      tagline: 'Écosystème Artistique Africain',
      title1: 'Connecter.', title2: 'Créer.', title3: 'Collaborer.',
      subtitle: "La première plateforme dédiée aux artistes africains. Présentez vos œuvres, trouvez des collaborateurs et rejoignez une communauté créative vibrante à travers le continent.",
      exploreArtists: 'Explorer les Artistes', joinCommunity: 'Rejoindre la Communauté',
      featuredArtists: 'Artistes en Vedette', viewAll: 'Voir Tout',
      stats: { artists: 'Artistes', countries: 'Pays', sectors: 'Secteurs Artistiques', projects: 'Collaborations' },
      features: {
        portfolio: { title: 'Portfolio Numérique', desc: 'Présentez vos travaux avec documents, images et vidéos' },
        network: { title: 'Réseau Panafricain', desc: "Connectez-vous avec des artistes de toute l'Afrique" },
        collaborate: { title: 'Collaborer', desc: 'Trouvez des partenaires pour vos projets artistiques' }
      },
      joinCTA: "Rejoignez la communauté\nartistique africaine"
    },
    auth: {
      login: 'Connexion', register: 'Créer un compte', email: 'Email',
      password: 'Mot de passe', firstName: 'Prénom', lastName: 'Nom',
      country: 'Pays', subregion: 'Sous-région', gender: 'Genre',
      sector: 'Secteur Artistique', domain: 'Domaine/Spécialité',
      yearStarted: 'Année de début', bio: 'Biographie / Présentation',
      additionalInfo: 'Informations complémentaires', website: 'Site web',
      profileTag: 'Type de profil', artistTag: 'Artiste', professionalTag: 'Professionnel', mediaTag: 'Média',
      alreadyAccount: 'Vous avez déjà un compte ?', noAccount: "Vous n'avez pas de compte ?",
      createOne: 'Créer un compte', signInHere: 'Connectez-vous ici',
      selectCountry: 'Sélectionnez votre pays', selectSector: 'Sélectionnez votre secteur',
      selectDomain: 'Sélectionnez votre domaine', selectGender: 'Sélectionnez le genre',
      visitorType: 'Type de compte', individual: 'Particulier', organisation: 'Organisation',
      organisationName: "Nom de l'organisation",
      visitorInfo: "En tant que visiteur vous pouvez explorer les profils et portfolios des artistes. Vous ne pouvez pas accéder au Fil, publier du contenu ou envoyer des messages.",
      welcomeBack: 'Bon retour', signInTo: 'Connectez-vous à Art Connect Africa',
      signingIn: 'Connexion...', demoAccounts: 'Comptes de démonstration :',
      chooseAccountType: 'Choisissez votre type de compte', joinACA: 'Rejoignez Art Connect Africa',
      artist: 'Artiste', institution: 'Institution', visitor: 'Visiteur',
      portfolioNetwork: 'Portfolio & Réseau', statsAccess: 'Accès aux statistiques',
      exploreDiscover: 'Explorer & Découvrir',
      organizationName: "Nom de l'organisation", contactFirstName: 'Prénom du contact',
      contactLastName: 'Nom du contact', missionDescription: "Mission / Description de l'organisation",
      statsAccessTitle: '📊 Accès aux statistiques',
      statsAccessInfo: "Après inscription, vous devrez effectuer un paiement fictif pour obtenir votre code d'accès et consulter les statistiques détaillées.",
      creating: 'Création...', createInstitution: 'Créer le compte Institution',
      bioPlaceholder: 'Parlez-nous de vous et de votre art...',
      additionalInfoPlaceholder: 'Expositions, prix, collaborations notables...',
      orgNamePlaceholder: 'Ex: Ministère de la Culture du Sénégal',
      missionPlaceholder: "Décrivez la mission de votre organisation...",
      emailPlaceholder: 'contact@organisation.org'
    },
    profile: {
      portfolio: 'Portfolio', about: 'À propos', contact: 'Contact',
      sendMessage: 'Envoyer un Message', editProfile: 'Modifier le Profil',
      uploadDocument: 'Télécharger un Document', uploadImage: 'Télécharger une Image',
      addVideo: 'Ajouter un Lien Vidéo', documents: 'Documents', images: 'Images',
      videos: 'Vidéos', memberSince: 'Membre depuis', yearsExperience: "ans d'expérience",
      collaborationsCount: 'collaboration(s)', noCollaborations: 'Aucune collaboration',
      visitorBadge: 'VISITEUR', backToDiscover: 'Retour',
      messageSent: 'Message envoyé !', messageFailed: "Échec de l'envoi",
      writeMessage: 'Écrivez votre message...', send: 'Envoyer', cancel: 'Annuler',
      yrs: 'ans', view: 'vue', views: 'vues', emptyPortfolio: 'Aucun élément dans le portfolio'
    },
    dashboard: {
      welcome: 'Bienvenue', conversations: 'Conversations', recentMessages: 'Messages récents',
      new: 'nouveau', findArtists: 'Trouver des Artistes', add: 'Ajouter', title: 'Titre',
      description: 'Description', upload: 'Télécharger', chooseFile: 'Choisir un fichier',
      noImages: 'Aucune image', noDocuments: 'Aucun document', noVideos: 'Aucune vidéo',
      fileUploaded: 'Fichier téléchargé !', videoAdded: 'Vidéo ajoutée !', deleted: 'Supprimé !',
      addVideo: 'Ajouter la vidéo', image: 'Image', document: 'Document', video: 'Vidéo'
    },
    projects: {
      title: 'Projets de Collaboration', createProject: 'Créer un Projet',
      lookingFor: 'Recherche', apply: 'Postuler', applications: 'candidatures',
      openProjects: 'Projets Ouverts', myProjects: 'Mes Projets',
      upcoming: 'À venir', ongoing: 'En cours', past: 'Passés',
      typeLocal: 'Local', typeIntra: 'Intra-Africain',
      startDate: 'Date de début', endDate: 'Date de fin (Optionnel / En continu)',
      noProjects: 'Aucun projet pour le moment', noUpcoming: 'Aucun projet à venir',
      noOngoing: 'Aucun projet en cours', noPast: 'Aucun projet passé',
      projectCreated: 'Projet créé !', fillRequiredFields: 'Veuillez remplir les champs obligatoires',
      applicationSent: 'Candidature envoyée !', starts: 'Début', ends: 'Fin',
      findCollaborators: 'Trouvez des collaborateurs pour vos projets artistiques',
      type: 'Type de collaboration', location: 'Lieu', projectTitle: 'Titre du projet',
      createProjectBtn: 'Créer le projet', sendApplication: 'Envoyer ma candidature'
    },
    statistics: {
      title: 'Statistiques & Analyses', overview: "Vue d'ensemble",
      byGender: 'Par Genre', byCountry: 'Par Pays', byRegion: 'Par Région',
      bySector: 'Par Secteur', requestAccess: 'Demander un Accès Institutionnel',
      totalArtists: 'Total Artistes', detailedStats: 'Statistiques Détaillées',
      projectCollaborations: 'Collaborations',
      statsByType: 'Par Type', statsByStatus: 'Par Statut',
      statsTimeline: 'Historique', statsTopCountries: 'Pays Principaux',
      interCountryGender: 'Collaborations Interpays par Genre',
      genderByDomain: 'Artistes par Genre et Domaine',
      visitorInterest: 'Intérêt des Visiteurs par Profil',
      women: 'Femmes', men: 'Hommes', other: 'Autre',
      countryPair: 'Paire de pays', visitorViews: 'Vues Visiteurs', artistCount: 'Artistes',
      collaborations: 'Collaborations', genderDomain: 'Genre & Domaine',
      visitors: 'Visiteurs', postsActivity: 'Posts & Activité',
      local: 'Locale', intraAfrican: 'Intra-Africaine',
      visitorMessages: 'Messages Visiteurs', mostMessaged: 'Domaine le plus contacté',
      trendVsLastMonth: 'vs mois dernier', topCountryPair: 'Paire la plus active',
      genderSplit: 'Répartition par Genre', typeSplit: 'Répartition par Type',
      monthlyEvolution: 'Évolution Mensuelle', countryPairs: 'Paires de Pays (Intra-Africain)',
      detailedData: 'Données Détaillées', loading: 'Chargement...'
    },
    messages: {
      title: 'Messages', noConversations: 'Aucune conversation',
      findArtists: 'Trouver des Artistes', typeMessage: 'Écrivez un message...',
      selectConversation: 'Sélectionnez une conversation',
      back: 'Retour aux conversations',
      noMessages: 'Aucun message'
    },
    settings: {
      title: 'Paramètres', profilePhoto: 'Photo de profil', changePhoto: 'Changer la photo',
      updateProfile: 'Mettre à jour le profil', saving: 'Enregistrement...',
      profileUpdated: 'Profil mis à jour !', updateFailed: 'Échec de la mise à jour',
      uploadFailed: "Échec de l'upload", photoUpdated: 'Photo de profil mise à jour !',
      invalidFileType: 'Type de fichier invalide. Utilisez JPG, PNG, GIF ou WebP',
      fileTooLarge: 'Fichier trop volumineux. Maximum 5MB'
    },
    feed: {
      title: 'Fil d\'actualité', shareSomething: 'Partagez quelque chose...', post: 'Publier',
      noPosts: 'Aucun post pour le moment', loadMore: 'Charger plus',
      deletePost: 'Supprimer le post', deleteConfirm: 'Êtes-vous sûr de vouloir supprimer ce post ?',
      comments: 'Commentaires', addComment: 'Ajouter un commentaire...', commentPlaceholder: 'Écrivez un commentaire...',
      community: 'Communauté', newPost: 'Nouveau post', createPost: 'Créer un post',
      postPublished: 'Post publié !', postDeleted: 'Post supprimé',
      publishing: 'Publication...', firstToShare: 'Soyez le premier à partager !',
      seenItAll: 'Vous avez tout vu !', institutionNoInteract: 'Les institutions ne peuvent pas interagir',
      institutionWarning: '⚠️ En tant qu\'institution, vous pouvez consulter le feed mais pas interagir (liker, commenter, publier).',
      noComments: 'Aucun commentaire', text: 'Texte', clickToAdd: 'Cliquez pour ajouter'
    },
    visitorProfile: {
      title: 'Profil Visiteur', visitorNotFound: 'Visiteur non trouvé',
      individual: 'Particulier', organization: 'Organisation'
    },
    checkout: {
      title: 'Débloquer les Statistiques', subtitle: 'Accédez aux données démographiques complètes de la communauté artistique africaine.',
      institutionalAccess: 'Accès Institutionnel', demographics: 'Données démographiques',
      geography: 'Couverture géographique', activityTrends: 'Activité & Tendances',
      demographicsDesc: 'Genre, âge, pays', geographyDesc: 'Par région africaine',
      activityTrendsDesc: 'Posts, likes, secteurs',
      accessActivated: 'Accès activé', mockPayment: 'Paiement Fictif',
      redirecting: 'Redirection vers les statistiques...',
      mockPaymentDesc: 'Simulation de paiement — aucune donnée bancaire requise',
      accessCode: 'Code d\'accès', institutionalPlan: 'Plan Institutionnel',
      annual: 'Annuel', total: 'Total (simulation)',
      benefit1: 'Statistiques détaillées par genre et pays',
      benefit2: 'Tableau de bord analytique complet',
      benefit3: 'Code d\'accès unique et sécurisé',
      benefit4: 'Accès illimité aux données',
      simulatePayment: 'Simuler le paiement & Accéder',
      noRealTransaction: '🔒 Simulation uniquement — aucune transaction réelle',
      paymentAccepted: 'Paiement accepté ! Accès accordé.',
      paymentError: 'Erreur de paiement', loginRequired: 'Connexion requise',
      signInInstitution: 'Connectez-vous avec un compte institution.',
      institutionsOnly: 'Réservé aux institutions', accessReserved: 'Cet accès est réservé aux comptes de type Institution.',
      viewPublicStats: 'Voir les stats publiques', processing: 'Traitement...'
    },
    statistics: {
      overview: 'Aperçu', collaborations: 'Collaborations', genderDomain: 'Genre & Domaine',
      visitors: 'Visiteurs', totalArtists: 'Total Artistes', trendVsLastMonth: 'vs mois dernier',
      visitorViews: 'Vues Visiteurs', visitorMessages: 'Messages Visiteurs',
      mostMessaged: 'Domaine le plus contacté', topDomainsByMessages: 'Top Domaines par Messages Visiteurs',
      detailedData: 'Données Détaillées', typeSplit: 'Répartition par Type', monthlyEvolution: 'Évolution Mensuelle',
      byGender: 'Par Genre', women: 'Femmes', men: 'Hommes', other: 'Autre',
      local: 'Locale', intraAfrican: 'Intra-Africaine',
      countryPairs: 'Paires de Pays (Intra-Africain)', activePair: 'Paire la plus active',
      genderSplit: 'Répartition par Genre', genderByDomain: 'Genre par Domaine',
      loading: 'Chargement des statistiques...', visitorViewsShort: 'Vues Visiteurs', visitorMessagesShort: 'Messages Visiteurs',
      postsActivity: 'Activité des Posts', featureInDev: 'Fonctionnalité en développement',
      country: 'Pays', gender: 'Genre', domain: 'Domaine', artists: 'Artistes'
    },
    common: {
      search: 'Rechercher', filter: 'Filtrer', all: 'Tout', save: 'Enregistrer',
      cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier',
      loading: 'Chargement...', noResults: 'Aucun résultat trouvé',
      viewProfile: 'Voir le Profil',
      explore: 'Explorer', discover: 'Découvrir', back: 'Retour',
      send: 'Envoyer', welcome: 'Bienvenue', success: 'Succès', error: 'Erreur',
      isFrench: true, langCode: 'fr',
      collaboration: 'collaboration', collaborations: 'collaborations',
      noCollaborations: 'Aucune collaboration'
    },
    discover: {
      searchPlaceholder: 'Rechercher par nom...',
      resultsCount: 'Découvrez {total} artistes de toute l\'Afrique'
    }
  },
  // Deep copies for other languages (placeholders)
  pt: {
    nav: {
      home: 'Início', discover: 'Descobrir', feed: 'Feed', projects: 'Projetos',
      messages: 'Mensagens', dashboard: 'Painel', statistics: 'Estatísticas',
      signIn: 'Entrar', getStarted: 'Começar', logout: 'Sair',
      institutionAccess: 'Acesso Institucional',
      visitorBadge: 'Visitante',
      languages: 'Idiomas'
    },
    home: {
      tagline: 'Ecossistema Artístico Africano',
      title1: 'Conectar.', title2: 'Criar.', title3: 'Colaborar.',
      subtitle: "A primeira plataforma dedicada a artistas africanos. Apresente as suas obras, encontre colaboradores e junte-se a uma comunidade criativa vibrante em todo o continente.",
      exploreArtists: 'Explorar Artistas', joinCommunity: 'Participar na Comunidade',
      featuredArtists: 'Artistas em Destaque', viewAll: 'Ver Tudo',
      stats: { artists: 'Artistas', countries: 'Países', sectors: 'Setores Artísticos', projects: 'Colaborações' },
      features: {
        portfolio: { title: 'Portefólio Digital', desc: 'Apresente os seus trabalhos com documentos, imagens e vídeos' },
        network: { title: 'Rede Pan-Africana', desc: "Conecte-se com artistas de toda a África" },
        collaborate: { title: 'Colaborar', desc: 'Encontre parceiros para os seus projetos artísticos' }
      },
      joinCTA: "Junte-se à comunidade\nartística africana"
    },
    auth: {
      login: 'Entrar', register: 'Criar conta', email: 'E-mail',
      password: 'Palavra-passe', firstName: 'Nome', lastName: 'Apelido',
      country: 'País', subregion: 'Sub-região', gender: 'Género',
      sector: 'Setor Artístico', domain: 'Domínio/Especialidade',
      yearStarted: 'Ano de início', bio: 'Biografia',
      additionalInfo: 'Informações adicionais', website: 'Website',
      alreadyAccount: 'Já tem uma conta?', noAccount: "Não tem uma conta?",
      createOne: 'Criar uma', signInHere: 'Inicie sessão aqui',
      selectCountry: 'Selecione o seu país', selectSector: 'Selecione o seu setor',
      selectDomain: 'Selecione o seu domínio', selectGender: 'Selecione o género',
      visitorType: 'Tipo de conta', individual: 'Particular', organisation: 'Organização',
      organisationName: "Nome da organização",
      visitorInfo: "Como visitante, pode explorar perfis e portefólios. Não pode aceder ao Feed, publicar conteúdo ou enviar mensagens.",
      welcomeBack: 'Bem-vindo de volta', signInTo: 'Inicie sessão no Art Connect Africa',
      signingIn: 'A entrar...', demoAccounts: 'Contas de demonstração:',
      chooseAccountType: 'Escolha o seu tipo de conta', joinACA: 'Junte-se ao Art Connect Africa',
      artist: 'Artista', institution: 'Instituição', visitor: 'Visitante',
      portfolioNetwork: 'Portefólio e Rede', statsAccess: 'Acesso a estatísticas',
      exploreDiscover: 'Explorar e Descobrir',
      organizationName: "Nome da organização", contactFirstName: 'Nome do contacto',
      contactLastName: 'Apelido do contacto', missionDescription: "Missão / Descrição da organização",
      statsAccessTitle: '📊 Acesso a estatísticas',
      statsAccessInfo: "Após o registo, deverá efetuar um pagamento fictício para obter o seu código de acesso e consultar estatísticas detalhadas.",
      creating: 'A criar...', createInstitution: 'Criar conta de Instituição',
      bioPlaceholder: 'Fale-nos sobre si e a sua arte...',
      additionalInfoPlaceholder: 'Exposições, prémios, colaborações notáveis...',
      orgNamePlaceholder: 'Ex: Ministério da Cultura do Senegal',
      missionPlaceholder: "Descreva a missão da sua organização...",
      emailPlaceholder: 'contacto@organizacao.org'
    },
    profile: {
      portfolio: 'Portefólio', about: 'Sobre', contact: 'Contacto',
      sendMessage: 'Enviar Mensagem', editProfile: 'Editar Perfil',
      uploadDocument: 'Carregar Documento', uploadImage: 'Carregar Imagem',
      addVideo: 'Adicionar Link de Vídeo', documents: 'Documentos', images: 'Imagens',
      videos: 'Vídeos', memberSince: 'Membro desde', yearsExperience: "anos de experiência",
      collaborationsCount: 'colaboração(ões)', noCollaborations: 'Nenhuma colaboração',
      visitorBadge: 'VISITANTE', backToDiscover: 'Voltar',
      messageSent: 'Mensagem enviada!', messageFailed: "Falha no envio",
      writeMessage: 'Escreva a sua mensagem...', send: 'Enviar', cancel: 'Cancelar',
      yrs: 'anos', view: 'visualização', views: 'visualizações', emptyPortfolio: 'Nenhum item no portefólio'
    },
    dashboard: {
      welcome: 'Bem-vindo', conversations: 'Conversas', recentMessages: 'Mensagens recentes',
      new: 'novo', findArtists: 'Encontrar Artistas', add: 'Adicionar', title: 'Título',
      description: 'Descrição', upload: 'Carregar', chooseFile: 'Escolher ficheiro',
      noImages: 'Nenhuma imagem', noDocuments: 'Nenhum documento', noVideos: 'Nenhum vídeo',
      fileUploaded: 'Ficheiro carregado!', videoAdded: 'Vídeo adicionado!', deleted: 'Eliminado!',
      addVideo: 'Adicionar vídeo', image: 'Imagem', document: 'Documento', video: 'Vídeo'
    },
    projects: {
      title: 'Projetos de Colaboração', createProject: 'Criar um Projeto',
      lookingFor: 'À procura de', apply: 'Candidatar-se', applications: 'candidaturas',
      openProjects: 'Projetos Abertos', myProjects: 'Os meus Projetos',
      upcoming: 'Próximos', ongoing: 'Em curso', past: 'Passados',
      typeLocal: 'Local', typeIntra: 'Intra-africano',
      startDate: 'Data de início', endDate: 'Data de fim (Opcional / Contínuo)',
      noProjects: 'Nenhum projeto no momento', noUpcoming: 'Nenhum projeto próximo',
      noOngoing: 'Nenhum projeto em curso', noPast: 'Nenhum projeto passado',
      projectCreated: 'Projeto criado!', fillRequiredFields: 'Por favor, preencha os campos obrigatórios',
      applicationSent: 'Candidatura enviada!', starts: 'Início', ends: 'Fim',
      findCollaborators: 'Encontre colaboradores para os seus projetos artísticos',
      type: 'Tipo de colaboração', location: 'Localização', projectTitle: 'Título do projeto',
      createProjectBtn: 'Criar projeto', sendApplication: 'Enviar candidatura'
    },
    statistics: {
      title: 'Estatísticas e Análise', overview: "Visão Geral",
      byGender: 'Por Género', byCountry: 'Por País', byRegion: 'Por Região',
      bySector: 'Por Setor', requestAccess: 'Solicitar Acesso Institucional',
      totalArtists: 'Total de Artistas', detailedStats: 'Estatísticas Detalhadas',
      projectCollaborations: 'Colaborações',
      statsByType: 'Por Tipo', statsByStatus: 'Por Estado',
      statsTimeline: 'Histórico', statsTopCountries: 'Principais Países',
      interCountryGender: 'Colaborações Interpaíses por Género',
      genderByDomain: 'Artistas por Género e Domínio',
      visitorInterest: 'Interesse dos Visitantes por Perfil',
      women: 'Mulheres', men: 'Homens', other: 'Outro',
      countryPair: 'Par de países', visitorViews: 'Visualizações de Visitantes', artistCount: 'Artistas',
      collaborations: 'Colaborações', genderDomain: 'Género e Domínio',
      visitors: 'Visitantes', postsActivity: 'Publicações e Atividade',
      local: 'Local', intraAfrican: 'Intra-africana',
      visitorMessages: 'Mensagens de Visitantes', mostMessaged: 'Domínio mais contactado',
      trendVsLastMonth: 'vs mês passado', topCountryPair: 'Par mais ativo',
      genderSplit: 'Distribuição por Género', typeSplit: 'Distribuição por Tipo',
      monthlyEvolution: 'Evolução Mensal', countryPairs: 'Pares de Países (Intra-africanos)',
      detailedData: 'Dados Detalhados', loading: 'A carregar...'
    },
    messages: {
      title: 'Mensagens', noConversations: 'Nenhuma conversa',
      findArtists: 'Encontrar Artistas', typeMessage: 'Escreva uma mensagem...',
      selectConversation: 'Selecione uma conversa',
      back: 'Voltar para as conversas',
      noMessages: 'Nenhuma mensagem'
    },
    settings: {
      title: 'Definições', profilePhoto: 'Foto de perfil', changePhoto: 'Alterar foto',
      updateProfile: 'Atualizar perfil', saving: 'A guardar...',
      profileUpdated: 'Perfil atualizado!', updateFailed: 'Falha na atualização',
      uploadFailed: "Falha no carregamento", photoUpdated: 'Foto de perfil atualizada!',
      invalidFileType: 'Tipo de ficheiro inválido. Use JPG, PNG, GIF ou WebP',
      fileTooLarge: 'Ficheiro demasiado grande. Máximo 5MB'
    },
    feed: {
      title: 'Feed de notícias', shareSomething: 'Partilhe algo...', post: 'Publicar',
      noPosts: 'Nenhuma publicação no momento', loadMore: 'Carregar mais',
      deletePost: 'Eliminar publicação', deleteConfirm: 'Tem a certeza de que deseja eliminar esta publicação?',
      comments: 'Comentários', addComment: 'Adicionar um comentário...', commentPlaceholder: 'Escreva um comentário...',
      community: 'Comunidade', newPost: 'Nova publicação', createPost: 'Criar publicação',
      postPublished: 'Publicação realizada!', postDeleted: 'Publicação eliminada',
      publishing: 'A publicar...', firstToShare: 'Seja o primeiro a partilhar!',
      seenItAll: 'Já viu tudo!', institutionNoInteract: 'As instituições não podem interagir',
      institutionWarning: '⚠️ Como instituição, pode consultar o feed mas não pode interagir (gostar, comentar, publicar).',
      noComments: 'Nenhum comentário', text: 'Texto', clickToAdd: 'Clique para adicionar'
    },
    visitorProfile: {
      title: 'Perfil de Visitante', visitorNotFound: 'Visitante não encontrado',
      individual: 'Particular', organization: 'Organização'
    },
    checkout: {
      title: 'Desbloquear Estatísticas', subtitle: 'Aceda a dados demográficos completos da comunidade artística africana.',
      institutionalAccess: 'Acesso Institucional', demographics: 'Dados demográficos',
      geography: 'Cobertura geográfica', activityTrends: 'Atividade e Tendências',
      demographicsDesc: 'Género, idade, país', geographyDesc: 'Por região africana',
      activityTrendsDesc: 'Posts, gostos, setores',
      accessActivated: 'Acesso ativado', mockPayment: 'Pagamento Fictício',
      redirecting: 'A redirecionar para as estatísticas...',
      mockPaymentDesc: 'Simulação de pagamento — não são necessários dados bancários',
      accessCode: 'Código de acesso', institutionalPlan: 'Plano Institucional',
      annual: 'Anual', total: 'Total (simulação)',
      benefit1: 'Estatísticas detalhadas por género e país',
      benefit2: 'Painel analítico completo',
      benefit3: 'Código de acesso único e seguro',
      benefit4: 'Acesso ilimitado aos dados',
      simulatePayment: 'Simular pagamento e Aceder',
      noRealTransaction: '🔒 Apenas simulação — sem transação real',
      paymentAccepted: 'Pagamento aceite! Acesso concedido.',
      paymentError: 'Erro de pagamento', loginRequired: 'Início de sessão necessário',
      signInInstitution: 'Inicie sessão com uma conta de instituição.',
      institutionsOnly: 'Apenas para instituições', accessReserved: 'Este acesso é reservado a contas do tipo Instituição.',
      viewPublicStats: 'Ver estatísticas públicas', processing: 'A processar...'
    },
    common: {
      search: 'Pesquisar', filter: 'Filtrar', all: 'Tudo', save: 'Guardar',
      cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
      loading: 'A carregar...', noResults: 'Nenhum resultado encontrado',
      viewProfile: 'Ver Perfil',
      explore: 'Explorar', discover: 'Descobrir', back: 'Voltar',
      send: 'Enviar', welcome: 'Bem-vindo', success: 'Sucesso', error: 'Erro',
      isFrench: false, langCode: 'pt',
      collaboration: 'colaboração', collaborations: 'colaborações',
      noCollaborations: 'Nenhuma colaboração'
    },
    discover: {
      searchPlaceholder: 'Pesquisar por nome...',
      resultsCount: 'Descubra {total} artistas de toda a África'
    }
}, 

es: {
    nav: {
      home: 'Inicio', discover: 'Descubrir', feed: 'Feed', projects: 'Proyectos',
      messages: 'Mensajes', dashboard: 'Panel de control', statistics: 'Estadísticas',
      signIn: 'Iniciar sesión', getStarted: 'Empezar', logout: 'Cerrar sesión',
      institutionAccess: 'Acceso Institucional',
      visitorBadge: 'Visitante',
      languages: 'Idiomas'
    },
    home: {
      tagline: 'Ecosistema Artístico Africano',
      title1: 'Conectar.', title2: 'Crear.', title3: 'Colaborar.',
      subtitle: "La primera plataforma dedicada a artistas africanos. Presente sus obras, encuentre colaboradores y únase a una comunidad creativa vibrante en todo el continente.",
      exploreArtists: 'Explorar Artistas', joinCommunity: 'Unirse a la Comunidad',
      featuredArtists: 'Artistas Destacados', viewAll: 'Ver Todo',
      stats: { artists: 'Artistas', countries: 'Países', sectors: 'Sectores Artísticos', projects: 'Colaboraciones' },
      features: {
        portfolio: { title: 'Portafolio Digital', desc: 'Presente sus trabajos con documentos, imágenes y videos' },
        network: { title: 'Red Panafricana', desc: "Conéctese con artistas de toda África" },
        collaborate: { title: 'Colaborar', desc: 'Encuentre socios para sus proyectos artísticos' }
      },
      joinCTA: "Únase a la comunidad\nartística africana"
    },
    auth: {
      login: 'Iniciar sesión', register: 'Crear una cuenta', email: 'Correo electrónico',
      password: 'Contraseña', firstName: 'Nombre', lastName: 'Apellido',
      country: 'País', subregion: 'Subregión', gender: 'Género',
      sector: 'Sector Artístico', domain: 'Dominio/Especialidad',
      yearStarted: 'Año de inicio', bio: 'Biografía',
      additionalInfo: 'Información adicional', website: 'Sitio web',
      alreadyAccount: '¿Ya tiene una cuenta?', noAccount: "¿No tiene una cuenta?",
      createOne: 'Crear una cuenta', signInHere: 'Inicie sesión aquí',
      selectCountry: 'Seleccione su país', selectSector: 'Seleccione su sector',
      selectDomain: 'Seleccione su dominio', selectGender: 'Seleccione el género',
      visitorType: 'Tipo de cuenta', individual: 'Particular', organisation: 'Organización',
      organisationName: "Nombre de la organización",
      visitorInfo: "Como visitante puede explorar los perfiles y portafolios de los artistas. No puede acceder al Feed, publicar contenido o enviar mensajes.",
      welcomeBack: 'Bienvenido de nuevo', signInTo: 'Inicie sesión en Art Connect Africa',
      signingIn: 'Iniciando sesión...', demoAccounts: 'Cuentas de demostración:',
      chooseAccountType: 'Elija su tipo de cuenta', joinACA: 'Únase a Art Connect Africa',
      artist: 'Artista', institution: 'Institución', visitor: 'Visitante',
      portfolioNetwork: 'Portafolio y Red', statsAccess: 'Acceso a estadísticas',
      exploreDiscover: 'Explorar y Descubrir',
      organizationName: "Nombre de la organización", contactFirstName: 'Nombre del contacto',
      contactLastName: 'Apellido del contacto', missionDescription: "Misión / Descripción de la organización",
      statsAccessTitle: '📊 Acceso a estadísticas',
      statsAccessInfo: "Después del registro, deberá realizar un pago ficticio para obtener su código de acceso y consultar estadísticas detalladas.",
      creating: 'Creando...', createInstitution: 'Crear cuenta de Institución',
      bioPlaceholder: 'Cuéntenos sobre usted y su arte...',
      additionalInfoPlaceholder: 'Exposiciones, premios, colaboraciones notables...',
      orgNamePlaceholder: 'Ej: Ministerio de Cultura de Senegal',
      missionPlaceholder: "Describa la misión de su organización...",
      emailPlaceholder: 'contacto@organizacion.org'
    },
    profile: {
      portfolio: 'Portafolio', about: 'Acerca de', contact: 'Contacto',
      sendMessage: 'Enviar un Mensaje', editProfile: 'Editar Perfil',
      uploadDocument: 'Subir un Documento', uploadImage: 'Subir una Imagen',
      addVideo: 'Añadir Enlace de Video', documents: 'Documentos', images: 'Imágenes',
      videos: 'Videos', memberSince: 'Miembro desde', yearsExperience: "años de experiencia",
      collaborationsCount: 'colaboración(es)', noCollaborations: 'Sin colaboraciones',
      visitorBadge: 'VISITANTE', backToDiscover: 'Volver',
      messageSent: '¡Mensaje enviado!', messageFailed: "Error al enviar",
      writeMessage: 'Escriba su mensaje...', send: 'Enviar', cancel: 'Cancelar',
      yrs: 'años', view: 'vista', views: 'vistas', emptyPortfolio: 'No hay elementos en el portafolio'
    },
    dashboard: {
      welcome: 'Bienvenido', conversations: 'Conversaciones', recentMessages: 'Mensajes recientes',
      new: 'nuevo', findArtists: 'Buscar Artistas', add: 'Añadir', title: 'Título',
      description: 'Descripción', upload: 'Subir', chooseFile: 'Elegir archivo',
      noImages: 'Sin imágenes', noDocuments: 'Sin documentos', noVideos: 'Sin videos',
      fileUploaded: '¡Archivo subido!', videoAdded: '¡Video añadido!', deleted: '¡Eliminado!',
      addVideo: 'Añadir video', image: 'Imagen', document: 'Documento', video: 'Video'
    },
    projects: {
      title: 'Proyectos de Colaboración', createProject: 'Crear un Proyecto',
      lookingFor: 'Buscando', apply: 'Postular', applications: 'postulaciones',
      openProjects: 'Proyectos Abiertos', myProjects: 'Mis Proyectos',
      upcoming: 'Próximos', ongoing: 'En curso', past: 'Pasados',
      typeLocal: 'Local', typeIntra: 'Intra-Africano',
      startDate: 'Fecha de inicio', endDate: 'Fecha de fin (Opcional / Continuo)',
      noProjects: 'No hay proyectos por el momento', noUpcoming: 'No hay proyectos próximos',
      noOngoing: 'No hay proyectos en curso', noPast: 'No hay proyectos pasados',
      projectCreated: '¡Proyecto creado!', fillRequiredFields: 'Por favor complete los campos obligatorios',
      applicationSent: '¡Postulación enviada!', starts: 'Inicia', ends: 'Finaliza',
      findCollaborators: 'Encuentre colaboradores para sus proyectos artísticos',
      type: 'Tipo de colaboración', location: 'Ubicación', projectTitle: 'Título del proyecto',
      createProjectBtn: 'Crear proyecto', sendApplication: 'Enviar mi postulación'
    },
    statistics: {
      title: 'Estadísticas y Análisis', overview: "Resumen",
      byGender: 'Por Género', byCountry: 'Por País', byRegion: 'Por Región',
      bySector: 'Por Sector', requestAccess: 'Solicitar Acceso Institucional',
      totalArtists: 'Total de Artistas', detailedStats: 'Estadísticas Detalladas',
      projectCollaborations: 'Colaboraciones',
      statsByType: 'Por Tipo', statsByStatus: 'Por Estado',
      statsTimeline: 'Historial', statsTopCountries: 'Países Principales',
      interCountryGender: 'Colaboraciones entre países por género',
      genderByDomain: 'Artistas por Género y Dominio',
      visitorInterest: 'Interés de Visitantes por Perfil',
      women: 'Mujeres', men: 'Hombres', other: 'Otro',
      countryPair: 'Par de países', visitorViews: 'Vistas de Visitantes', artistCount: 'Artistas',
      collaborations: 'Colaboraciones', genderDomain: 'Género y Dominio',
      visitors: 'Visitantes', postsActivity: 'Publicaciones y Actividad',
      local: 'Local', intraAfrican: 'Intra-Africana',
      visitorMessages: 'Mensajes de Visitantes', mostMessaged: 'Dominio más contactado',
      trendVsLastMonth: 'vs mes anterior', topCountryPair: 'Par más activo',
      genderSplit: 'Distribución por Género', typeSplit: 'Distribución por Tipo',
      monthlyEvolution: 'Evolución Mensual', countryPairs: 'Pares de Países (Intra-Africanos)',
      detailedData: 'Datos Detallados', loading: 'Cargando...'
    },
    messages: {
      title: 'Mensajes', noConversations: 'No hay conversaciones',
      findArtists: 'Buscar Artistas', typeMessage: 'Escriba un mensaje...',
      selectConversation: 'Seleccione una conversación',
      back: 'Volver a las conversaciones',
      noMessages: 'No hay mensajes'
    },
    settings: {
      title: 'Ajustes', profilePhoto: 'Foto de perfil', changePhoto: 'Cambiar foto',
      updateProfile: 'Actualizar perfil', saving: 'Guardando...',
      profileUpdated: '¡Perfil actualizado!', updateFailed: 'Error al actualizar',
      uploadFailed: "Error al subir", photoUpdated: '¡Foto de perfil actualizada!',
      invalidFileType: 'Tipo de archivo inválido. Use JPG, PNG, GIF o WebP',
      fileTooLarge: 'Archivo demasiado grande. Máximo 5MB'
    },
    feed: {
      title: 'Feed de noticias', shareSomething: 'Comparta algo...', post: 'Publicar',
      noPosts: 'No hay publicaciones por el momento', loadMore: 'Cargar más',
      deletePost: 'Eliminar publicación', deleteConfirm: '¿Está seguro de que desea eliminar esta publicación?',
      comments: 'Comentarios', addComment: 'Añadir un comentario...', commentPlaceholder: 'Escriba un comentario...',
      community: 'Comunidad', newPost: 'Nueva publicación', createPost: 'Crear publicación',
      postPublished: '¡Publicación enviada!', postDeleted: 'Publicación eliminada',
      publishing: 'Publicando...', firstToShare: '¡Sea el primero en compartir!',
      seenItAll: '¡Ya lo ha visto todo!', institutionNoInteract: 'Las instituciones no pueden interactuar',
      institutionWarning: '⚠️ Como institución, puede consultar el feed pero no interactuar (dar like, comentar, publicar).',
      noComments: 'Sin comentarios', text: 'Texto', clickToAdd: 'Haga clic para añadir'
    },
    visitorProfile: {
      title: 'Perfil de Visitante', visitorNotFound: 'Visitante no encontrado',
      individual: 'Particular', organization: 'Organización'
    },
    checkout: {
      title: 'Desbloquear Estadísticas', subtitle: 'Acceda a datos demográficos completos de la comunidad artística africana.',
      institutionalAccess: 'Acceso Institucional', demographics: 'Datos demográficos',
      geography: 'Cobertura geográfica', activityTrends: 'Actividad y Tendencias',
      demographicsDesc: 'Género, edad, país', geographyDesc: 'Por región africana',
      activityTrendsDesc: 'Posts, likes, sectores',
      accessActivated: 'Acceso activado', mockPayment: 'Pago Ficticio',
      redirecting: 'Redirigiendo a las estadísticas...',
      mockPaymentDesc: 'Simulación de pago — no se requieren datos bancarios',
      accessCode: 'Código de acceso', institutionalPlan: 'Plan Institucional',
      annual: 'Anual', total: 'Total (simulación)',
      benefit1: 'Estadísticas detalladas por género y país',
      benefit2: 'Panel analítico completo',
      benefit3: 'Código de acceso único y seguro',
      benefit4: 'Acceso ilimitado a los datos',
      simulatePayment: 'Simular pago y Acceder',
      noRealTransaction: '🔒 Solo simulación — sin transacción real',
      paymentAccepted: '¡Pago aceptado! Acceso concedido.',
      paymentError: 'Error de pago', loginRequired: 'Inicio de sesión requerido',
      signInInstitution: 'Inicie sesión con una cuenta institucional.',
      institutionsOnly: 'Solo instituciones', accessReserved: 'Este acceso está reservado para cuentas de tipo Institución.',
      viewPublicStats: 'Ver estadísticas públicas', processing: 'Procesando...'
    },
    common: {
      search: 'Buscar', filter: 'Filtrar', all: 'Todo', save: 'Guardar',
      cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar',
      loading: 'Cargando...', noResults: 'No se encontraron resultados',
      viewProfile: 'Ver Perfil',
      explore: 'Explorar', discover: 'Descubrir', back: 'Volver',
      send: 'Enviar', welcome: 'Bienvenido', success: 'Éxito', error: 'Error',
      isFrench: false, langCode: 'es',
      collaboration: 'colaboración', collaborations: 'colaboraciones',
      noCollaborations: 'Sin colaboraciones'
    },
    discover: {
      searchPlaceholder: 'Buscar por nombre...',
      resultsCount: 'Descubra a {total} artistas de toda África'
    }
}, 
   
ar: {
    nav: {
      home: 'الرئيسية',
      discover: 'اكتشف',
      feed: 'الأخبار',
      projects: 'المشاريع',
      messages: 'الرسائل',
      dashboard: 'لوحة التحكم',
      statistics: 'الإحصائيات',
      signIn: 'تسجيل الدخول',
      getStarted: 'ابدأ الآن',
      logout: 'تسجيل الخروج',
      institutionAccess: 'وصول المؤسسات',
      visitorBadge: 'زائر',
      languages: 'اللغات'
    },
    home: {
      tagline: 'النظام البيئي الفني الأفريقي',
      title1: 'تواصل.',
      title2: 'أبدع.',
      title3: 'تعاون.',
      subtitle: "أول منصة مخصصة للفنانين الأفارقة. اعرض أعمالك، وابحث عن متعاونين، وانضم إلى مجتمع إبداعي حيوي عبر القارة.",
      exploreArtists: 'استكشف الفنانين',
      joinCommunity: 'انضم إلى المجتمع',
      featuredArtists: 'فنانون مميزون',
      viewAll: 'عرض الكل',
      stats: {
        artists: 'فنانون',
        countries: 'دول',
        sectors: 'قطاعات فنية',
        projects: 'تعاونات'
      },
      features: {
        portfolio: {
          title: 'ملف أعمال رقمي',
          desc: 'اعرض أعمالك من خلال المستندات والصور والفيديوهات'
        },
        network: {
          title: 'شبكة عموم أفريقيا',
          desc: "تواصل مع فنانين من جميع أنحاء أفريقيا"
        },
        collaborate: {
          title: 'تعاون',
          desc: 'ابحث عن شركاء لمشاريعك الفنية'
        }
      },
      joinCTA: "انضم إلى المجتمع\nالفني الأفريقي"
    },
    auth: {
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      country: 'الدولة',
      subregion: 'المنطقة الفرعية',
      gender: 'الجنس',
      sector: 'القطاع الفني',
      domain: 'المجال/التخصص',
      yearStarted: 'سنة البدء',
      bio: 'السيرة الذاتية',
      additionalInfo: 'معلومات إضافية',
      website: 'الموقع الإلكتروني',
      alreadyAccount: 'لديك حساب بالفعل؟',
      noAccount: "ليس لديك حساب؟",
      createOne: 'أنشئ حساباً',
      signInHere: 'سجل دخولك هنا',
      selectCountry: 'اختر دولتك',
      selectSector: 'اختر قطاعك',
      selectDomain: 'اختر مجالك',
      selectGender: 'اختر الجنس',
      visitorType: 'نوع الحساب',
      individual: 'فردي',
      organisation: 'مؤسسة',
      organisationName: "اسم المؤسسة",
      visitorInfo: "بصفتك زائراً، يمكنك استكشاف الملفات الشخصية والأعمال. لا يمكنك الوصول إلى الأخبار أو النشر أو المراسلة.",
      welcomeBack: 'مرحباً بعودتك',
      signInTo: 'سجل دخولك إلى Art Connect Africa',
      signingIn: 'جاري تسجيل الدخول...',
      demoAccounts: 'حسابات تجريبية:',
      chooseAccountType: 'اختر نوع الحساب',
      joinACA: 'انضم إلى Art Connect Africa',
      artist: 'فنان',
      institution: 'مؤسسة',
      visitor: 'زائر',
      portfolioNetwork: 'ملف الأعمال والشبكة',
      statsAccess: 'الوصول للإحصائيات',
      exploreDiscover: 'استكشف واكتشف',
      organizationName: "اسم المؤسسة",
      contactFirstName: 'الاسم الأول لجهة الاتصال',
      contactLastName: 'اسم عائلة جهة الاتصال',
      missionDescription: "مهمة / وصف المؤسسة",
      statsAccessTitle: '📊 الوصول إلى الإحصائيات',
      statsAccessInfo: "بعد التسجيل، ستحتاج إلى إجراء عملية دفع تجريبية للحصول على رمز الوصول والاطلاع على الإحصائيات.",
      creating: 'جاري الإنشاء...',
      createInstitution: 'إنشاء حساب مؤسسة',
      bioPlaceholder: 'أخبرنا عن نفسك وفنك...',
      additionalInfoPlaceholder: 'معارض، جوائز، تعاونات بارزة...',
      orgNamePlaceholder: 'مثال: وزارة الثقافة السنغالية',
      missionPlaceholder: "صف مهمة مؤسستك...",
      emailPlaceholder: 'contact@organisation.org'
    },
    profile: {
      portfolio: 'ملف الأعمال',
      about: 'عن الفنان',
      contact: 'اتصال',
      sendMessage: 'إرسال رسالة',
      editProfile: 'تعديل الملف الشخصي',
      uploadDocument: 'رفع مستند',
      uploadImage: 'رفع صورة',
      addVideo: 'إضافة رابط فيديو',
      documents: 'مستندات',
      images: 'صور',
      videos: 'فيديوهات',
      memberSince: 'عضو منذ',
      yearsExperience: "سنوات خبرة",
      collaborationsCount: 'تعاون(ات)',
      noCollaborations: 'لا توجد تعاونات',
      visitorBadge: 'زائر',
      backToDiscover: 'رجوع',
      messageSent: 'تم إرسال الرسالة!',
      messageFailed: "فشل الإرسال",
      writeMessage: 'اكتب رسالتك...',
      send: 'إرسال',
      cancel: 'إلغاء',
      yrs: 'سنوات',
      view: 'مشاهدة',
      views: 'مشاهدات',
      emptyPortfolio: 'ملف الأعمال فارغ'
    },
    dashboard: {
      welcome: 'مرحباً',
      conversations: 'المحادثات',
      recentMessages: 'الرسائل الأخيرة',
      new: 'جديد',
      findArtists: 'البحث عن فنانين',
      add: 'إضافة',
      title: 'العنوان',
      description: 'الوصف',
      upload: 'رفع',
      chooseFile: 'اختر ملفاً',
      noImages: 'لا توجد صور',
      noDocuments: 'لا توجد مستندات',
      noVideos: 'لا توجد فيديوهات',
      fileUploaded: 'تم رفع الملف!',
      videoAdded: 'تمت إضافة الفيديو!',
      deleted: 'تم الحذف!',
      addVideo: 'إضافة فيديو',
      image: 'صورة',
      document: 'مستند',
      video: 'فيديو'
    },
    projects: {
      title: 'مشاريع تعاونية',
      createProject: 'إنشاء مشروع',
      lookingFor: 'أبحث عن',
      apply: 'تقديم الطلب',
      applications: 'طلبات',
      openProjects: 'مشاريع مفتوحة',
      myProjects: 'مشاريعي',
      upcoming: 'قادم',
      ongoing: 'مستمر',
      past: 'سابق',
      typeLocal: 'محلي',
      typeIntra: 'داخل أفريقيا',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء (اختياري)',
      noProjects: 'لا توجد مشاريع حالياً',
      noUpcoming: 'لا توجد مشاريع قادمة',
      noOngoing: 'لا توجد مشاريع مستمرة',
      noPast: 'لا توجد مشاريع سابقة',
      projectCreated: 'تم إنشاء المشروع!',
      fillRequiredFields: 'يرجى ملء الحقول المطلوبة',
      applicationSent: 'تم إرسال الطلب!',
      starts: 'يبدأ',
      ends: 'ينتهي',
      findCollaborators: 'ابحث عن متعاونين لمشاريعك الفنية',
      type: 'نوع التعاون',
      location: 'الموقع',
      projectTitle: 'عنوان المشروع',
      createProjectBtn: 'إنشاء مشروع',
      sendApplication: 'إرسال طلبي'
    },
    statistics: {
      title: 'الإحصائيات والتحليل',
      overview: "نظرة عامة",
      byGender: 'حسب الجنس',
      byCountry: 'حسب الدولة',
      byRegion: 'حسب المنطقة',
      bySector: 'حسب القطاع',
      requestAccess: 'طلب وصول المؤسسات',
      totalArtists: 'إجمالي الفنانين',
      detailedStats: 'إحصائيات مفصلة',
      projectCollaborations: 'التعاون في المشاريع',
      statsByType: 'حسب النوع',
      statsByStatus: 'حسب الحالة',
      statsTimeline: 'الخط الزمني',
      statsTopCountries: 'أبرز الدول',
      interCountryGender: 'التعاون الدولي حسب الجنس',
      genderByDomain: 'الفنانين حسب الجنس والمجال',
      visitorInterest: 'اهتمام الزوار بالملفات الشخصية',
      women: 'نساء',
      men: 'رجال',
      other: 'آخر',
      countryPair: 'ثنائي الدول',
      visitorViews: 'مشاهدات الزوار',
      artistCount: 'عدد الفنانين',
      collaborations: 'التعاونات',
      genderDomain: 'الجنس والمجال',
      visitors: 'الزوار',
      postsActivity: 'المنشورات والنشاط',
      local: 'محلي',
      intraAfrican: 'داخل أفريقيا',
      visitorMessages: 'رسائل الزوار',
      mostMessaged: 'المجال الأكثر مراسلة',
      trendVsLastMonth: 'مقارنة بالشهر الماضي',
      topCountryPair: 'ثنائي الدول الأكثر نشاطاً',
      genderSplit: 'توزيع الجنس',
      typeSplit: 'توزيع النوع',
      monthlyEvolution: 'التطور الشهري',
      countryPairs: 'ثنائيات الدول (أفريقيا)',
      detailedData: 'بيانات مفصلة',
      loading: 'جاري تحميل الإحصائيات...'
    },
    messages: {
      title: 'الرسائل',
      noConversations: 'لا توجد محادثات',
      findArtists: 'البحث عن فنانين',
      typeMessage: 'اكتب رسالة...',
      selectConversation: 'اختر محادثة',
      back: 'الرجوع للمحادثات',
      noMessages: 'لا توجد رسائل'
    },
    settings: {
      title: 'الإعدادات',
      profilePhoto: 'صورة الملف الشخصي',
      changePhoto: 'تغيير الصورة',
      updateProfile: 'تحديث الملف الشخصي',
      saving: 'جاري الحفظ...',
      profileUpdated: 'تم تحديث الملف الشخصي بنجاح!',
      updateFailed: 'فشل التحديث',
      uploadFailed: 'فشل الرفع',
      photoUpdated: 'تم تحديث صورة الملف الشخصي!',
      invalidFileType: 'نوع ملف غير صالح. استخدم JPG أو PNG أو WebP',
      fileTooLarge: 'الملف كبير جداً. الحد الأقصى 5 ميجابايت'
    },
    feed: {
      title: 'الأخبار',
      shareSomething: 'شارك شيئاً...',
      post: 'نشر',
      noPosts: 'لا توجد منشورات حالياً',
      loadMore: 'تحميل المزيد',
      deletePost: 'حذف المنشور',
      deleteConfirm: 'هل أنت متأكد من حذف هذا المنشور؟',
      comments: 'التعليقات',
      addComment: 'إضافة تعليق...',
      commentPlaceholder: 'اكتب تعليقاً...',
      community: 'المجتمع',
      newPost: 'منشور جديد',
      createPost: 'إنشاء منشور',
      postPublished: 'تم نشر المنشور!',
      postDeleted: 'تم حذف المنشور',
      publishing: 'جاري النشر...',
      firstToShare: 'كن أول من يشارك شيئاً!',
      seenItAll: 'لقد شاهدت كل شيء!',
      institutionNoInteract: 'لا يمكن للمؤسسات التفاعل',
      institutionWarning: '⚠️ بصفتك مؤسسة، يمكنك عرض الأخبار ولكن لا يمكنك الإعجاب أو التعليق أو النشر.',
      noComments: 'لا توجد تعليقات بعد',
      text: 'نص',
      clickToAdd: 'اضغط للإضافة'
    },
    visitorProfile: {
      title: 'ملف الزائر',
      visitorNotFound: 'الزائر غير موجود',
      individual: 'فرد',
      organization: 'مؤسسة'
    },
    checkout: {
      title: 'فتح الإحصائيات',
      subtitle: 'احصل على وصول كامل للبيانات الديموغرافية لمجتمع الفن الأفريقي.',
      institutionalAccess: 'وصول المؤسسات',
      demographics: 'الديموغرافيا',
      geography: 'النطاق الجغرافي',
      activityTrends: 'النشاط والتوجهات',
      demographicsDesc: 'الجنس، العمر، الدولة',
      geographyDesc: 'حسب المناطق الأفريقية',
      activityTrendsDesc: 'المنشورات، الإعجابات، القطاعات',
      accessActivated: 'تم تفعيل الوصول',
      mockPayment: 'دفع تجريبي',
      redirecting: 'جاري التوجيه إلى الإحصائيات...',
      mockPaymentDesc: 'محاكاة الدفع - لا يتطلب بيانات بنكية حقيقية',
      accessCode: 'رمز الوصول',
      institutionalPlan: 'خطة المؤسسات',
      annual: 'سنوي',
      total: 'الإجمالي (تجريبي)',
      benefit1: 'إحصائيات مفصلة حسب الجنس والدولة',
      benefit2: 'لوحة تحكم كاملة للتحليل',
      benefit3: 'رمز وصول فريد وآمن',
      benefit4: 'وصول غير محدود لجميع البيانات',
      simulatePayment: 'محاكاة الدفع والدخول',
      noRealTransaction: '🔒 محاكاة فقط - لن يتم خصم أموال حقيقية',
      paymentAccepted: 'تم قبول الدفع! تم منح الوصول.',
      paymentError: 'حدث خطأ في عملية الدفع',
      loginRequired: 'يجب تسجيل الدخول',
      signInInstitution: 'يرجى تسجيل الدخول بحساب مؤسسة.',
      institutionsOnly: 'للمؤسسات فقط',
      accessReserved: 'هذا الوصول مخصص لحسابات المؤسسات فقط.',
      viewPublicStats: 'عرض الإحصائيات العامة',
      processing: 'جاري المعالجة...'
    },
    common: {
      search: 'بحث',
      filter: 'تصفية',
      all: 'الكل',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      loading: 'جاري التحميل...',
      noResults: 'لا توجد نتائج',
      viewProfile: 'عرض الملف الشخصي',
      explore: 'استكشاف',
      discover: 'اكتشاف',
      back: 'رجوع',
      send: 'إرسال',
      welcome: 'مرحباً',
      success: 'نجاح',
      error: 'خطأ',
      isFrench: false,
      langCode: 'ar',
      collaboration: 'تعاون',
      collaborations: 'تعاونات',
      noCollaborations: 'لا توجد تعاونات'
    },
    discover: {
      searchPlaceholder: 'بحث بالاسم...',
      resultsCount: 'اكتشف {total} فنان من جميع أنحاء أفريقيا'
    }
},

   
sw: {
    nav: {
      home: 'Nyumbani',
      discover: 'Gundua',
      feed: 'Mlisho',
      projects: 'Miradi',
      messages: 'Ujumbe',
      dashboard: 'Dashibodi',
      statistics: 'Takwimu',
      signIn: 'Ingia',
      getStarted: 'Anza Sasa',
      logout: 'Ondoka',
      institutionAccess: 'Ufikiaji wa Taasisi',
      visitorBadge: 'Mgeni',
      languages: 'Lugha'
    },
    home: {
      tagline: 'Mfumo wa Sanaa wa Afrika',
      title1: 'Unganisha.',
      title2: 'Unda.',
      title3: 'Shirikiana.',
      subtitle: "Jukwaa la kwanza lililotengwa kwa wasanii wa Kiafrika. Onyesha kazi zako, tafuta washirika na ujiunge na jumuiya ya wabunifu inayochangamka kote barani.",
      exploreArtists: 'Gundua Wasanii',
      joinCommunity: 'Jiunge na Jumuiya',
      featuredArtists: 'Wasanii Walioangaziwa',
      viewAll: 'Tazama Zote',
      stats: {
        artists: 'Wasanii',
        countries: 'Nchi',
        sectors: 'Sekta za Sanaa',
        projects: 'Ushirikiano'
      },
      features: {
        portfolio: {
          title: 'Kwingineko ya Kidijitali',
          desc: 'Onyesha kazi zako kupitia nyaraka, picha na video'
        },
        network: {
          title: 'Mtandao wa Pan-Afrika',
          desc: "Wasiliana na wasanii kutoka kote Afrika"
        },
        collaborate: {
          title: 'Shirikiana',
          desc: 'Pata washirika kwa ajili ya miradi yako ya sanaa'
        }
      },
      joinCTA: "Jiunge na jumuiya ya\nsanaa ya Kiafrika"
    },
    auth: {
      login: 'Ingia',
      register: 'Fungua akaunti',
      email: 'Barua pepe',
      password: 'Nywila',
      firstName: 'Jina la kwanza',
      lastName: 'Jina la ukoo',
      country: 'Nchi',
      subregion: 'Kanda',
      gender: 'Jinsia',
      sector: 'Sekta ya Sanaa',
      domain: 'Utaalamu/Nyanja',
      yearStarted: 'Mwaka wa kuanza',
      bio: 'Wasifu',
      additionalInfo: 'Maelezo ya ziada',
      website: 'Tovuti',
      alreadyAccount: 'Tayari una akaunti?',
      noAccount: "Je, huna akaunti?",
      createOne: 'Fungua akaunti',
      signInHere: 'Ingia hapa',
      selectCountry: 'Chagua nchi yako',
      selectSector: 'Chagua sekta yako',
      selectDomain: 'Chagua nyanja yako',
      selectGender: 'Chagua jinsia',
      visitorType: 'Aina ya akaunti',
      individual: 'Binafsi',
      organisation: 'Shirika',
      organisationName: "Jina la shirika",
      visitorInfo: "Kama mgeni, unaweza kuchunguza wasifu na kwingineko za wasanii. Huwezi kufikia Mlisho (Feed), kuchapisha maudhui au kutuma ujumbe.",
      welcomeBack: 'Karibu tena',
      signInTo: 'Ingia kwenye Art Connect Africa',
      signingIn: 'Inaingia...',
      demoAccounts: 'Akaunti za majaribio:',
      chooseAccountType: 'Chagua aina ya akaunti yako',
      joinACA: 'Jiunge na Art Connect Africa',
      artist: 'Msanii',
      institution: 'Taasisi',
      visitor: 'Mgeni',
      portfolioNetwork: 'Kwingineko na Mtandao',
      statsAccess: 'Ufikiaji wa takwimu',
      exploreDiscover: 'Chunguza na Gundua',
      organizationName: "Jina la shirika",
      contactFirstName: 'Jina la kwanza la mwasiliani',
      contactLastName: 'Jina la ukoo la mwasiliani',
      missionDescription: "Lengo / Maelezo ya shirika",
      statsAccessTitle: '📊 Ufikiaji wa Takwimu',
      statsAccessInfo: "Baada ya usajili, utahitaji kufanya malipo ya dhihaka ili kupata msimbo wako wa ufikiaji na kutazama takwimu za kina.",
      creating: 'Inatengeneza...',
      createInstitution: 'Tengeneza akaunti ya Taasisi',
      bioPlaceholder: 'Tuambie kukuhusu na sanaa yako...',
      additionalInfoPlaceholder: 'Maonyesho, tuzo, ushirikiano muhimu...',
      orgNamePlaceholder: 'Mfano: Wizara ya Utamaduni ya Tanzania',
      missionPlaceholder: "Eleza malengo ya shirika lako...",
      emailPlaceholder: 'mawasiliano@shirika.org'
    },
    profile: {
      portfolio: 'Kwingineko',
      about: 'Kuhusu',
      contact: 'Mawasiliano',
      sendMessage: 'Tuma Ujumbe',
      editProfile: 'Hariri Wasifu',
      uploadDocument: 'Pakia Nyaraka',
      uploadImage: 'Pakia Picha',
      addVideo: 'Ongeza Kiungo cha Video',
      documents: 'Nyaraka',
      images: 'Picha',
      videos: 'Video',
      memberSince: 'Mwanachama tangu',
      yearsExperience: "miaka ya uzoefu",
      collaborationsCount: 'ushirikiano',
      noCollaborations: 'Hakuna ushirikiano',
      visitorBadge: 'MGENI',
      backToDiscover: 'Rudi',
      messageSent: 'Ujumbe umetumwa!',
      messageFailed: "Imeshindwa kutuma",
      writeMessage: 'Andika ujumbe wako...',
      send: 'Tuma',
      cancel: 'Ghairi',
      yrs: 'miaka',
      view: 'mtazamo',
      views: 'mitazamo',
      emptyPortfolio: 'Hakuna kitu kwenye kwingineko bado'
    },
    dashboard: {
      welcome: 'Karibu',
      conversations: 'Mazungumzo',
      recentMessages: 'Ujumbe wa hivi karibuni',
      new: 'mpya',
      findArtists: 'Tafuta Wasanii',
      add: 'Ongeza',
      title: 'Kichwa',
      description: 'Maelezo',
      upload: 'Pakia',
      chooseFile: 'Chagua faili',
      noImages: 'Hakuna picha',
      noDocuments: 'Hakuna nyaraka',
      noVideos: 'Hakuna video',
      fileUploaded: 'Faili imepakiwa kikamilifu!',
      videoAdded: 'Video imeongezwa!',
      deleted: 'Imefutwa!',
      addVideo: 'Ongeza video',
      image: 'Picha',
      document: 'Nyaraka',
      video: 'Video'
    },
    projects: {
      title: 'Miradi ya Ushirikiano',
      createProject: 'Tengeneza Mradi',
      lookingFor: 'Inatafuta',
      apply: 'Omba Nafasi',
      applications: 'maombi',
      openProjects: 'Miradi ya Wazi',
      myProjects: 'Miradi Yangu',
      upcoming: 'Inayokuja',
      ongoing: 'Inayoendelea',
      past: 'Iliyopita',
      typeLocal: 'Ndani ya Nchi',
      typeIntra: 'Ndani ya Afrika',
      startDate: 'Tarehe ya kuanza',
      endDate: 'Tarehe ya mwisho (Hiari / Inayoendelea)',
      noProjects: 'Hakuna miradi kwa sasa',
      noUpcoming: 'Hakuna miradi inayokuja',
      noOngoing: 'Hakuna miradi inayoendelea',
      noPast: 'Hakuna miradi iliyopita',
      projectCreated: 'Mradi umetengenezwa kikamilifu!',
      fillRequiredFields: 'Tafadhali jaza sehemu zinazohitajika',
      applicationSent: 'Ombi lako limetumwa!',
      starts: 'Inaanza',
      ends: 'Inaisha',
      findCollaborators: 'Tafuta washirika kwa ajili ya miradi yako ya sanaa',
      type: 'Aina ya ushirikiano',
      location: 'Mahali',
      projectTitle: 'Kichwa cha mradi',
      createProjectBtn: 'Tengeneza mradi',
      sendApplication: 'Tuma ombi langu'
    },
    statistics: {
      title: 'Takwimu na Uchambuzi',
      overview: "Muhtasari",
      byGender: 'Kwa Jinsia',
      byCountry: 'Kwa Nchi',
      byRegion: 'Kwa Kanda',
      bySector: 'Kwa Sekta',
      requestAccess: 'Omba Ufikiaji wa Taasisi',
      totalArtists: 'Jumla ya Wasanii',
      detailedStats: 'Takwimu za Kina',
      projectCollaborations: 'Ushirikiano wa Miradi',
      statsByType: 'Kwa Aina',
      statsByStatus: 'Kwa Hali',
      statsTimeline: 'Mstari wa Muda',
      statsTopCountries: 'Nchi Zinazoongoza',
      interCountryGender: 'Ushirikiano wa kimataifa kwa jinsia',
      genderByDomain: 'Wasanii kwa Jinsia na Nyanja',
      visitorInterest: 'Nia ya Wageni kwa wasifu',
      women: 'Wanawake',
      men: 'Wanaume',
      other: 'Nyingine',
      countryPair: 'Nchi Pacha',
      visitorViews: 'Mitazamo ya Wageni',
      artistCount: 'Idadi ya Wasanii',
      collaborations: 'Ushirikiano',
      genderDomain: 'Jinsia na Nyanja',
      visitors: 'Wageni',
      postsActivity: 'Machapisho na Shughuli',
      local: 'Ndani',
      intraAfrican: 'Ndani ya Afrika',
      visitorMessages: 'Ujumbe wa Wageni',
      mostMessaged: 'Nyanja inayotafutwa zaidi',
      trendVsLastMonth: 'dhidi ya mwezi uliopita',
      topCountryPair: 'Nchi pacha zenye shughuli nyingi',
      genderSplit: 'Mgawanyo wa Jinsia',
      typeSplit: 'Mgawanyo wa Aina',
      monthlyEvolution: 'Mabadiliko ya Kila Mwezi',
      countryPairs: 'Nchi Pacha (Ndani ya Afrika)',
      detailedData: 'Data ya Kina',
      loading: 'Inapakia takwimu...'
    },
    messages: {
      title: 'Ujumbe',
      noConversations: 'Hakuna mazungumzo',
      findArtists: 'Tafuta Wasanii',
      typeMessage: 'Andika ujumbe...',
      selectConversation: 'Chagua mazungumzo',
      back: 'Rudi kwenye mazungumzo',
      noMessages: 'Hakuna ujumbe hapa'
    },
    settings: {
      title: 'Mipangilio',
      profilePhoto: 'Picha ya Wasifu',
      changePhoto: 'Badilisha Picha',
      updateProfile: 'Sasisha Wasifu',
      saving: 'Inahifadhi...',
      profileUpdated: 'Wasifu umesasishwa kikamilifu!',
      updateFailed: 'Imeshindwa kusasisha wasifu',
      uploadFailed: "Imeshindwa kupakia faili",
      photoUpdated: 'Picha ya wasifu imesasishwa!',
      invalidFileType: 'Aina ya faili si sahihi. Tumia JPG, PNG, GIF au WebP',
      fileTooLarge: 'Faili ni kubwa mno. Isizidi 5MB'
    },
    feed: {
      title: 'Mlisho wa Habari',
      shareSomething: 'Shiriki jambo...',
      post: 'Chapisha',
      noPosts: 'Hakuna machapisho kwa sasa',
      loadMore: 'Pakia zaidi',
      deletePost: 'Futa chapisho',
      deleteConfirm: 'Je, una uhakika unataka kufuta chapisho hili?',
      comments: 'Maoni',
      addComment: 'Weka maoni...',
      commentPlaceholder: 'Andika maoni...',
      community: 'Jumuiya',
      newPost: 'Chapisho jipya',
      createPost: 'Tengeneza chapisho',
      postPublished: 'Chapisho lako limechapishwa!',
      postDeleted: 'Chapisho limefutwa',
      publishing: 'Inachapisha...',
      firstToShare: 'Kuwa wa kwanza kushiriki jambo!',
      seenItAll: 'Umeona machapisho yote!',
      institutionNoInteract: 'Taasisi haziwezi kuingiliana',
      institutionWarning: '⚠️ Kama taasisi, unaweza kutazama mlisho lakini huwezi kupenda (like), kutoa maoni, au kuchapisha.',
      noComments: 'Hakuna maoni bado',
      text: 'Maandishi',
      clickToAdd: 'Bonyeza ili kuongeza'
    },
    visitorProfile: {
      title: 'Wasifu wa Mgeni',
      visitorNotFound: 'Mgeni hakuweza kupatikana',
      individual: 'Binafsi',
      organization: 'Shirika'
    },
    checkout: {
      title: 'Fungua Takwimu',
      subtitle: 'Fikia data kamili ya idadi ya watu ya jumuiya ya sanaa ya Kiafrika.',
      institutionalAccess: 'Ufikiaji wa Taasisi',
      demographics: 'Idadi ya Watu',
      geography: 'Ufikiaji wa Kijiografia',
      activityTrends: 'Shughuli na Mielekeo',
      demographicsDesc: 'Jinsia, umri, nchi',
      geographyDesc: 'Kwa kanda za Afrika',
      activityTrendsDesc: 'Machapisho, likes, sekta',
      accessActivated: 'Ufikiaji umewezeshwa',
      mockPayment: 'Malipo ya Dhihaka (Simulizi)',
      redirecting: 'Inakupeleka kwenye takwimu...',
      mockPaymentDesc: 'Uigaji wa malipo — hakuna maelezo ya benki yanayohitajika',
      accessCode: 'Msimbo wa ufikiaji',
      institutionalPlan: 'Mpango wa Taasisi',
      annual: 'Kila Mwaka',
      total: 'Jumla (Uigaji)',
      benefit1: 'Takwimu za kina kwa jinsia na nchi',
      benefit2: 'Dashibodi kamili ya uchambuzi',
      benefit3: 'Msimbo wa ufikiaji wa kipekee na salama',
      benefit4: 'Ufikiaji usio na kikomo wa data yote',
      simulatePayment: 'Iga malipo na upate Ufikiaji',
      noRealTransaction: '🔒 Hii ni simulizi tu — hakuna pesa halisi inayokatwa',
      paymentAccepted: 'Malipo yamekubaliwa! Ufikiaji umetolewa.',
      paymentError: 'Hitilafu ya malipo imetokea',
      loginRequired: 'Lazima uingie kwanza',
      signInInstitution: 'Tafadhali ingia kwa kutumia akaunti ya taasisi.',
      institutionsOnly: 'Ni kwa ajili ya Taasisi pekee',
      accessReserved: 'Ufikiaji huu umehifadhiwa kwa ajili ya akaunti za aina ya Taasisi pekee.',
      viewPublicStats: 'Tazama takwimu za umma',
      processing: 'Inashughulikia...'
    },
    common: {
      search: 'Tafuta',
      filter: 'Chuja',
      all: 'Zote',
      save: 'Hifadhi',
      cancel: 'Ghairi',
      delete: 'Futa',
      edit: 'Hariri',
      loading: 'Inapakia...',
      noResults: 'Hakuna matokeo yaliyopatikana',
      viewProfile: 'Tazama Wasifu',
      explore: 'Chunguza',
      discover: 'Gundua',
      back: 'Nyuma',
      send: 'Tuma',
      welcome: 'Karibu',
      success: 'Mafanikio',
      error: 'Hitilafu',
      isFrench: false,
      langCode: 'sw',
      collaboration: 'ushirikiano',
      collaborations: 'ushirikiano',
      noCollaborations: 'Hakuna ushirikiano'
    },
    discover: {
      searchPlaceholder: 'Tafuta kwa jina...',
      resultsCount: 'Gundua wasanii {total} kutoka kote Afrika'
    }
}, 

af: {
    nav: {
      home: 'Tuis',
      discover: 'Ontdek',
      feed: 'Nuusvoer',
      projects: 'Projekte',
      messages: 'Boodskappe',
      dashboard: 'Kontroleskerm',
      statistics: 'Statistiek',
      signIn: 'Meld aan',
      getStarted: 'Begin nou',
      logout: 'Meld af',
      institutionAccess: 'Instansie-toegang',
      visitorBadge: 'Besoeker',
      languages: 'Tale'
    },
    home: {
      tagline: 'Die Afrika-kuns-ekosisteem',
      title1: 'Verbind.',
      title2: 'Skep.',
      title3: 'Werk saam.',
      subtitle: "Die eerste platform toegewy aan Afrika-kunstenaars. Stal jou werk uit, vind vennote en sluit aan by 'n lewendige kreatiewe gemeenskap regoor die kontinent.",
      exploreArtists: 'Verken Kunstenaars',
      joinCommunity: 'Sluit aan by Gemeenskap',
      featuredArtists: 'Uitgesproke Kunstenaars',
      viewAll: 'Sien Alles',
      stats: {
        artists: 'Kunstenaars',
        countries: 'Lande',
        sectors: 'Kunssektore',
        projects: 'Samewerkings'
      },
      features: {
        portfolio: {
          title: 'Digitale Portefeulje',
          desc: 'Stal jou werk uit deur dokumente, beelde en video\'s'
        },
        network: {
          title: 'Pan-Afrika Netwerk',
          desc: "Maak kontak met kunstenaars van regoor Afrika"
        },
        collaborate: {
          title: 'Werk saam',
          desc: 'Vind vennote vir jou kunsprojekte'
        }
      },
      joinCTA: "Sluit aan by die\nAfrika-kunsgemeenskap"
    },
    auth: {
      login: 'Meld aan',
      register: 'Registreer',
      email: 'E-pos',
      password: 'Wagwoord',
      firstName: 'Voornaam',
      lastName: 'Van',
      country: 'Land',
      subregion: 'Substreek',
      gender: 'Geslag',
      sector: 'Kunssektor',
      domain: 'Spesialisering/Domein',
      yearStarted: 'Beginjaar',
      bio: 'Biografie',
      additionalInfo: 'Bykomende inligting',
      website: 'Webwerf',
      alreadyAccount: 'Reeds \'n rekening?',
      noAccount: "Nog nie 'n rekening nie?",
      createOne: 'Skep een',
      signInHere: 'Meld hier aan',
      selectCountry: 'Kies jou land',
      selectSector: 'Kies jou sektor',
      selectDomain: 'Kies jou domein',
      selectGender: 'Kies geslag',
      visitorType: 'Rekeningtipe',
      individual: 'Individu',
      organisation: 'Organisasie',
      organisationName: "Naam van organisasie",
      visitorInfo: "As besoeker kan jy profiele en portefeuljes verken. Jy kan nie aan die Nuusvoer deelneem, plasings maak of boodskappe stuur nie.",
      welcomeBack: 'Welkom terug',
      signInTo: 'Meld aan by Art Connect Africa',
      signingIn: 'Meld tans aan...',
      demoAccounts: 'Demo-rekeninge:',
      chooseAccountType: 'Kies jou rekeningtipe',
      joinACA: 'Sluit aan by Art Connect Africa',
      artist: 'Kunstenaar',
      institution: 'Instansie',
      visitor: 'Besoeker',
      portfolioNetwork: 'Portefeulje & Netwerk',
      statsAccess: 'Toegang tot statistiek',
      exploreDiscover: 'Verken & Ontdek',
      organizationName: "Organisasienaam",
      contactFirstName: 'Kontakpersoon Voornaam',
      contactLastName: 'Kontakpersoon Van',
      missionDescription: "Missie / Beskrywing van organisasie",
      statsAccessTitle: '📊 Toegang tot Statistiek',
      statsAccessInfo: "Na registrasie moet jy 'n toetsbetaling voltooi om jou toegangskode te verkry en gedetailleerde statistiek te sien.",
      creating: 'Skep tans...',
      createInstitution: 'Skep Instansie-rekening',
      bioPlaceholder: 'Vertel ons van jouself en jou kuns...',
      additionalInfoPlaceholder: 'Uitstallings, toekennings, noemenswaardige samewerkings...',
      orgNamePlaceholder: 'Bv: Departement van Kuns en Kultuur',
      missionPlaceholder: "Beskryf jou organisasie se missie...",
      emailPlaceholder: 'kontak@organisasie.org'
    },
    profile: {
      portfolio: 'Portefeulje',
      about: 'Oor',
      contact: 'Kontak',
      sendMessage: 'Stuur Boodskap',
      editProfile: 'Wysig Profiel',
      uploadDocument: 'Laai Dokument op',
      uploadImage: 'Laai Beeld op',
      addVideo: 'Voeg Videoskakel by',
      documents: 'Dokumente',
      images: 'Beelde',
      videos: 'Video\'s',
      memberSince: 'Lid sedert',
      yearsExperience: "jaar ondervinding",
      collaborationsCount: 'samewerking(s)',
      noCollaborations: 'Geen samewerkings nie',
      visitorBadge: 'BESOEKER',
      backToDiscover: 'Terug',
      messageSent: 'Boodskap gestuur!',
      messageFailed: "Versending het misluk",
      writeMessage: 'Skryf jou boodskap...',
      send: 'Stuur',
      cancel: 'Kanselleer',
      yrs: 'jr',
      view: 'besigtiging',
      views: 'besigtigings',
      emptyPortfolio: 'Portefeulje is tans leeg'
    },
    dashboard: {
      welcome: 'Welkom',
      conversations: 'Gesprekke',
      recentMessages: 'Onlangse boodskappe',
      new: 'nuut',
      findArtists: 'Soek Kunstenaars',
      add: 'Voeg by',
      title: 'Titel',
      description: 'Beskrywing',
      upload: 'Laai op',
      chooseFile: 'Kies lêer',
      noImages: 'Geen beelde nie',
      noDocuments: 'Geen dokumente nie',
      noVideos: 'Geen video\'s nie',
      fileUploaded: 'Lêer suksesvol opgelaai!',
      videoAdded: 'Video bygevoeg!',
      deleted: 'Geskrap!',
      addVideo: 'Voeg video by',
      image: 'Beeld',
      document: 'Dokument',
      video: 'Video'
    },
    projects: {
      title: 'Samewerkingsprojekte',
      createProject: 'Skep Projek',
      lookingFor: 'Op soek na',
      apply: 'Doen aansoek',
      applications: 'aansoeke',
      openProjects: 'Oop Projekte',
      myProjects: 'My Projekte',
      upcoming: 'Komend',
      ongoing: 'Vorder tans',
      past: 'Afgelope',
      typeLocal: 'Plaaslik',
      typeIntra: 'Intra-Afrika',
      startDate: 'Begindatum',
      endDate: 'Einddatum (Opsioneel)',
      noProjects: 'Geen projekte tans nie',
      noUpcoming: 'Geen komende projekte nie',
      noOngoing: 'Geen projekte tans aan die gang nie',
      noPast: 'Geen afgelope projekte nie',
      projectCreated: 'Projek suksesvol geskep!',
      fillRequiredFields: 'Vul asseblief alle verpligte velde in',
      applicationSent: 'Aansoek gestuur!',
      starts: 'Begin',
      ends: 'Eindig',
      findCollaborators: 'Vind vennote vir jou kunsprojekte',
      type: 'Tipe samewerking',
      location: 'Ligging',
      projectTitle: 'Projek titel',
      createProjectBtn: 'Skep projek',
      sendApplication: 'Stuur my aansoek'
    },
    statistics: {
      title: 'Statistiek & Analise',
      overview: "Oorsig",
      byGender: 'Volgens Geslag',
      byCountry: 'Volgens Land',
      byRegion: 'Volgens Streek',
      bySector: 'Volgens Sektor',
      requestAccess: 'Versoek Instansie-toegang',
      totalArtists: 'Totale Kunstenaars',
      detailedStats: 'Gedetailleerde Statistiek',
      projectCollaborations: 'Projek-samewerkings',
      statsByType: 'Volgens Tipe',
      statsByStatus: 'Volgens Status',
      statsTimeline: 'Tydlyn',
      statsTopCountries: 'Top Lande',
      interCountryGender: 'Internasionale samewerking volgens geslag',
      genderByDomain: 'Kunstenaars volgens geslag en domein',
      visitorInterest: 'Besoekersbelangstelling per profiel',
      women: 'Vroue',
      men: 'Mans',
      other: 'Ander',
      countryPair: 'Land-paar',
      visitorViews: 'Besoekers-kyke',
      artistCount: 'Aantal kunstenaars',
      collaborations: 'Samewerkings',
      genderDomain: 'Geslag & Domein',
      visitors: 'Besoekers',
      postsActivity: 'Plasings & Aktiwiteit',
      local: 'Plaaslik',
      intraAfrican: 'Intra-Afrikaans',
      visitorMessages: 'Besoekersboodskappe',
      mostMessaged: 'Mees gekontakteerde domein',
      trendVsLastMonth: 'vergeleke met verlede maand',
      topCountryPair: 'Mees aktiewe land-pare',
      genderSplit: 'Geslagsverdeling',
      typeSplit: 'Tipe-verdeling',
      monthlyEvolution: 'Maandelikse evolusie',
      countryPairs: 'Land-pare (Afrika)',
      detailedData: 'Gedetailleerde Data',
      loading: 'Laai tans statistiek...'
    },
    messages: {
      title: 'Boodskappe',
      noConversations: 'Geen gesprekke nie',
      findArtists: 'Soek Kunstenaars',
      typeMessage: 'Tik boodskap...',
      selectConversation: 'Kies \'n gesprek',
      back: 'Terug na gesprekke',
      noMessages: 'Geen boodskappe nie'
    },
    settings: {
      title: 'Instellings',
      profilePhoto: 'Profielfoto',
      changePhoto: 'Verander foto',
      updateProfile: 'Opdateer profiel',
      saving: 'Stoor tans...',
      profileUpdated: 'Profiel suksesvol opgedateer!',
      updateFailed: 'Opdatering het misluk',
      uploadFailed: "Oplaai het misluk",
      photoUpdated: 'Profielfoto opgedateer!',
      invalidFileType: 'Ongeldige lêertipe. Gebruik JPG, PNG of WebP',
      fileTooLarge: 'Lêer is te groot. Maksimum 5MB'
    },
    feed: {
      title: 'Nuusvoer',
      shareSomething: 'Deel iets...',
      post: 'Plaas',
      noPosts: 'Geen plasings tans nie',
      loadMore: 'Laai meer',
      deletePost: 'Skrap plasing',
      deleteConfirm: 'Is jy seker jy wil hierdie plasing skrap?',
      comments: 'Kommentaar',
      addComment: 'Lewer kommentaar...',
      commentPlaceholder: 'Skryf kommentaar...',
      community: 'Gemeenskap',
      newPost: 'Nuwe plasing',
      createPost: 'Skep plasing',
      postPublished: 'Plasing gepubliseer!',
      postDeleted: 'Plasing geskrap',
      publishing: 'Publiseer tans...',
      firstToShare: 'Wees die eerste om iets te deel!',
      seenItAll: 'Jy het alles gesien!',
      institutionNoInteract: 'Instansies kan nie interaksie hê nie',
      institutionWarning: '⚠️ As \'n instansie kan jy die voer lees, maar jy kan nie \'laaik\', kommentaar lewer of plasings maak nie.',
      noComments: 'Geen kommentaar nog nie',
      text: 'Teks',
      clickToAdd: 'Klik om by te voeg'
    },
    visitorProfile: {
      title: 'Besoekerprofiel',
      visitorNotFound: 'Besoeker nie gevind nie',
      individual: 'Individu',
      organization: 'Organisasie'
    },
    checkout: {
      title: 'Ontsluit Statistiek',
      subtitle: 'Kry toegang tot volledige data oor die Afrika-kunsgemeenskap.',
      institutionalAccess: 'Instansie-toegang',
      demographics: 'Demografie',
      geography: 'Geografiese bereik',
      activityTrends: 'Aktiwiteit & Tendense',
      demographicsDesc: 'Geslag, ouderdom, land',
      geographyDesc: 'Per Afrika-streek',
      activityTrendsDesc: 'Plasings, laaiks, sektore',
      accessActivated: 'Toegang geaktiveer',
      mockPayment: 'Toetsbetaling',
      redirecting: 'Stuur tans aan na statistiek...',
      mockPaymentDesc: 'Simulasie - geen bankbesonderhede nodig nie',
      accessCode: 'Toegangskode',
      institutionalPlan: 'Instansie-plan',
      annual: 'Jaarliks',
      total: 'Totaal (Toets)',
      benefit1: 'Gedetailleerde statistiek per geslag en land',
      benefit2: 'Volledige analitiese kontroleskerm',
      benefit3: 'Unieke en veilige toegangskode',
      benefit4: 'Onbeperkte datatoegang',
      simulatePayment: 'Simuleer betaling & gaan voort',
      noRealTransaction: '🔒 Slegs simulasie - geen geld sal afgetrek word nie',
      paymentAccepted: 'Betaling aanvaar! Toegang verleen.',
      paymentError: 'Fout met betaling',
      loginRequired: 'Aanmelding word vereis',
      signInInstitution: 'Meld asseblief aan met \'n instansie-rekening.',
      institutionsOnly: 'Slegs vir Instansies',
      accessReserved: 'Hierdie toegang is gereserveer vir Instansie-rekeninge.',
      viewPublicStats: 'Sien publieke statistiek',
      processing: 'Verwerk tans...'
    },
    common: {
      search: 'Soek',
      filter: 'Filter',
      all: 'Alles',
      save: 'Stoor',
      cancel: 'Kanselleer',
      delete: 'Skrap',
      edit: 'Wysig',
      loading: 'Laai tans...',
      noResults: 'Geen resultate gevind nie',
      viewProfile: 'Sien Profiel',
      explore: 'Verken',
      discover: 'Ontdek',
      back: 'Terug',
      send: 'Stuur',
      welcome: 'Welkom',
      success: 'Sukses',
      error: 'Fout',
      isFrench: false,
      langCode: 'af',
      collaboration: 'samewerking',
      collaborations: 'samewerkings',
      noCollaborations: 'Geen samewerkings nie'
    },
    discover: {
      searchPlaceholder: 'Soek volgens naam...',
      resultsCount: 'Ontdek {total} kunstenaars regoor Afrika'
    }
},

mg: {
    nav: {
      home: 'Fandraisana',
      discover: 'Hikaroka',
      feed: 'Vaovao',
      projects: 'Tetikasa',
      messages: 'Hafatra',
      dashboard: 'Tabilao',
      statistics: 'Antontanisa',
      signIn: 'Hiditra',
      getStarted: 'Hanomboka',
      logout: 'Hivoaka',
      institutionAccess: 'Fidirana ara-panjakana',
      visitorBadge: 'Mpitsidika',
      languages: 'Fiteny'
    },
    home: {
      tagline: "Tontolo iainan'ny kanto afrikana",
      title1: 'Hifandray.',
      title2: 'Hamorona.',
      title3: 'Hiaraka hiasa.',
      subtitle: "Sehatra voalohany natokana ho an'ny mpanakanto afrikana. Asehoy ny sanganasanao, tadiavo ny mpiara-miasa ary manambara ao amin'ny vondrona mpamorona manerana ny kaontinanta.",
      exploreArtists: 'Hizaha mpanakanto',
      joinCommunity: "Hiditra ao amin'ny vondrona",
      featuredArtists: 'Mpanakanto miavaka',
      viewAll: 'Hijery ny rehetra',
      stats: {
        artists: 'Mpanakanto',
        countries: 'Firenena',
        sectors: 'Sehatry ny kanto',
        projects: 'Fiaraha-miasa'
      },
      features: {
        portfolio: {
          title: 'Tahiry kanto nomerika',
          desc: "Asehoy ny asanao amin'ny alalan'ny tahirin-kevitra, sary ary horonantsary"
        },
        network: {
          title: 'Tambajotra Panafrikana',
          desc: "Mifandray amin'ny mpanakanto manerana an'i Afrika"
        },
        collaborate: {
          title: 'Hiaraka hiasa',
          desc: "Tadiavo ny mpiara-miasa amin'ny tetikasa kantonao"
        }
      },
      joinCTA: "Midira ao amin'ny vondrona\nkanto afrikana"
    },
    auth: {
      login: 'Hiditra',
      register: 'Hamorona kaonty',
      email: 'Imailaka',
      password: 'Teny miafina',
      firstName: 'Anarana',
      lastName: 'Fanampiny',
      country: 'Firenena',
      subregion: 'Faritra',
      gender: 'Lahy na vavy',
      sector: 'Sehatry ny kanto',
      domain: 'Taranja/Sahan-draharaha',
      yearStarted: 'Taona nanombohana',
      bio: "Tantaran'ny fiainana",
      additionalInfo: 'Fampahalalana fanampiny',
      website: 'Tranonkala',
      alreadyAccount: 'Efa manana kaonty?',
      noAccount: "Tsy mbola manana kaonty?",
      createOne: 'Hamorona kaonty',
      signInHere: 'Midira eto',
      selectCountry: 'Safidio ny firenenao',
      selectSector: 'Safidio ny sehatrao',
      selectDomain: 'Safidio ny taranjanao',
      selectGender: 'Safidio ny lahy na vavy',
      visitorType: 'Karazana kaonty',
      individual: 'Olon-tokana',
      organisation: 'Fikambanana',
      organisationName: "Anaran'ny fikambanana",
      visitorInfo: "Amin'ny maha-mpitsidika anao, afaka mijery ny mombamomba sy ny tahiry kantony ianao. Tsy afaka mampiasa ny Feed, mandefa hafatra na mamoaka zavatra ianao.",
      welcomeBack: 'Tongasoa indray',
      signInTo: "Midira ato amin'ny Art Connect Africa",
      signingIn: 'Eo am-pidirana...',
      demoAccounts: 'Kaonty fanandramana:',
      chooseAccountType: 'Safidio ny karazana kaontinao',
      joinACA: "Midira ato amin'ny Art Connect Africa",
      artist: 'Mpanakanto',
      institution: 'Andrim-panjakana',
      visitor: 'Mpitsidika',
      portfolioNetwork: 'Tahiry & Tambajotra',
      statsAccess: "Fidirana amin'ny antontanisa",
      exploreDiscover: 'Hizaha & Hikaroka',
      organizationName: "Anaran'ny fikambanana",
      contactFirstName: "Anaran'ny mpifandray",
      contactLastName: "Fanampin'anaran'ny mpifandray",
      missionDescription: "Iraka / Famaritana ny fikambanana",
      statsAccessTitle: "📊 Fidirana amin'ny antontanisa",
      statsAccessInfo: "Aorian'ny fisoratana anarana, mila manao fandoavam-bola fitsapana ianao mba hahazoana ny kaody fidirana hijerena ny antontanisa antsipiriany.",
      creating: 'Eo am-pamoronana...',
      createInstitution: 'Hamorona kaonty Andrim-panjakana',
      bioPlaceholder: 'Lazao anay ny momba anao sy ny kantonao...',
      additionalInfoPlaceholder: 'Fampirantiana, loka, fiaraha-miasa miavaka...',
      orgNamePlaceholder: "Ohatra: Ministeran'ny Kolontsaina",
      missionPlaceholder: "Lazao ny iraky ny fikambananao...",
      emailPlaceholder: 'fifandraisana@fikambanana.org'
    },
    profile: {
      portfolio: 'Tahiry kanto',
      about: 'Mombamomba',
      contact: 'Fifandraisana',
      sendMessage: 'Handefa Hafatra',
      editProfile: 'Hanova ny mombamomba',
      uploadDocument: 'Handefa Tahirin-kevitra',
      uploadImage: 'Handefa Sary',
      addVideo: 'Hanampy Rohy Horonantsary',
      documents: 'Tahirin-kevitra',
      images: 'Sary',
      videos: 'Horonantsary',
      memberSince: 'Mpikambana nanomboka ny',
      yearsExperience: "taona traikefa",
      collaborationsCount: 'fiaraha-miasa',
      noCollaborations: 'Tsy mbola nisy fiaraha-miasa',
      visitorBadge: 'MPITSIDIKA',
      backToDiscover: 'Hiverina',
      messageSent: 'Lasa ny hafatra!',
      messageFailed: "Tsy tontosa ny fandefasana",
      writeMessage: 'Soraty ny hafatrao...',
      send: 'Alefaso',
      cancel: 'Hanafoana',
      yrs: 'taona',
      view: 'fahitana',
      views: 'fahitana',
      emptyPortfolio: 'Tsy misy na inona na inona ao anaty tahiry'
    },
    dashboard: {
      welcome: 'Tongasoa',
      conversations: 'Resaka',
      recentMessages: 'Hafatra vao haingana',
      new: 'vao',
      findArtists: 'Hitady mpanakanto',
      add: 'Hanampy',
      title: 'Lohateny',
      description: 'Famaritana',
      upload: 'Handefa',
      chooseFile: 'Hisafidy rakitra',
      noImages: 'Tsy misy sary',
      noDocuments: 'Tsy misy tahirin-kevitra',
      noVideos: 'Tsy misy horonantsary',
      fileUploaded: 'Lasa ny rakitra!',
      videoAdded: 'Tafiditra ny horonantsary!',
      deleted: 'Voafafa!',
      addVideo: 'Hanampy horonantsary',
      image: 'Sary',
      document: 'Tahirin-kevitra',
      video: 'Horonantsary'
    },
    projects: {
      title: 'Tetikasa Fiaraha-miasa',
      createProject: 'Hamorona Tetikasa',
      lookingFor: 'Mitady',
      apply: 'Handefa fangatahana',
      applications: 'fangatahana',
      openProjects: 'Tetikasa misokatra',
      myProjects: 'Ny tetikasako',
      upcoming: 'Ho avy',
      ongoing: 'Eo am-pandehanana',
      past: 'Efa lasa',
      typeLocal: 'An-toerana',
      typeIntra: "Anatin'i Afrika",
      startDate: 'Daty nanombohana',
      endDate: 'Daty niafarana (Azo atao)',
      noProjects: "Tsy misy tetikasa amin'izao fotoana izao",
      noUpcoming: 'Tsy misy tetikasa ho avy',
      noOngoing: 'Tsy misy tetikasa mandeha',
      noPast: 'Tsy misy tetikasa taloha',
      projectCreated: 'Tafatsangana ny tetikasa!',
      fillRequiredFields: 'Fenoy ny banga rehetra',
      applicationSent: 'Lasa ny fangatahana!',
      starts: 'Manomboka',
      ends: 'Mifarana',
      findCollaborators: "Tadiavo ny mpiara-miasa amin'ny tetikasa kantonao",
      type: 'Karazana fiaraha-miasa',
      location: 'Toerana',
      projectTitle: "Lohatenin'ny tetikasa",
      createProjectBtn: 'Hamorona tetikasa',
      sendApplication: 'Handefa ny fangatahako'
    },
    statistics: {
      title: 'Antontanisa & Famakafakana',
      overview: "Topimaso",
      byGender: 'Araka ny maha-lahy na maha-vavy',
      byCountry: 'Araka ny firenena',
      byRegion: 'Araka ny faritra',
      bySector: 'Araka ny sehatra',
      requestAccess: 'Hangataka fidirana ara-panjakana',
      totalArtists: "Totalin'ny mpanakanto",
      detailedStats: 'Antontanisa amin\'ny antsipiriany',
      projectCollaborations: 'Fiaraha-miasa',
      statsByType: 'Araka ny karazany',
      statsByStatus: 'Araka ny sata',
      statsTimeline: 'Tantara',
      statsTopCountries: 'Firenena lohany',
      interCountryGender: 'Fiaraha-miasa iraisam-pirenena araka ny maha-lahy na maha-vavy',
      genderByDomain: 'Mpanakanto araka ny maha-lahy na maha-vavy sy ny taranja',
      visitorInterest: "Fahalinan'ny mpitsidika araka ny mombamomba",
      women: 'Vehivavy',
      men: 'Lehilahy',
      other: 'Hafa',
      countryPair: 'Firenena tsiroaroa',
      visitorViews: "Fijerena nataon'ny mpitsidika",
      artistCount: "Isan'ny mpanakanto",
      collaborations: 'Fiaraha-miasa',
      genderDomain: 'Maha-lahy na maha-vavy & Taranja',
      visitors: 'Mpitsidika',
      postsActivity: 'Lahatsoratra & Hetsika',
      local: 'An-toerana',
      intraAfrican: 'Panafrikana',
      visitorMessages: "Hafatry ny mpitsidika",
      mostMessaged: 'Taranja be mpandinika indrindra',
      trendVsLastMonth: "Raha oharina tamin'ny volana lasa",
      topCountryPair: 'Firenena tsiroaroa mazoto indrindra',
      genderSplit: "Fizarana araka ny maha-lahy na maha-vavy",
      typeSplit: 'Fizarana araka ny karazany',
      monthlyEvolution: 'Fivoarana isam-bolana',
      countryPairs: "Firenena tsiroaroa (Afrika)",
      detailedData: 'Data antsipiriany',
      loading: 'Eo am-pamoahana...'
    },
    messages: {
      title: 'Hafatra',
      noConversations: 'Tsy misy resaka',
      findArtists: 'Hitady mpanakanto',
      typeMessage: 'Soraty ny hafatra...',
      selectConversation: 'Safidio ny resaka',
      back: 'Hiverina amin\'ny resaka',
      noMessages: 'Tsy misy hafatra'
    },
    settings: {
      title: 'Fandrindrana',
      profilePhoto: 'Sarin\'ny mombamomba',
      changePhoto: 'Hanova sary',
      updateProfile: 'Havaozina ny mombamomba',
      saving: 'Eo am-pitehirizana...',
      profileUpdated: 'Voahavao ny mombamomba!',
      updateFailed: 'Tsy nahomby ny fanavaozana',
      uploadFailed: 'Tsy nahomby ny fampidirana',
      photoUpdated: 'Voahavao ny sarin\'ny mombamomba!',
      invalidFileType: 'Tsy mety io karazana rakitra io. Ampiasao ny JPG, PNG, na WebP',
      fileTooLarge: 'Be loatra io rakitra io. 5MB no fetra farany'
    },
    feed: {
      title: 'Vaovao farany',
      shareSomething: 'Hizara zavatra...',
      post: 'Hamoaka',
      noPosts: 'Tsy misy lahatsoratra amin\'izao fotoana izao',
      loadMore: 'Hijery fanampiny',
      deletePost: 'Hofafana ny lahatsoratra',
      deleteConfirm: 'Tena hofafanao ve ity lahatsoratra ity?',
      comments: 'Hevitra',
      addComment: 'Hanampy hevitra...',
      commentPlaceholder: 'Soraty ny hevitrao...',
      community: 'Vondrona',
      newPost: 'Lahatsoratra vaovao',
      createPost: 'Hamorona lahatsoratra',
      postPublished: 'Tafavoaka ny lahatsoratra!',
      postDeleted: 'Voafafa ny lahatsoratra',
      publishing: 'Eo am-pamoahana...',
      firstToShare: 'Ho voalohany hizara zavatra!',
      seenItAll: 'Efa voajery daholo ny rehetra!',
      institutionNoInteract: 'Tsy afaka mandray anjara ny andrim-panjakana',
      institutionWarning: '⚠️ Amin\'ny maha andrim-panjakana anao, afaka mijery vaovao ianao fa tsy afaka manao "like", maneho hevitra, na mamoaka lahatsoratra.',
      noComments: 'Tsy misy hevitra mbola voasoratra',
      text: 'Lahatsoratra',
      clickToAdd: 'Tsindrio raha hanampy'
    },
    visitorProfile: {
      title: 'Mombamomba ny Mpitsidika',
      visitorNotFound: 'Tsy hita ny mpitsidika',
      individual: 'Olon-tokana',
      organization: 'Fikambanana'
    },
    checkout: {
      title: 'Hamoha ny Antontanisa',
      subtitle: "Hazo ny angon-drakitra feno momba ny vondrona mpanakanto afrikana.",
      institutionalAccess: 'Fidirana ara-panjakana',
      demographics: 'Mponina',
      geography: 'Sahan-tany',
      activityTrends: 'Hetsika & Fironana',
      demographicsDesc: 'Maha-lahy na maha-vavy, taona, firenena',
      geographyDesc: 'Araka ny faritra afrikana',
      activityTrendsDesc: 'Lahatsoratra, like, sehatra',
      accessActivated: 'Nampandehanina ny fidirana',
      mockPayment: 'Fandoavam-bola fitsapana',
      redirecting: 'Hampitodika any amin\'ny antontanisa...',
      mockPaymentDesc: 'Fitsapana fandoavam-bola — tsy mila angon-drakitra banky',
      accessCode: 'Kaody fidirana',
      institutionalPlan: 'Tolotra ho an\'ny Andrim-panjakana',
      annual: 'Isan-taona',
      total: 'Totaly (Fitsapana)',
      benefit1: 'Antontanisa antsipiriany araka ny maha-lahy na maha-vavy sy firenena',
      benefit2: 'Tabilao feno momba ny famakafakana',
      benefit3: 'Kaody fidirana tokana sy azo antoka',
      benefit4: 'Fidirana tsy misy fetra amin\'ny data rehetra',
      simulatePayment: 'Hanandrana fandoavam-bola & Hiditra',
      noRealTransaction: '🔒 Fitsapana fotsiny — tsy misy vola tena mivoaka',
      paymentAccepted: 'Voaray ny fandoavam-bola! Misokatra ny fidirana.',
      paymentError: 'Nisy fahadisoana ny fandoavam-bola',
      loginRequired: 'Mila miditra ianao',
      signInInstitution: 'Midira amin\'ny alalan\'ny kaonty andrim-panjakana azafady.',
      institutionsOnly: 'Ho an\'ny Andrim-panjakana ihany',
      accessReserved: 'Ity fidirana ity dia natokana ho an\'ny kaonty Andrim-panjakana ihany.',
      viewPublicStats: 'Hijery ny antontanisa ho an\'ny besinimaro',
      processing: 'Eo am-panatanterahana...'
    },
    common: {
      search: 'Hitady',
      filter: 'Hifantina',
      all: 'Rehetra',
      save: 'Tehirizina',
      cancel: 'Hanafoana',
      delete: 'Hofafana',
      edit: 'Hanova',
      loading: 'Eo am-pandehanana...',
      noResults: 'Tsy misy vokany hita',
      viewProfile: 'Hijery ny mombamomba',
      explore: 'Hizaha',
      discover: 'Hikaroka',
      back: 'Hiverina',
      send: 'Alefaso',
      welcome: 'Tongasoa',
      success: 'Fahombiazana',
      error: 'Fahadisoana',
      isFrench: false,
      langCode: 'mg',
      collaboration: 'fiaraha-miasa',
      collaborations: 'fiaraha-miasa',
      noCollaborations: 'Tsy mbola nisy fiaraha-miasa'
    },
    discover: {
      searchPlaceholder: 'Hitady amin\'ny anarana...',
      resultsCount: 'Mahita mpanakanto {total} manerana an\'i Afrika'
    }
}, 

ti: {
    nav: {
      home: 'መበገሲ',
      discover: 'ዳህስስ',
      feed: 'ዜናታት',
      projects: 'ፕሮጀክታት',
      messages: 'መልእኽቲ',
      dashboard: 'ዳሽቦርድ',
      statistics: 'ስታቲስቲክስ',
      signIn: 'እቶ',
      getStarted: 'ጀምር',
      logout: 'ውጻእ',
      institutionAccess: 'ናይ ትካል መእተዊ',
      visitorBadge: 'በጻሒ',
      languages: 'ቋንቋታት'
    },
    home: {
      tagline: 'ኣፍሪቃዊ ስነ-ጥበባዊ ከባቢ',
      title1: 'ተራኸብ።',
      title2: 'ፍጠር።',
      title3: 'ተሓባበር።',
      subtitle: "ቀዳማይ ንኣፍሪቃውያን ስነ-ጥበበኛታት ዝተዳለወ መድረኽ። ስራሕካ ኣርኢ፣ መሻርኽቲ ድለ፣ ከምኡ’ውን ኣብ መላእ ክፍለ-ዓለም ኣብ ዝርከብ ንጡፍ ፈጣሪ ማሕበረሰብ ተጸንበር።",
      exploreArtists: 'ስነ-ጥበበኛታት ዳህስስ',
      joinCommunity: 'ማሕበረሰብ ተጸንበር',
      featuredArtists: 'ፍሉጣት ስነ-ጥበበኛታት',
      viewAll: 'ኩሉ ርአ',
      stats: {
        artists: 'ስነ-ጥበበኛታት',
        countries: 'ሃገራት',
        sectors: 'ስነ-ጥበባዊ ዘፈራት',
        projects: 'ምትሕብባራት'
      },
      features: {
        portfolio: {
          title: 'ዲጂታላዊ ፖርትፎሊዮ',
          desc: 'ስራሕካ ብሰነዳት፣ ስእልታትን ቪድዮታትን ኣርኢ'
        },
        network: {
          title: 'ፓን-ኣፍሪቃዊ መርበብ',
          desc: "ኣብ መላእ ኣፍሪቃ ምስ ዝርከቡ ስነ-ጥበበኛታት ተራኸብ"
        },
        collaborate: {
          title: 'ተሓባበር',
          desc: 'ንጥበባዊ ፕሮጀክትታትካ መሻርኽቲ ርኸብ'
        }
      },
      joinCTA: "ኣብቲ ኣፍሪቃዊ ስነ-ጥበባዊ\nማሕበረሰብ ተጸንበር"
    },
    auth: {
      login: 'እቶ',
      register: 'ኣካውንት ክፈት',
      email: 'ኢሜይል',
      password: 'መሕለፊ ቃል',
      firstName: 'ሽም',
      lastName: 'ዓሌት',
      country: 'ሃገር',
      subregion: 'ንኡስ ዞባ',
      gender: 'ጾታ',
      sector: 'ስነ-ጥበባዊ ዘፈር',
      domain: 'ሞያ/ክእለት',
      yearStarted: 'ዝጀመርካሉ ዓመት',
      bio: 'ባዮግራፊ',
      additionalInfo: 'ተወሳኺ ሓበሬታ',
      website: 'ዌብሳይት',
      alreadyAccount: 'ኣካውንት ኣሎካ ድዩ?',
      noAccount: "ኣካውንት የብልካን?",
      createOne: 'ሓድሽ ክፈት',
      signInHere: 'ኣብዚ እቶ',
      selectCountry: 'ሃገርካ ምረጽ',
      selectSector: 'ዘፈርካ ምረጽ',
      selectDomain: 'ሞያኻ ምረጽ',
      selectGender: 'ጾታ ምረጽ',
      visitorType: 'ዓይነት ኣካውንት',
      individual: 'ውልቃዊ',
      organisation: 'ትካል',
      organisationName: "ሽም ትካል",
      visitorInfo: "ከም በጻሒ መጠን ፕሮፋይልን ፖርትፎሊዮን ክትድህስስ ትኽእል ኢኻ። ኣብቲ ዜናታት ክትኣቱ፣ ጽሑፍ ክትዝርግሕ ወይ መልእኽቲ ክትሰድድ ግን ኣይትኽእልን።",
      welcomeBack: 'እንኳዕ ደሓን መጻእካ',
      signInTo: 'ኣብ Art Connect Africa እቶ',
      signingIn: 'ይኣቱ ኣሎ...',
      demoAccounts: 'ናይ መርኣያ (Demo) ኣካውንታት:',
      chooseAccountType: 'ዓይነት ኣካውንትካ ምረጽ',
      joinACA: 'ኣብ Art Connect Africa ተጸንበር',
      artist: 'ስነ-ጥበበኛ',
      institution: 'ትካል',
      visitor: 'በጻሒ',
      portfolioNetwork: 'ፖርትፎሊዮን መርበብን',
      statsAccess: 'ናይ ስታቲስቲክስ መእተዊ',
      exploreDiscover: 'ዳህስስን ርከብን',
      contactFirstName: 'ናይ መርከቢ ሽም',
      contactLastName: 'ናይ መርከቢ ዓሌት',
      missionDescription: "ዕላማ / መግለጺ ትካል",
      statsAccessTitle: '📊 ናይ ስታቲስቲክስ መእተዊ',
      statsAccessInfo: "ድሕሪ ምምዝጋብካ፣ ናይ መእተዊ ኮድ ንምርካብን ዝርዝር ስታቲስቲክስ ን ምርኣይን ናይ ፈተነ ክፍሊት ክትከፍል የድልየካ።",
      creating: 'ይፍጠር ኣሎ...',
      createInstitution: 'ናይ ትካል ኣካውንት ክፈት',
      bioPlaceholder: 'ብዛዕባኻን ጥበብካን ንገረና...',
      additionalInfoPlaceholder: 'ምርኢታት፣ ሽልማታት፣ ፍሉጥ ምትሕብባራት...',
      orgNamePlaceholder: 'ንኣብነት: ሚኒስትሪ ባህሊ ሰነጋል',
      missionPlaceholder: "ናይ ትካልካ ዕላማ ግለጽ...",
      emailPlaceholder: 'contact@organisation.org'
    },
    profile: {
      portfolio: 'ፖርትፎሊዮ',
      about: 'ብዛዕባ',
      contact: 'ርክብ',
      sendMessage: 'መልእኽቲ ስደድ',
      editProfile: 'ፕሮፋይል ኣመሓይሽ',
      uploadDocument: 'ሰነድ ጽዓን',
      uploadImage: 'ስእሊ ጽዓን',
      addVideo: 'ናይ ቪድዮ ሊንክ ወስኽ',
      documents: 'ሰነዳት',
      images: 'ስእልታት',
      videos: 'ቪድዮታት',
      memberSince: 'ኣባል ካብ',
      yearsExperience: "ዓመት ተመክሮ",
      collaborationsCount: 'ምትሕብባር(ታት)',
      noCollaborations: 'ምትሕብባር የለን',
      visitorBadge: 'በጻሒ',
      backToDiscover: 'ተመለስ',
      messageSent: 'መልእኽቲ ተሰዲዱ!',
      messageFailed: "ምልኣኽ ኣይተዓወተን",
      writeMessage: 'መልእኽቲ ጽሓፍ...',
      send: 'ስደድ',
      cancel: 'ሰርዝ',
      yrs: 'ዓመት',
      view: 'ርኢቶ',
      views: 'ርኢቶታት',
      emptyPortfolio: 'ኣብ ፖርትፎሊዮ ዝተረኽበ ነገር የለን'
    },
    dashboard: {
      welcome: 'እንኳዕ ደሓን መጻእካ',
      conversations: 'ዕላል',
      recentMessages: 'ናይ ቀረባ መልእኽቲ',
      new: 'ሓድሽ',
      findArtists: 'ስነ-ጥበበኛታት ድለ',
      add: 'ወስኽ',
      title: 'ኣርእስቲ',
      description: 'መግለጺ',
      upload: 'ጽዓን',
      chooseFile: 'ፋይል ምረጽ',
      noImages: 'ስእሊ የለን',
      noDocuments: 'ሰነድ የለን',
      noVideos: 'ቪድዮ የለን',
      fileUploaded: 'ፋይል ተጻዒኑ!',
      videoAdded: 'ቪድዮ ተወሲኹ!',
      deleted: 'ተደምሲሱ!',
      addVideo: 'ቪድዮ ወስኽ',
      image: 'ስእሊ',
      document: 'ሰነድ',
      video: 'ቪድዮ'
    },
    projects: {
      title: 'ናይ ምትሕብባር ፕሮጀክትታት',
      createProject: 'ፕሮጀክት ፍጠር',
      lookingFor: 'ይደሊ ኣሎ',
      apply: 'ኣመልክት',
      applications: 'ምልካታታት',
      openProjects: 'ክፉት ፕሮጀክትታት',
      myProjects: 'ናተይ ፕሮጀክትታት',
      upcoming: 'ዝመጽእ',
      ongoing: 'ኣብ መስርሕ',
      past: 'ዝሓለፈ',
      typeLocal: 'ናይ ዓዲ',
      typeIntra: 'ውሽጢ ኣፍሪቃ',
      startDate: 'ዝጅምረሉ ዕለት',
      endDate: 'ዝውድኣሉ ዕለት (ኣማራጺ)',
      noProjects: 'ኣብዚ እዋን ፕሮጀክት የለን',
      noUpcoming: 'ዝመጽእ ፕሮጀክት የለን',
      noOngoing: 'ኣብ መስርሕ ዘሎ ፕሮጀክት የለን',
      noPast: 'ዝሓለፈ ፕሮጀክት የለን',
      projectCreated: 'ፕሮጀክት ተፈጢሩ!',
      fillRequiredFields: 'በጃኹም ዘድልዩ ቦታታት መልኡ',
      applicationSent: 'ምልከታ ተሰዲዱ!',
      starts: 'ይጅምር',
      ends: 'ውዳእ',
      findCollaborators: 'ንጥበባዊ ፕሮጀክትታትካ መሻርኽቲ ድለ',
      type: 'ዓይነት ምትሕብባር',
      location: 'ቦታ',
      projectTitle: 'ኣርእስቲ ፕሮጀክት',
      createProjectBtn: 'ፕሮጀክት ፍጠር',
      sendApplication: 'ምልከታይ ስደድ'
    },
    statistics: {
      title: 'ስታቲስቲክስን ትንተናን',
      overview: "ሓፈሻዊ ምርኢት",
      byGender: 'ብጾታ',
      byCountry: 'ብሃገር',
      byRegion: 'ብዞባ',
      bySector: 'ብዘፈር',
      requestAccess: 'ናይ ትካል መእተዊ ሕተት',
      totalArtists: 'ጠቕላላ ስነ-ጥበበኛታት',
      detailedStats: 'ዝርዝር ስታቲስቲክስ',
      projectCollaborations: 'ምትሕብባራት',
      statsByType: 'ብዓይነት',
      statsByStatus: 'ብኩነታት',
      statsTimeline: 'ታሪኽ',
      statsTopCountries: 'ቀዳሞት ሃገራት',
      interCountryGender: 'ኣህጉራዊ ምትሕብባር ብጾታ',
      genderByDomain: 'ስነ-ጥበበኛታት ብጾታን ሞያን',
      visitorInterest: 'ናይ በጻሕቲ ተገዳስነት ብፕሮፋይል',
      women: 'ደቂ-ኣንስትዮ',
      men: 'ደቂ-ተባዕትዮ',
      other: 'ካልእ',
      countryPair: 'ምስምማዕ ሃገራት',
      visitorViews: 'ናይ በጻሕቲ ምርኢት',
      artistCount: 'ቁጽሪ ስነ-ጥበበኛታት',
      collaborations: 'ምትሕብባራት',
      genderDomain: 'ጾታን ሞያን',
      visitors: 'በጻሕቲ',
      postsActivity: 'ጽሑፋትን ንጥፈታትን',
      local: 'ናይ ዓዲ',
      intraAfrican: 'ውሽጢ ኣፍሪቃ',
      visitorMessages: 'መልእኽቲ በጻሕቲ',
      mostMessaged: 'ዝበዝሐ መልእኽቲ ዝተላእከሉ ሞያ',
      trendVsLastMonth: 'ምስ ዝሓለፈ ወርሒ ክወዳደር ከሎ',
      topCountryPair: 'ዝበዝሐ ንጥፈት ዘለዎም ሃገራት',
      genderSplit: 'ምክፍፋል ጾታ',
      typeSplit: 'ምክፍፋል ዓይነት',
      monthlyEvolution: 'ወርሓዊ ዕብየት',
      countryPairs: 'ምስምማዕ ሃገራት (ኣፍሪቃ)',
      detailedData: 'ዝርዝር ዳታ',
      loading: 'ይጽዕን ኣሎ...'
    },
    messages: {
      title: 'መልእኽቲ',
      noConversations: 'ዕላል የለን',
      findArtists: 'ስነ-ጥበበኛታት ድለ',
      typeMessage: 'መልእኽቲ ጽሓፍ...',
      selectConversation: 'ዕላል ምረጽ',
      back: 'ናብ ዕላል ተመለስ',
      noMessages: 'መልእኽቲ የለን'
    },
    settings: {
      title: 'ቅጥዕታት',
      profilePhoto: 'ናይ ፕሮፋይል ስእሊ',
      changePhoto: 'ስእሊ ቀይር',
      updateProfile: 'ፕሮፋይል ኣሐድስ',
      saving: 'ይዕቀብ ኣሎ...',
      profileUpdated: 'ፕሮፋይል ተሓዲሱ!',
      updateFailed: 'ምሕዳስ ኣይተዓወተን',
      uploadFailed: "ምጽዓን ኣይተዓወተን",
      photoUpdated: 'ናይ ፕሮፋይል ስእሊ ተቐይሩ!',
      invalidFileType: 'ጌጋ ዓይነት ፋይል። በጃኹም JPG, PNG ወይ WebP ተጠቐሙ',
      fileTooLarge: 'ፋይል ዓቢ እዩ። ዝለዓለ 5MB'
    },
    feed: {
      title: 'ዜናታት',
      shareSomething: 'ገለ ነገር ኣካፍል...',
      post: 'ዝርጋሕ',
      noPosts: 'ኣብዚ እዋን ጽሑፍ የለን',
      loadMore: 'ተወሳኺ ርአ',
      deletePost: 'ጽሑፍ ደምስስ',
      deleteConfirm: 'ነዚ ጽሑፍ ክትድምስሶ ርግጸኛ ዲኻ?',
      comments: 'ርኢቶታት',
      addComment: 'ርኢቶ ወስኽ...',
      commentPlaceholder: 'ርኢቶ ጽሓፍ...',
      community: 'ማሕበረሰብ',
      newPost: 'ሓድሽ ጽሑፍ',
      createPost: 'ጽሑፍ ፍጠር',
      postPublished: 'ጽሑፍ ተዘርጊሑ!',
      postDeleted: 'ጽሑፍ ተደምሲሱ',
      publishing: 'ይዝርጋሕ ኣሎ...',
      firstToShare: 'ቀዳማይ ተኻፋሊ ኩን!',
      seenItAll: 'ኩሉ ርኢኻዮ!',
      institutionNoInteract: 'ትካላት ርኢቶ ክህቡ ኣይኽእሉን',
      institutionWarning: '⚠️ ከም ትካል መጠን፣ ዜናታት ክትርኢ ትኽእል ኢኻ፡ ግን ክትሳተፍ (like, ርኢቶ ክትህብ ወይ ክትዝርግሕ) ኣይትኽእልን።',
      noComments: 'ርኢቶ የለን',
      text: 'ጽሑፍ',
      clickToAdd: 'ንምውሳኽ ጠውቕ'
    },
    visitorProfile: {
      title: 'ናይ በጻሒ ፕሮፋይል',
      visitorNotFound: 'በጻሒ ኣይተረኽበን',
      individual: 'ውልቃዊ',
      organization: 'ትካል'
    },
    checkout: {
      title: 'ስታቲስቲክስ ክፈት',
      subtitle: 'ናይ ኣፍሪቃዊ ስነ-ጥበባዊ ማሕበረሰብ ምሉእ ዳታ ረኸብ።',
      institutionalAccess: 'ናይ ትካል መእተዊ',
      demographics: 'ስነ-ህዝባዊ ዳታ',
      geography: 'ጂኦግራፊያዊ ስፍሓት',
      activityTrends: 'ንጥፈታትን ዝንባለታትን',
      demographicsDesc: 'ጾታ፣ ዕድመ፣ ሃገር',
      geographyDesc: 'ብናይ ኣፍሪቃ ዞባታት',
      activityTrendsDesc: 'ጽሑፋት፣ likes፣ ዘፈራት',
      accessActivated: 'መእተዊ ተኸፊቱ',
      mockPayment: 'ናይ ፈተነ ክፍሊት',
      redirecting: 'ናብ ስታቲስቲክስ ይወስደካ ኣሎ...',
      mockPaymentDesc: 'ናይ ክፍሊት ፈተነ — ናይ ባንክ ዳታ ኣየድልን',
      accessCode: 'ናይ መእተዊ ኮድ',
      institutionalPlan: 'ናይ ትካል ፕላን',
      annual: 'ዓመታዊ',
      total: 'ጠቕላላ (ፈተነ)',
      benefit1: 'ዝርዝር ስታቲስቲክስ ብጾታን ሃገርን',
      benefit2: 'ምሉእ ትንተናዊ ዳሽቦርድ',
      benefit3: 'ፍሉይን ውሑስን መእተዊ ኮድ',
      benefit4: 'ደረት ዘይብሉ ናይ ዳታ መእተዊ',
      simulatePayment: 'ክፍሊት ፈትንን እቶን',
      noRealTransaction: '🔒 ፈተነ ጥራይ እዩ — ናይ ሓቂ ክፍሊት የለን',
      paymentAccepted: 'ክፍሊት ተቀቢልና! መእተዊ ተፈቂዱ።',
      paymentError: 'ናይ ክፍሊት ጌጋ',
      loginRequired: 'ምእታው የድሊ',
      signInInstitution: 'በጃኹም ብናይ ትካል ኣካውንት እተዉ።',
      institutionsOnly: 'ንትካላት ጥራይ',
      accessReserved: 'እዚ መእተዊ ንናይ ትካል ኣካውንታት ጥራይ ዝተሓዝ እዩ።',
      viewPublicStats: 'ናይ ህዝቢ ስታቲስቲክስ ርአ',
      processing: 'ይስራሕ ኣሎ...'
    },
    common: {
      search: 'ደሊ',
      filter: 'ኣጻሪ',
      all: 'ኩሉ',
      save: 'ኣቐምጥ',
      cancel: 'ሰርዝ',
      delete: 'ደምስስ',
      edit: 'ኣመሓይሽ',
      loading: 'ይጽዕን ኣሎ...',
      noResults: 'ዝተረኽበ ውጽኢት የለን',
      viewProfile: 'ፕሮፋይል ርአ',
      explore: 'ዳህስስ',
      discover: 'ርከብ',
      back: 'ተመለስ',
      send: 'ስደድ',
      welcome: 'እንኳዕ ደሓን መጻእካ',
      success: 'ተዓዊቱ',
      error: 'ጌጋ',
      isFrench: false,
      langCode: 'ti',
      collaboration: 'ምትሕብባር',
      collaborations: 'ምትሕብባራት',
      noCollaborations: 'ምትሕብባር የለን'
    },
    discover: {
      searchPlaceholder: 'ብሽም ደሊ...',
      resultsCount: 'ኣብ መላእ ኣፍሪቃ ዝርከቡ {total} ስነ-ጥበበኛታት ርከብ'
    }
}, 

so: {
    nav: {
      home: 'Hoy',
      discover: 'Baadh',
      feed: 'Wararka',
      projects: 'Mashaariicda',
      messages: 'Farriimaha',
      dashboard: 'Xogta',
      statistics: 'Istaatistiga',
      signIn: 'Soo gal',
      getStarted: 'Bilaw',
      logout: 'Ka bax',
      institutionAccess: 'Galgalka Hay\'adda',
      visitorBadge: 'Booqde',
      languages: 'Luqadaha'
    },
    home: {
      tagline: 'Nidaamka Farshaxanka Afrika',
      title1: 'Isku xidh.',
      title2: 'Abuur.',
      title3: 'Wada shaqee.',
      subtitle: "Madal ugu horreysay ee loo qoondeeyay farshaxanada Afrikaanka ah. Soo bandhig shaqadaada, raadso la-shaqeeyayaal oo ku biir bulsho hal-abuur leh oo qaaradda oo dhan ah.",
      exploreArtists: 'Baadh Farshaxanada',
      joinCommunity: 'Ku biir Bulshada',
      featuredArtists: 'Farshaxanada Caanka ah',
      viewAll: 'Arag Dhammaan',
      stats: {
        artists: 'Farshaxanada',
        countries: 'Waddamada',
        sectors: 'Qaybaha Farshaxanka',
        projects: 'Wada-shaqaynta'
      },
      features: {
        portfolio: {
          title: 'Portfolio Dijital ah',
          desc: 'Ku soo bandhig shaqadaada dukumentiyo, sawirro iyo muuqaallo'
        },
        network: {
          title: 'Shabakadda Pan-Afrika',
          desc: "La xidhiidh farshaxanada Afrika oo dhan"
        },
        collaborate: {
          title: 'Wada shaqee',
          desc: 'Raadi lamaanayaal mashaariicdaada farshaxanka'
        }
      },
      joinCTA: "Ku biir bulshada\nfarshaxanka Afrika"
    },
    auth: {
      login: 'Soo gal',
      register: 'Abuur xisaab',
      email: 'Iimayl',
      password: 'Furaha',
      firstName: 'Magaca koowaad',
      lastName: 'Magaca dambe',
      country: 'Waddanka',
      subregion: 'Gobolka',
      gender: 'Lab ama Dheddig',
      sector: 'Qaybta Farshaxanka',
      domain: 'Takhasuska',
      yearStarted: 'Sanadkii aad bilaawday',
      bio: 'Taariikh nololeed',
      additionalInfo: 'Macluumaad dheeraad ah',
      website: 'Websaydh',
      alreadyAccount: 'Xisaab ma leedahay?',
      noAccount: "Xisaab ma lahayn?",
      createOne: 'Mid abuur',
      signInHere: 'Halkan ka soo gal',
      selectCountry: 'Xalano wadankaaga',
      selectSector: 'Xalano qaybtaada',
      selectDomain: 'Xalano takhasuskaaga',
      selectGender: 'Xalano jinsiga',
      visitorType: 'Nooca xisaabta',
      individual: 'Shaqsi',
      organisation: 'Urur',
      organisationName: "Magaca ururka",
      visitorInfo: "Booqde ahaan waxaad baadhi kartaa profile-yada iyo portfolio-yada farshaxanada. Ma geli kartid Feed-ka, ma daabici kartid macluumaad, mana diri kartid fariimo.",
      welcomeBack: 'Soo dhowow mar kale',
      signInTo: 'Soo gal Art Connect Africa',
      signingIn: 'Waa la gelayaa...',
      demoAccounts: 'Xisaabaadka tijaabada ah:',
      chooseAccountType: 'Xalano nooca xisaabtaada',
      joinACA: 'Ku biir Art Connect Africa',
      artist: 'Farshaxan',
      institution: 'Hay\'ad',
      visitor: 'Booqde',
      portfolioNetwork: 'Portfolio & Shabakad',
      statsAccess: 'Galgalka istaatistiga',
      exploreDiscover: 'Baadh & Soo hel',
      organizationName: "Magaca ururka",
      contactFirstName: 'Magaca koowaad ee xidhiidhka',
      contactLastName: 'Magaca dambe ee xidhiidhka',
      missionDescription: "Hadafka / Sharaxaadda ururka",
      statsAccessTitle: '📊 Galgalka istaatistiga',
      statsAccessInfo: "Diiwaangelinta ka dib, waxaad u baahan doontaa inaad samayso lacag bixin tijaabo ah si aad u hesho koodka galgalka oo aad u aragto istaatistiga faahfaahsan.",
      creating: 'Waa la abuurayaa...',
      createInstitution: 'Abuur xisaabta Hay\'adda',
      bioPlaceholder: 'Nooga sheekee naftaada iyo farshaxankaaga...',
      additionalInfoPlaceholder: 'Bandhigyo, abaalmarino, wada-shaqayn caan ah...',
      orgNamePlaceholder: 'Tusaale: Wasaaradda Hidaha iyo Dhaqanka',
      missionPlaceholder: "Sharax hadafka ururkaaga...",
      emailPlaceholder: 'xidhiidhka@ururka.org'
    },
    profile: {
      portfolio: 'Portfolio',
      about: 'Ku saabsan',
      contact: 'Xidhiidh',
      sendMessage: 'Dir Farriin',
      editProfile: 'Wax ka beddel Profile-ka',
      uploadDocument: 'Soo geli Dukumenti',
      uploadImage: 'Soo geli Sawir',
      addVideo: 'Ku dar Link Video',
      documents: 'Dukumentiyo',
      images: 'Sawirro',
      videos: 'Muuqaallo',
      memberSince: 'Xubin tan iyo',
      yearsExperience: "sano oo waayo-aragnimo ah",
      collaborationsCount: 'wada-shaqayn',
      noCollaborations: 'Ma jiraan wada-shaqayn',
      visitorBadge: 'BOOQDE',
      backToDiscover: 'Dib u laabo',
      messageSent: 'Fariintu waa martay!',
      messageFailed: "Diraaddii waa guul-darraysatay",
      writeMessage: 'Qor fariintaada...',
      send: 'Dir',
      cancel: 'Jooji',
      yrs: 'sano',
      view: 'aragti',
      views: 'aragtiyo',
      emptyPortfolio: 'Portfolio-gu waa madhan yahay'
    },
    dashboard: {
      welcome: 'Soo dhowow',
      conversations: 'Wadahadallada',
      recentMessages: 'Farriimihii u dambeeyay',
      new: 'cusub',
      findArtists: 'Raadi Farshaxano',
      add: 'Ku dar',
      title: 'Cinwaan',
      description: 'Sharaxaad',
      upload: 'Soo geli',
      chooseFile: 'Dooro fayl',
      noImages: 'Ma jiraan sawirro',
      noDocuments: 'Ma jiraان dukumentiyo',
      noVideos: 'Ma jiraan muuqaallo',
      fileUploaded: 'Faylka waa la soo geliyay!',
      videoAdded: 'Video waa la ku daray!',
      deleted: 'Waa la tirtiray!',
      addVideo: 'Ku dar video',
      image: 'Sawir',
      document: 'Dukumenti',
      video: 'Video'
    },
    projects: {
      title: 'Mashaariicda Wada-shaqaynta',
      createProject: 'Abuur Mashruuc',
      lookingFor: 'Raadinaya',
      apply: 'Codso',
      applications: 'codsiyada',
      openProjects: 'Mashaariicda Furan',
      myProjects: 'Mashaariicdayda',
      upcoming: 'Kuwa soo socda',
      ongoing: 'Hadda socda',
      past: 'Kuwii hore',
      typeLocal: 'Gudaha',
      typeIntra: 'Gudaha Afrika',
      startDate: 'Taariikhda bilowga',
      endDate: 'Taariikhda dhamaadka (Ikhtiyaari)',
      noProjects: 'Ma jiraan mashaariic hadda',
      noUpcoming: 'Ma jiraan mashaariic soo socota',
      noOngoing: 'Ma jiraan mashaariic hadda socda',
      noPast: 'Ma jiraan mashaariic hore',
      projectCreated: 'Mashruuca waa la abuuray!',
      fillRequiredFields: 'Fadlan buuxi meelaha loo baahan yahay',
      applicationSent: 'Codsiga waa la diray!',
      starts: 'Bilowga',
      ends: 'Dhamaadka',
      findCollaborators: 'Raadi la-shaqeeyayaal mashaariicdaada farshaxanka',
      type: 'Nooca wada-shaqaynta',
      location: 'Goobta',
      projectTitle: 'Cinwaanka mashruuca',
      createProjectBtn: 'Abuur mashruuc',
      sendApplication: 'Dir codsigayga'
    },
    statistics: {
      title: 'Istaatistiga & Falanqaynta',
      overview: "Guud ahaan",
      byGender: 'Jinsi ahaan',
      byCountry: 'Wadan ahaan',
      byRegion: 'Gobol ahaan',
      bySector: 'Qayb ahaan',
      requestAccess: 'Codso Galgalka Hay\'adda',
      totalArtists: 'Wadarta Farshaxanada',
      detailedStats: 'Istaatistiga Faahfaahsan',
      projectCollaborations: 'Wada-shaqayn',
      statsByType: 'Nooc ahaan',
      statsByStatus: 'Xaalad ahaan',
      statsTimeline: 'Taariikhda',
      statsTopCountries: 'Waddamada ugu sarreeya',
      interCountryGender: 'Wada-shaqaynta caalamiga ah ee jinsiga',
      genderByDomain: 'Farshaxanada jinsiga iyo takhasuska',
      visitorInterest: 'Xiisaha booqdayaasha ee profile-yada',
      women: 'Haween',
      men: 'Rag',
      other: 'Kuwo kale',
      countryPair: 'Lammaanaha waddamada',
      visitorViews: 'Aragtida booqdayaasha',
      artistCount: 'Tirada farshaxanada',
      collaborations: 'Wada-shaqaynaha',
      genderDomain: 'Jinsiga & Takhasuska',
      visitors: 'Booqdayaasha',
      postsActivity: 'Qoraallada & Firfircoonida',
      local: 'Gudaha',
      intraAfrican: 'Afrika dhexdeeda',
      visitorMessages: 'Farriimaha booqdayaasha',
      mostMessaged: 'Takhasuska loogu farriimo badan yahay',
      trendVsLastMonth: 'marka loo eego bishii hore',
      topCountryPair: 'Lammaanaha ugu firfircoon',
      genderSplit: 'Qaybinta jinsiga',
      typeSplit: 'Qaybinta nooca',
      monthlyEvolution: 'Isbeddelka bishii',
      countryPairs: 'Lammaanaha waddamada (Afrika)',
      detailedData: 'Xogta faahfaahsan',
      loading: 'Waa la raryayaa...'
    },
    messages: {
      title: 'Farriimaha',
      noConversations: 'Ma jiraan wadahadallo',
      findArtists: 'Raadi Farshaxano',
      typeMessage: 'Qor farriin...',
      selectConversation: 'Dooro wadahadal',
      back: 'Ku laabo wadahadallada',
      noMessages: 'Ma jiraan farriimo'
    },
    settings: {
      title: 'Habaynta',
      profilePhoto: 'Sawirka profile-ka',
      changePhoto: 'Beddel sawirka',
      updateProfile: 'Cusboonaysii profile-ka',
      saving: 'Waa la kaydinayaa...',
      profileUpdated: 'Profile-ka waa la cusboonaysiiyay!',
      updateFailed: 'Cusboonaysiintu way fashilantay',
      uploadFailed: "Soo gelintu way fashilantay",
      photoUpdated: 'Sawirka profile-ka waa la beddelay!',
      invalidFileType: 'Nooca faylka ma saxna. Isticmaal JPG, PNG, ama WebP',
      fileTooLarge: 'Faylka waa weyn yahay. Ugu badnaan 5MB'
    },
    feed: {
      title: 'Wararka',
      shareSomething: 'Wax la wadaag...',
      post: 'Daabac',
      noPosts: 'Ma jiraan wax la daabacay hadda',
      loadMore: 'Arag kuwo kale',
      deletePost: 'Tirtir qoraalka',
      deleteConfirm: 'Ma hubtaa inaad tirtirto qoraalkan?',
      comments: 'Faallooyinka',
      addComment: 'Ku dar faallo...',
      commentPlaceholder: 'Qor faallo...',
      community: 'Bulshada',
      newPost: 'Qoraal cusub',
      createPost: 'Samee qoraal',
      postPublished: 'Qoraalka waa la daabacay!',
      postDeleted: 'Qoraalka waa la tirtiray',
      publishing: 'Waa la daabacayaa...',
      firstToShare: 'Noqo qofka ugu horreeya ee wax la wadaaga!',
      seenItAll: 'Wada aragtay dhammaan!',
      institutionNoInteract: 'Hay\'aduhu ma fal-gali karaan',
      institutionWarning: '⚠️ Hay\'ad ahaan, waad arki kartaa wararka laakiin ma fal-gali kartid (like, faallo, ama qoraal).',
      noComments: 'Ma jiraan faallooyin',
      text: 'Qoraal',
      clickToAdd: 'Guji si aad ugu darto'
    },
    visitorProfile: {
      title: 'Profile-ka Booqdaha',
      visitorNotFound: 'Booqde lama helin',
      individual: 'Shaqsi',
      organization: 'Urur'
    },
    checkout: {
      title: 'Furo Istaatistiga',
      subtitle: 'Hel xogta dhammaystiran ee bulshada farshaxanka Afrika.',
      institutionalAccess: 'Galgalka Hay\'adda',
      demographics: 'Xogta dadka',
      geography: 'Baaxadda juquraafi',
      activityTrends: 'Firfircoonida & Isbeddellada',
      demographicsDesc: 'Jinsiga, da\'da, waddanka',
      geographyDesc: 'Gobollada Afrika ahaan',
      activityTrendsDesc: 'Qoraallada, like-yada, qaybaha',
      accessActivated: 'Galgalka waa la furay',
      mockPayment: 'Lacag-bixin Tijaabo ah',
      redirecting: 'Waa laguu gudbinayaa istaatistiga...',
      mockPaymentDesc: 'Tijaabinta lacagta — looma baahna xog bangi oo dhab ah',
      accessCode: 'Koodka galgalka',
      institutionalPlan: 'Qorshaha Hay\'adda',
      annual: 'Sannadle',
      total: 'Wadarta (tijaabo)',
      benefit1: 'Istaatistiga faahfaahsan ee jinsiga iyo waddanka',
      benefit2: 'Dashboard dhammaystiran oo falanqayn ah',
      benefit3: 'Koodh galgal oo gaar ah oo ammaan ah',
      benefit4: 'Helitaanka xogta oo aan xad lahayn',
      simulatePayment: 'Tijaabi lacagta & gal',
      noRealTransaction: '🔒 Waa tijaabo oo kaliya — lacag dhab ah ma baxayso',
      paymentAccepted: 'Lacagta waa la aqbalay! Galgalka waa furan yahay.',
      paymentError: 'Khalad baa ka dhacay lacagta',
      loginRequired: 'Waxaad u baahan tahay inaad soo gasho',
      signInInstitution: 'Fadlan ku soo gal xisaabta hay\'adda.',
      institutionsOnly: 'Hay\'adaha oo kaliya',
      accessReserved: 'Galgalkan waxaa loogu talagalay xisaabaadka Hay\'adaha.',
      viewPublicStats: 'Arag istaatistiga dadwaynaha',
      processing: 'Waa la shaqaynayaa...'
    },
    common: {
      search: 'Raadi',
      filter: 'Sifee',
      all: 'Dhammaan',
      save: 'Keydi',
      cancel: 'Jooji',
      delete: 'Tirtir',
      edit: 'Wax ka beddel',
      loading: 'Wuu raran yahay...',
      noResults: 'Wax natiijo ah lama helin',
      viewProfile: 'Arag Profile-ka',
      explore: 'Baadh',
      discover: 'Soo hel',
      back: 'Dib u laabo',
      send: 'Dir',
      welcome: 'Ku soo dhawaaw',
      success: 'Guul',
      error: 'Khalad',
      isFrench: false,
      langCode: 'so',
      collaboration: 'wada-shaqayn',
      collaborations: 'wada-shaqaynaha',
      noCollaborations: 'Ma jiraan wada-shaqayn'
    },
    discover: {
      searchPlaceholder: 'Ku raadi magac...',
      resultsCount: 'Soo hel {total} farshaxan oo Afrika oo dhan ah'
    }
}, 

am: {
    nav: {
      home: 'መነሻ',
      discover: 'አግኝ',
      feed: 'ዜናዎች',
      projects: 'ፕሮጀክቶች',
      messages: 'መልዕክቶች',
      dashboard: 'ዳሽቦርድ',
      statistics: 'ስታቲስቲክስ',
      signIn: 'ግባ',
      getStarted: 'ጀምር',
      logout: 'ውጣ',
      institutionAccess: 'የተቋም መግቢያ',
      visitorBadge: 'ጎብኚ',
      languages: 'ቋንቋዎች'
    },
    home: {
      tagline: 'የአፍሪካ የጥበብ ሥነ-ምህዳር',
      title1: 'ተገናኝ።',
      title2: 'ፍጠር።',
      title3: 'ተባበር።',
      subtitle: "ለአፍሪካውያን የጥበብ ባለሙያዎች የተዘጋጀ የመጀመሪያው መድረክ። ስራዎችዎን ያሳዩ፣ አጋሮችን ያግኙ እና በመላው አህጉሩ ካለው የፈጠራ ማህበረሰብ ጋር ይቀላቀሉ።",
      exploreArtists: 'ባለሙያዎችን ፈልግ',
      joinCommunity: 'ማህበረሰቡን ተቀላቀል',
      featuredArtists: 'ተለይተው የታወቁ ባለሙያዎች',
      viewAll: 'ሁሉንም ተመልከት',
      stats: {
        artists: 'ባለሙያዎች',
        countries: 'ሃገራት',
        sectors: 'የጥበብ ዘርፎች',
        projects: 'ትብብሮች'
      },
      features: {
        portfolio: {
          title: 'ዲጂታል ፖርትፎሊዮ',
          desc: 'ስራዎችዎን በሰነዶች፣ በምስሎች እና በቪዲዮዎች ያሳዩ'
        },
        network: {
          title: 'አህጉራዊ መረብ',
          desc: "በመላው አፍሪካ ከሚገኙ የጥበብ ባለሙያዎች ጋር ይገናኙ"
        },
        collaborate: {
          title: 'ተባበር',
          desc: 'ለጥበብ ፕሮጀክቶችዎ አጋሮችን ያግኙ'
        }
      },
      joinCTA: "የአፍሪካ የጥበብ ማህበረሰብን\nተቀላቀሉ"
    },
    auth: {
      login: 'ግባ',
      register: 'አካውንት ክፈት',
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      firstName: 'ስም',
      lastName: 'የአባት ስም',
      country: 'ሃገር',
      subregion: 'ንዑስ ዞባ',
      gender: 'ጾታ',
      sector: 'የጥበብ ዘርፍ',
      domain: 'የሙያ መስክ',
      yearStarted: 'የተጀመረበት ዓመት',
      bio: 'የህይወት ታሪክ',
      additionalInfo: 'ተጨማሪ መረጃ',
      website: 'ድረ-ገጽ',
      alreadyAccount: 'አካውንት አለዎት?',
      noAccount: "አካውንት የለዎትም?",
      createOne: 'አዲስ ይክፈቱ',
      signInHere: 'እዚህ ይግቡ',
      selectCountry: 'ሃገርዎን ይምረጡ',
      selectSector: 'ዘርፍዎን ይምረጡ',
      selectDomain: 'የሙያ መስክዎን ይምረጡ',
      selectGender: 'ጾታ ይምረጡ',
      visitorType: 'የአካውንት አይነት',
      individual: 'ግለሰብ',
      organisation: 'ድርጅት',
      organisationName: "የድርጅት ስም",
      visitorInfo: "እንደ ጎብኚ የባለሙያዎችን ፕሮፋይል እና ስራዎች ማየት ይችላሉ። ዜናዎችን ማየት፣ መለጠፍ ወይም መልዕክት መላክ ግን አይችሉም።",
      welcomeBack: 'እንኳን ደህና መጡ',
      signInTo: 'ወደ Art Connect Africa ይግቡ',
      signingIn: 'በመግባት ላይ...',
      demoAccounts: 'የሙከራ አካውንቶች፡',
      chooseAccountType: 'የአካውንት አይነትዎን ይምረጡ',
      joinACA: 'Art Connect Africa-ን ይቀላቀሉ',
      artist: 'ባለሙያ',
      institution: 'ተቋም',
      visitor: 'ጎብኚ',
      portfolioNetwork: 'ፖርትፎሊዮ እና መረብ',
      statsAccess: 'የስታቲስቲክስ መግቢያ',
      exploreDiscover: 'ፈልግ እና አግኝ',
      contactFirstName: 'የእውቂያ ሰው ስም',
      contactLastName: 'የእውቂያ ሰው የአባት ስም',
      missionDescription: "የድርጅቱ ተልዕኮ / መግለጫ",
      statsAccessTitle: '📊 የስታቲስቲክስ መግቢያ',
      statsAccessInfo: "ከምዝገባ በኋላ፣ የመግቢያ ኮድ ለማግኘት እና ዝርዝር ስታቲስቲክስ ለማየት የሙከራ ክፍያ መክፈል ይኖርብዎታል።",
      creating: 'በመፍጠር ላይ...',
      createInstitution: 'የተቋም አካውንት ክፈት',
      bioPlaceholder: 'ስለ እርስዎ እና ስለ ጥበብዎ ይንገሩን...',
      additionalInfoPlaceholder: 'ኤግዚቢሽኖች፣ ሽልማቶች፣ የታወቁ ትብብሮች...',
      orgNamePlaceholder: 'ምሳሌ፡ የባህልና ስፖርት ሚኒስቴር',
      missionPlaceholder: "የድርጅትዎን ተልዕኮ ይግለጹ...",
      emailPlaceholder: 'contact@organisation.org'
    },
    profile: {
      portfolio: 'ፖርትፎሊዮ',
      about: 'ስለ',
      contact: 'እውቂያ',
      sendMessage: 'መልዕክት ላክ',
      editProfile: 'ፕሮፋይል አስተካክል',
      uploadDocument: 'ሰነድ ጫን',
      uploadImage: 'ምስል ጫን',
      addVideo: 'የቪዲዮ ሊንክ ጨምር',
      documents: 'ሰነዶች',
      images: 'ምስሎች',
      videos: 'ቪዲዮዎች',
      memberSince: 'አባል የሆኑበት ጊዜ',
      yearsExperience: "የስራ ልምድ ዓመታት",
      collaborationsCount: 'ትብብር(ሮች)',
      noCollaborations: 'ምንም ትብብር የለም',
      visitorBadge: 'ጎብኚ',
      backToDiscover: 'ተመለስ',
      messageSent: 'መልዕክቱ ተልኳል!',
      messageFailed: "መላክ አልተሳካም",
      writeMessage: 'መልዕክትዎን ይጻፉ...',
      send: 'ላክ',
      cancel: 'ሰርዝ',
      yrs: 'ዓመታት',
      view: 'እይታ',
      views: 'እይታዎች',
      emptyPortfolio: 'በፖርትፎሊዮው ውስጥ ምንም ነገር የለም'
    },
    dashboard: {
      welcome: 'እንኳን ደህና መጡ',
      conversations: 'ንግግሮች',
      recentMessages: 'የቅርብ መልዕክቶች',
      new: 'አዲስ',
      findArtists: 'ባለሙያዎችን ፈልግ',
      add: 'ጨምር',
      title: 'ርዕስ',
      description: 'መግለጫ',
      upload: 'ጫን',
      chooseFile: 'ፋይል ምረጥ',
      noImages: 'ምንም ምስል የለም',
      noDocuments: 'ምንም ሰነድ የለም',
      noVideos: 'ምንም ቪዲዮ የለም',
      fileUploaded: 'ፋይሉ ተጭኗል!',
      videoAdded: 'ቪዲዮው ተጨምሯል!',
      deleted: 'ተሰርዟል!',
      addVideo: 'ቪዲዮ ጨምር',
      image: 'ምስል',
      document: 'ሰነድ',
      video: 'ቪዲዮ'
    },
    projects: {
      title: 'የትብብር ፕሮጀክቶች',
      createProject: 'ፕሮጀክት ፍጠር',
      lookingFor: 'የሚፈለግ',
      apply: 'አመልክት',
      applications: 'ማመልከቻዎች',
      openProjects: 'ክፍት ፕሮጀክቶች',
      myProjects: 'የእኔ ፕሮጀክቶች',
      upcoming: 'የሚመጡ',
      ongoing: 'በሂደት ላይ',
      past: 'ያለፉ',
      typeLocal: 'የሃገር ውስጥ',
      typeIntra: 'አህጉራዊ (አፍሪካ)',
      startDate: 'የመጀመሪያ ቀን',
      endDate: 'የማለቂያ ቀን (አማራጭ)',
      noProjects: 'በአሁኑ ጊዜ ምንም ፕሮጀክት የለም',
      noUpcoming: 'ምንም የሚመጣ ፕሮጀክት የለም',
      noOngoing: 'በሂደት ላይ ያለ ፕሮጀክት የለም',
      noPast: 'ምንም ያለፈ ፕሮጀክት የለም',
      projectCreated: 'ፕሮጀክቱ ተፈጥሯል!',
      fillRequiredFields: 'እባክዎን አስፈላጊ ቦታዎችን ይሙሉ',
      applicationSent: 'ማመልከቻው ተልኳል!',
      starts: 'ይጀምራል',
      ends: 'ያበቃል',
      findCollaborators: 'ለጥበብ ፕሮጀክቶችዎ አጋሮችን ይፈልጉ',
      type: 'የትብብር አይነት',
      location: 'ቦታ',
      projectTitle: 'የፕሮጀክት ርዕስ',
      createProjectBtn: 'ፕሮጀክት ፍጠር',
      sendApplication: 'ማመልከቻዬን ላክ'
    },
    statistics: {
      title: 'ስታቲስቲክስ እና ትንተና',
      overview: "አጠቃላይ እይታ",
      byGender: 'በጾታ',
      byCountry: 'በሃገር',
      byRegion: 'በቀጣና',
      bySector: 'በዘርፍ',
      requestAccess: 'የተቋም መግቢያ ጠይቅ',
      totalArtists: 'ጠቅላላ ባለሙያዎች',
      detailedStats: 'ዝርዝር ስታቲስቲክስ',
      projectCollaborations: 'ትብብሮች',
      statsByType: 'በአይነት',
      statsByStatus: 'በሁኔታ',
      statsTimeline: 'ታሪክ',
      statsTopCountries: 'ዋና ዋና ሃገራት',
      interCountryGender: 'የሃገራት ትብብር በጾታ',
      genderByDomain: 'ባለሙያዎች በጾታ እና በሙያ',
      visitorInterest: 'የጎብኚዎች ፍላጎት በፕሮፋይል',
      women: 'ሴቶች',
      men: 'ወንዶች',
      other: 'ሌላ',
      countryPair: 'የሃገራት ጥምረት',
      visitorViews: 'የጎብኚዎች እይታ',
      artistCount: 'የባለሙያዎች ብዛት',
      collaborations: 'ትብብሮች',
      genderDomain: 'ጾታ እና ሙያ',
      visitors: 'ጎብኚዎች',
      postsActivity: 'ልጥፎች እና እንቅስቃሴዎች',
      local: 'የሃገር ውስጥ',
      intraAfrican: 'አህጉራዊ',
      visitorMessages: 'የጎብኚዎች መልዕክት',
      mostMessaged: 'ብዙ መልዕክት የተላከበት ሙያ',
      trendVsLastMonth: 'ካለፈው ወር ጋር ሲነጻጸር',
      topCountryPair: 'ንቁ የሃገራት ጥምረት',
      genderSplit: 'የጾታ ስርጭት',
      typeSplit: 'የአይነት ስርጭት',
      monthlyEvolution: 'የወር እድገት',
      countryPairs: 'የሃገራት ጥምረት (አፍሪካ)',
      detailedData: 'ዝርዝር መረጃ',
      loading: 'በመጫን ላይ...'
    },
    messages: {
      title: 'መልዕክቶች',
      noConversations: 'ምንም ንግግር የለም',
      findArtists: 'ባለሙያዎችን ፈልግ',
      typeMessage: 'መልዕክት ይጻፉ...',
      selectConversation: 'ንግግር ይምረጡ',
      back: 'ወደ ንግግሮች ተመለስ',
      noMessages: 'ምንም መልዕክት የለም'
    },
    settings: {
      title: 'ቅንብሮች',
      profilePhoto: 'የፕሮፋይል ፎቶ',
      changePhoto: 'ፎቶ ቀይር',
      updateProfile: 'ፕሮፋይል አድስ',
      saving: 'በመቀመጥ ላይ...',
      profileUpdated: 'ፕሮፋይሉ ታድሷል!',
      updateFailed: 'ማደስ አልተሳካም',
      uploadFailed: "መጫን አልተሳካም",
      photoUpdated: 'የፕሮፋይል ፎቶ ተቀይሯል!',
      invalidFileType: 'ትክክለኛ ያልሆነ የፋይል አይነት። JPG, PNG ወይም WebP ይጠቀሙ',
      fileTooLarge: 'ፋይሉ በጣም ትልቅ ነው። ከፍተኛው 5MB'
    },
    feed: {
      title: 'ዜናዎች',
      shareSomething: 'አንድ ነገር ያካፍሉ...',
      post: 'ልጠፍ',
      noPosts: 'በአሁኑ ጊዜ ምንም ልጥፍ የለም',
      loadMore: 'ተጨማሪ አሳይ',
      deletePost: 'ልጥፍ አጥፋ',
      deleteConfirm: 'ይህን ልጥፍ ማጥፋትዎን እርግጠኛ ነዎት?',
      comments: 'አስተያየቶች',
      addComment: 'አስተያየት ጨምር...',
      commentPlaceholder: 'አስተያየት ይጻፉ...',
      community: 'ማህበረሰብ',
      newPost: 'አዲስ ልጥፍ',
      createPost: 'ልጥፍ ፍጠር',
      postPublished: 'ልጥፉ ወጥቷል!',
      postDeleted: 'ልጥፉ ተሰርዟል',
      publishing: 'በመለጠፍ ላይ...',
      firstToShare: 'የመጀመሪያው ተካፋይ ይሁኑ!',
      seenItAll: 'ሁሉንም አይተዋል!',
      institutionNoInteract: 'ተቋማት መሳተፍ አይችሉም',
      institutionWarning: '⚠️ እንደ ተቋም ዜናዎችን ማየት ይችላሉ እንጂ መሳተፍ (ላይክ፣ አስተያየት መስጠት ወይም መለጠፍ) አይችሉም።',
      noComments: 'ምንም አስተያየት የለም',
      text: 'ጽሁፍ',
      clickToAdd: 'ለመጨመር ይጫኑ'
    },
    visitorProfile: {
      title: 'የጎብኚ ፕሮፋይል',
      visitorNotFound: 'ጎብኚው አልተገኘም',
      individual: 'ግለሰብ',
      organization: 'ድርጅት'
    },
    checkout: {
      title: 'ስታቲስቲክስን ክፈት',
      subtitle: 'የአፍሪካ ጥበብ ማህበረሰብን ሙሉ መረጃ ያግኙ።',
      institutionalAccess: 'የተቋም መግቢያ',
      demographics: 'የህዝብ መረጃ',
      geography: 'ጂኦግራፊያዊ ሽፋን',
      activityTrends: 'እንቅስቃሴዎች እና አዝማሚያዎች',
      demographicsDesc: 'ጾታ፣ እድሜ፣ ሃገር',
      geographyDesc: 'በአፍሪካ ቀጣናዎች',
      activityTrendsDesc: 'ልጥፎች፣ ላይኮች፣ ዘርፎች',
      accessActivated: 'መግቢያው ተከፍቷል',
      mockPayment: 'የሙከራ ክፍያ',
      redirecting: 'ወደ ስታቲስቲክስ እየወሰደዎት ነው...',
      mockPaymentDesc: 'የክፍያ ሙከራ — ምንም አይነት የባንክ መረጃ አያስፈልግም',
      accessCode: 'የመግቢያ ኮድ',
      institutionalPlan: 'የተቋም እቅድ',
      annual: 'ዓመታዊ',
      total: 'ጠቅላላ (ሙከራ)',
      benefit1: 'ዝርዝር ስታቲስቲክስ በጾታ እና በሃገር',
      benefit2: 'ሙሉ የትንተና ዳሽቦርድ',
      benefit3: 'ልዩ እና ደህንነቱ የተጠበቀ የመግቢያ ኮድ',
      benefit4: 'ያልተገደበ የመረጃ ተደራሽነት',
      simulatePayment: 'ክፍያውን ሞክር እና እይ',
      noRealTransaction: '🔒 ሙከራ ብቻ ነው — እውነተኛ የገንዘብ ዝውውር የለም',
      paymentAccepted: 'ክፍያው ተቀባይነት አግኝቷል! መግቢያ ተፈቅዷል።',
      paymentError: 'የክፍያ ስህተት',
      loginRequired: 'መግባት ያስፈልጋል',
      signInInstitution: 'እባክዎን በተቋም አካውንት ይግቡ።',
      institutionsOnly: 'ለተቋማት ብቻ',
      accessReserved: 'ይህ መግቢያ ለተቋም አካውንቶች ብቻ የተፈቀደ ነው።',
      viewPublicStats: 'የህዝብ ስታቲስቲክስን ይመልከቱ',
      processing: 'በመሰራት ላይ...'
    },
    common: {
      search: 'ፈልግ',
      filter: 'አጣራ',
      all: 'ሁሉም',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      delete: 'አጥፋ',
      edit: 'አስተካክል',
      loading: 'በመጫን ላይ...',
      noResults: 'ምንም ውጤት አልተገኘም',
      viewProfile: 'ፕሮፋይል ይመልከቱ',
      explore: 'ዳስስ',
      discover: 'አግኝ',
      back: 'ተመለስ',
      send: 'ላክ',
      welcome: 'እንኳን ደህና መጡ',
      success: 'ተሳክቷል',
      error: 'ስህተት',
      isFrench: false,
      langCode: 'am',
      collaboration: 'ትብብር',
      collaborations: 'ትብብሮች',
      noCollaborations: 'ምንም ትብብር የለም'
    },
    discover: {
      searchPlaceholder: 'በስም ይፈልጉ...',
      resultsCount: 'በመላው አፍሪካ የሚገኙ {total} ባለሙያዎችን ያግኙ'
    }
}
};

// Fill placeholders with English (to be translated later)


// Language Store
export const useLanguageStore = create((set, get) => ({
  language: localStorage.getItem('aca_language') || 'fr',
  t: translations[localStorage.getItem('aca_language') || 'fr'] || translations.en,
  availableLanguages,
  
  setLanguage: (langCode) => {
    localStorage.setItem('aca_language', langCode);
    // Fall back to English for untranslated languages
    const translation = translations[langCode] || translations.en;
    set({ language: langCode, t: translation });
    
    // Handle RTL for Arabic
    const language = availableLanguages.find(l => l.code === langCode);
    if (language?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  },
  
  toggleLanguage: () => {
    const newLang = get().language === 'fr' ? 'en' : 'fr';
    localStorage.setItem('aca_language', newLang);
    const translation = translations[newLang] || translations.en;
    set({ language: newLang, t: translation });
    document.documentElement.dir = 'ltr';
  }
}));

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('aca_token'),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  // ✅ FIX: Added missing clearError action.
  // Login.jsx calls clearError() before each attempt to wipe stale errors from
  // previous failed logins. Without this, the old error message stays on screen
  // even after a successful retry, and isLoading can appear stuck.
  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('aca_token', token);
      set({ user, token, isLoading: false });
      return { success: true, user };
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
      localStorage.setItem('aca_token', token);
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
        headers: { Authorization: `Bearer ${token}` }
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
  countries: [], subregions: [], sectors: [], domains: {}, genders: [], isLoaded: false,
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
        countries: countriesRes.data, subregions: subregionsRes.data,
        sectors: sectorsRes.data, domains: domainsRes.data,
        genders: gendersRes.data, isLoaded: true
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  }
}));

// Artists Store
export const useArtistsStore = create((set, get) => ({
  artists: [], featuredArtists: [], currentArtist: null, total: 0, isLoading: false,
  filters: { search: '', country: '', subregion: '', sector: '', domain: '', gender: '' },
  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  resetFilters: () => set({ filters: { search: '', country: '', subregion: '', sector: '', domain: '', gender: '' } }),
  fetchArtists: async () => {
    set({ isLoading: true });
    const { filters } = get();
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => { if (value) params.append(key, value); });
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
      // Silently record visit for visitor tracking (debounced per session)
      const { user, token } = useAuthStore.getState();
      if (!user || user.role === 'visitor') {
        if (!_visitorViewedSet.has(id)) {
          _visitorViewedSet.add(id);
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          axios.post(`${API}/artists/${id}/view`, {}, { headers }).catch(() => {});
        }
      }
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
    try {
      const res = await axios.get(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ conversations: res.data });
    } catch (err) {
      console.warn('Failed to fetch conversations:', err);
    }
  },

  markAsRead: async (userId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      await axios.patch(`${API}/messages/${userId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.user.id === userId ? { ...conv, unread_count: 0 } : conv
        ),
      }));
    } catch (err) {
      console.warn('Failed to mark as read', err);
    }
  },

  fetchMessages: async (userId) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      await get().markAsRead(userId);
      const res = await axios.get(`${API}/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ currentMessages: res.data, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },

  

   sendMessage: async (userId, content) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await axios.post(`${API}/messages`, { 
        receiver_id: userId,
        content 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Format the last_message to match conversation structure
      const lastMessage = {
        content: res.data.content,
        created_at: res.data.created_at,
        sender_type: res.data.sender_type
      };
      
      set((state) => ({
        currentMessages: [...state.currentMessages, res.data],
        conversations: state.conversations.map((conv) =>
          conv.user.id === userId ? { ...conv, last_message: lastMessage } : conv
        ),
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.detail || 'Failed to send message' };
    }
  },
  
  clearCurrentMessages: () => set({ currentMessages: [] }),
}));


// Projects Store
export const useProjectsStore = create((set, get) => ({
  projects: [], isLoading: false,
  statusFilter: null, typeFilter: null,
  setStatusFilter: (status) => set({ statusFilter: status }),
  setTypeFilter: (type) => set({ typeFilter: type }),
  fetchProjects: async (sector = null) => {
    set({ isLoading: true });
    try {
      const { statusFilter, typeFilter } = get();
      const queryParams = new URLSearchParams();
      if (sector) queryParams.append('sector', sector);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (typeFilter) queryParams.append('collaboration_type', typeFilter);
      
      const paramsStr = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const response = await axios.get(`${API}/projects${paramsStr}`);
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
      const response = await axios.post(`${API}/projects`, projectData, { headers: { Authorization: `Bearer ${token}` } });
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
      await axios.post(`${API}/projects/${projectId}/apply?message=${encodeURIComponent(message)}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to apply' };
    }
  }
}));

// Statistics Store
export const useStatisticsStore = create((set) => ({
  overview: null, detailed: null, collaborations: null,
  genderByDomain: null, visitorInterest: null,
  isLoading: false, hasInstitutionAccess: false,
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
  fetchDetailed: async (sector = null, profileTag = null) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (sector) params.append('sector', sector);
      if (profileTag) params.append('profile_tag', profileTag);
      const response = await axios.get(`${API}/statistics/detailed?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      set({ detailed: response.data, hasInstitutionAccess: true, isLoading: false });
    } catch (error) {
      console.error('Error fetching detailed statistics:', error);
      set({ isLoading: false, hasInstitutionAccess: false });
    }
  },
  fetchCollaborationStats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/statistics/collaborations`, { headers: { Authorization: `Bearer ${token}` } });
      const data = response.data;
      set({
        collaborations: data,
        genderByDomain: data.by_gender_domain || [],
        visitorInterest: data.by_country_gender_domain || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching collaboration statistics:', error);
      set({ isLoading: false });
    }
  },
  reset: () => set({ overview: null, detailed: null, collaborations: null, genderByDomain: null, visitorInterest: null, isLoading: false })
}));

// Visitor Store
export const useVisitorStore = create((set, get) => ({
  viewedProfiles: new Set(),
  trackProfileView: async (artistId, token) => {
    const { viewedProfiles } = get();
    if (viewedProfiles.has(artistId)) return; // debounce: once per session
    set((state) => ({ viewedProfiles: new Set([...state.viewedProfiles, artistId]) }));
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/artists/${artistId}/view`, {}, { headers });
    } catch (e) {
      // Silent fail — tracking should never impact UX
    }
  }
}));

// Institution Payment Store
export const useInstitutionStore = create((set) => ({
  hasPaid: localStorage.getItem('institution_paid') === 'true',
  accessCode: localStorage.getItem('institution_code') || null,
  paidAt: localStorage.getItem('institution_paid_at') || null,
  isLoading: false,
  setPayment: (code, paidAt) => {
    localStorage.setItem('institution_paid', 'true');
    localStorage.setItem('institution_code', code);
    localStorage.setItem('institution_paid_at', paidAt);
    set({ hasPaid: true, accessCode: code, paidAt });
  },
  hydrateFromBackend: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return { hasPaid: false, accessCode: null, paidAt: null };
    try {
      const response = await axios.get(`${API}/payments/status`, { headers: { Authorization: `Bearer ${token}` } });
      const { has_paid, access_code, paid_at } = response.data;
      if (has_paid && access_code) {
        localStorage.setItem('institution_paid', 'true');
        localStorage.setItem('institution_code', access_code);
        localStorage.setItem('institution_paid_at', paid_at || '');
        set({ hasPaid: true, accessCode: access_code, paidAt: paid_at });
        return { hasPaid: true, accessCode: access_code, paidAt: paid_at };
      }
      return { hasPaid: !!has_paid, accessCode: access_code || null, paidAt: paid_at || null };
    } catch (e) {
      console.error('Failed to hydrate institution store:', e);
      return { hasPaid: false, accessCode: null, paidAt: null };
    }
  },
  mockCheckout: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API}/payments/mock-checkout`, {}, { headers: { Authorization: `Bearer ${token}` } });
      const { access_code, paid_at } = response.data;
      localStorage.setItem('institution_paid', 'true');
      localStorage.setItem('institution_code', access_code);
      localStorage.setItem('institution_paid_at', paid_at || '');
      set({ hasPaid: true, accessCode: access_code, paidAt: paid_at, isLoading: false });
      return { success: true, access_code };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.detail || 'Payment failed' };
    }
  },
  reset: () => {
    localStorage.removeItem('institution_paid');
    localStorage.removeItem('institution_code');
    localStorage.removeItem('institution_paid_at');
    set({ hasPaid: false, accessCode: null, paidAt: null });
  }
}));

export const useFeedStore = create((set, get) => ({
  posts: [], isLoading: false, hasMore: true,
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
      set({ posts: reset ? newPosts : [...posts, ...newPosts], hasMore: newPosts.length === 10, isLoading: false });
    } catch (error) {
      console.error('Error fetching posts:', error);
      set({ isLoading: false });
    }
  },


  createPost: async (postData) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const response = await axios.post(`${API}/posts`, postData, { headers: { Authorization: `Bearer ${token}` } });
      set((state) => ({ posts: [response.data, ...state.posts] }));
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
    formData.append('text_content', textContent || '');
    set({ isLoading: true });
    try {
      const response = await axios.post(`${API}/posts/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set((state) => ({ posts: [response.data, ...state.posts], isLoading: false }));
      return { success: true, post: response.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.detail || 'Failed to upload post' };
    }
  },
  toggleLike: async (postId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const response = await axios.post(`${API}/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      set((state) => ({
        posts: state.posts.map(post =>
          post.id === postId ? { ...post, is_liked: response.data.liked, likes_count: response.data.likes_count } : post
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
      await axios.delete(`${API}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      set((state) => ({ posts: state.posts.filter(post => post.id !== postId) }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to delete post' };
    }
  },
  resetPosts: () => set({ posts: [], hasMore: true })
}));

// Comments Store
export const useCommentsStore = create((set) => ({
  comments: {}, isLoading: false,
  fetchComments: async (postId) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API}/posts/${postId}/comments`);
      set((state) => ({ comments: { ...state.comments, [postId]: response.data }, isLoading: false }));
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
      const response = await axios.post(`${API}/posts/${postId}/comments`, { content }, { headers: { Authorization: `Bearer ${token}` } });
      set((state) => ({ comments: { ...state.comments, [postId]: [...(state.comments[postId] || []), response.data] } }));
      return { success: true, comment: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to add comment' };
    }
  },
  deleteComment: async (postId, commentId) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };
    try {
      await axios.delete(`${API}/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      set((state) => ({ comments: { ...state.comments, [postId]: (state.comments[postId] || []).filter(c => c.id !== commentId) } }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Failed to delete comment' };
    }
  }
}));

// Portfolio Store
export const usePortfolioStore = create((set) => ({
  isUploading: false,
  uploadFile: async (file, fileType, title, description = '') => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    formData.append('title', title);
    formData.append('description', description);

    set({ isUploading: true });
    try {
      await axios.post(`${API}/portfolio/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ isUploading: false });
      return { success: true };
    } catch (err) {
      set({ isUploading: false });
      return { success: false, error: err.response?.data?.detail || 'Upload failed' };
    }
  },
  
  addVideo: async (file, title, description) => {
    const token = useAuthStore.getState().token;
    if (!token) return { success: false };
    const formData = new FormData();
    formData.append('file', file);
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
      await axios.delete(`${API}/portfolio/${itemType}/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });
      await useAuthStore.getState().fetchUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Delete failed' };
    }
  }
}));
