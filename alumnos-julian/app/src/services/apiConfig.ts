/**
 * Configuración central de modo de datos.
 * Permite alternar entre los servicios de demostración tipados y la API REST real.
 */
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK !== 'false';

// Simulación de latencia realista de red para mostrar estados de carga impecables
export const simulateNetworkLatency = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
