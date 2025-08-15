// js/auth.js
// Jednostavan storage tokena u localStorage

const TOKEN_KEY = "auth_token";

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function isLoggedIn() {
  return !!getToken();
}

// (opciono) izloži na window za brzo testiranje u konzoli
window.Auth = { setToken, getToken, clearToken, isLoggedIn };