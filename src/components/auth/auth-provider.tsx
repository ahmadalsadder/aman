
'use client';

import * as React from 'react';
import type { User, Permission } from '@/types';
import { mockLogin } from '@/lib/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password:string) => Promise<void>;
  logout: () => void;
  hasPermission: (requiredPermissions: Permission[]) => boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = 'guardian-gate-auth';

// Helper functions to manage cookies
function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name: string) {   
    document.cookie = name+'=; Max-Age=-99999999; path=/;';  
}


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = () => {
        try {
            const storedUser = getCookie(AUTH_COOKIE_NAME);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to parse auth data from cookie', error);
            eraseCookie(AUTH_COOKIE_NAME);
        } finally {
            setLoading(false);
        }
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedInUser = await mockLogin(email, password);
    setUser(loggedInUser);
    setCookie(AUTH_COOKIE_NAME, JSON.stringify(loggedInUser), 7);
  };

  const logout = () => {
    setUser(null);
    eraseCookie(AUTH_COOKIE_NAME);
    localStorage.clear();
  };
  
  const hasPermission = (requiredPermissions: Permission[]): boolean => {
    if (!user) return false;
    return requiredPermissions.every((perm) => user.permissions.includes(perm));
  };

  const value = React.useMemo(() => ({
    user,
    loading,
    login,
    logout,
    hasPermission
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}
