// ═══════════════════════════════════════════════════════════════════════
// SUPABASE HELPERS - Snake_case <-> camelCase mapping
// ═══════════════════════════════════════════════════════════════════════

/**
 * Convert snake_case object keys to camelCase
 */
export function toCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const camelObj: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelObj[camelKey] = toCamelCase(obj[key]);
      }
    }
    
    return camelObj as T;
  }
  
  return obj;
}

/**
 * Convert camelCase object keys to snake_case
 */
export function toSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const snakeObj: any = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeObj[snakeKey] = toSnakeCase(obj[key]);
      }
    }
    
    return snakeObj as T;
  }
  
  return obj;
}
