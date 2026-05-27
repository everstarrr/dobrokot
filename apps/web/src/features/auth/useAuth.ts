"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  SubscriptionPlan,
  UserRole,
  type SubscriptionState,
} from "@dobrokot/shared";
import { apiClient, tokenStorage, unwrapApiResponse } from "@/api/http";
import {
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
} from "@/api/auth";
import { activateSubscription, fetchSubscription } from "@/api/subscription";

export { SubscriptionPlan, UserRole };

export type PetInfo = {
  nickname?: string;
  species?: string;
  breed?: string;
  age?: string;
  weight?: string;
  bloodGroup?: string;
  sex?: string;
};

export type AuthState = {
  isAuthenticated: boolean;
  user: AuthUser | null;
  subscription: SubscriptionState | null;
  pet: PetInfo;
  hydrated: boolean;
};

const STORAGE_PET_KEY = "dobrokot:pet";

const defaultState: AuthState = {
  isAuthenticated: false,
  user: null,
  subscription: null,
  pet: {},
  hydrated: false,
};

const listeners = new Set<() => void>();
let currentState: AuthState = defaultState;
let hydrationPromise: Promise<void> | null = null;

const readPet = (): PetInfo => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_PET_KEY);
    return raw ? (JSON.parse(raw) as PetInfo) : {};
  } catch {
    return {};
  }
};

const writePet = (pet: PetInfo) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_PET_KEY, JSON.stringify(pet));
};

const setState = (next: Partial<AuthState>) => {
  currentState = { ...currentState, ...next };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => currentState;
const getServerSnapshot = () => defaultState;

async function fetchMe(): Promise<AuthUser | null> {
  try {
    const response = await apiClient.get("/users/me");
    return unwrapApiResponse<AuthUser>(response);
  } catch {
    return null;
  }
}

async function hydrate() {
  if (hydrationPromise) return hydrationPromise;
  hydrationPromise = (async () => {
    const pet = readPet();
    const token = tokenStorage.getAccess();
    if (!token) {
      setState({ pet, hydrated: true });
      return;
    }
    const [user, subscription] = await Promise.all([
      fetchMe(),
      fetchSubscription().catch(() => null),
    ]);
    if (user) {
      setState({
        isAuthenticated: true,
        user,
        subscription,
        pet,
        hydrated: true,
      });
    } else {
      tokenStorage.clear();
      setState({ pet, hydrated: true });
    }
  })();
  return hydrationPromise;
}

export const useAuth = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (!currentState.hydrated) {
      void hydrate();
    }
  }, []);

  const signUp = useCallback(
    async (payload: { email: string; password: string; name: string; phone?: string }) => {
      const user = await registerUser(payload);
      const subscription = await fetchSubscription().catch(() => null);
      setState({ isAuthenticated: true, user, subscription });
      return user;
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await loginUser({ email, password });
    const subscription = await fetchSubscription().catch(() => null);
    setState({ isAuthenticated: true, user, subscription });
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await logoutUser().catch(() => {});
    setState({ isAuthenticated: false, user: null, subscription: null });
  }, []);

  const purchasePlan = useCallback(async (plan: SubscriptionPlan) => {
    const subscription = await activateSubscription(plan);
    setState({ subscription });
    return subscription;
  }, []);

  const refreshSubscription = useCallback(async () => {
    const subscription = await fetchSubscription().catch(() => null);
    setState({ subscription });
    return subscription;
  }, []);

  const refreshUser = useCallback(async () => {
    const user = await fetchMe();
    if (user) setState({ user });
    return user;
  }, []);

  const updatePet = useCallback((pet: PetInfo) => {
    const next = { ...currentState.pet, ...pet };
    writePet(next);
    setState({ pet: next });
  }, []);

  return {
    ...state,
    plan: state.subscription?.isActive ? state.subscription.plan : null,
    role: state.user?.role ?? null,
    signUp,
    signIn,
    signOut,
    purchasePlan,
    refreshSubscription,
    refreshUser,
    updatePet,
  };
};
