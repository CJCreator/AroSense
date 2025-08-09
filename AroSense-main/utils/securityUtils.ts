// Security utilities for input sanitization and validation

export const sanitizeForLog = (input: any): string => {
  if (typeof input === 'string') {
    return input.replace(/[\r\n\t]/g, ' ').substring(0, 1000);
  }
  return JSON.stringify(input).replace(/[\r\n\t]/g, ' ').substring(0, 1000);
};

export const validateUserId = (userId: string): string => {
  if (!userId || typeof userId !== 'string' || userId.length === 0 || userId.length >= 100) {
    throw new Error('Invalid user ID');
  }
  return userId;
};

export const validateId = (id: string): string => {
  if (!id || typeof id !== 'string' || id.length === 0 || id.length >= 100) {
    throw new Error('Invalid ID');
  }
  return id;
};

export const sanitizeInput = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().substring(0, 1000);
};