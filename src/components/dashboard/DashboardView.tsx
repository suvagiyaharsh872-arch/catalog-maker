import React from 'react';
import { 
  Plus, 
  FileSpreadsheet, 
  ArrowRight, 
  Package, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Sparkles,
  Download,
  Palette
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';
import type { Project, Product, ExportRecord } from '../../types';

interface DashboardViewProps {
  projects: Project[];
  activeProject?: Project;
  products: Product[];
  recentExports: ExportRecord[];
  onCreateProject: () => void;
  onSelectProject: (id: string) => void;
  onNavigate: (tab: any) => void;
  onLoadDemo: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeProject,
  products,
  recentExports,
  onCreateProject,
  onSelectProject,
  onNavigate,
  onLoadDemo,
}) => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold mb-4 border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation Catalog Studio
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Design & Publish Professional Product Catalogs
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Upload a reference catalog PDF to replicate layout structure, manage products with rich specifications, import Excel/CSV files, and generate publication-ready PDF documents.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              onClick={onCreateProject}
              icon={<Plus className="w-4 h-4" />}
            >
              Create New Catalog
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => onNavigate('editor')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue Editing Catalog
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              onClick={() => onNavigate('import')}
              icon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Import Product Data
            </Button>
          </div>
        </div>

        {/* Subtle decorative background shapes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-indigo-500 to-transparent pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog Projects</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{projects.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Products</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{products.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Template</p>
            <h3 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-[140px]">
              {activeProject?.activeTemplateId ? 'Configured' : 'Default Tech'}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Palette className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Exports</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{recentExports.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Download className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content: Projects List & Quick Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Catalog Projects</h3>
            <button
              onClick={() => onNavigate('catalogs')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
            >
              View all ({projects.length})
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No Catalog Projects Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Create a fresh catalog project or explore our fully functional architectural demo project with 5 pre-configured products and specifications.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={onCreateProject}>
                  Create First Project
                </Button>
                <Button variant="outline" size="sm" onClick={onLoadDemo} icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}>
                  Load Demo Project
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const isActive = activeProject?.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj.id)}
                    className={`p-5 rounded-xl border transition-all cursor-pointer bg-white hover:shadow-card overflow-hidden ${
                      isActive ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate" title={proj.name}>
                          {proj.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {proj.description || 'No description provided.'}
                        </p>
                      </div>
                      {isActive && (
                        <Badge variant="brand" size="sm" className="flex-shrink-0 mt-0.5">
                          Active
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatDate(proj.updatedAt)}
                      </span>
                      <span className="font-semibold text-brand-600 flex items-center gap-1 group">
                        Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Workflow Guide & Recent Exports */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Catalog Workflow</h4>
            <div className="space-y-3 text-xs">
              <div 
                onClick={() => onNavigate('analyzer')} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <p className="font-bold text-slate-900">Upload Reference PDF</p>
                  <p className="text-slate-500">Extract layout geometry, fonts, margins, & colors.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('products')} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <p className="font-bold text-slate-900">Manage Products & Images</p>
                  <p className="text-slate-500">Add SKUs, technical specs, pricing, and high-res photos.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('editor')} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <p className="font-bold text-slate-900">Live WYSIWYG Preview</p>
                  <p className="text-slate-500">Tune styling, inspect overflow, and verify pagination.</p>
                </div>
              </div>

              <div 
                onClick={() => onNavigate('editor')} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <p className="font-bold text-slate-900">Publish Multi-Page PDF</p>
                  <p className="text-slate-500">Export publication-ready vector & print-quality document.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Exports Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Recent Exports</h4>
            {recentExports.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No exports generated yet.</p>
            ) : (
              <div className="space-y-2">
                {recentExports.slice(0, 4).map((exp) => (
                  <div key={exp.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[160px]">{exp.filename}</p>
                      <p className="text-[10px] text-slate-500">{formatDate(exp.exportedAt)} • {exp.pageCount} pages</p>
                    </div>
                    <Badge variant="brand" size="sm">{exp.format}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
