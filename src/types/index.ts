export type ProductAvailability = 
  | 'in_stock' 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'preorder' 
  | 'discontinued';

export interface ProductSpecification {
  id: string;
  key: string;
  value: string;
}

export interface Product {
  id: string;
  projectId: string;
  title: string;
  sku: string;
  description: string;
  mainImage?: string; // base64 data URL or URL
  additionalImages?: string[];
  category: string;
  subcategory?: string;
  brand?: string;
  specifications: ProductSpecification[];
  price?: number | string;
  currency: string;
  availability: ProductAvailability;
  productUrl?: string;
  customFields?: Record<string, string>;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface BrandConfig {
  name: string;
  tagline?: string;
  logoUrl?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontTitle: string;
  fontBody: string;
}

export interface LayoutBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  w: number; // percentage (0 - 100)
  h: number; // percentage (0 - 100)
}

export interface TemplateRegionConfig {
  enabled: boolean;
  box: LayoutBox;
  align?: 'left' | 'center' | 'right';
  fontSize?: number;
  textColor?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

export interface CatalogTemplate {
  id: string;
  projectId?: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isReferenceDerived?: boolean;
  
  // Page geometry
  pageSize: 'A4' | 'LETTER' | 'A5';
  orientation: 'portrait' | 'landscape';
  marginsMm: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  
  // Grid layout
  productsPerPage: 1 | 2 | 4;
  
  // Theme & Styling
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
  };
  
  typography: {
    titleFont: string;
    titleSizePt: number;
    titleWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    titleColor?: string;
    bodyFont: string;
    bodySizePt: number;
    bodyColor?: string;
    skuFont: string;
    skuSizePt: number;
    priceFont: string;
    priceSizePt: number;
    priceColor?: string;
  };

  imageConfig: {
    fit: 'contain' | 'cover';
    aspectRatio: '1:1' | '4:3' | '16:9' | 'auto';
    borderRadiusPx: number;
    showBorder: boolean;
    borderColor: string;
    backgroundColor: string;
    maxHeightMm: number;
  };

  specsConfig: {
    layout: 'table' | 'striped' | 'grid' | 'inline';
    columns: 1 | 2 | 3;
    showBorders: boolean;
    headerBg: string;
    alternateRowBg: boolean;
    fontSizePt: number;
  };

  headerConfig: {
    enabled: boolean;
    showLogo: boolean;
    titleText: string;
    showDivider: boolean;
    heightMm: number;
  };

  footerConfig: {
    enabled: boolean;
    text: string;
    showPageNumbers: boolean;
    pageNumberFormat: 'PAGE_X' | 'PAGE_X_OF_Y' | 'SIMPLE';
    heightMm: number;
  };

  coverPage: {
    enabled: boolean;
    title: string;
    subtitle: string;
    coverImageUrl?: string;
    dateText?: string;
    theme: 'clean' | 'bold' | 'minimal' | 'luxury';
  };

  tableOfContents: {
    enabled: boolean;
    title: string;
    showCategoryDividers: boolean;
  };

  overflowPolicy: 'fit' | 'continue' | 'truncate';
}

export interface ExtractedTextBlock {
  text: string;
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  fontSize: number;
  fontName?: string;
  isHeading?: boolean;
}

export interface AnalyzedPdfPage {
  pageIndex: number;
  widthPts: number;
  heightPts: number;
  aspectRatio: number;
  thumbnailUrl: string;
  textBlocks: ExtractedTextBlock[];
  detectedColors: string[];
  suggestedRegions: {
    title?: { text: string; box: LayoutBox };
    sku?: { text: string; box: LayoutBox };
    imageArea?: { box: LayoutBox };
    description?: { text: string; box: LayoutBox };
    specsTable?: { rows: Array<{ key: string; value: string }>; box: LayoutBox };
    price?: { text: string; box: LayoutBox };
    header?: { text: string; box: LayoutBox };
    footer?: { text: string; box: LayoutBox };
  };
  confidence: number;
}

export interface ReferencePdfData {
  fileName: string;
  fileSize: number;
  pageCount: number;
  uploadedAt: number;
  pages: AnalyzedPdfPage[];
  selectedPageIndex: number;
}

export interface ExportSettings {
  includeCover: boolean;
  includeToc: boolean;
  includePrices: boolean;
  includeAvailability: boolean;
  includeSpecs: boolean;
  includePageNumbers: boolean;
  selectedProductIds: string[]; // empty means all
  imageQuality: 'standard' | 'high' | 'maximum';
  filename: string;
  productSortBy: 'sortOrder' | 'title' | 'sku' | 'category' | 'price';
  productSortOrder: 'asc' | 'desc';
}

export interface ProjectSettings {
  missingFieldPlaceholder: string;
  missingPricePlaceholder: string;
  missingImagePlaceholder: string;
  duplicateSkuPolicy: 'skip' | 'update' | 'allow';
  autoSave: boolean;
  currencySymbol: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  brand: BrandConfig;
  referencePdf?: ReferencePdfData;
  activeTemplateId: string;
  exportSettings: ExportSettings;
  settings: ProjectSettings;
  createdAt: number;
  updatedAt: number;
}

export interface ExportRecord {
  id: string;
  projectId: string;
  projectName: string;
  filename: string;
  format: 'PDF' | 'CSV' | 'XLSX' | 'JSON' | 'ZIP';
  fileSize: number;
  productCount: number;
  pageCount: number;
  exportedAt: number;
  downloadUrl?: string;
}

export interface ValidationIssue {
  id: string;
  productId?: string;
  productTitle?: string;
  severity: 'error' | 'warning' | 'info';
  field?: string;
  message: string;
  blocking: boolean;
}
