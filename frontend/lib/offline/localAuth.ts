/**
 * Local Authentication for Desktop App
 * Stores user credentials securely in browser localStorage
 * No internet required
 */

import CryptoJS from 'crypto-js';

const AUTH_KEY = 'edgesoul_local_auth';
const USER_KEY = 'edgesoul_current_user';
const SECRET_KEY = 'edgesoul-secret-key-2024'; // In production, this should be more secure

export interface LocalUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: string;
  lastLogin: string;
}

interface StoredAuth {
  username: string;
  passwordHash: string;
  user: LocalUser;
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password: string): string {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
}

/**
 * Generate unique user ID
 */
function generateUserId(): string {
  return 'local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}

/**
 * Register a new user (offline)
 */
export function registerLocalUser(
  username: string,
  password: string,
  email: string = '',
  displayName: string = ''
): { success: boolean; message: string; user?: LocalUser } {
  try {
    // Check if user already exists
    const existingAuth = localStorage.getItem(AUTH_KEY);
    if (existingAuth) {
      const authData: StoredAuth = JSON.parse(existingAuth);
      if (authData.username === username) {
        return { success: false, message: 'Username already exists' };
      }
    }

    // Create new user
    const user: LocalUser = {
      id: generateUserId(),
      username,
      email: email || `${username}@local.edgesoul`,
      displayName: displayName || username,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Store credentials
    const authData: StoredAuth = {
      username,
      passwordHash: hashPassword(password),
      user,
    };

    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { success: true, message: 'Registration successful', user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
}

/**
 * Login with username and password (offline)
 */
export function loginLocalUser(
  username: string,
  password: string
): { success: boolean; message: string; user?: LocalUser } {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    
    if (!authData) {
      return { success: false, message: 'No user found. Please register first.' };
    }

    const storedAuth: StoredAuth = JSON.parse(authData);
    const passwordHash = hashPassword(password);

    if (storedAuth.username !== username) {
      return { success: false, message: 'Invalid username or password' };
    }

    if (storedAuth.passwordHash !== passwordHash) {
      return { success: false, message: 'Invalid username or password' };
    }

    // Update last login
    storedAuth.user.lastLogin = new Date().toISOString();
    localStorage.setItem(AUTH_KEY, JSON.stringify(storedAuth));
    localStorage.setItem(USER_KEY, JSON.stringify(storedAuth.user));

    return { success: true, message: 'Login successful', user: storedAuth.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed' };
  }
}

/**
 * Get current logged-in user
 */
export function getCurrentUser(): LocalUser | null {
  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Check if user is logged in
 */
export function isUserLoggedIn(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Logout current user
 */
export function logoutLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if any user is registered
 */
export function hasRegisteredUser(): boolean {
  return localStorage.getItem(AUTH_KEY) !== null;
}

/**
 * Change password
 */
export function changePassword(
  username: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) {
      return { success: false, message: 'No user found' };
    }

    const storedAuth: StoredAuth = JSON.parse(authData);
    const oldPasswordHash = hashPassword(oldPassword);

    if (storedAuth.username !== username || storedAuth.passwordHash !== oldPasswordHash) {
      return { success: false, message: 'Invalid current password' };
    }

    // Update password
    storedAuth.passwordHash = hashPassword(newPassword);
    localStorage.setItem(AUTH_KEY, JSON.stringify(storedAuth));

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: 'Password change failed' };
  }
}

/**
 * Delete user account
 */
export function deleteLocalUser(username: string, password: string): { success: boolean; message: string } {
  try {
    const authData = localStorage.getItem(AUTH_KEY);
    if (!authData) {
      return { success: false, message: 'No user found' };
    }

    const storedAuth: StoredAuth = JSON.parse(authData);
    const passwordHash = hashPassword(password);

    if (storedAuth.username !== username || storedAuth.passwordHash !== passwordHash) {
      return { success: false, message: 'Invalid credentials' };
    }

    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);

    return { success: true, message: 'Account deleted successfully' };
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, message: 'Account deletion failed' };
  }
}
