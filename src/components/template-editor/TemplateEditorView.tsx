import React, { useState } from 'react';
import { 
  Palette, 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Sliders, 
  Check, 
  Sparkles,
  BookOpen,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DEFAULT_TEMPLATES } from '../../features/templates/defaultTemplates';
import type { CatalogTemplate, BrandConfig, Product } from '../../types';
import { CatalogPageRenderer } from '../../features/pdf-generation/pageLayoutRenderer';

interface TemplateEditorViewProps {
  currentTemplate: CatalogTemplate;
  availableTemplates: CatalogTemplate[];
  brand: BrandConfig;
  sampleProduct?: Product;
  onSaveTemplate: (template: CatalogTemplate) => void;
  onSelectTemplate: (templateId: string) => void;
}

export const TemplateEditorView: React.FC<TemplateEditorViewProps> = ({
  currentTemplate,
  availableTemplates,
  brand,
  sampleProduct,
  onSaveTemplate,
  onSelectTemplate,
}) => {
  const [template, setTemplate] = useState<CatalogTemplate>(currentTemplate);
  const [activeSection, setActiveSection] = useState<'layout' | 'typography' | 'colors' | 'images' | 'table' | 'headerFooter'>('layout');
  const [isSaved, setIsSaved] = useState(false);

  const handleUpdate = (updater: (prev: CatalogTemplate) => CatalogTemplate) => {
    setTemplate(prev => updater(prev));
    setIsSaved(false);
  };

  const handleSave = () => {
    onSaveTemplate(template);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catalog Template Engine</h1>
            {template.isReferenceDerived && <Badge variant="brand">Reference-Derived</Badge>}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize typography, page geometry, color systems, and technical specification table styles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : undefined}
          >
            {isSaved ? 'Template Saved!' : 'Save Template Settings'}
          </Button>
        </div>
      </div>

      {/* Preset Templates Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Select or Switch Catalog Template Preset
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {DEFAULT_TEMPLATES.map((tmpl) => {
            const isSelected = template.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  setTemplate(tmpl);
                  onSelectTemplate(tmpl.id);
                }}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-100 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{tmpl.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tmpl.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 2-Col Workspace: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Settings Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
          {/* Section Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50 overflow-x-auto text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveSection('layout')}
              className={`px-3 py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'layout' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Geometry
            </button>
            <button
              onClick={() => setActiveSection('typography')}
              className={`px-3 py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'typography' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Fonts
            </button>
            <button
              onClick={() => setActiveSection('colors')}
              className={`px-3 py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'colors' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Colors
            </button>
            <button
              onClick={() => setActiveSection('images')}
              className={`px-3 py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'images' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Photos
            </button>
            <button
              onClick={() => setActiveSection('table')}
              className={`px-3 py-2.5 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSection === 'table' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Tables
            </button>
          </div>

          <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
            {/* 1. GEOMETRY & LAYOUT */}
            {activeSection === 'layout' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Page Standard</label>
                  <select
                    value={template.pageSize}
                    onChange={(e) => handleUpdate(t => ({ ...t, pageSize: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="A4">A4 (210 × 297 mm) — Standard International</option>
                    <option value="LETTER">US Letter (8.5 × 11 in) — North American Standard</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Orientation</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({ ...t, orientation: 'portrait' }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.orientation === 'portrait' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      Portrait (Vertical)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({ ...t, orientation: 'landscape' }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.orientation === 'landscape' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      Landscape (Horizontal)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Products per Page</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({ ...t, productsPerPage: 1 }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.productsPerPage === 1 ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      1 Product (Full Page Showcase)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({ ...t, productsPerPage: 2 }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.productsPerPage === 2 ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      2 Products (Compact Split)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Page Margins (Current: {template.marginsMm.top}mm)
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="30"
                    value={template.marginsMm.top}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate(t => ({
                        ...t,
                        marginsMm: { top: v, right: v, bottom: v, left: v },
                      }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>
            )}

            {/* 2. TYPOGRAPHY */}
            {activeSection === 'typography' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Headline Font Family</label>
                  <select
                    value={template.typography.titleFont}
                    onChange={(e) => handleUpdate(t => ({
                      ...t,
                      typography: { ...t.typography, titleFont: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Inter">Inter (Modern Clean Sans)</option>
                    <option value="Outfit">Outfit (High-Tech Geometric)</option>
                    <option value="Playfair Display">Playfair Display (Serif Luxury)</option>
                    <option value="Roboto Mono">Roboto Mono (Engineering Monospace)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Title Font Size ({template.typography.titleSizePt} pt)
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="32"
                    value={template.typography.titleSizePt}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate(t => ({
                        ...t,
                        typography: { ...t.typography, titleSizePt: v }
                      }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Body Text Font Family</label>
                  <select
                    value={template.typography.bodyFont}
                    onChange={(e) => handleUpdate(t => ({
                      ...t,
                      typography: { ...t.typography, bodyFont: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Roboto Mono">Roboto Mono</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Body Font Size ({template.typography.bodySizePt} pt)
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="14"
                    step="0.5"
                    value={template.typography.bodySizePt}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate(t => ({
                        ...t,
                        typography: { ...t.typography, bodySizePt: v }
                      }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>
            )}

            {/* 3. COLORS */}
            {activeSection === 'colors' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Primary Brand Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={template.colors.primary}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, primary: e.target.value }
                      }))}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={template.colors.primary}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, primary: e.target.value }
                      }))}
                      className="w-28 px-2 py-1 border border-slate-300 rounded font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secondary / Dark Accent</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={template.colors.secondary}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, secondary: e.target.value }
                      }))}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={template.colors.secondary}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, secondary: e.target.value }
                      }))}
                      className="w-28 px-2 py-1 border border-slate-300 rounded font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Page Sheet Background</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={template.colors.background}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, background: e.target.value }
                      }))}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={template.colors.background}
                      onChange={(e) => handleUpdate(t => ({
                        ...t,
                        colors: { ...t.colors, background: e.target.value }
                      }))}
                      className="w-28 px-2 py-1 border border-slate-300 rounded font-mono uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. IMAGES */}
            {activeSection === 'images' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image Fit Behavior</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({
                        ...t,
                        imageConfig: { ...t.imageConfig, fit: 'contain' }
                      }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.imageConfig.fit === 'contain' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white'
                      }`}
                    >
                      Contain (Never Crop)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(t => ({
                        ...t,
                        imageConfig: { ...t.imageConfig, fit: 'cover' }
                      }))}
                      className={`py-2 px-3 rounded-lg border font-semibold cursor-pointer ${
                        template.imageConfig.fit === 'cover' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 bg-white'
                      }`}
                    >
                      Cover (Fill Container)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Maximum Image Height ({template.imageConfig.maxHeightMm} mm)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="140"
                    value={template.imageConfig.maxHeightMm}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate(t => ({
                        ...t,
                        imageConfig: { ...t.imageConfig, maxHeightMm: v }
                      }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image Box Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={template.imageConfig.borderRadiusPx}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      handleUpdate(t => ({
                        ...t,
                        imageConfig: { ...t.imageConfig, borderRadiusPx: v }
                      }));
                    }}
                    className="w-full accent-brand-600"
                  />
                </div>
              </div>
            )}

            {/* 5. TABLES */}
            {activeSection === 'table' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Specs Layout Style</label>
                  <select
                    value={template.specsConfig.layout}
                    onChange={(e) => handleUpdate(t => ({
                      ...t,
                      specsConfig: { ...t.specsConfig, layout: e.target.value as any }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="table">Bordered Table with Header</option>
                    <option value="striped">Zebra Striped Rows</option>
                    <option value="grid">Minimal Clean Grid</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Alternate Row Shading</span>
                  <input
                    type="checkbox"
                    checked={template.specsConfig.alternateRowBg}
                    onChange={(e) => handleUpdate(t => ({
                      ...t,
                      specsConfig: { ...t.specsConfig, alternateRowBg: e.target.checked }
                    }))}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Live Preview Sheet (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/5 rounded-2xl border border-slate-200 p-6 flex flex-col items-center justify-center overflow-hidden">
          <div className="mb-3 flex items-center justify-between w-full max-w-[500px] text-xs font-semibold text-slate-500">
            <span>WYSIWYG Template Preview</span>
            <span className="font-mono">{template.pageSize} • {template.orientation}</span>
          </div>

          <div className="scale-[0.62] origin-top -mb-48 shadow-2xl rounded-lg overflow-hidden">
            <CatalogPageRenderer
              pageType="product"
              template={template}
              brand={brand}
              product={sampleProduct}
              pageNumber={3}
              totalPages={8}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
