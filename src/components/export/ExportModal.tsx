import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Settings,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { generateCatalogPdf } from '../../features/pdf-generation/pdfGenerator';
import { 
  exportProductsToCsv, 
  exportProductsToExcel, 
  exportProductsToJson,
  exportTemplateToJson 
} from '../../services/exportService';
import type { 
  Project, 
  Product, 
  CatalogTemplate, 
  ExportSettings, 
  ValidationIssue 
} from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  template: CatalogTemplate;
  products: Product[];
  validationIssues: ValidationIssue[];
  onExportRecorded: (filename: string, format: any, pageCount: number, sizeBytes: number) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  template,
  products,
  validationIssues,
  onExportRecorded,
}) => {
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    ...project.exportSettings,
    filename: project.exportSettings?.filename || `${project.name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [exportDone, setExportDone] = useState(false);

  const blockingErrors = validationIssues.filter(i => i.blocking);
  const warnings = validationIssues.filter(i => !i.blocking && i.severity === 'warning');

  const handleStartPdfExport = async () => {
    setIsExporting(true);
    setProgress(5);
    setStatusMessage('Initializing PDF rendering engine...');
    setExportDone(false);

    try {
      const result = await generateCatalogPdf(
        project,
        template,
        products,
        exportSettings,
        (pct, stage) => {
          setProgress(pct);
          setStatusMessage(stage);
        }
      );

      onExportRecorded(result.filename, 'PDF', result.pageCount, result.sizeBytes);
      setExportDone(true);
    } catch (err: any) {
      console.error(err);
      alert(`Export failed: ${err?.message || 'Unknown error during rendering'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Product Catalog"
      description="Configure publication parameters, cover sheets, and download the finished PDF or source data."
      maxWidth="xl"
    >
      <div className="space-y-5 text-xs">
        {/* Pre-flight Validation Summary Alert */}
        {blockingErrors.length > 0 ? (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{blockingErrors.length} Issue(s) blocking export</span>
            </div>
            <p className="text-[11px] text-rose-700">
              {blockingErrors[0].message}
            </p>
          </div>
        ) : warnings.length > 0 ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">{warnings.length} pre-flight warning(s) detected.</span>
            </div>
            <span className="text-[10px] text-amber-700 font-medium">Safe to export</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">All products and parameters verified. Catalog ready for export!</span>
          </div>
        )}

        {/* Filename Input */}
        <div>
          <Input
            label="Output PDF Filename"
            value={exportSettings.filename}
            onChange={(e) => setExportSettings({ ...exportSettings, filename: e.target.value })}
            placeholder="catalog.pdf"
          />
        </div>

        {/* Section Inclusion Checkboxes */}
        <div className="space-y-2">
          <label className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
            Catalog Document Sections
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.includeCover}
                onChange={(e) => setExportSettings({ ...exportSettings, includeCover: e.target.checked })}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-slate-800">Cover Page</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.includeToc}
                onChange={(e) => setExportSettings({ ...exportSettings, includeToc: e.target.checked })}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-slate-800">Table of Contents</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.includePrices}
                onChange={(e) => setExportSettings({ ...exportSettings, includePrices: e.target.checked })}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-slate-800">Include Pricing</span>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={exportSettings.includeSpecs}
                onChange={(e) => setExportSettings({ ...exportSettings, includeSpecs: e.target.checked })}
                className="rounded text-brand-600"
              />
              <span className="font-semibold text-slate-800">Technical Specs Table</span>
            </label>
          </div>
        </div>

        {/* Quality and Sorting */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Image Quality</label>
            <select
              value={exportSettings.imageQuality}
              onChange={(e) => setExportSettings({ ...exportSettings, imageQuality: e.target.value as any })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="standard">Standard (Compact)</option>
              <option value="high">High Definition (Print Ready 300 DPI)</option>
              <option value="maximum">Maximum DPI (Archival)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Product Sort Order</label>
            <select
              value={exportSettings.productSortBy}
              onChange={(e) => setExportSettings({ ...exportSettings, productSortBy: e.target.value as any })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
            >
              <option value="sortOrder">Manual Sort Order</option>
              <option value="title">Title (Alphabetical)</option>
              <option value="sku">SKU Code</option>
              <option value="category">Category</option>
              <option value="price">Price</option>
            </select>
          </div>
        </div>

        {/* Export Progress Bar */}
        {isExporting && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="truncate max-w-[280px]">{statusMessage}</span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-200 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {exportDone && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Catalog PDF Successfully Generated!
            </span>
          </div>
        )}

        {/* Alternative Export Formats */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-slate-500">
          <span className="font-semibold text-[11px]">Also Export Data:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportProductsToCsv(products, `${project.name}.csv`)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={() => exportProductsToExcel(products, `${project.name}.xlsx`)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              Excel
            </button>
            <button
              onClick={() => exportProductsToJson(products, `${project.name}.json`)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              JSON
            </button>
            <button
              onClick={() => exportTemplateToJson(template, `${template.name}.json`)}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
            >
              Template
            </button>
          </div>
        </div>

        {/* Main Action Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isExporting}>
            Close
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleStartPdfExport}
            isLoading={isExporting}
            disabled={blockingErrors.length > 0}
            icon={<Download className="w-4 h-4" />}
          >
            {isExporting ? 'Generating Multi-Page PDF...' : 'Download Catalog PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
