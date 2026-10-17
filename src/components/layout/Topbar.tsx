import React from 'react';
import { 
  Download, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Button } from '../ui/Button';
import type { Project, ValidationIssue } from '../../types';

interface TopbarProps {
  project?: Project;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onOpenExport: () => void;
  onLoadDemo: () => void;
  validationIssues: ValidationIssue[];
  onOpenValidation: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  hasUnsavedChanges,
  onSave,
  onOpenExport,
  onLoadDemo,
  validationIssues,
  onOpenValidation,
}) => {
  const blockingErrors = validationIssues.filter(i => i.blocking).length;
  const warnings = validationIssues.filter(i => !i.blocking && i.severity === 'warning').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10">
      {/* Left Project Info */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 truncate max-w-xs md:max-w-md">
              {project?.name || 'Untitled Project'}
            </h2>
            {hasUnsavedChanges ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                Unsaved changes
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" /> Saved
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {project?.brand.name} • {project?.brand.tagline || 'Ready for publishing'}
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Validation Status Pill */}
        <button
          onClick={onOpenValidation}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
            blockingErrors > 0 
              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              : warnings > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title="Click to view catalog pre-flight validation"
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>
            {blockingErrors > 0
              ? `${blockingErrors} Issue${blockingErrors > 1 ? 's' : ''}`
              : warnings > 0
              ? `${warnings} Warning${warnings > 1 ? 's' : ''}`
              : 'Validation OK'}
          </span>
        </button>

        {/* Load Demo Project */}
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadDemo}
          icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
        >
          Load Demo Project
        </Button>

        {/* Save Button */}
        <Button
          variant={hasUnsavedChanges ? 'primary' : 'outline'}
          size="sm"
          onClick={onSave}
          icon={<Save className="w-3.5 h-3.5" />}
        >
          Save
        </Button>

        {/* Export PDF Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenExport}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export Catalog PDF
        </Button>
      </div>
    </header>
  );
};
