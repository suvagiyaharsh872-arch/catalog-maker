import { describe, it, expect } from 'vitest';
import { validateCatalogProducts } from '../src/services/validation';
import { 
  autoDetectColumnMapping, 
  normalizeImportRows 
} from '../src/features/imports/importService';
import { DEFAULT_TEMPLATES } from '../src/features/templates/defaultTemplates';
import { formatCurrency, formatFileSize } from '../src/utils/formatters';
import type { Product, ProjectSettings } from '../src/types';

describe('Catalog Studio Test Suite', () => {
  // Test 1: Product Validation and Missing Fields
  it('identifies products with missing title and empty SKU as blocking errors', () => {
    const invalidProducts: Product[] = [
      {
        id: 'p1',
        projectId: 'test-proj',
        title: '', // Missing
        sku: '', // Missing
        description: 'Test description',
        category: 'Test',
        specifications: [],
        currency: 'USD',
        availability: 'in_stock',
        sortOrder: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    const result = validateCatalogProducts(invalidProducts);
    expect(result.hasBlockingErrors).toBe(true);
    expect(result.totalErrors).toBe(2); // Missing title + missing SKU
  });

  // Test 2: SKU Duplicate Detection
  it('detects duplicate SKUs across products and reports review warnings', () => {
    const duplicateProducts: Product[] = [
      {
        id: 'p1',
        projectId: 'test-proj',
        title: 'Luminaire A',
        sku: 'DUPLICATE-SKU',
        description: '',
        category: 'Lighting',
        specifications: [],
        currency: 'USD',
        availability: 'in_stock',
        sortOrder: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'p2',
        projectId: 'test-proj',
        title: 'Luminaire B',
        sku: 'DUPLICATE-SKU',
        description: '',
        category: 'Lighting',
        specifications: [],
        currency: 'USD',
        availability: 'in_stock',
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ];

    const result = validateCatalogProducts(duplicateProducts);
    expect(result.duplicateSkusFound).toContain('DUPLICATE-SKU');
    expect(result.issues.some(i => i.field === 'sku' && i.message.includes('Duplicate SKU detected'))).toBe(true);
  });

  // Test 3: Missing Value Handling & Configurable Placeholders
  it('handles missing price and values using configured placeholders without inventing facts', () => {
    expect(formatCurrency(undefined, 'USD', 'Contact for pricing')).toBe('Contact for pricing');
    expect(formatCurrency('', 'USD', '—')).toBe('—');
    expect(formatCurrency(199.5, 'USD')).toBe('$199.50');
  });

  // Test 4: File Size Formatter
  it('correctly formats file sizes for PDF audits', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });

  // Test 5: CSV/Excel Column Auto-Detection & Mapping
  it('automatically detects standard catalog headers from imported spreadsheets', () => {
    const sampleHeaders = [
      'Product Name', 
      'Item Code', 
      'Category', 
      'MSRP Price', 
      'Product Description',
      'Luminous Flux', 
      'Input Voltage'
    ];

    const mapping = autoDetectColumnMapping(sampleHeaders);

    expect(mapping.titleField).toBe('Product Name');
    expect(mapping.skuField).toBe('Item Code');
    expect(mapping.categoryField).toBe('Category');
    expect(mapping.priceField).toBe('MSRP Price');
    expect(mapping.descriptionField).toBe('Product Description');
    // Extra headers should be routed to technical specifications
    expect(mapping.specFields).toContain('Luminous Flux');
    expect(mapping.specFields).toContain('Input Voltage');
  });

  // Test 6: Import Row Normalization
  it('normalizes raw spreadsheet rows into structured product records', () => {
    const rawRows = [
      {
        'Product Name': 'Architectural Sconce',
        'Item Code': 'ASC-01',
        'Category': 'Outdoor',
        'MSRP Price': '$249.99',
        'Product Description': 'IP66 Rated wall luminaire.',
        'Voltage': '120-277V',
      }
    ];

    const mapping = {
      titleField: 'Product Name',
      skuField: 'Item Code',
      categoryField: 'Category',
      priceField: 'MSRP Price',
      descriptionField: 'Product Description',
      specFields: ['Voltage'],
    };

    const normalized = normalizeImportRows(rawRows, mapping, 'test-project');

    expect(normalized).toHaveLength(1);
    expect(normalized[0].isValid).toBe(true);
    expect(normalized[0].normalized.title).toBe('Architectural Sconce');
    expect(normalized[0].normalized.sku).toBe('ASC-01');
    expect(normalized[0].normalized.price).toBe(249.99);
    expect(normalized[0].normalized.specifications).toHaveLength(1);
    expect(normalized[0].normalized.specifications?.[0].key).toBe('Voltage');
    expect(normalized[0].normalized.specifications?.[0].value).toBe('120-277V');
  });

  // Test 7: Default Template Integrity
  it('loads valid default catalog templates with complete geometric and typography settings', () => {
    expect(DEFAULT_TEMPLATES.length).toBeGreaterThanOrEqual(4);
    
    const defaultTemplate = DEFAULT_TEMPLATES.find(t => t.isDefault);
    expect(defaultTemplate).toBeDefined();
    expect(defaultTemplate?.pageSize).toBe('A4');
    expect(defaultTemplate?.marginsMm.top).toBeGreaterThan(0);
    expect(defaultTemplate?.typography.titleSizePt).toBeGreaterThan(12);
    expect(defaultTemplate?.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
  });

  // Test 8: Empty Catalog Validation
  it('flags completely empty catalog projects before export', () => {
    const result = validateCatalogProducts([]);
    expect(result.hasBlockingErrors).toBe(true);
    expect(result.issues.some(i => i.id === 'no-products')).toBe(true);
  });
});
