import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Package, 
  BookOpen, 
  Sliders, 
  Image as ImageIcon,
  Check,
  Search,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CatalogPageRenderer } from '../../features/pdf-generation/pageLayoutRenderer';
import type { 
  Project, 
  Product, 
  CatalogTemplate, 
  BrandConfig 
} from '../../types';

interface CatalogEditorViewProps {
  project: Project;
  products: Product[];
  template: CatalogTemplate;
  onUpdateProduct: (product: Product) => void;
  onUpdateTemplate: (template: CatalogTemplate) => void;
  onOpenExport: () => void;
}

export const CatalogEditorView: React.FC<CatalogEditorViewProps> = ({
  project,
  products,
  template,
  onUpdateProduct,
  onUpdateTemplate,
  onOpenExport,
}) => {
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(75);
  const [leftTab, setLeftTab] = useState<'pages' | 'products'>('pages');
  const [productSearch, setProductSearch] = useState('');

  // 1. Build document pages structure (Cover -> TOC -> Products -> Back cover)
  const pagesList = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      pageType: 'cover' | 'toc' | 'product' | 'backcover';
      product?: Product;
      secondaryProduct?: Product;
      pageNumber: number;
    }> = [];

    let pNum = 1;

    // Cover
    if (template.coverPage.enabled) {
      list.push({
        id: 'cover-page',
        title: 'Cover Page',
        pageType: 'cover',
        pageNumber: pNum++,
      });
    }

    // TOC
    if (template.tableOfContents.enabled) {
      list.push({
        id: 'toc-page',
        title: 'Table of Contents',
        pageType: 'toc',
        pageNumber: pNum++,
      });
    }

    // Products
    if (template.productsPerPage === 2) {
      for (let i = 0; i < products.length; i += 2) {
        list.push({
          id: `prod-page-${i}`,
          title: `${products[i].title} & ${products[i + 1]?.title || '—'}`,
          pageType: 'product',
          product: products[i],
          secondaryProduct: products[i + 1],
          pageNumber: pNum++,
        });
      }
    } else {
      products.forEach((prod) => {
        list.push({
          id: `prod-page-${prod.id}`,
          title: prod.title,
          pageType: 'product',
          product: prod,
          pageNumber: pNum++,
        });
      });
    }

    // Back cover
    list.push({
      id: 'back-cover-page',
      title: 'Back Cover & Contacts',
      pageType: 'backcover',
      pageNumber: pNum++,
    });

    return list;
  }, [template, products]);

  // Safe active page
  const activePage = pagesList[currentPageIndex] || pagesList[0];
  const activeProduct = activePage?.product;

  // Filtered product items for left list
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  const handleSelectProduct = (product: Product) => {
    // Find page containing this product
    const idx = pagesList.findIndex(p => p.product?.id === product.id || p.secondaryProduct?.id === product.id);
    if (idx !== -1) {
      setCurrentPageIndex(idx);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* =========================================================================
          LEFT PANEL: Navigation (Pages List & Product Inventory) (w-80)
         ========================================================================= */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full flex-shrink-0">
        {/* Left Tabs Header */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 p-2 gap-2 text-xs font-bold text-slate-600">
          <button
            onClick={() => setLeftTab('pages')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              leftTab === 'pages' ? 'bg-white text-brand-600 shadow-xs' : 'hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Pages ({pagesList.length})
          </button>
          <button
            onClick={() => setLeftTab('products')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              leftTab === 'products' ? 'bg-white text-brand-600 shadow-xs' : 'hover:bg-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> Products ({products.length})
          </button>
        </div>

        {/* Tab 1: Pages Sequence */}
        {leftTab === 'pages' && (
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {pagesList.map((page, idx) => {
              const isActive = currentPageIndex === idx;
              return (
                <div
                  key={page.id}
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                    isActive
                      ? 'border-brand-500 bg-brand-50/50 text-brand-900 font-bold shadow-xs ring-1 ring-brand-200'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {page.pageNumber}
                    </span>
                    <span className="truncate">{page.title}</span>
                  </div>

                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {page.pageType}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Products Switcher */}
        {leftTab === 'products' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {filteredProducts.map((p) => {
                const isSelected = activeProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 font-bold shadow-xs ring-1 ring-brand-200'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    {p.mainImage ? (
                      <img src={p.mainImage} alt={p.title} className="w-8 h-8 rounded object-contain border border-slate-200 bg-slate-50" />
                    ) : (
                      <div className="w-8 h-8 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-[9px] text-slate-400 font-mono">
                        N/A
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                      <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CENTER PANEL: Live High-Fidelity Catalog Page Viewport
         ========================================================================= */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Viewport Navigation Bar */}
        <div className="h-12 bg-white border-b border-slate-200 px-6 flex items-center justify-between text-xs">
          {/* Page Turner */}
          <div className="flex items-center gap-2">
            <button
              disabled={currentPageIndex === 0}
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-slate-700">
              Page {currentPageIndex + 1} of {pagesList.length}
            </span>
            <button
              disabled={currentPageIndex >= pagesList.length - 1}
              onClick={() => setCurrentPageIndex(Math.min(pagesList.length - 1, currentPageIndex + 1))}
              className="p-1 rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(Math.max(45, zoomLevel - 15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-slate-700 font-semibold w-10 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(160, zoomLevel + 15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(75)}
              className="text-[11px] font-semibold text-brand-600 ml-1 hover:underline cursor-pointer"
            >
              Fit
            </button>
          </div>

          {/* Export Action */}
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenExport}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export PDF
          </Button>
        </div>

        {/* Center Live Sheet Stage */}
        <div className="flex-1 overflow-auto p-8 flex items-start justify-center bg-slate-200/70">
          <div
            className="transition-transform duration-100 origin-top shadow-2xl rounded-sm"
            style={{
              transform: `scale(${zoomLevel / 100})`,
            }}
          >
            {activePage && (
              <CatalogPageRenderer
                pageType={activePage.pageType}
                template={template}
                brand={project.brand}
                settings={project.settings}
                product={activePage.product}
                secondaryProduct={activePage.secondaryProduct}
                pageNumber={activePage.pageNumber}
                totalPages={pagesList.length}
              />
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANEL: Selected Element & Properties Inspector (w-80)
         ========================================================================= */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full flex-shrink-0">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Element Properties</span>
          <Badge variant="neutral" size="sm">{activePage?.pageType.toUpperCase()}</Badge>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {activeProduct ? (
            /* Editing Active Product Properties */
            <div className="space-y-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={activeProduct.title}
                  onChange={(e) => onUpdateProduct({ ...activeProduct, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">SKU</label>
                <input
                  type="text"
                  value={activeProduct.sku}
                  onChange={(e) => onUpdateProduct({ ...activeProduct, sku: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Price</label>
                <input
                  type="text"
                  value={activeProduct.price !== undefined ? String(activeProduct.price) : ''}
                  placeholder="e.g. 299.00"
                  onChange={(e) => {
                    const v = e.target.value;
                    onUpdateProduct({
                      ...activeProduct,
                      price: v !== '' ? (isNaN(Number(v)) ? v : Number(v)) : undefined,
                    });
                  }}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={activeProduct.description}
                  onChange={(e) => onUpdateProduct({ ...activeProduct, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Quick Image Fit Toggles */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block mb-1">Image Fit</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateTemplate({
                      ...template,
                      imageConfig: { ...template.imageConfig, fit: 'contain' }
                    })}
                    className={`py-1.5 px-2 rounded-lg border font-semibold cursor-pointer ${
                      template.imageConfig.fit === 'contain' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200'
                    }`}
                  >
                    Contain
                  </button>
                  <button
                    onClick={() => onUpdateTemplate({
                      ...template,
                      imageConfig: { ...template.imageConfig, fit: 'cover' }
                    })}
                    className={`py-1.5 px-2 rounded-lg border font-semibold cursor-pointer ${
                      template.imageConfig.fit === 'cover' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200'
                    }`}
                  >
                    Cover
                  </button>
                </div>
              </div>

              {/* Specs Summary */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700">Specifications ({activeProduct.specifications.length})</span>
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {activeProduct.specifications.map((s, idx) => (
                    <div key={idx} className="p-1.5 bg-slate-50 rounded border border-slate-200 text-[11px] flex justify-between">
                      <span className="font-medium text-slate-700">{s.key}:</span>
                      <span className="font-mono text-slate-600 truncate max-w-[120px]">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Non-product Page Settings */
            <div className="space-y-4">
              <p className="text-slate-500">
                Editing layout properties for {activePage?.title}.
              </p>

              {activePage?.pageType === 'cover' && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Catalog Title</label>
                    <input
                      type="text"
                      value={template.coverPage.title}
                      onChange={(e) => onUpdateTemplate({
                        ...template,
                        coverPage: { ...template.coverPage, title: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={template.coverPage.subtitle}
                      onChange={(e) => onUpdateTemplate({
                        ...template,
                        coverPage: { ...template.coverPage, subtitle: e.target.value }
                      })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
