import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Edit3, 
  Package, 
  FileSearch, 
  Palette, 
  UploadCloud, 
  History, 
  Settings,
  Sparkles,
  BookMarked
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard' 
  | 'catalogs' 
  | 'editor' 
  | 'products' 
  | 'analyzer' 
  | 'templates' 
  | 'import' 
  | 'exports' 
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  productCount: number;
  catalogName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  productCount,
  catalogName,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalogs', label: 'My Catalogs', icon: BookOpen },
    { id: 'editor', label: 'Live Catalog Editor', icon: Edit3, badge: 'Live' },
    { id: 'products', label: 'Products Manager', icon: Package, count: productCount },
    { id: 'analyzer', label: 'Reference PDF Analyzer', icon: FileSearch, badge: 'AI/PDF' },
    { id: 'templates', label: 'Template Editor', icon: Palette },
    { id: 'import', label: 'Import CSV/XLSX', icon: UploadCloud },
    { id: 'exports', label: 'Export History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen select-none border-r border-slate-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-lg">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">Catalog Studio</h1>
            <span className="text-[10px] text-brand-300 font-medium tracking-wider uppercase mt-1 inline-block">
              Professional Publisher
            </span>
          </div>
        </div>
      </div>

      {/* Current Project Pill */}
      {catalogName && (
        <div className="mx-4 mt-3 mb-1 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Catalog</div>
          <div className="text-xs font-bold text-white truncate mt-0.5">{catalogName}</div>
        </div>
      )}

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-900/30 font-bold'
                  : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {'count' in item && item.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.count}
                </span>
              )}
              {'badge' in item && item.badge && !('count' in item) && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-extrabold tracking-wider ${
                  isActive ? 'bg-white/20 text-white' : 'bg-brand-950/80 text-brand-300 border border-brand-800/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Pro / Status Widget */}
      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/60 flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-[11px] text-slate-300">
            <p className="font-semibold text-white">Full Local Engine</p>
            <p className="text-[10px] text-slate-400">IndexedDB offline ready</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
