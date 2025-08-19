// src/api.js

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

/**
 * Generic API wrapper
 * @param {string} path - API endpoint path (e.g., "/tasks")
 * @param {object} options - fetch options
 */
export async function api(path, { method = "GET", token, json } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: json ? JSON.stringify(json) : undefined,
    });

    // CORS or network issue
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Fetch failed:", err);
    throw err;
  }
}

// ===== Specific API calls =====

export function register(email, password) {
  return api("/auth/register", {
    method: "POST",
    json: { email, password },
  });
}

export function login(email, password) {
  return api("/auth/login", {
    method: "POST",
    json: { email, password },
  });
}

export function listTasks(token) {
  return api("/tasks", { method: "GET", token });
}

export function createTask(token, title, dueDate) {
  return api("/tasks", {
    method: "POST",
    token,
    json: { title, dueDate },
  });
}

export function deleteTask(token, taskId) {
  return api(`/tasks/${taskId}`, { method: "DELETE", token });
}

export function updateTask(token, taskId, updates) {
  return api(`/tasks/${taskId}`, {
    method: "PUT",
    token,
    json: updates,
  });
}
