export interface AgeRange {
  minAge: number;
  maxAge: number;
}

export interface UserPreferences {
  minAge?: number;
  maxAge?: number;
}

export function getAgeRange(userAge: number, preferences?: UserPreferences): AgeRange {
  if (preferences?.minAge && preferences?.maxAge) {
    return {
      minAge: Math.max(18, preferences.minAge),
      maxAge: preferences.maxAge
    };
  }

  let minAge: number;
  let maxAge: number;

  if (userAge >= 18 && userAge <= 25) {
    minAge = 18;
    maxAge = 28;
  } else if (userAge >= 26 && userAge <= 35) {
    minAge = userAge - 5;
    maxAge = userAge + 5;
  } else if (userAge >= 36 && userAge <= 45) {
    minAge = userAge - 7;
    maxAge = userAge + 7;
  } else if (userAge >= 46 && userAge <= 55) {
    minAge = userAge - 8;
    maxAge = userAge + 8;
  } else {
    minAge = userAge - 10;
    maxAge = userAge + 10;
  }

  minAge = Math.max(18, minAge);

  return { minAge, maxAge };
}

export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function isAgeCompatible(userAge: number, targetAge: number, preferences?: UserPreferences): boolean {
  const { minAge, maxAge } = getAgeRange(userAge, preferences);
  return targetAge >= minAge && targetAge <= maxAge;
}
