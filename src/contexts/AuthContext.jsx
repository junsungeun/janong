import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) return data;

  try {
    const { data: rpcData } = await supabase.rpc('get_my_profile');
    if (rpcData) return rpcData;
  } catch (_) {}

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    // 초기 세션 로드
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mountedRef.current) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const p = await loadProfile(u.id);
        if (mountedRef.current) setProfile(p);
      }
      if (mountedRef.current) {
        setLoading(false);
        initializedRef.current = true;
      }
    });

    // 이후 세션 변경 감지 (로그인/로그아웃)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mountedRef.current) return;
      // 초기 로드 전이면 무시 (getSession이 처리)
      if (!initializedRef.current) return;

      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        const p = await loadProfile(u.id);
        if (mountedRef.current) setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (mountedRef.current) {
      setUser(null);
      setProfile(null);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
