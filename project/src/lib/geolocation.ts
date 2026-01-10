export interface City {
  name: string;
  country: string;
  displayName: string;
}

export const popularCities: City[] = [
  { name: 'Paris', country: 'France', displayName: 'Paris, France' },
  { name: 'Marseille', country: 'France', displayName: 'Marseille, France' },
  { name: 'Lyon', country: 'France', displayName: 'Lyon, France' },
  { name: 'Toulouse', country: 'France', displayName: 'Toulouse, France' },
  { name: 'Nice', country: 'France', displayName: 'Nice, France' },
  { name: 'Nantes', country: 'France', displayName: 'Nantes, France' },
  { name: 'Bordeaux', country: 'France', displayName: 'Bordeaux, France' },
  { name: 'Lille', country: 'France', displayName: 'Lille, France' },
  { name: 'Strasbourg', country: 'France', displayName: 'Strasbourg, France' },
  { name: 'Montpellier', country: 'France', displayName: 'Montpellier, France' },
  { name: 'Rennes', country: 'France', displayName: 'Rennes, France' },
  { name: 'Reims', country: 'France', displayName: 'Reims, France' },
  { name: 'Toulon', country: 'France', displayName: 'Toulon, France' },
  { name: 'Saint-Étienne', country: 'France', displayName: 'Saint-Étienne, France' },
  { name: 'Le Havre', country: 'France', displayName: 'Le Havre, France' },
  { name: 'Grenoble', country: 'France', displayName: 'Grenoble, France' },
  { name: 'Dijon', country: 'France', displayName: 'Dijon, France' },
  { name: 'Angers', country: 'France', displayName: 'Angers, France' },
  { name: 'Nîmes', country: 'France', displayName: 'Nîmes, France' },
  { name: 'Villeurbanne', country: 'France', displayName: 'Villeurbanne, France' },
  { name: 'Bruxelles', country: 'Belgique', displayName: 'Bruxelles, Belgique' },
  { name: 'Genève', country: 'Suisse', displayName: 'Genève, Suisse' },
  { name: 'Lausanne', country: 'Suisse', displayName: 'Lausanne, Suisse' },
  { name: 'Luxembourg', country: 'Luxembourg', displayName: 'Luxembourg, Luxembourg' },
  { name: 'Monaco', country: 'Monaco', displayName: 'Monaco' }
];

export function searchCities(query: string): City[] {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return popularCities.slice(0, 10);

  return popularCities.filter(city =>
    city.name.toLowerCase().includes(normalizedQuery) ||
    city.country.toLowerCase().includes(normalizedQuery) ||
    city.displayName.toLowerCase().includes(normalizedQuery)
  );
}

export async function getCurrentLocation(): Promise<{ city: string; country: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        resolve({ city: 'Paris', country: 'France' });
      },
      () => {
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
}
