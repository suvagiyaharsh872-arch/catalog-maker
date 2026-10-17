import React, { useState } from 'react';
import { 
  Plus, 
  Folder, 
  Clock, 
  ArrowRight, 
  Copy, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  Sparkles,
  CheckCircle2,
  Package
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProjectModal } from './ProjectModal';
import { formatDate } from '../../utils/formatters';
import type { Project, Product } from '../../types';
import { exportProjectBackup, importProjectBackup } from '../../storage/db';
import { saveAs } from 'file-saver';

interface MyCatalogsViewProps {
  projects: Project[];
  activeProject?: Project;
  products: Product[];
  onSelectProject: (id: string) => void;
  onSaveProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onDuplicateProject: (project: Project) => void;
  onLoadDemo: () => void;
  onRefreshData: () => void;
}

export const MyCatalogsView: React.FC<MyCatalogsViewProps> = ({
  projects,
  activeProject,
  products,
  onSelectProject,
  onSaveProject,
  onDeleteProject,
  onDuplicateProject,
  onLoadDemo,
  onRefreshData,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleExportBackup = async (proj: Project) => {
    try {
      const json = await exportProjectBackup(proj.id);
      const blob = new Blob([json], { type: 'application/json' });
      saveAs(blob, `${proj.name.replace(/[^a-z0-9]/gi, '_')}-backup.json`);
    } catch (err: any) {
      alert(`Backup failed: ${err?.message}`);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const newProjectId = await importProjectBackup(text);
      alert('Project restored successfully from backup!');
      onRefreshData();
      onSelectProject(newProjectId);
    } catch (err: any) {
      alert(`Failed to restore project: ${err?.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catalog Projects</h1>
            <Badge variant="neutral">{projects.length} Total</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your product line catalogs, brand identities, and local project backups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="inline-flex items-center justify-center font-medium rounded-lg text-xs px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 bg-white cursor-pointer transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            <span>Restore Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={onLoadDemo}
            icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
          >
            Load Demo
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }}
            icon={<Plus className="w-4 h-4" />}
          >
            New Catalog
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Folder className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Catalog Projects Created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Get started by creating your first catalog or test the platform immediately using the pre-loaded architectural demo.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProject(null);
                setIsModalOpen(true);
              }}
            >
              Create New Catalog
            </Button>
            <Button variant="outline" size="sm" onClick={onLoadDemo}>
              Load Architectural Demo
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isActive = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between hover:shadow-card overflow-hidden ${
                  isActive ? 'border-brand-500 ring-2 ring-brand-100 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: proj.brand.primaryColor || '#4f46e5' }}
                      >
                        {proj.brand.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm truncate" title={proj.name}>
                          {proj.name}
                        </h3>
                        <p className="text-[10px] text-slate-500 truncate">{proj.brand.name}</p>
                      </div>
                    </div>

                    {isActive ? (
                      <Badge variant="brand" size="sm" className="flex-shrink-0 mt-0.5">Active</Badge>
                    ) : (
                      <button
                        onClick={() => onSelectProject(proj.id)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-brand-600 cursor-pointer flex-shrink-0"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px]">
                    {proj.description || 'No description entered.'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(proj.updatedAt)}
                    </span>
                    <span className="text-[11px] font-medium text-slate-700">
                      {isActive ? `${products.length} Products` : 'Catalog Project'}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProject(proj);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="Edit project metadata"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDuplicateProject(proj)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleExportBackup(proj)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                      title="Export JSON backup"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete catalog project "${proj.name}"? This cannot be undone.`)) {
                          onDeleteProject(proj.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectProject(proj.id)}
                    className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800 transition-colors cursor-pointer"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        project={editingProject}
        onSave={onSaveProject}
      />
    </div>
  );
};
