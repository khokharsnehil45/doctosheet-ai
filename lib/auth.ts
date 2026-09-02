export interface User {
  id: string;
  email: string;
  name?: string;
  isGuest?: boolean;
  isPro: boolean;
  proPlanName?: string;
  proToken?: string;
  creditsUsed: number;
  maxFreeCredits: number;
  customApiKey?: string;
  createdAt: string;
}

const STORAGE_KEY_CURRENT_USER = 'doctosheet_current_user_id';
const STORAGE_KEY_USERS_DB = 'doctosheet_users_db';
const COOKIE_NAME = 'doctosheet_session';

export const MAX_FREE_CREDITS_PER_USER = 2;

function getUsersDB(): Record<string, User> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsersDB(db: Record<string, User>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save users database', e);
  }
}

function setSessionCookie(userId: string) {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=${userId}; path=/; max-age=2592000; SameSite=Lax`;
  }
}

function clearSessionCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const currentId = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (!currentId) return null;

  const db = getUsersDB();
  return db[currentId] || null;
}

export function signupUser(email: string, _password?: string, name?: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const db = getUsersDB();

  // Check if existing user by email
  const existingUserId = Object.keys(db).find((id) => db[id].email.toLowerCase() === cleanEmail);
  if (existingUserId) {
    const existing = db[existingUserId];
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, existing.id);
    setSessionCookie(existing.id);
    return existing;
  }

  const newUserId = `usr_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  const newUser: User = {
    id: newUserId,
    email: cleanEmail,
    name: name?.trim() || cleanEmail.split('@')[0],
    isGuest: false,
    isPro: false,
    creditsUsed: 0,
    maxFreeCredits: MAX_FREE_CREDITS_PER_USER,
    createdAt: new Date().toISOString(),
  };

  db[newUserId] = newUser;
  saveUsersDB(db);
  localStorage.setItem(STORAGE_KEY_CURRENT_USER, newUserId);
  setSessionCookie(newUserId);
  return newUser;
}

export function loginUser(email: string, _password?: string): User {
  const cleanEmail = email.trim().toLowerCase();
  const db = getUsersDB();

  const existingUserId = Object.keys(db).find((id) => db[id].email.toLowerCase() === cleanEmail);
  if (existingUserId) {
    const user = db[existingUserId];
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, user.id);
    setSessionCookie(user.id);
    return user;
  }

  // If user doesn't exist, automatically sign them up for seamless frictionless access
  return signupUser(cleanEmail, _password);
}

export function loginAsGuest(): User {
  const guestId = `guest_${Math.random().toString(36).substring(2, 8)}`;
  const guestUser: User = {
    id: guestId,
    email: `guest_${guestId.substring(6)}@doctosheet.local`,
    name: 'Guest User',
    isGuest: true,
    isPro: false,
    creditsUsed: 0,
    maxFreeCredits: MAX_FREE_CREDITS_PER_USER,
    createdAt: new Date().toISOString(),
  };

  const db = getUsersDB();
  db[guestId] = guestUser;
  saveUsersDB(db);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, guestId);
    setSessionCookie(guestId);
  }

  return guestUser;
}

export function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    clearSessionCookie();
  }
}

export function updateUserRecord(user: User): User {
  const db = getUsersDB();
  db[user.id] = user;
  saveUsersDB(db);
  return user;
}

export function recordUserConversion(userId: string): User | null {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;

  if (!user.isPro) {
    user.creditsUsed = (user.creditsUsed || 0) + 1;
    db[userId] = user;
    saveUsersDB(db);
  }

  return user;
}

export function updateUserApiKey(userId: string, key: string): User | null {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;

  user.customApiKey = key.trim() || undefined;
  db[userId] = user;
  saveUsersDB(db);
  return user;
}

export function upgradeUserToPro(userId: string, planName: string = 'Pro Unlimited ($19/mo)'): User | null {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;

  user.isPro = true;
  user.proPlanName = planName;
  user.proToken = `pro_token_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
  db[userId] = user;
  saveUsersDB(db);
  return user;
}

export function resetUserCredits(userId: string): User | null {
  const db = getUsersDB();
  const user = db[userId];
  if (!user) return null;

  user.creditsUsed = 0;
  user.isPro = false;
  user.proPlanName = undefined;
  user.proToken = undefined;
  db[userId] = user;
  saveUsersDB(db);
  return user;
}
