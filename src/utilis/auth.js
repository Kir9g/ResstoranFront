import {jwtDecode} from 'jwt-decode';

export function saveToken(token) {
  localStorage.setItem('jwt_token', token);
}

export function getToken() {
  return localStorage.getItem('jwt_token');
}

export function logout() {
  localStorage.removeItem('jwt_token');
}

export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    return Date.now() < exp * 1000;
  } catch (e) {
    return false;
  }
}

export function getUserRole() {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;
  } catch (e) {
    return null;
  }
}
