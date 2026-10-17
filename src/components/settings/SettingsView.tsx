import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  HardDrive, 
  Download, 
  Upload, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import type { Project, ProjectSettings } from '../../types';

interface SettingsViewProps {
  project?: Project;
  onUpdateSettings: (settings: ProjectSettings) => void;
  onExportFullBackup: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  project,
  onUpdateSettings,
  onExportFullBackup,
}) => {
  const [settings, setSettings] = useState<ProjectSettings>(
    project?.settings || {
      missingFieldPlaceholder: 'Not provided',
      missingPricePlaceholder: 'Contact for pricing',
      missingImagePlaceholder: 'Image pending',
      duplicateSkuPolicy: 'skip',
      autoSave: true,
      currencySymbol: '$',
    }
  );

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    onUpdateSettings(settings);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catalog Settings</h1>
            <Badge variant="brand">Local Configuration</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global placeholder rules, duplicate SKU policies, and local IndexedDB database backup.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          icon={savedNotice ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
        >
          {savedNotice ? 'Settings Saved!' : 'Save Settings'}
        </Button>
      </div>

      {/* Section 1: Placeholder Rules */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Missing Value & Placeholder Policy
        </h3>
        <p className="text-xs text-slate-500">
          In strict compliance with catalog accuracy, Catalog Studio will never invent technical data or prices. Configure the replacement string shown when a field is missing:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <Input
              label="Missing Text Field Placeholder"
              value={settings.missingFieldPlaceholder}
              onChange={(e) => setSettings({ ...settings, missingFieldPlaceholder: e.target.value })}
              placeholder="e.g. Not provided or —"
            />
          </div>

          <div>
            <Input
              label="Missing Price Placeholder"
              value={settings.missingPricePlaceholder}
              onChange={(e) => setSettings({ ...settings, missingPricePlaceholder: e.target.value })}
              placeholder="e.g. Inquire for pricing"
            />
          </div>

          <div>
            <Input
              label="Default Currency Symbol"
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              placeholder="$"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Duplicate SKU Policy</label>
            <select
              value={settings.duplicateSkuPolicy}
              onChange={(e) => setSettings({ ...settings, duplicateSkuPolicy: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
            >
              <option value="skip">Skip duplicates (Preserve existing)</option>
              <option value="update">Update existing product fields</option>
              <option value="allow">Allow multiple products with same SKU</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Storage & Persistence */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Local Storage & Database Backup
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              All projects, imported spreadsheets, and high-res product photos are securely stored locally inside your browser's IndexedDB. No external cloud or paid database required.
            </p>
          </div>
          <HardDrive className="w-6 h-6 text-slate-400" />
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-700">
            <p className="font-bold text-slate-900">Full Project Backup</p>
            <p className="text-[11px] text-slate-500">Download a complete JSON bundle of this project and products.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportFullBackup}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Project Backup
          </Button>
        </div>
      </div>
    </div>
  );
};
