import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Project } from '../../types';
import { DEFAULT_TEMPLATES } from '../../features/templates/defaultTemplates';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSave: (project: Project) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [tagline, setTagline] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4f46e5');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setBrandName(project.brand.name);
      setTagline(project.brand.tagline || '');
      setWebsite(project.brand.website || '');
      setEmail(project.brand.email || '');
      setPrimaryColor(project.brand.primaryColor || '#4f46e5');
      setSecondaryColor(project.brand.secondaryColor || '#0f172a');
    } else {
      setName('');
      setDescription('');
      setBrandName('');
      setTagline('');
      setWebsite('');
      setEmail('');
      setPrimaryColor('#4f46e5');
      setSecondaryColor('#0f172a');
    }
    setError('');
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required.');
      return;
    }

    const now = Date.now();
    const targetProject: Project = {
      id: project?.id || `proj_${now}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      description: description.trim(),
      brand: {
        name: brandName.trim() || name.trim(),
        tagline: tagline.trim(),
        website: website.trim(),
        email: email.trim(),
        primaryColor,
        secondaryColor,
        accentColor: '#6366f1',
        fontTitle: 'Inter',
        fontBody: 'Inter',
      },
      activeTemplateId: project?.activeTemplateId || DEFAULT_TEMPLATES[0].id,
      exportSettings: project?.exportSettings || {
        includeCover: true,
        includeToc: true,
        includePrices: true,
        includeAvailability: true,
        includeSpecs: true,
        includePageNumbers: true,
        selectedProductIds: [],
        imageQuality: 'high',
        filename: `${name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        productSortBy: 'sortOrder',
        productSortOrder: 'asc',
      },
      settings: project?.settings || {
        missingFieldPlaceholder: 'Not provided',
        missingPricePlaceholder: 'Inquire for pricing',
        missingImagePlaceholder: 'Image pending',
        duplicateSkuPolicy: 'skip',
        autoSave: true,
        currencySymbol: '$',
      },
      createdAt: project?.createdAt || now,
      updatedAt: now,
    };

    onSave(targetProject);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Catalog Project' : 'Create New Catalog Project'}
      description="Define the catalog title, brand identity, and theme colors."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <Input
            label="Catalog Project Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Commercial Lighting Catalog 2026"
            error={error}
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Description (Optional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Catalog edition details, target market, or scope..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          />
        </div>

        <div className="pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-3">
            Brand Identity Configuration
          </h4>

          <div className="space-y-3">
            <div>
              <Input
                label="Company / Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Acme Industrial Corp"
              />
            </div>

            <div>
              <Input
                label="Tagline / Motto"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Precision Engineering for Modern Industry"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input
                  label="Official Website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="www.company.com"
                />
              </div>

              <div>
                <Input
                  label="Inquiry Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sales@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-2 py-1 border border-slate-300 rounded font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
