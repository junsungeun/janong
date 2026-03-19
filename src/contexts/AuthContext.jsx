import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  // 1차: 일반 조회
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) return data;

  // 2차: RLS 우회 rpc
  try {
    const { data: rpcData } = await supabase.rpc('get_my_profile');
    if (rpcData) return rpcData;
  } catch (_) {}

  return null;
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    profile: null,
    loading: true,
  });
  const mountedRef = useRef(true);

  const updateAuth = async (session) => {
    const u = session?.user ?? null;

    if (!u) {
      if (mountedRef.current) {
        setState({ user: null, profile: null, loading: false });
      }
      return;
    }

    const profile = await loadProfile(u.id);
    if (mountedRef.current) {
      setState({ user: u, profile, loading: false });
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    // 초기 세션 로드
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuth(session);
    });

    // 이후 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // 초기 로드 후 변경만 처리
      if (!state.loading) {
        updateAuth(session);
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
    // onAuthStateChange가 처리
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    if (mountedRef.current) {
      setState({ user: null, profile: null, loading: false });
    }
  };

  const isAdmin = state.profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user: state.user,
      profile: state.profile,
      loading: state.loading,
      signIn,
      signOut,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
