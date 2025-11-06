import { compare, hash } from 'bcrypt';

export const Hash = async (plainText: string, saltRound: number = 12) => {
  try {
    const hashedText = await hash(plainText, saltRound);
    console.log('Hash function debug:', {
      input: plainText,
      output: hashedText,
      isValid: hashedText.startsWith('$2b$'),
    });
    return hashedText;
  } catch (error) {
    console.error('Hash function error:', error);
    throw error;
  }
};

export const Compare = async (plainText: string, hashedText: string) => {
  try {
    const result = await compare(plainText, hashedText);
    console.log('Compare function debug:', {
      plainText,
      hashedText,
      result,
    });
    return result;
  } catch (error) {
    console.error('Compare function error:', error);
    return false;
  }
};
