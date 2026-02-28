import { useState } from 'react';
import { Shield, UserCheck, UserX } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import { useCmsUsers } from '@/hooks/useCms';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { timeAgo } from '@/lib/cms-utils';
import { cn } from '@/lib/utils';

const roleColors: Record<string, string> = {
  super_admin: 'bg-red-500/20 text-red-400 border-red-500/30',
  admin: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  editor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function CmsUsersPage() {
  const { data: users = [], isLoading } = useCmsUsers();
  const qc = useQueryClient();
  const { toast } = useToast();

  const handleRoleChange = async (userId: string, roleId: string, newRole: string) => {
    try {
      const { error } = await supabase.from('user_roles').update({ role: newRole as any }).eq('id', roleId);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['cms_users'] });
      toast({ title: 'Role updated!' });
    } catch { toast({ title: 'Update failed', variant: 'destructive' }); }
  };

  return (
    <CmsLayout title="Users & Roles">
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            <p className="text-sm font-semibold text-white">{users.length} Users</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No users found</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">User</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Current Role</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium hidden md:table-cell">Assigned</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                        {(u.profile?.full_name ?? u.user_id ?? '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{u.profile?.full_name ?? 'Unknown User'}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.user_id?.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs rounded-full border', roleColors[u.role] ?? 'bg-slate-500/20 text-slate-400')}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-slate-500 text-xs">{timeAgo(u.created_at)}</td>
                  <td className="py-3 px-4">
                    <select
                      defaultValue={u.role}
                      onChange={e => handleRoleChange(u.user_id, u.id, e.target.value)}
                      className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none"
                    >
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CmsLayout>
  );
}
