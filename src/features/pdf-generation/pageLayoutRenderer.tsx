import React from 'react';
import type { Product, CatalogTemplate, BrandConfig, ProjectSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';

export interface CatalogPageProps {
  pageType: 'cover' | 'toc' | 'divider' | 'product' | 'backcover';
  template: CatalogTemplate;
  brand: BrandConfig;
  settings?: ProjectSettings;
  
  // For product page
  product?: Product;
  secondaryProduct?: Product; // For 2-up layout
  pageNumber: number;
  totalPages: number;

  // For TOC page
  tocEntries?: Array<{ category: string; pageNumber: number; count: number }>;

  // For category divider page
  categoryName?: string;
  categoryProductCount?: number;
}

export const CatalogPageRenderer: React.FC<CatalogPageProps> = ({
  pageType,
  template,
  brand,
  settings,
  product,
  secondaryProduct,
  pageNumber,
  totalPages,
  tocEntries = [],
  categoryName,
  categoryProductCount,
}) => {
  const isA4 = template.pageSize === 'A4';
  const isPortrait = template.orientation === 'portrait';

  // Standard dimensions at 96 DPI: A4 is 794px x 1123px, Letter is 816px x 1056px
  const widthPx = isPortrait ? (isA4 ? 794 : 816) : (isA4 ? 1123 : 1056);
  const heightPx = isPortrait ? (isA4 ? 1123 : 1056) : (isA4 ? 794 : 816);

  const paddingStyle = {
    paddingTop: `${template.marginsMm.top * 3.78}px`,
    paddingRight: `${template.marginsMm.right * 3.78}px`,
    paddingBottom: `${template.marginsMm.bottom * 3.78}px`,
    paddingLeft: `${template.marginsMm.left * 3.78}px`,
  };

  const placeholderText = settings?.missingFieldPlaceholder || '—';
  const pricePlaceholder = settings?.missingPricePlaceholder || 'Contact for pricing';

  // 1. COVER PAGE
  if (pageType === 'cover') {
    return (
      <div 
        className="catalog-page-sheet bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl mx-auto"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: template.coverPage.theme === 'luxury' ? '#fafaf9' : template.colors.background,
          ...paddingStyle,
        }}
      >
        {/* Accent Bar */}
        <div 
          className="absolute top-0 left-0 right-0 h-3"
          style={{ backgroundColor: template.colors.primary }}
        />

        {/* Header / Logo */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            {brand.logoUrl ? (
              <img src={brand.logoUrl} alt={brand.name} className="h-12 object-contain" />
            ) : (
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow"
                style={{ backgroundColor: template.colors.primary }}
              >
                {brand.name ? brand.name.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold tracking-tight" style={{ color: template.colors.textPrimary }}>
                {brand.name || 'Catalog Studio'}
              </h2>
              {brand.tagline && (
                <p className="text-xs uppercase tracking-widest text-slate-500">{brand.tagline}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span 
              className="text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: `${template.colors.primary}15`, color: template.colors.primary }}
            >
              {template.coverPage.dateText || 'Official Catalog'}
            </span>
          </div>
        </div>

        {/* Center Title Hero */}
        <div className="my-auto py-12 flex flex-col items-center text-center">
          {template.coverPage.coverImageUrl ? (
            <div className="w-full max-h-72 mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img src={template.coverPage.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div 
              className="w-24 h-2 mb-8 rounded-full"
              style={{ backgroundColor: template.colors.primary }}
            />
          )}

          <h1 
            className="text-4xl md:text-5xl font-black tracking-tight max-w-xl leading-tight"
            style={{ 
              color: template.colors.textPrimary,
              fontFamily: template.typography.titleFont 
            }}
          >
            {template.coverPage.title || 'PRODUCT CATALOG'}
          </h1>

          <p className="mt-4 text-lg max-w-md text-slate-600 font-normal">
            {template.coverPage.subtitle || 'Complete Line of High-Performance Products'}
          </p>

          <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <span>Edition 2026</span>
            <span>•</span>
            <span>{brand.website || 'catalogstudio.app'}</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            <p className="font-medium text-slate-700">{brand.name}</p>
            <p>{brand.address || brand.email || 'All specifications subject to change without notice.'}</p>
          </div>
          <div className="text-right">
            <p className="font-mono">Page 1</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. TABLE OF CONTENTS
  if (pageType === 'toc') {
    return (
      <div 
        className="catalog-page-sheet bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl mx-auto"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: template.colors.background,
          ...paddingStyle,
        }}
      >
        {/* Top Header */}
        <div className="pb-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{brand.name}</span>
          <span className="text-xs text-slate-500 font-mono">Catalog Index</span>
        </div>

        {/* TOC Content */}
        <div className="my-auto py-8">
          <div className="mb-10 text-center">
            <h2 
              className="text-3xl font-bold tracking-tight"
              style={{ color: template.colors.primary, fontFamily: template.typography.titleFont }}
            >
              {template.tableOfContents.title || 'Table of Contents'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Directory of product sections & categories</p>
          </div>

          <div className="max-w-lg mx-auto space-y-4">
            {tocEntries.length > 0 ? (
              tocEntries.map((entry, idx) => (
                <div key={idx} className="flex items-end justify-between py-2 border-b border-dashed border-slate-300">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: `${template.colors.primary}15`, color: template.colors.primary }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-base font-semibold text-slate-800">{entry.category}</span>
                    <span className="text-xs text-slate-500">({entry.count} {entry.count === 1 ? 'item' : 'items'})</span>
                  </div>
                  <span className="text-base font-bold font-mono text-slate-700">
                    Page {entry.pageNumber}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p>No categories defined.</p>
              </div>
            )}
          </div>
        </div>

        {/* Page Footer */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>{template.footerConfig.text || 'Product Directory'}</span>
          <span className="font-mono">Page {pageNumber}</span>
        </div>
      </div>
    );
  }

  // 3. PRODUCT SHOWCASE PAGE (Single Product or 2-up)
  if (pageType === 'product' && product) {
    const isTwoUp = template.productsPerPage === 2 && secondaryProduct;

    return (
      <div 
        className="catalog-page-sheet bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl mx-auto"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: template.colors.background,
          ...paddingStyle,
        }}
      >
        {/* Running Header */}
        {template.headerConfig.enabled && (
          <div className="pb-3 mb-4 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {template.headerConfig.showLogo && brand.logoUrl && (
                <img src={brand.logoUrl} alt="Logo" className="h-5 object-contain" />
              )}
              <span className="font-bold tracking-tight text-slate-700">{brand.name}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 uppercase tracking-wider">{product.category}</span>
            </div>
            <div className="text-slate-500 font-medium">
              {template.headerConfig.titleText || 'Product Specification'}
            </div>
          </div>
        )}

        {/* Main Product Content */}
        {!isTwoUp ? (
          /* Single Product Full Page Layout */
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Top Area: Title, SKU, Price & Badge */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="font-mono text-xs px-2 py-0.5 rounded font-semibold tracking-wider"
                    style={{ backgroundColor: `${template.colors.primary}12`, color: template.colors.primary }}
                  >
                    SKU: {product.sku || placeholderText}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.availability === 'in_stock' ? 'bg-emerald-100 text-emerald-800' :
                    product.availability === 'low_stock' ? 'bg-amber-100 text-amber-800' :
                    product.availability === 'out_of_stock' ? 'bg-rose-100 text-rose-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {product.availability === 'in_stock' ? 'In Stock' :
                     product.availability === 'low_stock' ? 'Low Stock' :
                     product.availability === 'out_of_stock' ? 'Out of Stock' :
                     product.availability === 'preorder' ? 'Pre-Order' : 'Discontinued'}
                  </span>
                </div>

                <h1 
                  className="font-bold tracking-tight leading-tight"
                  style={{
                    fontSize: `${template.typography.titleSizePt}pt`,
                    color: template.typography.titleColor || template.colors.textPrimary,
                    fontFamily: template.typography.titleFont,
                  }}
                >
                  {product.title}
                </h1>

                {product.brand && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">By {product.brand}</p>
                )}
              </div>

              {/* Price Tag */}
              <div className="text-right flex flex-col items-end">
                <div 
                  className="font-bold tracking-tight"
                  style={{
                    fontSize: `${template.typography.priceSizePt}pt`,
                    color: template.typography.priceColor || template.colors.primary,
                    fontFamily: template.typography.priceFont,
                  }}
                >
                  {formatCurrency(product.price, product.currency, pricePlaceholder)}
                </div>
                {product.price && (
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">MSRP / Unit</span>
                )}
              </div>
            </div>

            {/* Middle Area: Product Main Image & Highlights */}
            <div className="grid grid-cols-12 gap-6 items-center my-2">
              <div className="col-span-6 flex justify-center">
                <div 
                  className="w-full rounded-xl overflow-hidden flex items-center justify-center p-3 shadow-sm"
                  style={{
                    maxHeight: `${template.imageConfig.maxHeightMm * 3.78}px`,
                    height: `${template.imageConfig.maxHeightMm * 3.78}px`,
                    backgroundColor: template.imageConfig.backgroundColor || '#f8fafc',
                    border: template.imageConfig.showBorder ? `1px solid ${template.imageConfig.borderColor}` : 'none',
                    borderRadius: `${template.imageConfig.borderRadiusPx}px`,
                  }}
                >
                  {product.mainImage ? (
                    <img 
                      src={product.mainImage} 
                      alt={product.title} 
                      className="max-h-full max-w-full"
                      style={{ objectFit: template.imageConfig.fit }}
                    />
                  ) : (
                    <div className="text-center p-6 text-slate-500">
                      <div className="w-12 h-12 mx-auto mb-2 rounded bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-bold">
                        IMG
                      </div>
                      <p className="text-xs font-medium">No Image Provided</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Description */}
              <div className="col-span-6 flex flex-col justify-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Overview</h3>
                <p 
                  className="leading-relaxed"
                  style={{
                    fontSize: `${template.typography.bodySizePt}pt`,
                    color: template.typography.bodyColor || template.colors.textSecondary,
                    fontFamily: template.typography.bodyFont,
                  }}
                >
                  {product.description || `No product description provided for ${product.title}.`}
                </p>

                {product.productUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-brand-600">
                    <span className="font-semibold">Product URL:</span>
                    <span className="font-mono truncate">{product.productUrl}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Area: Technical Specifications Table */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Technical Specifications
                </h3>
                <span className="text-[10px] text-slate-500">
                  {product.specifications.length} {product.specifications.length === 1 ? 'specification' : 'specifications'}
                </span>
              </div>

              {product.specifications.length > 0 ? (
                <div 
                  className="rounded-lg overflow-hidden border"
                  style={{ borderColor: template.colors.border }}
                >
                  <table className="w-full text-left border-collapse" style={{ fontSize: `${template.specsConfig.fontSizePt}pt` }}>
                    <thead>
                      <tr style={{ backgroundColor: template.specsConfig.headerBg || '#f1f5f9' }}>
                        <th className="py-1.5 px-3 font-semibold text-slate-700 w-1/3 border-b border-slate-200">Specification</th>
                        <th className="py-1.5 px-3 font-semibold text-slate-700 border-b border-slate-200">Value / Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.specifications.map((spec, sIdx) => (
                        <tr 
                          key={sIdx}
                          style={{
                            backgroundColor: (template.specsConfig.alternateRowBg && sIdx % 2 === 1) ? '#f8fafc' : '#ffffff',
                          }}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="py-1.5 px-3 font-medium text-slate-700">{spec.key}</td>
                          <td className="py-1.5 px-3 text-slate-600 font-mono">{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-lg text-center text-xs text-slate-500">
                  No technical specifications supplied for this item.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 2-Product Compact Stacked Layout */
          <div className="flex-1 flex flex-col justify-between gap-6 overflow-hidden">
            {[product, secondaryProduct!].map((item, iIdx) => (
              <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex gap-4 items-center">
                <div className="w-36 h-36 flex-shrink-0 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-2">
                  {item.mainImage ? (
                    <img src={item.mainImage} alt={item.title} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">No Image</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold">
                      SKU: {item.sku}
                    </span>
                    <span className="font-bold text-base text-brand-700">
                      {formatCurrency(item.price, item.currency, pricePlaceholder)}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{item.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                    {item.specifications.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="bg-white px-2 py-1 rounded border border-slate-200 text-slate-700">
                        <strong className="font-medium">{s.key}:</strong> {s.value}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Running Footer */}
        {template.footerConfig.enabled && (
          <div className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>{template.footerConfig.text || brand.name}</span>
            {template.footerConfig.showPageNumbers && (
              <span className="font-mono font-medium">
                {template.footerConfig.pageNumberFormat === 'PAGE_X_OF_Y' 
                  ? `Page ${pageNumber} of ${totalPages}`
                  : `Page ${pageNumber}`}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. BACK COVER
  if (pageType === 'backcover') {
    return (
      <div 
        className="catalog-page-sheet bg-white relative flex flex-col justify-between overflow-hidden shadow-2xl mx-auto text-center"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor: template.colors.secondary || '#0f172a',
          color: '#ffffff',
          ...paddingStyle,
        }}
      >
        <div className="pt-8">
          <h2 className="text-xl font-bold tracking-tight text-white">{brand.name}</h2>
          <p className="text-xs text-slate-400 mt-1">{brand.tagline}</p>
        </div>

        <div className="my-auto py-12 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl font-black mb-6">
            ✓
          </div>
          <h3 className="text-3xl font-black tracking-tight text-white mb-4">
            Quality & Reliability Guaranteed
          </h3>
          <p className="max-w-md text-slate-300 text-sm leading-relaxed mb-8">
            Thank you for reviewing our catalog. For orders, custom volume quotations, or technical specifications, contact our engineering support desk.
          </p>

          <div className="space-y-2 text-sm text-slate-300 font-mono">
            {brand.website && <p>Website: {brand.website}</p>}
            {brand.email && <p>Inquiries: {brand.email}</p>}
            {brand.phone && <p>Sales: {brand.phone}</p>}
          </div>
        </div>

        <div className="pb-4 text-xs text-slate-400 border-t border-white/10 pt-4 flex justify-between items-center">
          <span>© {new Date().getFullYear()} {brand.name}. All Rights Reserved.</span>
          <span className="font-mono">Page {pageNumber}</span>
        </div>
      </div>
    );
  }

  return null;
};
