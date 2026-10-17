import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Product, CatalogTemplate, ExportSettings } from '../types';

export function exportProductsToCsv(products: Product[], filename: string = 'catalog-products.csv'): void {
  // Collect all unique specification keys across products
  const allSpecKeys = Array.from(
    new Set(products.flatMap(p => p.specifications.map(s => s.key)))
  );

  const flatRows = products.map(p => {
    const row: Record<string, any> = {
      'SKU': p.sku,
      'Title': p.title,
      'Category': p.category,
      'Subcategory': p.subcategory || '',
      'Price': p.price !== undefined ? p.price : '',
      'Currency': p.currency,
      'Availability': p.availability,
      'Description': p.description,
      'Brand': p.brand || '',
      'Image URL': p.mainImage && !p.mainImage.startsWith('data:') ? p.mainImage : '',
    };

    // Add specs as separate columns
    allSpecKeys.forEach(key => {
      const spec = p.specifications.find(s => s.key === key);
      row[`Spec: ${key}`] = spec ? spec.value : '';
    });

    return row;
  });

  const csv = Papa.unparse(flatRows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export function exportProductsToExcel(products: Product[], filename: string = 'catalog-products.xlsx'): void {
  const allSpecKeys = Array.from(
    new Set(products.flatMap(p => p.specifications.map(s => s.key)))
  );

  const flatRows = products.map(p => {
    const row: Record<string, any> = {
      'SKU': p.sku,
      'Title': p.title,
      'Category': p.category,
      'Subcategory': p.subcategory || '',
      'Price': p.price !== undefined ? p.price : '',
      'Currency': p.currency,
      'Availability': p.availability,
      'Description': p.description,
      'Brand': p.brand || '',
      'Product URL': p.productUrl || '',
    };

    allSpecKeys.forEach(key => {
      const spec = p.specifications.find(s => s.key === key);
      row[`Spec: ${key}`] = spec ? spec.value : '';
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(flatRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

export function exportProductsToJson(products: Product[], filename: string = 'catalog-products.json'): void {
  const jsonString = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

export function exportTemplateToJson(template: CatalogTemplate, filename: string = 'catalog-template.json'): void {
  const jsonString = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}
