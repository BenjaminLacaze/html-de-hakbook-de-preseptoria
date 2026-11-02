import { profile } from './adapters';
import type { StudentProfile } from '../types';
export const studentService = {
  getProfile: profile,
  async updateContactInfo(_info: { email: string; telefono: string }): Promise<StudentProfile> {
    throw new Error('La ficha institucional la actualiza Secretaría.');
  },
};
