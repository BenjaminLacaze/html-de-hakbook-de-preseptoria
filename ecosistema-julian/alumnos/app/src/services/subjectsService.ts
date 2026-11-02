import { loadSubjects, subject } from './adapters';
export const subjectsService = { async getSubjects() { return (await loadSubjects()).map(subject); }, async getSubjectById(id: string) { return (await this.getSubjects()).find(s => s.id === id) ?? null; } };
