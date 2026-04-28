// Data structure for Cuban provinces and their municipalities
export const PROVINCES_AND_MUNICIPALITIES = {
  "Pinar del Río": [
    "Pinar del Río",
    "Viñales",
  ],
  "Artemisa": [
    "Artemisa",
    "Mariel",
  ], 
  "Mayabeque": [
    "San José de las Lajas",
    "Guines"
  ],
  "Isla de la Juventud": [
    "Nueva Gerona",
    "Isla de la Juventud rural"
  ],
  "La Habana": [
    "Plaza de la Revolución",
    "Playa",
  ],
  "Matanzas": [
    "Matanzas",
    "Varadero",
  ],
  "Cienfuegos": [
    "Cienfuegos",
    "Cruces"
  ],
  "Villa Clara": [
    "Santa Clara",
    "Caibarién"
  ],

  "Sancti Spíritus": [
    "Sancti Spíritus",
    "Trinidad"
  ],
  "Ciego de Ávila": [
    "Ciego de Ávila",
    "Morón",
  ],
  "Camagüey": [
    "Camagüey",
    "Florida"
  ],
  "Las Tunas": [
    "Las Tunas",
    "Puerto Padre"
  ],
  "Granma": [
    "Bayamo",
    "Manzanillo",
  ],
  "Holguín": [
    "Holguín",
    "Banes",
  ],
  
  "Santiago de Cuba": [
    "Santiago de Cuba",
    "Contramaestre",
  ],
  "Guantánamo": [
    "Guantánamo",
    "Baracoa",
  ]
  
};

// Helper functions
export const getProvinces = (): string[] => {
  return Object.keys(PROVINCES_AND_MUNICIPALITIES).sort();
};

export const getMunicipalitiesByProvince = (province: string): string[] => {
  return PROVINCES_AND_MUNICIPALITIES[province as keyof typeof PROVINCES_AND_MUNICIPALITIES] || [];
};


const PROVINCES = Object.keys(PROVINCES_AND_MUNICIPALITIES);

// Get province ID based on name
export const getProvinceId = (provinceName: string): number => {
  return PROVINCES.indexOf(provinceName) + 1;
};
// Get municipality ID based on province name and municipality name
export const getMunicipalityId = (provinceName: string, municipalityName: string): number => {
  const province = getProvinceId(provinceName);
  let total = 0;
  for (let i = 0; i < province - 1; i++) {
    total += getMunicipalitiesByProvince(PROVINCES[i]).length;
  }

  console.log(`Calculating municipality ID for ${municipalityName} in ${provinceName}: Province ID = ${province}, Total municipalities before this province = ${total}`);
  console.log(total + getMunicipalitiesByProvince(provinceName).indexOf(municipalityName) + 1);

  return total + getMunicipalitiesByProvince(provinceName).indexOf(municipalityName) + 1;
};

// Get province name by ID
export const getProvinceNameById = (provinceId: number): string => {
  return PROVINCES[provinceId - 1] || "";
};

// Get municipality name by province ID and municipality ID
export const getMunicipalityNameById = (provinceId: number, municipalityId: number): string => {
  const provinceName = getProvinceNameById(provinceId);
  const municipalities = getMunicipalitiesByProvince(provinceName);
  // Calculate the actual index within the province
  let provinceStartIndex = 0;
  for (let i = 0; i < provinceId - 1; i++) {
    provinceStartIndex += getMunicipalitiesByProvince(PROVINCES[i]).length;
  }
  const indexInProvince = municipalityId - provinceStartIndex - 1;
  return municipalities[indexInProvince] || "";
};