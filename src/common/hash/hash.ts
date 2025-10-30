import { compare, hash } from 'bcrypt';

export const Hash = async (plainText: string, saltRound: number = 12) => {
  return hash(plainText, saltRound);
};

export const Compare = async (plainText: string, cipherText: string) => {
  return compare(plainText, cipherText);
};
