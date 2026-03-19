import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileCache = useRef(null);
  const initializedRef = useRef(false);

  const fetchProfile = useCallback(async (userId) => {
    // 캐시된 프로필이 같은 유저면 재사용
    if (profileCache.current?.id === userId) {
      setProfile(profileCache.current);
      return;
    }

    // 1차: 일반 조회
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      profileCache.current = data;
      setProfile(data);
      return;
    }

    // 2차: RLS 우회 rpc
    const { data: rpcData } = await supabase.rpc('get_my_profile');
    if (rpcData) {
      profileCache.current = rpcData;
      setProfile(rpcData);
      return;
    }

    setProfile(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    // onAuthStateChange만 사용 (INITIAL_SESSION 이벤트가 getSession 역할도 함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const u = session?.user ?? null;
      setUser(u);

      if (u) {
        await fetchProfile(u.id);
      } else {
        profileCache.current = null;
        setProfile(null);
      }

      if (mounted) setLoading(false);
      initializedRef.current = true;
    });

    // fallback: 3초 안에 이벤트 안 오면 로딩 해제
    const timeout = setTimeout(() => {
      if (mounted && !initializedRef.current) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    profileCache.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
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
