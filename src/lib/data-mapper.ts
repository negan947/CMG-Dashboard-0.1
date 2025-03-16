/**
 * Converts a string from snake_case to camelCase
 */
export const snakeToCamel = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Converts a string from camelCase to snake_case
 */
export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Converts an object's keys from snake_case to camelCase recursively
 */
export const snakeToCamelObject = <T extends object>(obj: Record<string, any>): T => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Recursively convert nested objects
      result[camelKey] = snakeToCamelObject(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[camelKey] = value.map(item => 
        item !== null && typeof item === 'object' && !(item instanceof Date) 
          ? snakeToCamelObject(item) 
          : item
      );
    } else {
      result[camelKey] = value;
    }
  });
  
  return result as T;
};

/**
 * Converts an object's keys from camelCase to snake_case recursively
 */
export const camelToSnakeObject = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const snakeKey = camelToSnake(key);
    const value = obj[key];
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      // Recursively convert nested objects
      result[snakeKey] = camelToSnakeObject(value);
    } else if (Array.isArray(value)) {
      // Handle arrays
      result[snakeKey] = value.map(item => 
        item !== null && typeof item === 'object' && !(item instanceof Date)
          ? camelToSnakeObject(item) 
          : item
      );
    } else {
      result[snakeKey] = value;
    }
  });
  
  return result;
};

/**
 * Maps database rows to model objects with camelCase properties
 */
export function mapDbRows<T extends object>(rows: Record<string, any>[]): T[] {
  return rows.map(row => snakeToCamelObject<T>(row));
}

/**
 * Maps a single database row to a model object with camelCase properties
 */
export function mapDbRow<T extends object>(row: Record<string, any>): T {
  return snakeToCamelObject<T>(row);
}

/**
 * Maps a model object with camelCase properties to a database object with snake_case properties
 */
export function mapToDb<T>(model: Record<string, any>): Record<string, any> {
  return camelToSnakeObject(model);
} 