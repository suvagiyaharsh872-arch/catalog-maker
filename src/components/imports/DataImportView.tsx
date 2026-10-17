import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Columns, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  parseFileForImport, 
  autoDetectColumnMapping, 
  normalizeImportRows,
  type RawImportData,
  type ColumnMapping,
  type ImportPreviewRow 
} from '../../features/imports/importService';
import type { Product } from '../../types';

interface DataImportViewProps {
  projectId: string;
  onImportComplete: (newProducts: Product[]) => void;
  onCancel: () => void;
}

export const DataImportView: React.FC<DataImportViewProps> = ({
  projectId,
  onImportComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rawData, setRawData] = useState<RawImportData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({ specFields: [] });
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'update' | 'allow'>('skip');
  const [error, setError] = useState<string | null>(null);

  // STEP 1: Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setFileName(file.name);

    try {
      const parsed = await parseFileForImport(file);
      if (parsed.rows.length === 0) {
        throw new Error('The uploaded file contains no data rows.');
      }

      setRawData(parsed);
      const detectedMapping = autoDetectColumnMapping(parsed.headers);
      setMapping(detectedMapping);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to read data file.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2 -> STEP 3: Normalize & Validate
  const handleProceedToPreview = () => {
    if (!rawData) return;
    const normalized = normalizeImportRows(rawData.rows, mapping, projectId);
    setPreviewRows(normalized);
    setStep(3);
  };

  // STEP 3: Execute Import
  const handleExecuteImport = () => {
    const validProducts = previewRows
      .filter(r => r.isValid && r.normalized.id)
      .map(r => r.normalized as Product);

    onImportComplete(validProducts);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Import Product Records</h1>
          <Badge variant="brand">CSV, Excel, JSON</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Bulk load items from supplier spreadsheets with automated header recognition and specification extraction.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-subtle text-xs font-semibold">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
            step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200'
          }`}>1</span>
          <span>Upload File</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
            step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200'
          }`}>2</span>
          <span>Map Columns</span>
        </div>
        <div className="w-12 h-0.5 bg-slate-200" />
        <div className={`flex items-center gap-2 ${step >= 3 ? 'text-brand-600' : 'text-slate-400'}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
            step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200'
          }`}>3</span>
          <span>Review & Import</span>
        </div>
      </div>

      {/* STEP 1: UPLOAD FILE */}
      {step === 1 && (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-brand-500 transition-colors">
          <input
            type="file"
            id="import-file"
            accept=".csv,.xlsx,.xls,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="import-file" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-sm">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isLoading ? 'Reading File...' : 'Upload Spreadsheet or JSON'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Supports CSV (Comma Separated), Excel Workbook (.xlsx, .xls), and JSON records.
            </p>
            <div className="mt-5">
              <Button variant="primary" size="md" isLoading={isLoading}>
                Select File
              </Button>
            </div>
          </label>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      )}

      {/* STEP 2: COLUMN MAPPING */}
      {step === 2 && rawData && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configure Field Mappings</h3>
              <p className="text-xs text-slate-500">
                Source File: <strong className="text-slate-700">{fileName}</strong> ({rawData.totalRows} rows, {rawData.headers.length} columns)
              </p>
            </div>
            <Badge variant="success">Auto-Detected</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Product Title Field *</label>
              <select
                value={mapping.titleField || ''}
                onChange={(e) => setMapping({ ...mapping, titleField: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Column --</option>
                {rawData.headers.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">SKU / Item Code Field *</label>
              <select
                value={mapping.skuField || ''}
                onChange={(e) => setMapping({ ...mapping, skuField: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Column --</option>
                {rawData.headers.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category Field</label>
              <select
                value={mapping.categoryField || ''}
                onChange={(e) => setMapping({ ...mapping, categoryField: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Column (or Default to 'General') --</option>
                {rawData.headers.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Price Field</label>
              <select
                value={mapping.priceField || ''}
                onChange={(e) => setMapping({ ...mapping, priceField: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Column --</option>
                {rawData.headers.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Description Field</label>
              <select
                value={mapping.descriptionField || ''}
                onChange={(e) => setMapping({ ...mapping, descriptionField: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">-- Select Column --</option>
                {rawData.headers.map((h, i) => (
                  <option key={i} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Columns to Import as Specifications</label>
              <p className="text-[11px] text-slate-500 mb-2">Check the extra columns you want included in the product's technical specification table:</p>
              <div className="flex flex-wrap gap-2">
                {rawData.headers.map((h, i) => {
                  const isMappedToMain = [
                    mapping.titleField,
                    mapping.skuField,
                    mapping.categoryField,
                    mapping.priceField,
                    mapping.descriptionField
                  ].includes(h);

                  if (isMappedToMain) return null;

                  const isChecked = mapping.specFields.includes(h);
                  return (
                    <label key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${
                      isChecked ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMapping({ ...mapping, specFields: [...mapping.specFields, h] });
                          } else {
                            setMapping({ ...mapping, specFields: mapping.specFields.filter(f => f !== h) });
                          }
                        }}
                        className="rounded text-brand-600"
                      />
                      <span>{h}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Duplicate SKU Handling Option */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-slate-900">Duplicate SKU Resolution Policy</p>
              <p className="text-[11px] text-slate-500">If a SKU already exists in this catalog:</p>
            </div>
            <select
              value={duplicatePolicy}
              onChange={(e) => setDuplicatePolicy(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
            >
              <option value="skip">Skip duplicates (Preserve existing)</option>
              <option value="update">Update matching products</option>
              <option value="allow">Import as separate products</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              Back to Upload
            </Button>
            <Button variant="primary" size="sm" onClick={handleProceedToPreview} icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Review Normalized Preview ({rawData.totalRows} rows)
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW & CONFIRM */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Import Verification Preview</h3>
              <p className="text-xs text-slate-500">
                Found {previewRows.filter(r => r.isValid).length} valid records, {previewRows.filter(r => !r.isValid).length} invalid rows.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">SKU</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Specs Extracted</th>
                  <th className="py-2 px-3">Validation Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewRows.slice(0, 15).map((row) => (
                  <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                    <td className="py-2 px-3 font-mono text-slate-400">{row.rowNumber}</td>
                    <td className="py-2 px-3">
                      {row.isValid ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Ready
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Error
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 truncate max-w-xs">{row.normalized.title || '—'}</td>
                    <td className="py-2 px-3 font-mono">{row.normalized.sku || '—'}</td>
                    <td className="py-2 px-3">{row.normalized.category || 'General'}</td>
                    <td className="py-2 px-3">{row.normalized.specifications?.length || 0} items</td>
                    <td className="py-2 px-3 text-[11px] text-rose-600">
                      {row.errors.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              Back to Column Mapping
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleExecuteImport}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Confirm & Import {previewRows.filter(r => r.isValid).length} Products
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
