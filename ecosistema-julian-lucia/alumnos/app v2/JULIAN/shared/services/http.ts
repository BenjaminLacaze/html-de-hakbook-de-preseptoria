export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      credentials: "include",
      cache: "no-store",
      headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor institucional.", 0);
  }

  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null) as { error?: { message?: string } } | null;
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event("i26:session-expired"));
    }
    throw new ApiError(data?.error?.message ?? "La solicitud no pudo completarse.", response.status);
  }
  return data as T;
}

export interface AuthMe {
  user: { id: string; email: string; firstName: string; lastName: string; roles: string[] };
  studentId: string | null;
  mustChangePassword: boolean;
}

export const getMe = async (): Promise<AuthMe | null> => {
  try {
    return await apiFetch<AuthMe>("/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
};

export const login = (email: string, password: string) =>
  apiFetch<AuthMe>("/auth/login", { method: "POST", body: { email, password } });

export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<AuthMe>("/auth/change-password", { method: "POST", body: { currentPassword, newPassword } });

export const logout = () => apiFetch<void>("/auth/logout", { method: "POST" });
