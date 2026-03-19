// JANONG — 어드민 서비스
// Edge Function을 통해 유저 생성/삭제/비밀번호 리셋

import { supabase } from '../lib/supabase';

const invoke = async (body) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('로그인 필요');

  const { data, error } = await supabase.functions.invoke('admin-manage-user', {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data;
};

export const adminService = {
  createUser: (email, password, name) =>
    invoke({ action: 'create', email, password, name }),

  deleteUser: (userId) =>
    invoke({ action: 'delete', userId }),

  resetPassword: (userId, newPassword) =>
    invoke({ action: 'reset-password', userId, newPassword }),

  listUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
