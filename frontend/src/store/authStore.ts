import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { post } from '@/api/client';
import { endpoints } from '@/api/endpoints';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  login: (user: AuthUser, token: string, rememberMe?: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

const STORAGE_TOKEN = 'resqmeal_token';
const STORAGE_USER = 'resqmeal_user';

function syncLegacyStorage(user: AuthUser | null, token: string | null, rememberMe: boolean) {
  const primary = rememberMe ? localStorage : sessionStorage;
  const secondary = rememberMe ? sessionStorage : localStorage;
  try {
    if (user && token) {
      primary.setItem(STORAGE_TOKEN, token);
      primary.setItem(STORAGE_USER, JSON.stringify(user));
      secondary.removeItem(STORAGE_TOKEN);
      secondary.removeItem(STORAGE_USER);
    } else {
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
      sessionStorage.removeItem(STORAGE_TOKEN);
      sessionStorage.removeItem(STORAGE_USER);
    }
  } catch {
    /* ignore storage errors */
  }
}

function readLegacyAuth(): { user: AuthUser; token: string; rememberMe: boolean } | null {
  try {
    for (const [storage, rememberMe] of [[localStorage, true], [sessionStorage, false]] as const) {
      const token = storage.getItem(STORAGE_TOKEN);
      const userStr = storage.getItem(STORAGE_USER);
      if (token && userStr) {
        return { user: JSON.parse(userStr) as AuthUser, token, rememberMe };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: true,
      login: (user, token, rememberMe = true) => {
        syncLegacyStorage(user, token, rememberMe);
        set({ user, token, isAuthenticated: true, rememberMe });
      },
      logout: () => {
        post(endpoints.auth.logout).catch(() => undefined);
        syncLegacyStorage(null, null, get().rememberMe);
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        const user = { ...current, ...patch };
        syncLegacyStorage(user, get().token, get().rememberMe);
        set({ user });
      },
    }),
    {
      name: 'resqmeal-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user && state?.token) {
          syncLegacyStorage(state.user, state.token, state.rememberMe ?? true);
          return;
        }
        const legacy = readLegacyAuth();
        if (legacy) {
          useAuthStore.getState().login(legacy.user, legacy.token, legacy.rememberMe);
        }
      },
    }
  )
);

export function getAuthToken(): string | null {
  const { token } = useAuthStore.getState();
  if (token) return token;
  return localStorage.getItem(STORAGE_TOKEN) || sessionStorage.getItem(STORAGE_TOKEN);
}
