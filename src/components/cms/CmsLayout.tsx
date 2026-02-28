import { useState } from 'react';
import CmsSidebar from './CmsSidebar';
import CmsTopbar from './CmsTopbar';

interface Props {
  children: React.ReactNode;
  title?: string;
}

export default function CmsLayout({ children, title }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <CmsSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <CmsTopbar onMenuToggle={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
