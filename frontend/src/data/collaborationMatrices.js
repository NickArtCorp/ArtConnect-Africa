/**
 * ArtConnectAfrica: Cultural Collaboration Matrices
 * Exhaustive statistical data for creative ecosystem mapping.
 */

export const CONTINENTAL_HIERARCHY = {
  "North Africa": {
    sub_regions: ["Maghreb", "Egypt"],
    countries: ["Morocco", "Algeria", "Tunisia", "Libya", "Egypt"]
  },
  "Sub-Saharan Africa": {
    sub_regions: ["West Africa", "Central Africa", "East Africa", "Southern Africa"],
    countries: {
      "West Africa": ["Nigeria", "Senegal", "Cote d'Ivoire", "Ghana", "Mali"],
      "Central Africa": ["Cameroon", "Gabon", "DRC", "Congo", "Chad"],
      "East Africa": ["Kenya", "Ethiopia", "Uganda", "Rwanda", "Tanzania"],
      "Southern Africa": ["South Africa", "Angola", "Zimbabwe", "Namibia", "Botswana"]
    }
  }
};

export const COMPARISON_DATA = [
  {
    pair: ["Morocco", "Egypt"],
    volume: 245,
    evolution: [
      { year: '2020', count: 32 },
      { year: '2021', count: 38 },
      { year: '2022', count: 45 },
      { year: '2023', count: 62 },
      { year: '2024', count: 68 }
    ],
    sectors: [
      { name: "Visual Arts", value: 35 },
      { name: "Music", value: 25 },
      { name: "Cinema", value: 20 },
      { name: "Literature", value: 15 },
      { name: "Performance", value: 5 }
    ],
    structures: {
      institutional: 40,
      independent: 45,
      private_residency: 15
    },
    projects: [
      { title: "Pan-Arab Heritage Expo", type: "Institutional", year: 2023 },
      { title: "Electronic Fusion Residency", type: "Independent", year: 2024 }
    ]
  },
  {
    pair: ["Nigeria", "South Africa"],
    volume: 512,
    evolution: [
      { year: '2020', count: 85 },
      { year: '2021', count: 92 },
      { year: '2022', count: 105 },
      { year: '2023', count: 110 },
      { year: '2024', count: 120 }
    ],
    sectors: [
      { name: "Music", value: 55 },
      { name: "Cinema", value: 25 },
      { name: "Visual Arts", value: 10 },
      { name: "Fashion", value: 10 }
    ],
    structures: {
      institutional: 20,
      independent: 65,
      private_residency: 15
    },
    projects: [
      { title: "Afrobeats ↔ Amapiano Summit", type: "Independent", year: 2023 },
      { title: "Nollywood-SA Distribution Pact", type: "Commercial", year: 2024 }
    ]
  },
  {
    pair: ["West Africa", "Central Africa"],
    volume: 842,
    evolution: [
      { year: '2020', count: 120 },
      { year: '2021', count: 145 },
      { year: '2022', count: 168 },
      { year: '2023', count: 195 },
      { year: '2024', count: 214 }
    ],
    sectors: [
      { name: "Visual Arts", value: 30 },
      { name: "Music", value: 40 },
      { name: "Cinema", value: 15 },
      { name: "Literature", value: 10 },
      { name: "Performance", value: 5 }
    ],
    structures: {
      institutional: 35,
      independent: 50,
      private_residency: 15
    }
  }
];
