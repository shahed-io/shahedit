import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, File, Image, Tag, FolderOpen,
  Menu, Search, Users, Settings, Activity, ChevronRight, X,
  Code2
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const navGroups = [
  {
    label: null,
    items: [{ label: 'Dashboard', icon: LayoutDashboard, to: '/cms' }],
  },
  {
    label: 'Content',
    items: [
      { label: 'Posts', icon: FileText, to: '/cms/posts' },
      { label: 'Pages', icon: File, to: '/cms/pages' },
      { label: 'Media Library', icon: Image, to: '/cms/media' },
    ],
  },
  {
    label: 'Taxonomy',
    items: [
      { label: 'Categories', icon: FolderOpen, to: '/cms/categories' },
      { label: 'Tags', icon: Tag, to: '/cms/tags' },
    ],
  },
  {
    label: 'Navigation',
    items: [{ label: 'Menus', icon: Menu, to: '/cms/menus' }],
  },
  {
    label: 'SEO & Settings',
    items: [
      { label: 'SEO Manager', icon: Search, to: '/cms/seo' },
      { label: 'Site Settings', icon: Settings, to: '/cms/settings' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Users & Roles', icon: Users, to: '/cms/users' },
      { label: 'Audit Logs', icon: Activity, to: '/cms/audit' },
    ],
  },
];

export default function CmsSidebar({ open, onClose }: Props) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300',
        'bg-slate-900 border-r border-slate-800',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Shahed IT</p>
              <p className="text-[10px] text-slate-400">CMS Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-2 mb-1">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = location.pathname === item.to || (item.to !== '/cms' && location.pathname.startsWith(item.to));
                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                          isActive
                            ? 'bg-violet-600/20 text-violet-400 font-medium'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3" />}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-slate-800">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800 transition"
          >
            ← Back to Website
          </NavLink>
        </div>
      </aside>
    </>
  );
}
