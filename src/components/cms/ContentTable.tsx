import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';
import { statusColor, timeAgo } from '@/lib/cms-utils';
import { cn } from '@/lib/utils';

interface Row {
  id: string;
  title: string;
  status: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  type: string;
  slug: string;
}

interface Props {
  rows: Row[];
  type: 'post' | 'page';
  onDelete: (id: string) => void;
}

export default function ContentTable({ rows, type, onDelete }: Props) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <p className="text-4xl mb-3">📝</p>
        <p className="text-lg font-medium text-slate-400">No {type}s yet</p>
        <p className="text-sm">Create your first {type} to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-3 px-4 text-slate-500 font-medium">Title</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium hidden sm:table-cell">Status</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium hidden md:table-cell">Slug</th>
            <th className="text-left py-3 px-4 text-slate-500 font-medium hidden lg:table-cell">Updated</th>
            <th className="text-right py-3 px-4 text-slate-500 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition">
              <td className="py-3 px-4">
                <p className="font-medium text-white truncate max-w-[200px]">{row.title}</p>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <span className={cn('inline-flex px-2 py-0.5 text-xs rounded-full border', statusColor(row.status))}>
                  {row.status}
                </span>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <code className="text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{row.slug}</code>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell text-slate-500 text-xs">{timeAgo(row.updated_at)}</td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  {row.status === 'published' && (
                    <a
                      href={`/${type}/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <Link
                    to={`/cms/${type}s/${row.id}`}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-violet-400 transition"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => onDelete(row.id)}
                    className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
