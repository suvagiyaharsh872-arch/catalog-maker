import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Product, CatalogTemplate, Project, ExportSettings } from '../../types';
import { CatalogPageRenderer } from './pageLayoutRenderer';

export interface GenerationProgressCallback {
  (progress: number, stage: string): void;
}

export async function generateCatalogPdf(
  project: Project,
  template: CatalogTemplate,
  products: Product[],
  settings: ExportSettings,
  onProgress?: GenerationProgressCallback
): Promise<{ blob: Blob; filename: string; pageCount: number; sizeBytes: number }> {
  onProgress?.(5, 'Preparing catalog structure & computing pagination...');

  // 1. Filter products if specific IDs were chosen
  let targetProducts = products;
  if (settings.selectedProductIds && settings.selectedProductIds.length > 0) {
    targetProducts = products.filter(p => settings.selectedProductIds.includes(p.id));
  }

  // 2. Sort products according to export settings
  targetProducts = [...targetProducts].sort((a, b) => {
    let cmp = 0;
    if (settings.productSortBy === 'title') cmp = a.title.localeCompare(b.title);
    else if (settings.productSortBy === 'sku') cmp = a.sku.localeCompare(b.sku);
    else if (settings.productSortBy === 'category') cmp = a.category.localeCompare(b.category);
    else if (settings.productSortBy === 'price') {
      const pa = typeof a.price === 'number' ? a.price : parseFloat(String(a.price) || '0');
      const pb = typeof b.price === 'number' ? b.price : parseFloat(String(b.price) || '0');
      cmp = pa - pb;
    } else {
      cmp = a.sortOrder - b.sortOrder;
    }
    return settings.productSortOrder === 'desc' ? -cmp : cmp;
  });

  // 3. Calculate page allocation & Table of Contents
  let currentPage = 1;
  const pageItems: Array<{
    type: 'cover' | 'toc' | 'product' | 'backcover';
    product?: Product;
    secondaryProduct?: Product;
    pageNumber: number;
  }> = [];

  if (settings.includeCover) {
    pageItems.push({ type: 'cover', pageNumber: currentPage++ });
  }

  let tocPageIndex = -1;
  if (settings.includeToc) {
    tocPageIndex = currentPage;
    pageItems.push({ type: 'toc', pageNumber: currentPage++ });
  }

  // Category mapping for TOC
  const categoryFirstPage = new Map<string, { pageNumber: number; count: number }>();

  if (template.productsPerPage === 2) {
    for (let i = 0; i < targetProducts.length; i += 2) {
      const p1 = targetProducts[i];
      const p2 = targetProducts[i + 1];

      if (!categoryFirstPage.has(p1.category)) {
        categoryFirstPage.set(p1.category, { pageNumber: currentPage, count: 0 });
      }
      categoryFirstPage.get(p1.category)!.count += (p2 ? 2 : 1);

      pageItems.push({
        type: 'product',
        product: p1,
        secondaryProduct: p2,
        pageNumber: currentPage++,
      });
    }
  } else {
    // 1 product per page
    targetProducts.forEach(prod => {
      if (!categoryFirstPage.has(prod.category)) {
        categoryFirstPage.set(prod.category, { pageNumber: currentPage, count: 0 });
      }
      categoryFirstPage.get(prod.category)!.count += 1;

      pageItems.push({
        type: 'product',
        product: prod,
        pageNumber: currentPage++,
      });
    });
  }

  // Back cover
  pageItems.push({ type: 'backcover', pageNumber: currentPage++ });

  const totalPages = pageItems.length;

  const tocEntries = Array.from(categoryFirstPage.entries()).map(([category, info]) => ({
    category,
    pageNumber: info.pageNumber,
    count: info.count,
  }));

  // 4. Setup PDF Document
  const isA4 = template.pageSize === 'A4';
  const orientation = template.orientation === 'portrait' ? 'p' : 'l';
  const pdfFormat = isA4 ? 'a4' : 'letter';

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pdfFormat,
    compress: true,
  });

  // 5. Create Hidden DOM Render Container
  const container = document.createElement('div');
  container.id = 'pdf-render-offscreen';
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '-99999px';
  container.style.width = isA4 ? '794px' : '816px';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);

  try {
    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i];
      const pct = Math.round(15 + ((i + 1) / pageItems.length) * 75);
      onProgress?.(
        pct, 
        `Rendering page ${i + 1} of ${pageItems.length}: ${item.type === 'product' ? item.product?.title : item.type.toUpperCase()}`
      );

      // Render page component into container
      const root = createRoot(container);
      await new Promise<void>((resolve) => {
        root.render(
          <CatalogPageRenderer
            pageType={item.type}
            template={template}
            brand={project.brand}
            settings={project.settings}
            product={item.product}
            secondaryProduct={item.secondaryProduct}
            pageNumber={item.pageNumber}
            totalPages={totalPages}
            tocEntries={tocEntries}
          />
        );
        // Small tick to ensure images and layout mount
        setTimeout(resolve, 80);
      });

      // Capture with html2canvas
      const scale = settings.imageQuality === 'maximum' ? 2.5 : 2.0;
      const canvas = await html2canvas(container, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: template.colors.background || '#ffffff',
        logging: false,
      });

      // Add to jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = doc.internal.pageSize.getHeight();

      if (i > 0) {
        doc.addPage(pdfFormat, orientation);
      }
      doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      root.unmount();
      container.innerHTML = '';
    }

    onProgress?.(95, 'Compiling and saving publication-ready PDF...');
    const pdfBlob = doc.output('blob');
    const filename = settings.filename.endsWith('.pdf') ? settings.filename : `${settings.filename}.pdf`;

    saveAs(pdfBlob, filename);
    onProgress?.(100, 'Catalog PDF downloaded successfully!');

    return {
      blob: pdfBlob,
      filename,
      pageCount: totalPages,
      sizeBytes: pdfBlob.size,
    };
  } finally {
    // Cleanup offscreen element
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
