import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sliders, 
  ArrowRight,
  Info,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { analyzeReferencePdf } from '../../features/pdf-analysis/pdfAnalyzer';
import type { ReferencePdfData, AnalyzedPdfPage, LayoutBox, CatalogTemplate } from '../../types';
import { formatFileSize } from '../../utils/formatters';

interface ReferenceAnalyzerViewProps {
  referenceData?: ReferencePdfData;
  onSaveReferenceData: (data: ReferencePdfData) => void;
  onApplyAsTemplate: (template: Partial<CatalogTemplate>) => void;
}

export const ReferenceAnalyzerView: React.FC<ReferenceAnalyzerViewProps> = ({
  referenceData,
  onSaveReferenceData,
  onApplyAsTemplate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(referenceData?.selectedPageIndex || 0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeRegionTab, setActiveRegionTab] = useState<'all' | 'title' | 'sku' | 'image' | 'specs' | 'price'>('all');

  const currentPage: AnalyzedPdfPage | undefined = referenceData?.pages[selectedPageIndex];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF document.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('PDF file size exceeds 50MB limit.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const analyzed = await analyzeReferencePdf(file);
      onSaveReferenceData(analyzed);
      setSelectedPageIndex(analyzed.selectedPageIndex);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to analyze reference PDF document. It may be password protected or corrupted.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTemplate = () => {
    if (!currentPage) return;

    const detected = currentPage.suggestedRegions;
    const isPortrait = currentPage.aspectRatio < 1;

    // Convert detected regions & styles into a CatalogTemplate configuration
    const derivedTemplate: Partial<CatalogTemplate> = {
      name: `Template from ${referenceData?.fileName.replace(/\.pdf$/i, '') || 'Reference PDF'}`,
      description: `Automatically derived from page ${selectedPageIndex + 1} of reference PDF layout.`,
      isReferenceDerived: true,
      pageSize: 'A4',
      orientation: isPortrait ? 'portrait' : 'landscape',
      colors: {
        primary: currentPage.detectedColors[0] || '#4f46e5',
        secondary: currentPage.detectedColors[1] || '#0f172a',
        accent: currentPage.detectedColors[2] || '#6366f1',
        background: '#ffffff',
        surface: '#f8fafc',
        border: '#e2e8f0',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
      },
      typography: {
        titleFont: 'Inter',
        titleSizePt: detected.title ? 20 : 18,
        titleWeight: 'bold',
        titleColor: currentPage.detectedColors[1] || '#0f172a',
        bodyFont: 'Inter',
        bodySizePt: 10,
        bodyColor: '#334155',
        skuFont: 'Roboto Mono',
        skuSizePt: 9,
        priceFont: 'Inter',
        priceSizePt: 18,
        priceColor: currentPage.detectedColors[0] || '#4f46e5',
      },
      imageConfig: {
        fit: 'contain',
        aspectRatio: '4:3',
        borderRadiusPx: 6,
        showBorder: true,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
        maxHeightMm: 80,
      },
      specsConfig: {
        layout: detected.specsTable && detected.specsTable.rows.length > 5 ? 'table' : 'striped',
        columns: 2,
        showBorders: true,
        headerBg: '#f1f5f9',
        alternateRowBg: true,
        fontSizePt: 8.5,
      },
      headerConfig: {
        enabled: !!detected.header,
        showLogo: true,
        titleText: detected.header?.text || 'Product Catalog',
        showDivider: true,
        heightMm: 12,
      },
      footerConfig: {
        enabled: !!detected.footer,
        text: detected.footer?.text || 'Confidential',
        showPageNumbers: true,
        pageNumberFormat: 'PAGE_X_OF_Y',
        heightMm: 10,
      },
      coverPage: {
        enabled: true,
        title: detected.title?.text || 'PRODUCT CATALOG',
        subtitle: 'Official Specification Catalog',
        theme: 'clean',
      },
      tableOfContents: {
        enabled: true,
        title: 'Table of Contents',
        showCategoryDividers: true,
      },
      overflowPolicy: 'fit',
    };

    onApplyAsTemplate(derivedTemplate);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reference PDF Analyzer</h1>
            <Badge variant="brand">AI & PDF.js Inspection</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Upload an existing product catalog PDF to automatically extract its visual layout, bounding boxes, typography, and color palette.
          </p>
        </div>

        {referenceData && (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateTemplate}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Generate Catalog Template From Reference
            </Button>
          </div>
        )}
      </div>

      {/* Upload Zone / Status */}
      {!referenceData ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-brand-500 transition-colors">
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 shadow-sm">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isAnalyzing ? 'Analyzing PDF Geometry & Reading Blocks...' : 'Upload Reference Catalog PDF'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mt-1">
              Supports single or multi-page product catalogs up to 50MB. PDF.js will inspect text coordinates, fonts, image zones, and color tokens.
            </p>
            <div className="mt-5">
              <Button variant="primary" size="md" isLoading={isAnalyzing}>
                Select PDF File
              </Button>
            </div>
          </label>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 max-w-md mx-auto">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
        </div>
      ) : (
        /* Analyzed PDF Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Thumbnails & Metadata (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Document Info</span>
                <Badge variant="success" size="sm">Analyzed</Badge>
              </div>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-900 truncate" title={referenceData.fileName}>
                  {referenceData.fileName}
                </p>
                <p>File Size: {formatFileSize(referenceData.fileSize)}</p>
                <p>Total Pages: {referenceData.pageCount}</p>
                <p>Selected Page: #{selectedPageIndex + 1}</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label htmlFor="replace-pdf" className="text-xs font-semibold text-brand-600 hover:text-brand-800 cursor-pointer block text-center">
                  Replace Reference PDF
                </label>
                <input
                  type="file"
                  id="replace-pdf"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Page Thumbnails List */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Catalog Pages</span>
                <span className="text-[10px] text-slate-500">Click to inspect</span>
              </div>
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {referenceData.pages.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPageIndex === idx
                        ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-100'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <img
                      src={p.thumbnailUrl}
                      alt={`Page ${idx + 1}`}
                      className="w-12 h-16 object-cover rounded border border-slate-300 shadow-xs"
                    />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900">Page {idx + 1}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {p.textBlocks.length} text blocks
                      </p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {p.confidence}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Visual Inspection with Bounding Boxes (6 Cols) */}
          <div className="lg:col-span-6 bg-slate-900/5 rounded-2xl border border-slate-200 p-4 flex flex-col">
            {/* Viewport Toolbar */}
            <div className="flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-subtle mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Zoom:</span>
                <button
                  onClick={() => setZoomLevel(Math.max(50, zoomLevel - 15))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono font-medium text-slate-700 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(180, zoomLevel + 15))}
                  className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="text-[10px] text-brand-600 font-semibold ml-1 cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {/* Region Filter Chips */}
              <div className="flex items-center gap-1 text-[10px]">
                {(['all', 'title', 'sku', 'image', 'specs', 'price'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveRegionTab(tab)}
                    className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                      activeRegionTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Canvas Preview with Visual Bounding Box Overlays */}
            <div className="flex-1 overflow-auto flex items-center justify-center min-h-[540px] p-4 bg-slate-100/60 rounded-xl">
              {currentPage ? (
                <div 
                  className="relative bg-white shadow-xl rounded-lg overflow-hidden transition-transform origin-top"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    width: '520px',
                    height: '735px',
                  }}
                >
                  {/* Rendered PDF Page Background */}
                  <img
                    src={currentPage.thumbnailUrl}
                    alt="Analyzed Page"
                    className="w-full h-full object-contain pointer-events-none"
                  />

                  {/* Bounding Box Overlays */}
                  {currentPage.suggestedRegions.title && (activeRegionTab === 'all' || activeRegionTab === 'title') && (
                    <div
                      className="absolute border-2 border-indigo-500 bg-indigo-500/15 rounded flex items-start p-1 pointer-events-none"
                      style={{
                        left: `${currentPage.suggestedRegions.title.box.x}%`,
                        top: `${currentPage.suggestedRegions.title.box.y}%`,
                        width: `${currentPage.suggestedRegions.title.box.w}%`,
                        height: `${currentPage.suggestedRegions.title.box.h}%`,
                      }}
                    >
                      <span className="bg-indigo-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">
                        Product Title
                      </span>
                    </div>
                  )}

                  {currentPage.suggestedRegions.sku && (activeRegionTab === 'all' || activeRegionTab === 'sku') && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/15 rounded flex items-start p-1 pointer-events-none"
                      style={{
                        left: `${currentPage.suggestedRegions.sku.box.x}%`,
                        top: `${currentPage.suggestedRegions.sku.box.y}%`,
                        width: `${currentPage.suggestedRegions.sku.box.w}%`,
                        height: `${currentPage.suggestedRegions.sku.box.h}%`,
                      }}
                    >
                      <span className="bg-blue-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">
                        SKU
                      </span>
                    </div>
                  )}

                  {currentPage.suggestedRegions.imageArea && (activeRegionTab === 'all' || activeRegionTab === 'image') && (
                    <div
                      className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/15 rounded flex items-start p-1 pointer-events-none"
                      style={{
                        left: `${currentPage.suggestedRegions.imageArea.box.x}%`,
                        top: `${currentPage.suggestedRegions.imageArea.box.y}%`,
                        width: `${currentPage.suggestedRegions.imageArea.box.w}%`,
                        height: `${currentPage.suggestedRegions.imageArea.box.h}%`,
                      }}
                    >
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">
                        Product Image Zone
                      </span>
                    </div>
                  )}

                  {currentPage.suggestedRegions.specsTable && (activeRegionTab === 'all' || activeRegionTab === 'specs') && (
                    <div
                      className="absolute border-2 border-purple-500 bg-purple-500/15 rounded flex items-start p-1 pointer-events-none"
                      style={{
                        left: `${currentPage.suggestedRegions.specsTable.box.x}%`,
                        top: `${currentPage.suggestedRegions.specsTable.box.y}%`,
                        width: `${currentPage.suggestedRegions.specsTable.box.w}%`,
                        height: `${currentPage.suggestedRegions.specsTable.box.h}%`,
                      }}
                    >
                      <span className="bg-purple-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">
                        Technical Specs ({currentPage.suggestedRegions.specsTable.rows.length} rows)
                      </span>
                    </div>
                  )}

                  {currentPage.suggestedRegions.price && (activeRegionTab === 'all' || activeRegionTab === 'price') && (
                    <div
                      className="absolute border-2 border-amber-500 bg-amber-500/15 rounded flex items-start p-1 pointer-events-none"
                      style={{
                        left: `${currentPage.suggestedRegions.price.box.x}%`,
                        top: `${currentPage.suggestedRegions.price.box.y}%`,
                        width: `${currentPage.suggestedRegions.price.box.w}%`,
                        height: `${currentPage.suggestedRegions.price.box.h}%`,
                      }}
                    >
                      <span className="bg-amber-600 text-white text-[9px] font-bold px-1 rounded shadow-xs">
                        Price
                      </span>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Detected Structural Hierarchy & Design Settings (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Detected Design Elements</span>
                <span className="text-xs font-mono font-bold text-brand-600">
                  {currentPage?.confidence}% confidence
                </span>
              </div>

              {/* Dominant Brand Colors */}
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Palette</p>
                <div className="flex items-center gap-2">
                  {currentPage?.detectedColors.map((hex, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-lg border border-slate-200 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-[9px] font-mono text-slate-500">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detected Regions List */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Identified Zones</p>
                
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-700">Title Candidate</span>
                    {currentPage?.suggestedRegions.title ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">None</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] font-medium truncate">
                    {currentPage?.suggestedRegions.title?.text || 'Not detected'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-700">SKU / Code</span>
                    {currentPage?.suggestedRegions.sku ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">None</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] font-mono">
                    {currentPage?.suggestedRegions.sku?.text || 'Not detected'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-700">Specifications Table</span>
                    {currentPage?.suggestedRegions.specsTable ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">None</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {currentPage?.suggestedRegions.specsTable
                      ? `${currentPage.suggestedRegions.specsTable.rows.length} rows recognized`
                      : 'Not detected'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-700">Price Location</span>
                    {currentPage?.suggestedRegions.price ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="text-slate-400 text-[10px]">None</span>
                    )}
                  </div>
                  <p className="text-slate-600 text-[11px] font-mono">
                    {currentPage?.suggestedRegions.price?.text || 'Not detected'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <Button
                  variant="primary"
                  className="w-full text-xs"
                  onClick={handleGenerateTemplate}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Apply Reference As Active Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
