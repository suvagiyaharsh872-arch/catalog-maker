import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { ValidationIssue } from '../../types';

interface ValidationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
  productCount: number;
}

export const ValidationSummaryModal: React.FC<ValidationSummaryModalProps> = ({
  isOpen,
  onClose,
  issues,
  productCount,
}) => {
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const infos = issues.filter(i => i.severity === 'info');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catalog Pre-Flight Validation"
      description={`Quality audit across ${productCount} catalog products prior to PDF rendering.`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* KPI Pills */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
            <p className="font-bold text-rose-900 text-sm">{errors.length}</p>
            <p className="text-[10px] text-rose-700 font-semibold uppercase">Blocking Errors</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="font-bold text-amber-900 text-sm">{warnings.length}</p>
            <p className="text-[10px] text-amber-700 font-semibold uppercase">Review Warnings</p>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="font-bold text-emerald-900 text-sm">{errors.length === 0 ? 'Passed' : 'Action Needed'}</p>
            <p className="text-[10px] text-emerald-700 font-semibold uppercase">Export Status</p>
          </div>
        </div>

        {/* List of issues */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {issues.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-slate-800">No issues detected</p>
              <p className="text-[11px] mt-0.5">Your catalog meets all publishing requirements.</p>
            </div>
          ) : (
            issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border flex items-start gap-3 ${
                  issue.severity === 'error'
                    ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                    : issue.severity === 'warning'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {issue.severity === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : issue.severity === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  {issue.productTitle && (
                    <span className="font-bold mr-1.5">{issue.productTitle}:</span>
                  )}
                  <span>{issue.message}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
