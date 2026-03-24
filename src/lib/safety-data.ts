// This file centralizes safety data for various locations.
// It is a standard TypeScript file without the 'use client' directive
// so it can be safely imported by both Client and Server Components.

export type SafetyInfo = {
  locationName: string;
  latitude: number;
  longitude: number;
  emergencyNumbers: {
    serviceKey: string;
    number: string;
    icon: string;
  }[];
  embassy: {
    country: string;
    name: string;
    address: string;
    phone: string;
  };
  emergencyPhrases: {
    english: string;
    local: string;
  }[];
};

export const safetyData: Record<string, SafetyInfo> = {
  'paris': {
    locationName: 'Paris, France',
    latitude: 48.8566,
    longitude: 2.3522,
    emergencyNumbers: [
      { serviceKey: 'safety.police', number: '17', icon: 'Siren' },
      { serviceKey: 'safety.ambulance', number: '15', icon: 'Ambulance' },
      { serviceKey: 'safety.fire', number: '18', icon: 'Flame' },
      { serviceKey: 'safety.europeanEmergency', number: '112', icon: 'ShieldAlert' },
    ],
    embassy: {
      country: 'Your Home Country',
      name: 'Embassy of [Your Country]',
      address: '123 Embassy Row, Paris, France',
      phone: '+33 1 23 45 67 89',
    },
    emergencyPhrases: [
      { english: 'I need help.', local: 'J\'ai besoin d\'aide.' },
      { english: 'Where is the nearest hospital?', local: 'Où est l\'hôpital le plus proche ?' },
      { english: 'Please call the police.', local: 'S\'il vous plaît, appelez la police.' },
      { english: 'I am lost.', local: 'Je suis perdu(e).'},
    ],
  },
  'tokyo': {
    locationName: 'Tokyo, Japan',
    latitude: 35.6895,
    longitude: 139.6917,
    emergencyNumbers: [
      { serviceKey: 'safety.police', number: '110', icon: 'Siren' },
      { serviceKey: 'safety.ambulance', number: '119', icon: 'Ambulance' },
      { serviceKey: 'safety.fire', number: '119', icon: 'Flame' },
    ],
    embassy: {
      country: 'Your Home Country',
      name: 'Embassy of [Your Country]',
      address: '1-10-5 Akasaka, Minato-ku, Tokyo',
      phone: '+81 3-3224-5000',
    },
    emergencyPhrases: [
      { english: 'I need help.', local: '助けてください (Tasukete kudasai)' },
      { english: 'Where is the nearest hospital?', local: '最寄りの病院はどこですか (Moyori no byōin wa doko desu ka)' },
      { english: 'Please call the police.', local: '警察を呼んでください (Keisatsu o yonde kudasai)' },
      { english: 'I am lost.', local: '道に迷いました (Michi ni mayoi mashita)'},
    ],
  },
  'new-york': {
    locationName: 'New York, USA',
    latitude: 40.7128,
    longitude: -74.0060,
    emergencyNumbers: [
      { serviceKey: 'safety.emergency', number: '911', icon: 'ShieldAlert' },
    ],
    embassy: {
      country: 'Your Home Country',
      name: 'Consulate of [Your Country]',
      address: '123 Consulate Ave, New York, NY',
      phone: '+1 212-123-4567',
    },
    emergencyPhrases: [
      { english: 'I need help.', local: 'I need help.' },
      { english: 'Where is the nearest hospital?', local: 'Where is the nearest hospital?' },
      { english: 'Please call the police.', local: 'Please call the police.' },
      { english: 'I am lost.', local: 'I am lost.'},
    ],
  }
};
