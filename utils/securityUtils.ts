// Security utilities for input sanitization and validation

export const sanitizeForLog = (input: any): string => {
  if (typeof input === 'string') {
    return input.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
  }
  return JSON.stringify(input).replace(/[\r\n\t]/g, ' ').substring(0, 1000);
};

export const validateUserId = (userId: string): boolean => {
  return typeof userId === 'string' && userId.length > 0 && userId.length < 100;
};

export const validateId = (id: string): boolean => {
  return typeof id === 'string' && id.length > 0 && id.length < 100;
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().substring(0, 1000);
};