export interface FrenchCity {
  nom: string;
  codePostal: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number;
}

export const searchFrenchCities = async (query: string): Promise<FrenchCity[]> => {
  if (query.length < 2) return [];

  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,population&boost=population&limit=10`
    );

    if (!response.ok) {
      console.error('Failed to fetch cities');
      return [];
    }

    const villes = await response.json();

    return villes.map((ville: any) => ({
      nom: ville.nom,
      codePostal: ville.codesPostaux?.[0] || '',
      coordinates: {
        lat: ville.centre?.coordinates?.[1] || 0,
        lng: ville.centre?.coordinates?.[0] || 0,
      },
      population: ville.population || 0,
    }));
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const getCityByCoordinates = async (lat: number, lng: number): Promise<FrenchCity | null> => {
  try {
    const response = await fetch(
      `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lng}&fields=nom,centre,codesPostaux,population`
    );

    if (!response.ok) {
      return null;
    }

    const villes = await response.json();

    if (villes.length > 0) {
      const ville = villes[0];
      return {
        nom: ville.nom,
        codePostal: ville.codesPostaux?.[0] || '',
        coordinates: {
          lat: ville.centre?.coordinates?.[1] || lat,
          lng: ville.centre?.coordinates?.[0] || lng,
        },
        population: ville.population || 0,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting city by coordinates:', error);
    return null;
  }
};

export const getUserLocation = (): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        resolve(null);
      }
    );
  });
};

export const calculateDistance = (
  coord1: { lat: number; lng: number } | null | undefined,
  coord2: { lat: number; lng: number } | null | undefined
): number => {
  if (!coord1 || !coord2) return Infinity;

  const R = 6371;
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
};

export const formatDistance = (km: number): string => {
  if (km === Infinity || km === null) return '';
  if (km < 1) return '< 1 km';
  if (km < 10) return `${km} km`;
  if (km < 100) return `~${Math.round(km / 5) * 5} km`;
  return `${Math.round(km / 10) * 10} km`;
};
