import React from 'react';
import { History, FileText, Download, Trash2, Calendar, HardDrive } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatDate, formatFileSize } from '../../utils/formatters';
import type { ExportRecord } from '../../types';

interface ExportHistoryViewProps {
  exports: ExportRecord[];
  onDeleteExport: (id: string) => void;
  onNavigateEditor: () => void;
}

export const ExportHistoryView: React.FC<ExportHistoryViewProps> = ({
  exports,
  onDeleteExport,
  onNavigateEditor,
}) => {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Export History</h1>
            <Badge variant="neutral">{exports.length} Generated Documents</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit log of previously generated PDF catalogs, spreadsheets, and backup archives.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onNavigateEditor}>
          Create New Export
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        {exports.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No exports generated yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Generated catalogs will appear here with page count, file size, and timestamp for auditing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Pages</th>
                  <th className="py-3 px-4">File Size</th>
                  <th className="py-3 px-4">Date Exported</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {exports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span>{exp.filename}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="brand" size="sm">{exp.format}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono">{exp.pageCount} pages</td>
                    <td className="py-3 px-4 font-mono">{formatFileSize(exp.fileSize)}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(exp.exportedAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteExport(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
