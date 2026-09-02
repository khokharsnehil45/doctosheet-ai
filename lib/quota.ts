import { UserCreditsState } from './types';

const STORAGE_KEY_USAGE = 'doctosheet_credits_used';
const STORAGE_KEY_PRO = 'doctosheet_pro_status';
const STORAGE_KEY_PLAN = 'doctosheet_pro_plan';
const STORAGE_KEY_TOKEN = 'doctosheet_pro_token';
const STORAGE_KEY_API_KEY = 'doctosheet_custom_gemini_key';

export const MAX_FREE_CREDITS = 2;

export function getUserQuota(): UserCreditsState {
  if (typeof window === 'undefined') {
    return {
      creditsUsed: 0,
      maxFreeCredits: MAX_FREE_CREDITS,
      isPro: false,
    };
  }

  const isPro = localStorage.getItem(STORAGE_KEY_PRO) === 'true';
  const planName = localStorage.getItem(STORAGE_KEY_PLAN) || 'Pro Unlimited ($19/mo)';
  const used = parseInt(localStorage.getItem(STORAGE_KEY_USAGE) || '0', 10);
  const unlockedAt = localStorage.getItem('doctosheet_unlocked_at') || undefined;

  return {
    creditsUsed: isNaN(used) ? 0 : used,
    maxFreeCredits: MAX_FREE_CREDITS,
    isPro,
    proPlanName: isPro ? planName : undefined,
    unlockedAt,
  };
}

export function getProSessionToken(): string {
  if (typeof window === 'undefined') return '';
  const isPro = localStorage.getItem(STORAGE_KEY_PRO) === 'true';
  if (!isPro) return '';
  let token = localStorage.getItem(STORAGE_KEY_TOKEN);
  if (!token) {
    token = `pro_sess_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  }
  return token;
}

export function canPerformConversion(): { allowed: boolean; remaining: number; isPro: boolean } {
  const quota = getUserQuota();
  if (quota.isPro) {
    return { allowed: true, remaining: Infinity, isPro: true };
  }
  const remaining = Math.max(0, MAX_FREE_CREDITS - quota.creditsUsed);
  return {
    allowed: remaining > 0,
    remaining,
    isPro: false,
  };
}

export function recordConversion(): UserCreditsState {
  if (typeof window === 'undefined') return getUserQuota();

  const current = getUserQuota();
  if (!current.isPro) {
    const nextUsed = current.creditsUsed + 1;
    localStorage.setItem(STORAGE_KEY_USAGE, nextUsed.toString());
  }

  return getUserQuota();
}

export function unlockProTier(planName: string = 'Pro Unlimited ($19/mo)') {
  if (typeof window === 'undefined') return;
  const token = `pro_sess_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
  localStorage.setItem(STORAGE_KEY_PRO, 'true');
  localStorage.setItem(STORAGE_KEY_PLAN, planName);
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem('doctosheet_unlocked_at', new Date().toISOString());
}

export function resetQuotaForTesting() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_PRO);
  localStorage.removeItem(STORAGE_KEY_PLAN);
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USAGE);
  localStorage.removeItem('doctosheet_unlocked_at');
}

export function getCustomApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_API_KEY) || '';
}

export function setCustomApiKey(key: string) {
  if (typeof window === 'undefined') return;
  if (key.trim()) {
    localStorage.setItem(STORAGE_KEY_API_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_API_KEY);
  }
}
