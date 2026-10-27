// Reemplazo de @google/genai para la app consolidada.
// El "Análisis con IA" del preceptor llamaba a Gemini DESDE EL NAVEGADOR, con la clave expuesta.
// Hasta que exista un endpoint en el backend (backlog INT-90), la función avisa que no está disponible.
export const Type = { OBJECT: 'OBJECT', ARRAY: 'ARRAY', STRING: 'STRING', NUMBER: 'NUMBER', INTEGER: 'INTEGER', BOOLEAN: 'BOOLEAN' } as const;

export class GoogleGenAI {
  constructor(_opts: { apiKey?: string }) {}
  models = {
    generateContent: async (_req: unknown): Promise<{ text: string }> => {
      throw new Error('El análisis con IA todavía no está habilitado: se va a hacer desde el servidor para no exponer la clave.');
    },
  };
}
