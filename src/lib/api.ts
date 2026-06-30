export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://edu-platform-backend-one.vercel.app";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

export function cleanPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== "" && value !== undefined),
  );
}

export async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const text = Array.isArray(data?.message) ? data.message.join(", ") : data?.message;
    throw new Error(text || "Request failed");
  }

  return data as T;
}
