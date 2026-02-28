import { FileText, File, Image, Users, Activity, TrendingUp, CheckCircle } from 'lucide-react';
import CmsLayout from '@/components/cms/CmsLayout';
import StatsCard from '@/components/cms/StatsCard';
import { useContentItems, useMediaAssets, useAuditLogs, useCmsUsers } from '@/hooks/useCms';
import { timeAgo } from '@/lib/cms-utils';
import { statusColor } from '@/lib/cms-utils';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function CmsDashboard() {
  const { data: posts = [] } = useContentItems('post');
  const { data: pages = [] } = useContentItems('page');
  const { data: media = [] } = useMediaAssets();
  const { data: users = [] } = useCmsUsers();
  const { data: logs = [] } = useAuditLogs();

  const published = posts.filter(p => p.status === 'published');
  const drafts = posts.filter(p => p.status === 'draft');

  return (
    <CmsLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Published Posts" value={published.length} icon={CheckCircle} color="green" />
          <StatsCard title="Draft Posts" value={drafts.length} icon={FileText} color="orange" />
          <StatsCard title="Pages" value={pages.length} icon={File} color="violet" />
          <StatsCard title="Media Files" value={media.length} icon={Image} color="cyan" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Posts</h2>
              <Link to="/cms/posts" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            {posts.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No posts yet</p>
            ) : (
              <div className="space-y-3">
                {posts.slice(0, 6).map(post => (
                  <div key={post.id} className="flex items-center gap-3 py-2 border-b border-slate-800/60 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{post.title}</p>
                      <p className="text-xs text-slate-500">{timeAgo(post.created_at)}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border', statusColor(post.status))}>
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-white">Recent Activity</h2>
              <Link to="/cms/audit" className="text-xs text-violet-400 hover:text-violet-300">View all →</Link>
            </div>
            {logs.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {logs.slice(0, 8).map(log => (
                  <div key={log.id} className="flex items-start gap-2">
                    <div className={cn(
                      'mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0',
                      log.action === 'create' ? 'bg-green-500/20 text-green-400' :
                      log.action === 'update' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-red-500/20 text-red-400'
                    )}>
                      {log.action[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-slate-300">
                        <span className="capitalize font-medium">{log.action}</span>{' '}
                        <span className="text-slate-500">{log.entity}</span>
                      </p>
                      <p className="text-[10px] text-slate-600">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'New Post', to: '/cms/posts/new', color: 'bg-violet-600 hover:bg-violet-700' },
              { label: 'New Page', to: '/cms/pages/new', color: 'bg-cyan-600 hover:bg-cyan-700' },
              { label: 'Upload Media', to: '/cms/media', color: 'bg-green-600 hover:bg-green-700' },
              { label: 'Manage Menus', to: '/cms/menus', color: 'bg-orange-600 hover:bg-orange-700' },
            ].map(a => (
              <Link key={a.to} to={a.to} className={cn('px-4 py-2 text-sm font-medium text-white rounded-lg transition', a.color)}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </CmsLayout>
  );
}
