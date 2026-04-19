// // Data structure for Cuban provinces and their municipalities
// export const PROVINCES_AND_MUNICIPALITIES = {
//   "Pinar del Río": [
//     "Pinar del Río",
//     "San Luis",
//     "Los Palacios",
//     "Viñales",
//     "Minas de Matahambre",
//     "San Juan y Martínez",
//     "Sandino"
//   ],
//   "La Habana": [
//     "Playa",
//     "Plaza",
//     "Cerro",
//     "Diez de Octubre",
//     "Habana Vieja",
//     "San Miguel del Padrón",
//     "Regla",
//     "Guanabacoa",
//     "Santa María del Rosario",
//     "Cotorro",
//     "Boyeros",
//     "La Lisa"
//   ],
//   "Artemisa": [
//     "Artemisa",
//     "Guanajay",
//     "San Cristóbal",
//     "Bahía Honda",
//     "Mariel",
//     "Candelaria"
//   ],
//   "Mayabeque": [
//     "San José de las Lajas",
//     "Bejucal",
//     "Madruga",
//     "Guines",
//     "Santa Cruz del Norte",
//     "Nueva Paz",
//     "Melena del Sur",
//     "Quivicán"
//   ],
//   "Matanzas": [
//     "Matanzas",
//     "Los Arabos",
//     "El Rosario",
//     "Jagüey Grande",
//     "Calimete",
//     "Palma Soriano",
//     "Colon",
//     "Martí",
//     "Limonar",
//     "Varadero",
//     "Cardenas"
//   ],
//   "Villa Clara": [
//     "Santa Clara",
//     "Encrucijada",
//     "Manicaragua",
//     "Remedios",
//     "Sagua la Grande",
//     "Camajuaní",
//     "Cifuentes",
//     "Placetas",
//     "Santo Domingo",
//     "Ranchuelo",
//     "Vueltas"
//   ],
//   "Cienfuegos": [
//     "Cienfuegos",
//     "Abreus",
//     "Cumanayagua",
//     "Cruces",
//     "Lajas",
//     "Palmira",
//     "Rodas"
//   ],
//   "Sancti Spíritus": [
//     "Sancti Spíritus",
//     "Yaguajay",
//     "Fomento",
//     "Manicaragua",
//     "Jatibonico",
//     "La Sierpe",
//     "Trinidad"
//   ],
//   "Ciego de Ávila": [
//     "Ciego de Ávila",
//     "Morón",
//     "Bolivia",
//     "Chambas",
//     "Majagua",
//     "Primero de Enero",
//     "Venezuela"
//   ],
//   "Camagüey": [
//     "Camagüey",
//     "Minas",
//     "Nuevitas",
//     "Guáimaro",
//     "Sibanicú",
//     "Esmeralda",
//     "Contramaestre",
//     "Vertientes",
//     "Jimaguayú",
//     "Céspedes",
//     "Carlos Manuel de Céspedes"
//   ],
//   "Las Tunas": [
//     "Las Tunas",
//     "Manatí",
//     "Jesús Menéndez",
//     "Jobabo",
//     "Mayarí",
//     "Antilla",
//     "Frank País"
//   ],
//   "Holguín": [
//     "Holguín",
//     "Gibara",
//     "Banes",
//     "Báguano",
//     "Moa",
//     "Sagua de Tánamo",
//     "Calixto García",
//     "Cacocum",
//     "Rafael Freyre"
//   ],
//   "Granma": [
//     "Bayamo",
//     "Manzanillo",
//     "Bartolomé Masó",
//     "Niquero",
//     "Yara",
//     "Jiguaní",
//     "Guisa"
//   ],
//   "Santiago de Cuba": [
//     "Santiago de Cuba",
//     "Guantánamo",
//     "El Salvador",
//     "San Luis",
//     "Palma Soriano",
//     "Contramaestre",
//     "Tercer Frente"
//   ],
//   "Guantánamo": [
//     "Guantánamo",
//     "El Salvador",
//     "Baracoa",
//     "Maisí",
//     "Imías",
//     "Yateras",
//     "Caimanera",
//     "Niceto Pérez"
//   ],
//   "Isla de la Juventud": [
//     "Nueva Gerona",
//     "La Fe",
//     "El Sumidero",
//     "Cocodrilo"
//   ]
// };

// // Helper functions
// export const getProvinces = (): string[] => {
//   return Object.keys(PROVINCES_AND_MUNICIPALITIES).sort();
// };

// export const getMunicipalitiesByProvince = (province: string): string[] => {
//   return PROVINCES_AND_MUNICIPALITIES[province as keyof typeof PROVINCES_AND_MUNICIPALITIES] || [];
// };



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
