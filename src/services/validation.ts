import type { Product, ValidationIssue, ProjectSettings } from '../types';

export interface ValidationSummary {
  hasBlockingErrors: boolean;
  totalErrors: number;
  totalWarnings: number;
  totalInfos: number;
  issues: ValidationIssue[];
  productCount: number;
  productsWithMissingImages: number;
  duplicateSkusFound: string[];
}

export function validateCatalogProducts(
  products: Product[],
  settings?: ProjectSettings
): ValidationSummary {
  const issues: ValidationIssue[] = [];
  const skuMap = new Map<string, string[]>(); // SKU -> productIds
  let productsWithMissingImages = 0;

  if (products.length === 0) {
    issues.push({
      id: 'no-products',
      severity: 'error',
      message: 'Catalog has no products. Add or import at least one product before exporting.',
      blocking: true,
    });
  }

  products.forEach((product, index) => {
    // 1. Title validation
    if (!product.title || product.title.trim().length === 0) {
      issues.push({
        id: `missing-title-${product.id}`,
        productId: product.id,
        productTitle: product.title || `Item #${index + 1}`,
        field: 'title',
        severity: 'error',
        message: `Product #${index + 1} is missing a title.`,
        blocking: true,
      });
    } else if (product.title.length > 90) {
      issues.push({
        id: `long-title-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'title',
        severity: 'warning',
        message: `Title exceeds 90 characters and may wrap onto multiple lines in some templates.`,
        blocking: false,
      });
    }

    // 2. SKU validation
    if (!product.sku || product.sku.trim().length === 0) {
      issues.push({
        id: `missing-sku-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'sku',
        severity: 'error',
        message: `Product "${product.title}" has an empty SKU.`,
        blocking: true,
      });
    } else {
      const normalizedSku = product.sku.trim().toUpperCase();
      if (!skuMap.has(normalizedSku)) {
        skuMap.set(normalizedSku, []);
      }
      skuMap.get(normalizedSku)!.push(product.id);
    }

    // 3. Category validation
    if (!product.category || product.category.trim().length === 0) {
      issues.push({
        id: `missing-category-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'category',
        severity: 'warning',
        message: `Category is missing. It will appear under "Uncategorized" in the Table of Contents.`,
        blocking: false,
      });
    }

    // 4. Image check
    if (!product.mainImage) {
      productsWithMissingImages++;
      issues.push({
        id: `missing-image-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'mainImage',
        severity: 'warning',
        message: `No image assigned. A clean placeholder box will be used.`,
        blocking: false,
      });
    }

    // 5. Specs & Description overflow warning
    if (product.description && product.description.length > 550) {
      issues.push({
        id: `long-desc-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'description',
        severity: 'warning',
        message: `Description is unusually long (${product.description.length} chars). Consider shortening or verifying template fit.`,
        blocking: false,
      });
    }

    if (product.specifications && product.specifications.length > 12) {
      issues.push({
        id: `many-specs-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'specifications',
        severity: 'info',
        message: `Product has ${product.specifications.length} specifications. A multi-column spec layout is recommended.`,
        blocking: false,
      });
    }

    // 6. Price warning
    if (product.price === undefined || product.price === null || product.price === '') {
      issues.push({
        id: `missing-price-${product.id}`,
        productId: product.id,
        productTitle: product.title,
        field: 'price',
        severity: 'info',
        message: `Price not supplied. Configured placeholder will be displayed.`,
        blocking: false,
      });
    }
  });

  // Duplicate SKU check
  const duplicateSkus: string[] = [];
  skuMap.forEach((ids, sku) => {
    if (ids.length > 1) {
      duplicateSkus.push(sku);
      issues.push({
        id: `duplicate-sku-${sku}`,
        severity: settings?.duplicateSkuPolicy === 'skip' ? 'warning' : 'warning',
        field: 'sku',
        message: `Duplicate SKU detected: "${sku}" is shared by ${ids.length} products.`,
        blocking: false,
      });
    }
  });

  const totalErrors = issues.filter(i => i.severity === 'error').length;
  const totalWarnings = issues.filter(i => i.severity === 'warning').length;
  const totalInfos = issues.filter(i => i.severity === 'info').length;

  return {
    hasBlockingErrors: totalErrors > 0,
    totalErrors,
    totalWarnings,
    totalInfos,
    issues,
    productCount: products.length,
    productsWithMissingImages,
    duplicateSkusFound: duplicateSkus,
  };
}
