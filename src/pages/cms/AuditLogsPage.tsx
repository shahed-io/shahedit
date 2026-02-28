import CmsLayout from '@/components/cms/CmsLayout';
import { useAuditLogs } from '@/hooks/useCms';
import { timeAgo } from '@/lib/cms-utils';
import { cn } from '@/lib/utils';

const actionColors: Record<string, string> = {
  create: 'bg-green-500/20 text-green-400',
  update: 'bg-blue-500/20 text-blue-400',
  delete: 'bg-red-500/20 text-red-400',
};

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useAuditLogs();

  return (
    <CmsLayout title="Audit Logs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="p-4 border-b border-slate-800">
          <p className="text-sm text-slate-400">{logs.length} recent events</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No activity logged yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Action</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Entity</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium hidden sm:table-cell">Entity ID</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium hidden md:table-cell">Actor</th>
                <th className="text-left py-3 px-4 text-slate-500 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4">
                    <span className={cn('inline-flex px-2 py-0.5 text-xs rounded-full font-medium capitalize', actionColors[log.action] ?? 'bg-slate-500/20 text-slate-400')}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{log.entity}</td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <code className="text-xs text-slate-500">{log.entity_id?.slice(0, 12)}...</code>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <code className="text-xs text-slate-500">{log.actor_id?.slice(0, 8)}...</code>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs">{timeAgo(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </CmsLayout>
  );
}
