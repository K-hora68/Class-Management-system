const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

export function chatWebSocketUrl(roomId) {
  const baseUrl = import.meta.env.VITE_CHAT_WS_BASE_URL || new URL(API_BASE_URL).origin;
  const webSocketBaseUrl = baseUrl.replace(/^http:/, "ws:").replace(/^https:/, "wss:");
  return `${webSocketBaseUrl.replace(/\/$/, "")}/ws/chat/${encodeURIComponent(roomId)}`;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });
  const result = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(result?.error?.message || "The request could not be completed.");
    error.code = result?.error?.code || "REQUEST_FAILED";
    error.details = result?.error?.details || {};
    error.status = response.status;
    throw error;
  }

  return result?.data ?? result;
}

export function getApiErrorMessage(error) {
  if (error instanceof TypeError) {
    return "The learning service could not be reached. Check that the API is running.";
  }

  return error.message || "Something went wrong. Please try again.";
}