import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.JWT_SECRET || "artconnect-secret-key";

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded media statically
app.use("/api/uploads", express.static(uploadsDir));

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit to easily handle high-quality videos and photos
});

// In-memory data stores (MOCKED)
const users = new Map();
const posts = new Map();
const comments = new Map();
const news = new Map();
const projects = new Map();

// Seed Admin User & Fictitious Users
const seedDummyUsers = async (count = 450) => {
  if (users.size > 10) return;
  const sectors = ["Arts Visuels", "Musique", "Cinéma", "Littérature", "Arts du Spectacle", "Mode", "Art Numérique"];
  const domainsMap: Record<string, string[]> = {
    "Arts Visuels": ["Peinture", "Sculpture", "Photographie", "Art Numérique", "Illustration"],
    "Musique": ["Composition", "Interprétation / Chant", "Production / Beatmaking", "Ingénierie du son"],
    "Cinéma": ["Réalisation", "Jeu d'acteur", "Cadrage / Image", "Montage"],
    "Littérature": ["Poésie", "Roman / Fiction", "Essai"],
    "Arts du Spectacle": ["Théâtre", "Danse / Chorégraphie", "Humour"],
    "Mode": ["Stylisme", "Modélisme", "Design de Mode"],
    "Art Numérique": ["Création 3D", "Artiste IA", "Design Interactif"]
  };
  const citiesByCountry: Record<string, string[]> = {
    "Algeria": ["Alger", "Oran", "Constantine", "Annaba"],
    "Egypt": ["Le Caire", "Alexandrie", "Gizeh", "Louxor"],
    "Libya": ["Tripoli", "Benghazi", "Misrata"],
    "Morocco": ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger"],
    "Mauritania": ["Nouakchott", "Nouadhibou"],
    "Tunisia": ["Tunis", "Sfax", "Sousse"],
    "Nigeria": ["Lagos", "Abuja", "Kano", "Ibadan"],
    "Senegal": ["Dakar", "Saint-Louis", "Touba", "Thiès"],
    "Cameroon": ["Douala", "Yaoundé", "Garoua", "Bafoussam"],
    "DRC": ["Kinshasa", "Lubumbashi", "Goma"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
    "Ethiopia": ["Addis-Abeba", "Dire Dawa"],
    "South Africa": ["Le Cap", "Johannesbourg", "Durban", "Pretoria"],
    "Angola": ["Luanda", "Huambo", "Lobito"],
    "Côte d'Ivoire": ["Abidjan", "Yamoussoukro", "Bouaké"]
  };
  const profileTags = ["artist", "professional", "media"];
  const firstNames = ["Amara", "Kofi", "Fatima", "Moussa", "Zainab", "Chidi", "Olumide", "Nneka", "Kwame", "Abeba", "Tariq", "Yasmine", "Omar", "Amina", "Lamine", "Malick", "Aissatou", "Modou", "Ibrahima", "Samba", "Nour", "Mariam", "Salma", "Khaled", "Farida"];
  const lastNames = ["Diop", "Mensah", "Diallo", "Traore", "Okonkwo", "Kamau", "Bekele", "Sow", "Keita", "Bamba", "Fall", "Sane", "Gueye", "Ndiaye", "Cisse", "El-Sayed", "Hassan", "Mansour", "Gharbi", "Benali"];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const countryObj = AFRICAN_COUNTRIES[Math.floor(Math.random() * AFRICAN_COUNTRIES.length)];
    const cityList = citiesByCountry[countryObj.name] || ["Capitale"];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    const domain = sectors[Math.floor(Math.random() * sectors.length)];
    const sectorList = domainsMap[domain] || ["Général"];
    const sector = sectorList[Math.floor(Math.random() * sectorList.length)];
    const profileTag = profileTags[Math.random() < 0.7 ? 0 : (Math.random() < 0.6 ? 1 : 2)];
    const gender = Math.random() > 0.48 ? "women" : "men";

    const email = `artist${i}_${Date.now()}@artconnect.africa`;
    const userId = uuidv4();
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      first_name: fName,
      last_name: lName,
      country: countryObj.name,
      city,
      subregion: countryObj.subregion,
      sector,
      domain,
      gender,
      account_type: "artist",
      role: "artist",
      profile_tag: profileTag,
      approval_status: "approved",
      is_dummy: true,
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fName}${lName}${i}`,
      bio: `Artiste professionnel (${domain} - ${sector}) basé à ${city}, ${countryObj.name}.`
    };
    users.set(email, newUser);
  }
};

const seedPosts = async () => {
  const userList = Array.from(users.values());
  if (userList.length < 2) return;
  
  for (let i = 0; i < 20; i++) {
    const author = userList[Math.floor(Math.random() * userList.length)];
    const postId = uuidv4();
    posts.set(postId, {
      id: postId,
      author_id: author.id,
      author: sanitizeUser(author),
      text_content: `Ceci est le post numéro ${i + 1} de ${author.first_name}!`,
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24).toISOString(),
      likes: Math.floor(Math.random() * 50)
    });
  }
};

const seedAdmin = async () => {
  const adminEmail = "info@kolaconsulting.net";
  const hashedPassword = await bcrypt.hash("artconnect", 10);
  users.set(adminEmail, {
    id: "admin-1",
    email: adminEmail,
    password: hashedPassword,
    first_name: "Admin",
    last_name: "Kola",
    account_type: "admin",
    role: "admin",
    approval_status: "approved",
    created_at: new Date().toISOString(),
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin"
  });
  await seedDummyUsers(450);
  await seedPosts();
  seedProjects();
  seedNews();
};
seedAdmin();

const seedNews = () => {
  const sampleNews = [
    {
      id: "news_1",
      title: "Lancement de la plateforme de collaboration artistique Kola Consulting",
      content: "Nous sommes fiers d'annoncer le lancement de notre nouvelle plateforme favorisant l'interconnexion entre artistes, professionnels de la culture et médias à travers l'Afrique et le monde. Rejoignez-nous pour co-créer, échanger et propulser vos projets vers de nouveaux horizons.",
      media_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "news_2",
      title: "Forum de la Co-création Culturelle en Afrique de l'Ouest",
      content: "La semaine prochaine débutera le premier Forum en ligne dédié aux partenariats artistiques régionaux. Au programme : webinaires thématiques, sessions de pitch et rencontres B2B pour stimuler l'intra-régionalité culturelle.",
      media_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "news_3",
      title: "Appel à projets : Résidences croisées Afrique - Europe",
      content: "Découvrez toutes les opportunités de résidences artistiques de recherche et de création pour l'année 2026-2027. Les candidatures sont ouvertes pour les artistes de toutes disciplines souhaitant développer des collaborations transnationales.",
      media_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80",
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  sampleNews.forEach(item => news.set(item.id, item));
};

const seedProjects = () => {
  const userList = Array.from(users.values());
  if (userList.length === 0) return;
  const sampleProjects = [
    {
      id: "p1",
      title: "Festival Pan-Africain du Film Indépendant",
      description: "Un projet collaboratif visant à réunir des cinéastes d'Afrique de l'Ouest et du Nord pour une coproduction de courts-métrages documentaires.",
      sector: "Cinéma",
      looking_for: ["Réalisation", "Cadrage / Image", "Montage"],
      collaboration_type: "west_africa",
      start_date: "2026-09-01",
      end_date: "2026-12-15",
      location: "Dakar & Casablanca",
      status: "upcoming",
      creator_id: userList[0].id,
      creator: sanitizeUser(userList[0]),
      created_at: new Date().toISOString()
    },
    {
      id: "p2",
      title: "Résidence de Musique Électronique & Traditionnelle",
      description: "Fusionner les instruments traditionnels africains (kora, ngoni) avec la production électronique moderne.",
      sector: "Musique",
      looking_for: ["Composition", "Production / Beatmaking"],
      collaboration_type: "east_africa",
      start_date: "2026-07-10",
      end_date: "2026-08-30",
      location: "Johannesburg",
      status: "ongoing",
      creator_id: userList[1] ? userList[1].id : userList[0].id,
      creator: sanitizeUser(userList[1] || userList[0]),
      created_at: new Date().toISOString()
    },
    {
      id: "p3",
      title: "Exposition d'Art Numérique et Réalité Virtuelle",
      description: "Création d'une galerie virtuelle mettant en valeur le folklore africain à travers les nouvelles technologies 3D.",
      sector: "Art Numérique",
      looking_for: ["Création 3D", "Artiste IA"],
      collaboration_type: "north_africa",
      start_date: "2026-05-01",
      end_date: "2026-06-30",
      location: "Nairobi",
      status: "past",
      creator_id: userList[2] ? userList[2].id : userList[0].id,
      creator: sanitizeUser(userList[2] || userList[0]),
      created_at: new Date().toISOString()
    }
  ];
  sampleProjects.forEach(p => projects.set(p.id, p));
};

// --- API Routes ---
app.get("/api/news", (req, res) => {
  // Sort by created_at descending so recent news is first
  const sortedNews = Array.from(news.values()).sort((a: any, b: any) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  res.json(sortedNews);
});

app.post("/api/admin/news", (req, res) => {
  const user = getUserFromReq(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ detail: "Forbidden - Admin access required" });
  }

  const { title, content, media_url } = req.body;
  if (!title || !content) {
    return res.status(400).json({ detail: "Title and Content are required" });
  }

  const newNewsItem = {
    id: uuidv4(),
    title,
    content,
    media_url: media_url || null,
    created_at: new Date().toISOString()
  };

  news.set(newNewsItem.id, newNewsItem);
  res.json(newNewsItem);
});

app.put("/api/admin/news/:id", (req, res) => {
  const user = getUserFromReq(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ detail: "Forbidden - Admin access required" });
  }

  const { id } = req.params;
  const existingItem = news.get(id);
  if (!existingItem) {
    return res.status(404).json({ detail: "News item not found" });
  }

  const { title, content, media_url } = req.body;
  if (title !== undefined) existingItem.title = title;
  if (content !== undefined) existingItem.content = content;
  if (media_url !== undefined) existingItem.media_url = media_url || null;

  news.set(id, existingItem);
  res.json(existingItem);
});

app.delete("/api/admin/news/:id", (req, res) => {
  const user = getUserFromReq(req);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ detail: "Forbidden - Admin access required" });
  }

  const { id } = req.params;
  if (!news.has(id)) {
    return res.status(404).json({ detail: "News item not found" });
  }

  news.delete(id);
  res.json({ status: "success" });
});
const sanitizeUser = (user: any) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// --- Reference Data ---
const REGIONS = {
  NORTH: "North Africa",
  WEST: "West Africa",
  CENTRAL: "Central Africa",
  EAST: "East Africa",
  SOUTHERN: "Southern Africa",
  REST_OF_WORLD: "Rest of the World"
};

const AFRICAN_COUNTRIES = [
  // North Africa
  { name: "Algeria", name_fr: "Algérie", subregion: REGIONS.NORTH },
  { name: "Egypt", name_fr: "Égypte", subregion: REGIONS.NORTH },
  { name: "Libya", name_fr: "Libye", subregion: REGIONS.NORTH },
  { name: "Morocco", name_fr: "Maroc", subregion: REGIONS.NORTH },
  { name: "Mauritania", name_fr: "Mauritanie", subregion: REGIONS.NORTH },
  { name: "Tunisia", name_fr: "Tunisie", subregion: REGIONS.NORTH },
  // West Africa
  { name: "Nigeria", name_fr: "Nigéria", subregion: REGIONS.WEST },
  { name: "Senegal", name_fr: "Sénégal", subregion: REGIONS.WEST },
  // Central Africa
  { name: "Cameroon", name_fr: "Cameroun", subregion: REGIONS.CENTRAL },
  { name: "DRC", name_fr: "RDC", subregion: REGIONS.CENTRAL },
  // East Africa
  { name: "Kenya", name_fr: "Kenya", subregion: REGIONS.EAST },
  { name: "Ethiopia", name_fr: "Éthiopie", subregion: REGIONS.EAST },
  // Southern Africa
  { name: "South Africa", name_fr: "Afrique du Sud", subregion: REGIONS.SOUTHERN },
  { name: "Angola", name_fr: "Angola", subregion: REGIONS.SOUTHERN },
  // Diaspora
  { name: "Diaspora", name_fr: "Diaspora", subregion: "Diaspora" },
];

const ARTISTIC_SECTORS = [
  { name: "Visual Arts", name_fr: "Arts Visuels" },
  { name: "Performing Arts", name_fr: "Arts du Spectacle" },
  { name: "Music", name_fr: "Musique" },
  { name: "Literature", name_fr: "Littérature" },
];

const DOMAINS = [
  "Visual Arts", "Performing Arts", "Music", "Literature", "Cinema & Media", "Fashion & Design", "Digital & New Media", "Craft & Cultural Heritage"
];

const METIERS_BY_DOMAIN_MAP: Record<string, string[]> = {
  "Visual Arts": ["Painting", "Sculpture", "Photography", "Drawing", "Printmaking", "Ceramics", "Installation Art", "Performance Art", "Street Art", "Illustration", "Design Graphique"],
  "Performing Arts": ["Theater", "Dance", "Circus", "Puppetry", "Spoken Word", "Mime", "Physical Theater", "Humour"],
  "Music": ["Composition", "Performance", "Production", "Singing", "Songwriting", "Sound Engineering", "DJing", "Instrumental Music", "Arrangement", "Musicologie"],
  "Literature": ["Poetry", "Fiction", "Non-fiction", "Screenwriting", "Playwriting", "Journalism", "Essays", "Literary Criticism", "Édition", "Traduction"],
  "Cinema & Media": ["Direction", "Acting", "Editing", "Cinematography", "Sound Design", "Production Design", "Documentary Filmmaking", "Journalisme", "Critique littéraire", "Réalisation", "Cadrage / Image", "Production"],
  "Fashion & Design": ["Design", "Modeling", "Tailoring", "Jewelry Design", "Textile Art", "Fashion Photography", "Styling", "Modélisme", "Bijouterie"],
  "Digital & New Media": ["VR/AR", "Crypto Art", "AI Art", "3D Modeling", "Animation", "Graphic Design", "Web Art", "Game Design", "Création 3D", "Design Interactif", "Animation VFX", "Web Art", "Game Design", "Graphisme"],
  "Craft & Cultural Heritage": ["Pottery", "Weaving", "Woodworking", "Metalworking", "Basketry", "Traditional Jewelry", "Restoration", "Poterie", "Tissage", "Menuiserie", "Métallurgie", "Vannerie", "Bijouterie Traditionnelle"]
};

const SUBREGIONS = [
  "North Africa", "West Africa", "Central Africa", "East Africa", "Southern Africa", "Diaspora"
];

const GENDERS = ["Male", "Female", "Other"];

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/reference/countries", (req, res) => {
  res.json(AFRICAN_COUNTRIES);
});

app.get("/api/reference/sectors", (req, res) => {
  res.json(ARTISTIC_SECTORS);
});

app.get("/api/reference/subregions", (req, res) => {
  res.json(SUBREGIONS);
});

app.get("/api/reference/domains", (req, res) => {
  res.json(DOMAINS);
});

app.get("/api/reference/genders", (req, res) => {
  res.json(GENDERS);
});

app.get("/api/reference/metiers", (req, res) => {
  res.json(METIERS_BY_DOMAIN_MAP);
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const userData = req.body;
  if (users.has(userData.email.toLowerCase())) {
    return res.status(400).json({ detail: "Email already registered" });
  }

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUser = {
    ...userData,
    id: userId,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    approval_status: "approved", // Auto-approve in mock
    created_at: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.first_name || "User"}`
  };

  users.set(newUser.email, newUser);
  
  const token = jwt.sign({ id: userId, email: newUser.email }, SECRET_KEY);
  res.json({ token, user: sanitizeUser(newUser) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.get(email.toLowerCase());

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
  res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/partner-login", async (req, res) => {
  const { partner_code } = req.body;
  if (!partner_code) {
    return res.status(400).json({ detail: "Partner code required" });
  }

  let matchedUser: any = null;
  const codeTrimmed = partner_code.trim();

  if (codeTrimmed === "PARTNER2026") {
    matchedUser = {
      id: "p1",
      email: "partner@example.com",
      first_name: "Partner",
      last_name: "User",
      organization_name: "African Cultural Institute",
      account_type: "partner",
      role: "partenaire",
      approval_status: "approved",
      partner_code: "PARTNER2026"
    };
  } else {
    for (const u of users.values()) {
      if (u.partner_code && u.partner_code.toUpperCase() === codeTrimmed.toUpperCase()) {
        matchedUser = u;
        break;
      }
    }
  }

  if (!matchedUser) {
    return res.status(401).json({ detail: "Invalid partner code" });
  }

  // Grant automatic statistics / payment access for partners & institutions
  payments.set(matchedUser.id, {
    has_paid: true,
    access_code: matchedUser.partner_code || codeTrimmed,
    paid_at: new Date().toISOString()
  });

  const token = jwt.sign({ id: matchedUser.id, email: matchedUser.email }, SECRET_KEY);
  res.json({ token, user: sanitizeUser(matchedUser) });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

function getUserFromReq(req: any): any {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    return Array.from(users.values()).find(u => u.id === decoded.id) || null;
  } catch {
    return null;
  }
}

function getEffectiveCountry(req: any, requestedCountry?: string): string {
  const user = getUserFromReq(req);
  const isOrgOrPartner = user && user.role !== 'admin' && (user.role === 'partenaire' || user.role === 'personne_morale' || user.account_type === 'partner' || (user.role === 'visitor' && user.visitor_type === 'organisation'));
  if (isOrgOrPartner && user?.country) {
    return user.country;
  }
  return requestedCountry || 'all';
}

app.get("/api/auth/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });
    res.json(sanitizeUser(user));
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
});

// Mock Statistics
const MASTER_DOMAINS_STRUCTURE = [
  {
    domain: "Arts Visuels",
    sectors: [
      { name: "Peinture", artists_w: 50, artists_m: 45, pros_w: 20, pros_m: 18, media_w: 4, media_m: 4 },
      { name: "Sculpture", artists_w: 40, artists_m: 40, pros_w: 15, pros_m: 15, media_w: 3, media_m: 3 },
      { name: "Photographie", artists_w: 35, artists_m: 30, pros_w: 12, pros_m: 10, media_w: 3, media_m: 3 }
    ]
  },
  {
    domain: "Musique",
    sectors: [
      { name: "Composition", artists_w: 45, artists_m: 41, pros_w: 15, pros_m: 14, media_w: 4, media_m: 4 },
      { name: "Beatmaking", artists_w: 34, artists_m: 30, pros_w: 11, pros_m: 10, media_w: 3, media_m: 3 },
      { name: "Ingénierie Son", artists_w: 30, artists_m: 30, pros_w: 10, pros_m: 10, media_w: 3, media_m: 3 }
    ]
  },
  {
    domain: "Cinéma",
    sectors: [
      { name: "Réalisation", artists_w: 28, artists_m: 25, pros_w: 12, pros_m: 11, media_w: 3, media_m: 3 },
      { name: "Jeu d'acteur", artists_w: 25, artists_m: 22, pros_w: 10, pros_m: 9, media_w: 3, media_m: 2 },
      { name: "Cadrage", artists_w: 15, artists_m: 15, pros_w: 7, pros_m: 6, media_w: 2, media_m: 2 }
    ]
  },
  {
    domain: "Littérature",
    sectors: [
      { name: "Poésie", artists_w: 22, artists_m: 20, pros_w: 9, pros_m: 8, media_w: 2, media_m: 2 },
      { name: "Roman / Fiction", artists_w: 20, artists_m: 18, pros_w: 8, pros_m: 7, media_w: 2, media_m: 2 },
      { name: "Édition", artists_w: 10, artists_m: 10, pros_w: 4, pros_m: 4, media_w: 1, media_m: 1 }
    ]
  },
  {
    domain: "Arts du Spectacle",
    sectors: [
      { name: "Théâtre", artists_w: 20, artists_m: 19, pros_w: 7, pros_m: 7, media_w: 2, media_m: 1 },
      { name: "Danse / Chorégraphie", artists_w: 16, artists_m: 15, pros_w: 6, pros_m: 5, media_w: 1, media_m: 1 }
    ]
  },
  {
    domain: "Mode",
    sectors: [
      { name: "Stylisme", artists_w: 18, artists_m: 15, pros_w: 7, pros_m: 7, media_w: 2, media_m: 1 },
      { name: "Modélisme", artists_w: 14, artists_m: 13, pros_w: 6, pros_m: 5, media_w: 1, media_m: 1 }
    ]
  },
  {
    domain: "Art Numérique",
    sectors: [
      { name: "Création 3D", artists_w: 12, artists_m: 12, pros_w: 4, pros_m: 4, media_w: 2, media_m: 1 },
      { name: "Artiste IA", artists_w: 8, artists_m: 8, pros_w: 3, pros_m: 4, media_w: 1, media_m: 1 }
    ]
  }
];

const MASTER_COUNTRIES_STRUCTURE = [
  { country: "Morocco", countryFr: "Maroc", city: "Casablanca", weight: 0.25 },
  { country: "Senegal", countryFr: "Sénégal", city: "Dakar", weight: 0.22 },
  { country: "Nigeria", countryFr: "Nigeria", city: "Lagos", weight: 0.19 },
  { country: "Côte d'Ivoire", countryFr: "Côte d'Ivoire", city: "Abidjan", weight: 0.12 },
  { country: "Cameroon", countryFr: "Cameroun", city: "Douala", weight: 0.09 },
  { country: "Algeria", countryFr: "Algérie", city: "Alger", weight: 0.07 },
  { country: "Egypt", countryFr: "Égypte", city: "Le Caire", weight: 0.06 }
];

interface GranularRow {
  countryFr: string;
  countryEn: string;
  city: string;
  domain: string;
  sector: string;
  gender: "women" | "men";
  artist_count: number;
  professional_count: number;
  media_count: number;
  visitor_views_count: number;
  visitor_messages_count: number;
}

function buildMasterRows(): GranularRow[] {
  const rows: GranularRow[] = [];
  MASTER_COUNTRIES_STRUCTURE.forEach(c => {
    MASTER_DOMAINS_STRUCTURE.forEach(d => {
      d.sectors.forEach(s => {
        // Women
        const w_art = Math.max(1, Math.round(s.artists_w * c.weight));
        const w_pro = Math.max(0, Math.round(s.pros_w * c.weight));
        const w_med = Math.max(0, Math.round(s.media_w * c.weight));
        rows.push({
          countryFr: c.countryFr,
          countryEn: c.country,
          city: c.city,
          domain: d.domain,
          sector: s.name,
          gender: "women",
          artist_count: w_art,
          professional_count: w_pro,
          media_count: w_med,
          visitor_views_count: (w_art + w_pro + w_med) * 12 + 10,
          visitor_messages_count: (w_art + w_pro) * 2 + 2
        });

        // Men
        const m_art = Math.max(1, Math.round(s.artists_m * c.weight));
        const m_pro = Math.max(0, Math.round(s.pros_m * c.weight));
        const m_med = Math.max(0, Math.round(s.media_m * c.weight));
        rows.push({
          countryFr: c.countryFr,
          countryEn: c.country,
          city: c.city,
          domain: d.domain,
          sector: s.name,
          gender: "men",
          artist_count: m_art,
          professional_count: m_pro,
          media_count: m_med,
          visitor_views_count: (m_art + m_pro + m_med) * 11 + 9,
          visitor_messages_count: (m_art + m_pro) * 2 + 1
        });
      });
    });
  });
  return rows;
}

const MASTER_GRANULAR_ROWS = buildMasterRows();

app.get("/api/statistics/overview", (req, res) => {
  let totalArtists = 0;
  let totalPros = 0;
  let totalMedia = 0;

  MASTER_GRANULAR_ROWS.forEach(r => {
    totalArtists += r.artist_count;
    totalPros += r.professional_count;
    totalMedia += r.media_count;
  });

  res.json({
    total_artists: totalArtists,
    total_professionals: totalPros,
    total_media: totalMedia,
    total_collaborations: 1000,
    total_intra_african_projects: 600,
    total_posts: 3750
  });
});

app.get(["/api/statistics/explorer", "/api/statistics/v2/explorer"], (req, res) => {
  const queryCountry = (req.query as Record<string, string>).country;
  const country = getEffectiveCountry(req, queryCountry);
  const { city, sector, domain, gender, profile_tag } = req.query as Record<string, string>;

  const norm = (s?: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  let filtered = MASTER_GRANULAR_ROWS;

  if (country && country !== 'all') {
    const nc = norm(country);
    filtered = filtered.filter(r => norm(r.countryFr) === nc || norm(r.countryEn) === nc);
  }

  if (city && city !== 'all') {
    const nci = norm(city);
    filtered = filtered.filter(r => norm(r.city) === nci);
  }

  if (domain && domain !== 'all') {
    const nd = norm(domain);
    filtered = filtered.filter(r => norm(r.domain) === nd);
  }

  if (sector && sector !== 'all') {
    const ns = norm(sector);
    filtered = filtered.filter(r => norm(r.sector) === ns);
  }

  if (gender && gender !== 'all') {
    const ng = norm(gender);
    if (ng === 'female' || ng === 'women' || ng === 'femme') {
      filtered = filtered.filter(r => r.gender === 'women');
    } else if (ng === 'male' || ng === 'men' || ng === 'homme') {
      filtered = filtered.filter(r => r.gender === 'men');
    }
  }

  let totalArtists = 0;
  let totalPros = 0;
  let totalMedia = 0;

  filtered.forEach(r => {
    totalArtists += r.artist_count;
    totalPros += r.professional_count;
    totalMedia += r.media_count;
  });

  let effectiveArtists = totalArtists;
  let effectivePros = totalPros;
  let effectiveMedia = totalMedia;

  if (profile_tag === 'artist') {
    effectivePros = 0;
    effectiveMedia = 0;
  } else if (profile_tag === 'professional') {
    effectiveArtists = 0;
    effectiveMedia = 0;
  } else if (profile_tag === 'media') {
    effectiveArtists = 0;
    effectivePros = 0;
  }

  const totalUsers = effectiveArtists + effectivePros + effectiveMedia;

  let womenCount = 0;
  let menCount = 0;

  filtered.forEach(r => {
    let rowUserCount = 0;
    if (profile_tag === 'artist') rowUserCount = r.artist_count;
    else if (profile_tag === 'professional') rowUserCount = r.professional_count;
    else if (profile_tag === 'media') rowUserCount = r.media_count;
    else rowUserCount = r.artist_count + r.professional_count + r.media_count;

    if (r.gender === 'women') womenCount += rowUserCount;
    else menCount += rowUserCount;
  });

  const countriesSet = new Set<string>();
  const citiesSet = new Set<string>();
  const domainsSet = new Set<string>();
  const sectorsSet = new Set<string>();

  const countryCounts: Record<string, number> = {};
  const cityCounts: Record<string, number> = {};
  const domainCounts: Record<string, number> = {};
  const sectorCounts: Record<string, number> = {};

  filtered.forEach(r => {
    let c = 0;
    if (profile_tag === 'artist') c = r.artist_count;
    else if (profile_tag === 'professional') c = r.professional_count;
    else if (profile_tag === 'media') c = r.media_count;
    else c = r.artist_count + r.professional_count + r.media_count;

    if (c > 0) {
      countriesSet.add(r.countryFr);
      citiesSet.add(r.city);
      domainsSet.add(r.domain);
      sectorsSet.add(r.sector);

      countryCounts[r.countryFr] = (countryCounts[r.countryFr] || 0) + c;
      cityCounts[r.city] = (cityCounts[r.city] || 0) + c;
      domainCounts[r.domain] = (domainCounts[r.domain] || 0) + c;
      sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + c;
    }
  });

  const topCountries = Object.entries(countryCounts)
    .map(([name, count]) => ({ name, users_count: count, count }))
    .sort((a, b) => b.count - a.count);

  const topCities = Object.entries(cityCounts)
    .map(([name, count]) => ({ name, users_count: count, count }))
    .sort((a, b) => b.count - a.count);

  const topDomains = Object.entries(domainCounts)
    .map(([name, count]) => ({ name, users_count: count, count }))
    .sort((a, b) => b.count - a.count);

  const topSectors = Object.entries(sectorCounts)
    .map(([name, count]) => ({ name, users_count: count, count }))
    .sort((a, b) => b.count - a.count);

  res.json({
    kpis: {
      total_users: totalUsers,
      countries_count: countriesSet.size,
      cities_count: citiesSet.size,
      sectors_count: sectorsSet.size,
      domains_count: domainsSet.size
    },
    by_gender: {
      Female: womenCount,
      Male: menCount,
      women: womenCount,
      men: menCount
    },
    by_profile_tag: {
      artist: effectiveArtists,
      professional: effectivePros,
      media: effectiveMedia
    },
    top: {
      countries: topCountries,
      cities: topCities,
      domains: topDomains,
      sectors: topSectors
    },
    scope: {
      country: country !== 'all' ? country : undefined,
      city: city !== 'all' ? city : undefined,
      sector: sector !== 'all' ? sector : undefined,
      domain: domain !== 'all' ? domain : undefined,
      gender: gender !== 'all' ? gender : undefined,
      profile_tag: profile_tag !== 'all' ? profile_tag : undefined
    }
  });
});

app.get("/api/statistics/v2/countries-list", (req, res) => {
  const countryCounts: Record<string, number> = {};
  MASTER_GRANULAR_ROWS.forEach(r => {
    const cnt = r.artist_count + r.professional_count + r.media_count;
    countryCounts[r.countryFr] = (countryCounts[r.countryFr] || 0) + cnt;
  });

  const countries = Object.entries(countryCounts).map(([name, users_count]) => ({
    name,
    users_count,
    count: users_count
  }));

  res.json({ countries });
});

const CITIES_BY_COUNTRY_MAP: Record<string, string[]> = {
  "Algeria": ["Alger", "Oran", "Constantine", "Annaba"],
  "Algérie": ["Alger", "Oran", "Constantine", "Annaba"],
  "Egypt": ["Le Caire", "Alexandrie", "Gizeh", "Louxor"],
  "Égypte": ["Le Caire", "Alexandrie", "Gizeh", "Louxor"],
  "Libya": ["Tripoli", "Benghazi", "Misrata"],
  "Libye": ["Tripoli", "Benghazi", "Misrata"],
  "Morocco": ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"],
  "Maroc": ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"],
  "Mauritania": ["Nouakchott", "Nouadhibou"],
  "Mauritanie": ["Nouakchott", "Nouadhibou"],
  "Tunisia": ["Tunis", "Sfax", "Sousse"],
  "Tunisie": ["Tunis", "Sfax", "Sousse"],
  "Nigeria": ["Lagos", "Abuja", "Kano", "Ibadan"],
  "Nigéria": ["Lagos", "Abuja", "Kano", "Ibadan"],
  "Senegal": ["Dakar", "Saint-Louis", "Touba", "Thiès"],
  "Sénégal": ["Dakar", "Saint-Louis", "Touba", "Thiès"],
  "Cameroon": ["Douala", "Yaoundé", "Garoua", "Bafoussam"],
  "Cameroun": ["Douala", "Yaoundé", "Garoua", "Bafoussam"],
  "DRC": ["Kinshasa", "Lubumbashi", "Goma"],
  "RDC": ["Kinshasa", "Lubumbashi", "Goma"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
  "Ethiopia": ["Addis-Abeba", "Dire Dawa"],
  "Éthiopie": ["Addis-Abeba", "Dire Dawa"],
  "South Africa": ["Le Cap", "Johannesbourg", "Durban", "Pretoria"],
  "Afrique du Sud": ["Le Cap", "Johannesbourg", "Durban", "Pretoria"],
  "Angola": ["Luanda", "Huambo", "Lobito"],
  "Côte d'Ivoire": ["Abidjan", "Yamoussoukro", "Bouaké", "San-Pédro"]
};

app.get("/api/statistics/v2/filters/cities", (req, res) => {
  const country = getEffectiveCountry(req, (req.query as { country?: string }).country);
  const norm = (s?: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  let rows = MASTER_GRANULAR_ROWS;
  if (country && country !== 'all') {
    const nc = norm(country);
    rows = rows.filter(r => norm(r.countryFr) === nc || norm(r.countryEn) === nc);
  }

  const cityCounts: Record<string, number> = {};
  rows.forEach(r => {
    const cnt = r.artist_count + r.professional_count + r.media_count;
    cityCounts[r.city] = (cityCounts[r.city] || 0) + cnt;
  });

  const cities = Object.entries(cityCounts).map(([name, users_count]) => ({
    name,
    users_count,
    count: users_count
  }));

  res.json({ cities });
});

app.get("/api/statistics/v2/filters/domains", (req, res) => {
  const country = getEffectiveCountry(req, (req.query as Record<string, string>).country);
  const { city, profile_tag } = req.query as Record<string, string>;
  const norm = (s?: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  let rows = MASTER_GRANULAR_ROWS;
  if (country && country !== 'all') {
    const nc = norm(country);
    rows = rows.filter(r => norm(r.countryFr) === nc || norm(r.countryEn) === nc);
  }
  if (city && city !== 'all') {
    const nci = norm(city);
    rows = rows.filter(r => norm(r.city) === nci);
  }

  const domainCounts: Record<string, number> = {};
  rows.forEach(r => {
    let cnt = r.artist_count + r.professional_count + r.media_count;
    if (profile_tag === 'artist') cnt = r.artist_count;
    else if (profile_tag === 'professional') cnt = r.professional_count;
    else if (profile_tag === 'media') cnt = r.media_count;

    domainCounts[r.domain] = (domainCounts[r.domain] || 0) + cnt;
  });

  const domains = Object.entries(domainCounts).map(([name, users_count]) => ({
    name,
    users_count,
    count: users_count
  }));

  res.json({ domains });
});

app.get("/api/statistics/v2/filters/sectors", (req, res) => {
  const country = getEffectiveCountry(req, (req.query as Record<string, string>).country);
  const { city, domain, profile_tag } = req.query as Record<string, string>;
  const norm = (s?: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  let rows = MASTER_GRANULAR_ROWS;
  if (country && country !== 'all') {
    const nc = norm(country);
    rows = rows.filter(r => norm(r.countryFr) === nc || norm(r.countryEn) === nc);
  }
  if (city && city !== 'all') {
    const nci = norm(city);
    rows = rows.filter(r => norm(r.city) === nci);
  }
  if (domain && domain !== 'all') {
    const nd = norm(domain);
    rows = rows.filter(r => norm(r.domain) === nd);
  }

  const sectorCounts: Record<string, number> = {};
  rows.forEach(r => {
    let cnt = r.artist_count + r.professional_count + r.media_count;
    if (profile_tag === 'artist') cnt = r.artist_count;
    else if (profile_tag === 'professional') cnt = r.professional_count;
    else if (profile_tag === 'media') cnt = r.media_count;

    sectorCounts[r.sector] = (sectorCounts[r.sector] || 0) + cnt;
  });

  const sectors = Object.entries(sectorCounts).map(([name, users_count]) => ({
    name,
    users_count,
    count: users_count
  }));

  res.json({ sectors });
});


app.get("/api/statistics/detailed", (req, res) => {
  const { sector, profile_tag } = req.query as { sector?: string; profile_tag?: string };

  const norm = (s?: string) => s ? s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  let filtered = MASTER_GRANULAR_ROWS;

  if (sector && sector !== 'all') {
    const ns = norm(sector);
    filtered = filtered.filter(r => norm(r.sector) === ns || norm(r.domain) === ns);
  }

  let totalWomen = 0;
  let totalMen = 0;

  filtered.forEach(r => {
    let cnt = r.artist_count + r.professional_count + r.media_count;
    if (profile_tag === 'artist') cnt = r.artist_count;
    else if (profile_tag === 'professional') cnt = r.professional_count;
    else if (profile_tag === 'media') cnt = r.media_count;

    if (r.gender === 'women') totalWomen += cnt;
    else totalMen += cnt;
  });

  const by_gender = {
    women: totalWomen,
    men: totalMen,
    Female: totalWomen,
    Male: totalMen
  };

  const domainTotals: Record<string, number> = {};
  filtered.forEach(r => {
    let cnt = r.artist_count + r.professional_count + r.media_count;
    if (profile_tag === 'artist') cnt = r.artist_count;
    else if (profile_tag === 'professional') cnt = r.professional_count;
    else if (profile_tag === 'media') cnt = r.media_count;

    domainTotals[r.domain] = (domainTotals[r.domain] || 0) + cnt;
  });

  const by_sector = Object.entries(domainTotals).map(([domain, cnt]) => ({
    subject: domain,
    name: domain,
    A: cnt,
    count: cnt,
    users_count: cnt,
    fullMark: 400
  }));

  const domainGenderMap: Record<string, { women: number, men: number }> = {};
  filtered.forEach(r => {
    if (!domainGenderMap[r.domain]) domainGenderMap[r.domain] = { women: 0, men: 0 };
    let cnt = r.artist_count + r.professional_count + r.media_count;
    if (profile_tag === 'artist') cnt = r.artist_count;
    else if (profile_tag === 'professional') cnt = r.professional_count;
    else if (profile_tag === 'media') cnt = r.media_count;

    if (r.gender === 'women') domainGenderMap[r.domain].women += cnt;
    else domainGenderMap[r.domain].men += cnt;
  });

  const by_gender_domain = Object.entries(domainGenderMap).map(([domain, g]) => ({
    domain,
    women: g.women,
    men: g.men
  }));

  const by_country_gender_domain = filtered.map(r => ({
    country: r.countryFr,
    city: r.city,
    gender: r.gender,
    domain: r.domain,
    sector: r.sector,
    artist_count: r.artist_count,
    professional_count: r.professional_count,
    media_count: r.media_count,
    visitor_views_count: r.visitor_views_count,
    visitor_messages_count: r.visitor_messages_count,
    engagement_score: r.visitor_views_count + r.visitor_messages_count * 3
  }));

  const total_visitor_views = filtered.reduce((acc, curr) => acc + curr.visitor_views_count, 0);
  const total_visitor_messages = filtered.reduce((acc, curr) => acc + curr.visitor_messages_count, 0);

  res.json({
    kpis: {
      total_users: totalWomen + totalMen,
      total_posts: (totalWomen + totalMen) * 3,
      total_collaborations: Math.floor((totalWomen + totalMen) * 0.8)
    },
    by_gender,
    by_sector,
    by_gender_domain,
    by_country_gender_domain,
    total_visitor_views,
    total_visitor_messages,
    most_messaged_domain: "Arts Visuels"
  });
});

app.get("/api/statistics/v2/by-country/:country", (req, res) => {
  const countryParam = getEffectiveCountry(req, req.params.country);
  const normalizeStr = (str?: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  const nc = normalizeStr(countryParam);

  let countryRows = MASTER_GRANULAR_ROWS.filter(r => 
    normalizeStr(r.countryFr) === nc || normalizeStr(r.countryEn) === nc
  );

  if (countryRows.length === 0) {
    countryRows = MASTER_GRANULAR_ROWS.filter(r => normalizeStr(r.countryFr) === "maroc");
  }

  const targetCountryName = countryRows[0]?.countryFr || countryParam;

  let totalArtists = 0;
  let totalPros = 0;
  let totalMedia = 0;
  let totalViews = 0;
  let totalMessages = 0;
  let femaleCount = 0;
  let maleCount = 0;

  const cityMap: Record<string, { artist_count: number, professional_count: number, media_count: number, visitor_views_count: number, visitor_messages_count: number }> = {};
  const domainMap: Record<string, { artist_count: number, professional_count: number, media_count: number, engagement: number }> = {};
  const sectorMap: Record<string, { artist_count: number, professional_count: number, media_count: number, engagement: number }> = {};

  countryRows.forEach(r => {
    totalArtists += r.artist_count;
    totalPros += r.professional_count;
    totalMedia += r.media_count;
    totalViews += r.visitor_views_count;
    totalMessages += r.visitor_messages_count;

    const rowTotal = r.artist_count + r.professional_count + r.media_count;
    if (r.gender === 'women') femaleCount += rowTotal;
    else maleCount += rowTotal;

    if (!cityMap[r.city]) {
      cityMap[r.city] = { artist_count: 0, professional_count: 0, media_count: 0, visitor_views_count: 0, visitor_messages_count: 0 };
    }
    cityMap[r.city].artist_count += r.artist_count;
    cityMap[r.city].professional_count += r.professional_count;
    cityMap[r.city].media_count += r.media_count;
    cityMap[r.city].visitor_views_count += r.visitor_views_count;
    cityMap[r.city].visitor_messages_count += r.visitor_messages_count;

    if (!domainMap[r.domain]) {
      domainMap[r.domain] = { artist_count: 0, professional_count: 0, media_count: 0, engagement: 0 };
    }
    domainMap[r.domain].artist_count += r.artist_count;
    domainMap[r.domain].professional_count += r.professional_count;
    domainMap[r.domain].media_count += r.media_count;
    domainMap[r.domain].engagement += r.visitor_views_count + r.visitor_messages_count * 3;

    if (!sectorMap[r.sector]) {
      sectorMap[r.sector] = { artist_count: 0, professional_count: 0, media_count: 0, engagement: 0 };
    }
    sectorMap[r.sector].artist_count += r.artist_count;
    sectorMap[r.sector].professional_count += r.professional_count;
    sectorMap[r.sector].media_count += r.media_count;
    sectorMap[r.sector].engagement += r.visitor_views_count + r.visitor_messages_count * 3;
  });

  const totalMembers = totalArtists + totalPros + totalMedia;

  const by_city = Object.entries(cityMap).map(([city, data]) => ({
    city,
    ...data
  }));

  const by_domain = Object.entries(domainMap).map(([domain, data]) => ({
    domain,
    ...data
  }));

  const by_sector = Object.entries(sectorMap).map(([sector, data]) => ({
    sector,
    ...data
  }));

  const presetCities = Object.keys(cityMap);
  const mainCity = presetCities[0] || "Casablanca";

  const topArtistsList = [
    {
      artist_id: "art_1",
      name: "Amina Benmoussa",
      sector: "Peinture",
      domain: "Arts Visuels",
      city: mainCity,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      engagement_score: 950,
      views: 450,
      messages: 40,
      likes: 180,
      collaborations: 8
    },
    {
      artist_id: "art_2",
      name: "Youssef El Alami",
      sector: "Composition",
      domain: "Musique",
      city: presetCities[1] || mainCity,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      engagement_score: 870,
      views: 410,
      messages: 35,
      likes: 150,
      collaborations: 6
    },
    {
      artist_id: "art_3",
      name: "Khadija Chraibi",
      sector: "Réalisation",
      domain: "Cinéma",
      city: presetCities[2] || mainCity,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100",
      engagement_score: 790,
      views: 380,
      messages: 28,
      likes: 130,
      collaborations: 5
    }
  ];

  const topProsList = [
    { professional_id: "pro_1", name: "Sarah Benali (Agence Culture)", company_name: "Benali Art Mgmt", sector: "Management", domain: "Musique", city: mainCity, engagement_score: 1120, views: 680, messages: 78, likes: 210, collaborations: 14 },
    { professional_id: "pro_2", name: "Omar Sylla (Prod Studio)", company_name: "Sylla Visuals", sector: "Production", domain: "Cinéma", city: presetCities[1] || mainCity, engagement_score: 980, views: 590, messages: 64, likes: 185, collaborations: 11 },
    { professional_id: "pro_3", name: "Claire Dupont (Galerie)", company_name: "Espace Créatif", sector: "Curation", domain: "Arts Visuels", city: presetCities[2] || mainCity, engagement_score: 870, views: 510, messages: 52, likes: 140, collaborations: 9 }
  ];

  const topMediaList = [
    { media_id: "med_1", name: "Afrique Arts Hebdo", media_type: "Magazine Digital", sector: "Presse Écrite", domain: "Multidisciplinaire", city: mainCity, engagement_score: 1450, views: 1200, messages: 95, likes: 320, collaborations: 18 },
    { media_id: "med_2", name: "Culture Mag TV", media_type: "Chaîne Culturelle", sector: "Audiovisuel", domain: "Cinéma & Musique", city: presetCities[1] || mainCity, engagement_score: 1180, views: 890, messages: 70, likes: 240, collaborations: 15 }
  ];

  res.json({
    country: targetCountryName,
    subregion: "Afrique",
    overview: {
      total_artists: totalArtists,
      total_professionals: totalPros,
      total_media: totalMedia,
      total_members: totalMembers,
      total_posts: totalMembers * 3,
      total_views: totalViews,
      total_messages: totalMessages,
      collaborations: {
        total: Math.round(totalMembers * 0.8),
        local: Math.round(totalMembers * 0.5),
        intra_african: Math.round(totalMembers * 0.3)
      },
      by_gender: {
        Female: femaleCount,
        Male: maleCount
      }
    },
    by_city,
    by_sector,
    by_domain,
    top_artists: topArtistsList,
    top_professionals: topProsList,
    top_media: topMediaList
  });
});

app.get("/api/statistics/v2/by-city/:country/:city", (req, res) => {
  const country = getEffectiveCountry(req, req.params.country);
  const { city } = req.params;
  const normalizeStr = (str?: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  const nc = normalizeStr(country);
  const nci = normalizeStr(city);

  let cityRows = MASTER_GRANULAR_ROWS.filter(r =>
    (normalizeStr(r.countryFr) === nc || normalizeStr(r.countryEn) === nc) &&
    normalizeStr(r.city) === nci
  );

  if (cityRows.length === 0) {
    cityRows = MASTER_GRANULAR_ROWS.filter(r => normalizeStr(r.city) === nci);
  }

  let totalArtists = 0;
  let totalPros = 0;
  let totalMedia = 0;
  let totalViews = 0;
  let totalMessages = 0;
  let femaleCount = 0;
  let maleCount = 0;

  const bySector: Record<string, { artist_count: number, professional_count: number, media_count: number, engagement: number }> = {};
  const byDomain: Record<string, { artist_count: number, professional_count: number, media_count: number, engagement: number }> = {};

  cityRows.forEach(r => {
    totalArtists += r.artist_count;
    totalPros += r.professional_count;
    totalMedia += r.media_count;
    totalViews += r.visitor_views_count;
    totalMessages += r.visitor_messages_count;

    const rowTotal = r.artist_count + r.professional_count + r.media_count;
    if (r.gender === 'women') femaleCount += rowTotal;
    else maleCount += rowTotal;

    if (!bySector[r.sector]) {
      bySector[r.sector] = { artist_count: 0, professional_count: 0, media_count: 0, engagement: 0 };
    }
    bySector[r.sector].artist_count += r.artist_count;
    bySector[r.sector].professional_count += r.professional_count;
    bySector[r.sector].media_count += r.media_count;
    bySector[r.sector].engagement += r.visitor_views_count + r.visitor_messages_count * 3;

    if (!byDomain[r.domain]) {
      byDomain[r.domain] = { artist_count: 0, professional_count: 0, media_count: 0, engagement: 0 };
    }
    byDomain[r.domain].artist_count += r.artist_count;
    byDomain[r.domain].professional_count += r.professional_count;
    byDomain[r.domain].media_count += r.media_count;
    byDomain[r.domain].engagement += r.visitor_views_count + r.visitor_messages_count * 3;
  });

  res.json({
    country,
    city,
    overview: {
      total_artists: totalArtists,
      total_professionals: totalPros,
      total_media: totalMedia,
      total_views: totalViews,
      total_messages: totalMessages,
      by_gender: {
        Female: femaleCount,
        Male: maleCount
      }
    },
    by_sector: Object.entries(bySector).map(([sector, data]) => ({ sector, ...data })),
    by_domain: Object.entries(byDomain).map(([domain, data]) => ({ domain, ...data }))
  });
});

app.get("/api/statistics/v2/by-country/:country/sector/:sector", (req, res) => {
  const country = getEffectiveCountry(req, req.params.country);
  const { sector } = req.params;
  const normalizeStr = (str?: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

  const nc = normalizeStr(country);
  const ns = normalizeStr(sector);

  let rows = MASTER_GRANULAR_ROWS.filter(r =>
    normalizeStr(r.countryFr) === nc || normalizeStr(r.countryEn) === nc
  );

  if (sector && sector !== 'all') {
    rows = rows.filter(r => normalizeStr(r.sector) === ns || normalizeStr(r.domain) === ns);
  }

  const domainDataMap: Record<string, { artist_count: number, professional_count: number, media_count: number, engagement: number }> = {};

  rows.forEach(r => {
    const key = r.domain;
    if (!domainDataMap[key]) domainDataMap[key] = { artist_count: 0, professional_count: 0, media_count: 0, engagement: 0 };
    domainDataMap[key].artist_count += r.artist_count;
    domainDataMap[key].professional_count += r.professional_count;
    domainDataMap[key].media_count += r.media_count;
    domainDataMap[key].engagement += r.visitor_views_count + r.visitor_messages_count * 3;
  });

  res.json({
    country,
    sector,
    by_sector: Object.entries(domainDataMap).map(([s, data]) => ({
      sector: s,
      ...data
    }))
  });
});

app.get("/api/statistics/v2/timeline/:country", (req, res) => {
  const country = getEffectiveCountry(req, req.params.country);
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  const timeline = months.map(m => {
    const new_artists = Math.floor(Math.random() * 35) + 10;
    const new_professionals = Math.floor(Math.random() * 18) + 5;
    const new_media = Math.floor(Math.random() * 8) + 2;
    const posts_artists = new_artists * 3 + Math.floor(Math.random() * 20);
    const posts_professionals = new_professionals * 2 + Math.floor(Math.random() * 15);
    const posts_media = new_media * 4 + Math.floor(Math.random() * 10);
    const totalPostsCount = posts_artists + posts_professionals + posts_media;

    return {
      month: m,
      new_artists,
      new_professionals,
      new_media,
      posts: totalPostsCount,
      posts_artists,
      posts_professionals,
      posts_media,
      collaborations: Math.floor(Math.random() * 20) + 5,
      engagement: Math.floor(Math.random() * 500) + 100
    };
  });

  res.json({ timeline });
});

app.get("/api/statistics/v2/compare", (req, res) => {
  const countries = ((req.query.countries as string) || "").split(",");
  res.json(countries.map(c => ({
    country: c,
    artists: Math.floor(Math.random() * 200) + 50,
    collaborations: Math.floor(Math.random() * 100) + 20,
    growth: (Math.random() * 15).toFixed(1) + "%"
  })));
});

app.get("/api/statistics/collaborations", (req, res) => {
  res.json({
    tiers: [
      {
        id: "north-intra",
        label: "North Africa (Intra-Regional)",
        label_fr: "Afrique du Nord (Intra-régional)",
        description: "Collaborations between North African countries (Algeria, Morocco, Tunisia, Egypt, etc.)",
        description_fr: "Collaborations entre les pays d'Afrique du Nord (Algérie, Maroc, Tunisie, Égypte, etc.)",
        count: 245,
        percentage: 23
      },
      {
        id: "subsaharan-intra",
        label: "Sub-Saharan Africa (Intra-Regional)",
        label_fr: "Afrique Subsaharienne (Intra-régional)",
        description: "Collaborations within a Sub-Saharan region",
        description_fr: "Collaborations au sein d'une même sous-région subsaharienne",
        count: 180,
        percentage: 17
      },
      {
        id: "subsaharan-inter",
        label: "Sub-Saharan Africa (Inter-Regional)",
        label_fr: "Afrique Subsaharienne (Inter-régional)",
        description: "Collaborations between different Sub-Saharan sub-regions",
        description_fr: "Collaborations entre les différentes sous-régions subsahariennes",
        count: 140,
        percentage: 13
      },
      {
        id: "west-africa",
        label: "West Africa",
        label_fr: "Afrique de l'Ouest",
        description: "Collaborations between West African countries",
        description_fr: "Collaborations entre les pays d'Afrique de l'Ouest",
        count: 120,
        percentage: 11
      },
      {
        id: "central-africa",
        label: "Central Africa",
        label_fr: "Afrique Centrale",
        description: "Collaborations entre les pays d'Afrique centrale",
        description_fr: "Collaborations entre les pays d'Afrique centrale",
        count: 95,
        percentage: 9
      },
      {
        id: "east-africa",
        label: "East Africa",
        label_fr: "Afrique de l'Est",
        description: "Collaborations between East African countries",
        description_fr: "Collaborations entre les pays d'Afrique de l'Est",
        count: 85,
        percentage: 8
      },
      {
        id: "southern-africa",
        label: "Southern Africa",
        label_fr: "Afrique Australe",
        description: "Collaborations between Southern African countries",
        description_fr: "Collaborations entre les pays d'Afrique australe",
        count: 75,
        percentage: 7
      },
      {
        id: "north-south",
        label: "Sub-Saharan Africa and North Africa",
        label_fr: "Afrique Subsaharienne et Afrique du Nord",
        description: "Collaborations between North Africa and Sub-Saharan Africa",
        description_fr: "Collaborations entre la région de l'Afrique du Nord et de l'Afrique subsaharienne",
        count: 65,
        percentage: 6
      },
      {
        id: "global",
        label: "Africa-World Partnership",
        label_fr: "Partenariat Afrique-Monde",
        description: "Collaborations between Africa and the Rest of the World",
        description_fr: "Collaborations entre l'Afrique et le reste du monde",
        count: 75,
        percentage: 6
      }
    ],
    by_type: { local: 450, intra_african: 245 },
    by_status: { ongoing: 180, upcoming: 95, past: 420 },
    by_month: [
      { month: 'Jan', local: 30, intra_african: 15 },
      { month: 'Feb', local: 35, intra_african: 18 },
      { month: 'Mar', local: 42, intra_african: 22 },
      { month: 'Apr', local: 38, intra_african: 20 },
      { month: 'May', local: 45, intra_african: 25 },
      { month: 'Jun', local: 50, intra_african: 28 }
    ],
    by_gender_domain: [],
    by_country_gender_domain: []
  });
});

// Artists Routes
app.get("/api/artists", (req, res) => {
  // Simple mock: return all users that are not visitors
  const allArtists = Array.from(users.values())
    .filter(u => u.account_type !== "visitor")
    .map(sanitizeUser);
  res.json(allArtists);
});

app.get("/api/artists/featured", (req, res) => {
  // Mock some featured artists
  const featured = [
    {
      id: "f1",
      first_name: "Amara",
      last_name: "Diop",
      country: "Senegal",
      sector: "Visual Arts",
      domain: "Painting",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Amara",
      bio: "Visual artist from Dakar focusing on contemporary African themes."
    },
    {
      id: "f2",
      first_name: "Kofi",
      last_name: "Mensah",
      country: "Ghana",
      sector: "Music",
      domain: "Production",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Kofi",
      bio: "Music producer specialized in Afro-fusion beats."
    }
  ];
  res.json(featured);
});

app.get("/api/artists/:id", (req, res) => {
  const artist = Array.from(users.values()).find(u => u.id === req.params.id);
  if (!artist) return res.status(404).json({ detail: "Artist not found" });
  res.json(sanitizeUser(artist));
});

app.post("/api/artists/:id/view", (req, res) => {
  res.json({ status: "success" });
});

// Messages
app.get("/api/messages/conversations", (req, res) => {
  res.json([]);
});

app.get("/api/messages/:userId", (req, res) => {
  res.json([]);
});

app.post("/api/messages", (req, res) => {
  res.json({ id: uuidv4(), ...req.body, created_at: new Date().toISOString() });
});

app.patch("/api/messages/:userId/read", (req, res) => {
  res.json({ status: "success" });
});

// Projects Routes
app.get("/api/projects", (req, res) => {
  let list = Array.from(projects.values());
  const { sector, status, collaboration_type } = req.query;
  if (sector) {
    list = list.filter((p: any) => p.sector === sector);
  }
  if (status) {
    list = list.filter((p: any) => p.status === status);
  }
  if (collaboration_type) {
    list = list.filter((p: any) => p.collaboration_type === collaboration_type);
  }
  res.json(list);
});

app.post("/api/projects", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const newProj = {
      id: uuidv4(),
      ...req.body,
      creator_id: user.id,
      creator: sanitizeUser(user),
      status: "upcoming",
      created_at: new Date().toISOString()
    };
    projects.set(newProj.id, newProj);
    res.status(201).json(newProj);
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.post("/api/projects/:id/apply", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    jwt.verify(token, SECRET_KEY);
    const proj = projects.get(req.params.id);
    if (!proj) return res.status(404).json({ detail: "Project not found" });
    res.json({ status: "success", message: "Application sent successfully" });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

// Feed/Posts
app.get("/api/posts", (req, res) => {
  const authHeader = req.headers.authorization;
  let currentUserId: string | null = null;
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded: any = jwt.verify(token, SECRET_KEY);
      currentUserId = decoded.id;
    } catch (e) {
      // Ignored
    }
  }

  let list = Array.from(posts.values());
  list.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const before = req.query.before as string;
  if (before) {
    list = list.filter((p: any) => new Date(p.created_at).getTime() < new Date(before).getTime());
  }

  const limit = parseInt(req.query.limit as string) || 10;
  const sliced = list.slice(0, limit);

  const mapped = sliced.map((p: any) => {
    const liked_by = p.liked_by || [];
    const postComments = Array.from(comments.values()).filter((c: any) => c.post_id === p.id);
    return {
      ...p,
      is_liked: currentUserId ? liked_by.includes(currentUserId) : false,
      likes_count: liked_by.length,
      comments_count: postComments.length
    };
  });

  res.json(mapped);
});

app.post("/api/posts", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const postId = uuidv4();
    const newPost = {
      id: postId,
      author_id: user.id,
      author: sanitizeUser(user),
      content_type: req.body.content_type || "text",
      text_content: req.body.text_content || "",
      media_url: req.body.media_url || null,
      created_at: new Date().toISOString(),
      liked_by: []
    };
    posts.set(postId, newPost);
    res.status(201).json({
      ...newPost,
      is_liked: false,
      likes_count: 0,
      comments_count: 0
    });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.post("/api/posts/upload", upload.single("file"), (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const postId = uuidv4();
    const newPost = {
      id: postId,
      author_id: user.id,
      author: sanitizeUser(user),
      content_type: req.body.content_type || "image",
      text_content: req.body.text_content || "",
      media_url: fileUrl,
      created_at: new Date().toISOString(),
      liked_by: []
    };
    posts.set(postId, newPost);
    res.status(201).json({
      ...newPost,
      is_liked: false,
      likes_count: 0,
      comments_count: 0
    });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.post("/api/posts/:postId/like", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const post = posts.get(req.params.postId);
    if (!post) return res.status(404).json({ detail: "Post not found" });

    if (!post.liked_by) {
      post.liked_by = [];
    }

    const index = post.liked_by.indexOf(user.id);
    let liked = false;
    if (index === -1) {
      post.liked_by.push(user.id);
      liked = true;
    } else {
      post.liked_by.splice(index, 1);
    }

    posts.set(post.id, post);

    res.json({
      liked,
      likes_count: post.liked_by.length
    });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.delete("/api/posts/:postId", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const post = posts.get(req.params.postId);
    if (!post) return res.status(404).json({ detail: "Post not found" });

    if (post.author_id !== decoded.id) {
      const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ detail: "Not authorized to delete this post" });
      }
    }

    posts.delete(req.params.postId);
    res.json({ status: "success" });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.get("/api/posts/:postId/comments", (req, res) => {
  const postComments = Array.from(comments.values())
    .filter((c: any) => c.post_id === req.params.postId)
    .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  res.json(postComments);
});

app.post("/api/posts/:postId/comments", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
    if (!user) return res.status(401).json({ detail: "User not found" });

    const post = posts.get(req.params.postId);
    if (!post) return res.status(404).json({ detail: "Post not found" });

    const commentId = uuidv4();
    const newComment = {
      id: commentId,
      post_id: post.id,
      author_id: user.id,
      author: sanitizeUser(user),
      content: req.body.content,
      created_at: new Date().toISOString()
    };
    comments.set(commentId, newComment);
    res.status(201).json(newComment);
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.delete("/api/comments/:commentId", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const comment = comments.get(req.params.commentId);
    if (!comment) return res.status(404).json({ detail: "Comment not found" });

    if (comment.author_id !== decoded.id) {
      const user = Array.from(users.values()).find((u: any) => u.id === decoded.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ detail: "Not authorized to delete this comment" });
      }
    }

    comments.delete(req.params.commentId);
    res.json({ status: "success" });
  } catch (e) {
    res.status(401).json({ detail: "Invalid token" });
  }
});

// Payments & Institutional Access
const payments = new Map();

app.get("/api/payments/status", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const payment = payments.get(decoded.id);
    if (!payment) {
      return res.json({ has_paid: false, access_code: null, paid_at: null });
    }
    res.json(payment);
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
});

app.post("/api/payments/mock-checkout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ detail: "Not authenticated" });
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded: any = jwt.verify(token, SECRET_KEY);
    const access_code = "INST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const paid_at = new Date().toISOString();
    
    const paymentData = {
      has_paid: true,
      access_code,
      paid_at
    };
    
    payments.set(decoded.id, paymentData);
    res.json(paymentData);
  } catch {
    res.status(401).json({ detail: "Invalid token" });
  }
});

// Admin Routes
app.get("/api/admin/pending-approvals", (req, res) => {
  const pending = Array.from(users.values()).filter(u => u.approval_status === "pending");
  res.json(pending.map(sanitizeUser));
});

app.get("/api/admin/institutions", (req, res) => {
  const institutions = Array.from(users.values()).filter(u => 
    u.role === "partenaire" || u.role === "personne_morale" || u.partner_code || u.account_type === "partner"
  );
  res.json(institutions.map(sanitizeUser));
});

app.post("/api/admin/create-partner", async (req, res) => {
  const { email, password, organization_name, country, city, subregion, bio, website, additional_info, role = "partenaire" } = req.body;
  if (!email) {
    return res.status(400).json({ detail: "Email required" });
  }
  if (users.has(email.toLowerCase())) {
    return res.status(400).json({ detail: "Email already registered" });
  }

  const userId = uuidv4();
  const partner_code = "INST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const hashedPassword = password ? await bcrypt.hash(password, 10) : await bcrypt.hash("partner123", 10);

  const newPartner = {
    id: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
    organization_name: organization_name || "Partner Institution",
    country: country || "Morocco",
    city: city || "",
    subregion: subregion || "North Africa",
    bio: bio || "",
    website: website || "",
    additional_info: additional_info || "",
    role: role || "partenaire",
    account_type: "partner",
    approval_status: "approved",
    partner_code,
    created_at: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(organization_name || "Partner")}`
  };

  users.set(newPartner.email, newPartner);

  // Grant statistics access automatically
  payments.set(userId, {
    has_paid: true,
    access_code: partner_code,
    paid_at: new Date().toISOString()
  });

  res.json({ status: "success", partner_code, user: sanitizeUser(newPartner) });
});

app.post("/api/admin/institutions/:id/regenerate-code", async (req, res) => {
  const { id } = req.params;
  let foundUser: any = null;
  for (const u of users.values()) {
    if (u.id === id) {
      foundUser = u;
      break;
    }
  }

  if (!foundUser) {
    return res.status(404).json({ detail: "Institution not found" });
  }

  const new_partner_code = "INST-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  foundUser.partner_code = new_partner_code;
  users.set(foundUser.email, foundUser);

  payments.set(foundUser.id, {
    has_paid: true,
    access_code: new_partner_code,
    paid_at: new Date().toISOString()
  });

  res.json({ status: "success", partner_code: new_partner_code });
});

app.post("/api/admin/approve-user", (req, res) => {
  const { user_id, status, rejection_reason } = req.body;
  const user = Array.from(users.values()).find(u => u.id === user_id);
  if (!user) return res.status(404).json({ detail: "User not found" });

  user.approval_status = status;
  if (rejection_reason) user.rejection_reason = rejection_reason;
  
  users.set(user.email, user);
  res.json({ status: "success", user: sanitizeUser(user) });
});

app.post("/api/admin/seed-dummy-data", async (req, res) => {
  const count = 850;
  const sectors = ["Visual Arts", "Music", "Cinema", "Literature", "Performance", "Fashion", "Digital Art", "Craft & Heritage"];
  const domains: Record<string, string[]> = {
    "Visual Arts": ["Painting", "Sculpture", "Photography", "Digital Art", "Drawing", "Printmaking", "Ceramics", "Installation Art", "Performance Art", "Street Art"],
    "Music": ["Composition", "Performance", "Production", "Singing", "Songwriting", "Sound Engineering", "DJing", "Instrumental Music"],
    "Cinema": ["Direction", "Acting", "Editing", "Screenwriting", "Cinematography", "Sound Design", "Production Design", "Documentary Filmmaking"],
    "Literature": ["Poetry", "Fiction", "Non-fiction", "Screenwriting", "Playwriting", "Journalism", "Essays", "Literary Criticism"],
    "Performance": ["Theater", "Dance", "Circus", "Puppetry", "Spoken Word", "Mime", "Physical Theater"],
    "Fashion": ["Design", "Modeling", "Tailoring", "Jewelry Design", "Textile Art", "Fashion Photography", "Styling"],
    "Digital Art": ["VR/AR", "Crypto Art", "AI Art", "3D Modeling", "Animation", "Graphic Design", "Web Art", "Game Design"],
    "Craft & Heritage": ["Pottery", "Weaving", "Woodworking", "Metalworking", "Basketry", "Traditional Jewelry", "Restoration"]
  };
  const citiesByCountry: Record<string, string[]> = {
    "Algeria": ["Algiers", "Oran", "Constantine"],
    "Egypt": ["Cairo", "Alexandria", "Giza"],
    "Libya": ["Tripoli", "Benghazi", "Misrata"],
    "Morocco": ["Casablanca", "Rabat", "Marrakech", "Fes", "Tangier"],
    "Mauritania": ["Nouakchott", "Nouadhibou"],
    "Tunisia": ["Tunis", "Sfax", "Sousse"],
    "Nigeria": ["Lagos", "Abuja", "Kano", "Ibadan"],
    "Senegal": ["Dakar", "Saint-Louis", "Touba"],
    "Cameroon": ["Douala", "Yaoundé", "Garoua"],
    "DRC": ["Kinshasa", "Lubumbashi", "Goma"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
    "Ethiopia": ["Addis Ababa", "Dire Dawa", "Gondar"],
    "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
    "Angola": ["Luanda", "Huambo", "Lobito"],
    "Diaspora": ["Paris", "Bruxelles", "New York", "Montréal", "Londres"]
  };
  const profileTags = ["artist", "professional", "media"];
  const firstNames = ["Amara", "Kofi", "Fatima", "Moussa", "Zainab", "Chidi", "Olumide", "Nneka", "Kwame", "Abeba", "Tariq", "Yasmine", "Omar", "Amina", "Lamine", "Malick", "Aissatou", "Modou", "Ibrahima", "Samba"];
  const lastNames = ["Diop", "Mensah", "Diallo", "Traore", "Okonkwo", "Kamau", "Bekele", "Sow", "Keita", "Bamba", "Fall", "Sane", "Gueye", "Ndiaye", "Cisse"];
  
  const hashedPassword = await bcrypt.hash("password123", 10);
  const seededUserIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const countryObj = AFRICAN_COUNTRIES[Math.floor(Math.random() * AFRICAN_COUNTRIES.length)];
    const cityList = citiesByCountry[countryObj.name] || ["Capital City"];
    const city = cityList[Math.floor(Math.random() * cityList.length)];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    const domainList = domains[sector] || ["General"];
    const domain = domainList[Math.floor(Math.random() * domainList.length)];
    const profileTag = profileTags[Math.floor(Math.random() * profileTags.length)];
    const gender = Math.random() > 0.52 ? "Female" : "Male";
    
    const email = `user${i}_${Date.now()}@example.com`;
    const userId = uuidv4();
    
    // Determine country of origin and diaspora country
    const isDiaspora = countryObj.name === "Diaspora";
    const africanOnlyCountries = AFRICAN_COUNTRIES.filter(c => c.name !== "Diaspora");
    const countryOriginObj = isDiaspora 
      ? africanOnlyCountries[Math.floor(Math.random() * africanOnlyCountries.length)]
      : countryObj;
    const country_origin = countryOriginObj.name;
    const diaspora_country = isDiaspora
      ? ["France", "Belgium", "Canada", "United States", "United Kingdom", "Germany", "Switzerland", "Italy", "Spain"][Math.floor(Math.random() * 9)]
      : "";

    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      first_name: fName,
      last_name: lName,
      country: countryObj.name,
      country_origin,
      diaspora_country,
      city,
      subregion: countryObj.subregion,
      sector,
      domain,
      gender,
      account_type: "artist",
      role: "artist",
      profile_tag: profileTag,
      approval_status: "approved",
      is_dummy: true,
      created_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fName}${lName}${i}${Date.now()}`,
      bio: isDiaspora 
        ? `Professional ${domain} artist of ${country_origin} origin, currently living in the diaspora (${diaspora_country}, ${city}). Passionate about pan-African creative collaboration.`
        : `Professional ${domain} artist based in ${city}, ${countryObj.name}. Passionate about pan-African creative collaboration.`
    };
    users.set(email, newUser);
    seededUserIds.push(userId);
  }
  
  res.json({ status: "success", count: users.size });
});

app.post("/api/admin/clear-dummy-data", (req, res) => {
  let count = 0;
  for (const [email, user] of users.entries()) {
    if (user.is_dummy) {
      users.delete(email);
      count++;
    }
  }
  res.json({ status: "success", count });
});

// Serve Frontend
const distPath = path.join(process.cwd(), "frontend", "build");

app.use(express.static(distPath));

// SPA Fallback: All routes not matching an API or static file
// must serve index.html to allow client-side routing (React Router).
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    console.warn(`404 API Route: ${req.method} ${req.path}`);
    return res.status(404).json({ error: "API route not found" });
  }

  // Prevent serving index.html for missing static resources (JS chunks, CSS, images, etc.)
  if (req.path.startsWith("/static/") || /\.(js|css|json|png|jpg|jpeg|gif|ico|svg|ttf|woff|woff2|chunk\.js)$/i.test(req.path)) {
    console.warn(`404 Static Asset: ${req.method} ${req.path}`);
    return res.status(404).send("Static asset not found");
  }

  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(indexPath, (err) => {
      if (err && !res.headersSent) {
        console.error("Failed to send index.html:", err);
        res.status(500).send("Server configuration error: failed to send index.html.");
      }
    });
  } else {
    res.status(404).send("Frontend build index.html not found. Please build frontend first.");
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
