"use client";

import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";

import { api, type User, type UserRole } from "@/lib/api";

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    setLoading(true);
    const session = await api.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    setUser(session.user);
  }, []);

  const demoLogin = useCallback(async (role: UserRole) => {
    const session = await api.demoLogin(role);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, demoLogin, logout }),
    [user, loading, login, demoLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
