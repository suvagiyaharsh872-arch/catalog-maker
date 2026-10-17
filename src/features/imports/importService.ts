import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Product, ProductAvailability, ProductSpecification } from '../../types';

export interface RawImportData {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ColumnMapping {
  titleField?: string;
  skuField?: string;
  descriptionField?: string;
  categoryField?: string;
  priceField?: string;
  currencyField?: string;
  availabilityField?: string;
  imageField?: string;
  specFields: string[]; // List of columns to treat as specifications
}

export interface ImportPreviewRow {
  rowNumber: number;
  raw: Record<string, any>;
  normalized: Partial<Product>;
  isValid: boolean;
  errors: string[];
}

export async function parseFileForImport(file: File): Promise<RawImportData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv' || extension === 'txt') {
    return parseCsvFile(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcelFile(file);
  } else if (extension === 'json') {
    return parseJsonFile(file);
  } else {
    throw new Error(`Unsupported file type: .${extension}. Please upload CSV, XLSX, or JSON.`);
  }
}

function parseCsvFile(file: File): Promise<RawImportData> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        resolve({
          headers,
          rows: results.data,
          totalRows: results.data.length,
        });
      },
      error: (error) => reject(error),
    });
  });
}

async function parseExcelFile(file: File): Promise<RawImportData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel workbook contains no sheets.');
  }

  const sheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  
  if (jsonData.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Object.keys(jsonData[0]);
  return {
    headers,
    rows: jsonData,
    totalRows: jsonData.length,
  };
}

async function parseJsonFile(file: File): Promise<RawImportData> {
  const text = await file.text();
  const data = JSON.parse(text);

  let arrayData: any[] = [];
  if (Array.isArray(data)) {
    arrayData = data;
  } else if (data.products && Array.isArray(data.products)) {
    arrayData = data.products;
  } else {
    throw new Error('JSON file must be an array of objects or contain a "products" array.');
  }

  if (arrayData.length === 0) {
    return { headers: [], rows: [], totalRows: 0 };
  }

  const headers = Array.from(new Set(arrayData.flatMap(item => Object.keys(item))));
  return {
    headers,
    rows: arrayData,
    totalRows: arrayData.length,
  };
}

export function autoDetectColumnMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    specFields: [],
  };

  const clean = (h: string) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

  headers.forEach(h => {
    const c = clean(h);
    if (!mapping.titleField && (c.includes('title') || c.includes('productname') || c.includes('itemname') || c === 'name')) {
      mapping.titleField = h;
    } else if (!mapping.skuField && (c === 'sku' || c === 'code' || c.includes('productcode') || c.includes('itemcode') || c.includes('partnumber') || c === 'pn')) {
      mapping.skuField = h;
    } else if (!mapping.descriptionField && (c.includes('desc') || c.includes('details') || c.includes('summary'))) {
      mapping.descriptionField = h;
    } else if (!mapping.categoryField && (c.includes('category') || c === 'cat' || c === 'type' || c === 'group')) {
      mapping.categoryField = h;
    } else if (!mapping.priceField && (c.includes('price') || c.includes('cost') || c.includes('msrp') || c.includes('retail'))) {
      mapping.priceField = h;
    } else if (!mapping.currencyField && (c === 'currency' || c === 'curr')) {
      mapping.currencyField = h;
    } else if (!mapping.availabilityField && (c.includes('avail') || c.includes('stock') || c.includes('status'))) {
      mapping.availabilityField = h;
    } else if (!mapping.imageField && (c.includes('image') || c.includes('photo') || c.includes('picture') || c.includes('img'))) {
      mapping.imageField = h;
    } else {
      // Add other non-empty headers as potential specifications
      mapping.specFields.push(h);
    }
  });

  return mapping;
}

export function normalizeImportRows(
  rows: Record<string, any>[],
  mapping: ColumnMapping,
  projectId: string,
  defaultCurrency: string = 'USD'
): ImportPreviewRow[] {
  return rows.map((row, idx) => {
    const errors: string[] = [];
    const rowNumber = idx + 1;

    const title = mapping.titleField ? String(row[mapping.titleField] ?? '').trim() : '';
    if (!title) {
      errors.push('Missing product title');
    }

    const sku = mapping.skuField ? String(row[mapping.skuField] ?? '').trim() : `SKU-${rowNumber}`;
    if (!sku) {
      errors.push('Missing SKU');
    }

    const description = mapping.descriptionField ? String(row[mapping.descriptionField] ?? '').trim() : '';
    const category = mapping.categoryField ? String(row[mapping.categoryField] ?? '').trim() : 'General';
    const mainImage = mapping.imageField ? String(row[mapping.imageField] ?? '').trim() : undefined;

    let price: number | string | undefined = undefined;
    if (mapping.priceField && row[mapping.priceField] !== undefined && row[mapping.priceField] !== '') {
      const rawPrice = row[mapping.priceField];
      const parsed = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^0-9.-]+/g, ''));
      price = isNaN(parsed) ? String(rawPrice) : parsed;
    }

    const currency = mapping.currencyField ? String(row[mapping.currencyField] || defaultCurrency) : defaultCurrency;

    // Availability normalization
    let availability: ProductAvailability = 'in_stock';
    if (mapping.availabilityField && row[mapping.availabilityField]) {
      const rawAvail = String(row[mapping.availabilityField]).toLowerCase();
      if (rawAvail.includes('out') || rawAvail.includes('zero') || rawAvail === '0') availability = 'out_of_stock';
      else if (rawAvail.includes('low')) availability = 'low_stock';
      else if (rawAvail.includes('pre')) availability = 'preorder';
      else if (rawAvail.includes('disc')) availability = 'discontinued';
    }

    // Specifications extraction
    const specifications: ProductSpecification[] = [];
    mapping.specFields.forEach(field => {
      const val = row[field];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        specifications.push({
          id: `spec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          key: field,
          value: String(val).trim(),
        });
      }
    });

    const now = Date.now();
    const product: Product = {
      id: `prod_${now}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      projectId,
      title,
      sku,
      description,
      category: category || 'General',
      mainImage,
      specifications,
      price,
      currency,
      availability,
      sortOrder: idx,
      createdAt: now,
      updatedAt: now,
    };

    return {
      rowNumber,
      raw: row,
      normalized: product,
      isValid: errors.length === 0,
      errors,
    };
  });
}
