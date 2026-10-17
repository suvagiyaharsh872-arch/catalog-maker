# Catalog Studio — AI-Powered Product Catalog Maker

Catalog Studio is a full-featured, professional web platform designed to create, design, and publish multi-page product catalogs. Users can upload an existing catalog PDF as a design reference to inspect layout hierarchy, manage rich product data with dynamic technical specifications, import spreadsheet data (CSV/Excel/JSON), preview generated catalog sheets in a 3-panel live WYSIWYG editor, and export publication-ready multi-page PDF catalogs.

The entire application runs **100% locally** without requiring external cloud databases or paid third-party AI services. All projects, images, templates, and export logs persist in the browser via **IndexedDB**.

---

## Key Features & Modules

### 1. Reference PDF Analyzer (PDF.js)
- **Document Inspection**: Inspects uploaded PDF files, reads geometry, page dimensions, text coordinates, font families, font sizes, and sample dominant color tokens.
- **Layout Region Detection**: Heuristic engine identifies Product Title, SKU, Image Placement Zone, Technical Specifications Tables, Price Locations, Running Headers, and Footers.
- **Visual Bounding Box Overlay**: Interactive canvas viewer overlays recognized structural zones directly on the rendered PDF page.
- **Generate Template from Reference**: Converts detected bounding boxes, fonts, and colors into an active Catalog Studio template with 1 click.

### 2. Live Catalog Editor (3-Panel Desktop Workspace)
- **Left Panel**: Navigation tabs for complete catalog page sequence (Cover Page, Table of Contents, Product Pages, Back Cover) and searchable Product inventory.
- **Center Stage**: High-fidelity WYSIWYG sheet preview with zoom controls (50% to 160%, Fit-to-screen), page flip navigation, and pixel-precise layout fidelity.
- **Right Panel**: Real-time property inspector allowing live editing of product titles, SKUs, descriptions, pricing, image fit behaviors (contain vs. cover), and spec parameters.

### 3. Product Inventory & Technical Parameter Management
- **Full Product CRUD**: Stable UUID product identification, Title, SKU, Brand, Category, Subcategory, Price, Currency, Availability, URL, and Description.
- **Dynamic Specifications Table**: Reorderable, key-value parameter editor for engineering specifications (e.g. Dimensions, Power, Certifications, Material, CRI, IP Rating).
- **Product Image Management**: High-res JPG, PNG, and WebP support with containment rules preventing distorted aspect ratios.
- **Bulk Operations**: Bulk selection, bulk deletion, search by title/SKU, category filtering, and multi-field sorting.

### 4. Smart Data Import (CSV, Excel XLSX, JSON)
- **Multi-Format Support**: Reads CSV, Microsoft Excel (.xlsx, .xls), and JSON files using PapaParse and SheetJS.
- **Automated Column Recognition**: Automatically detects and maps Title, SKU, Price, Description, Category, Image URL, and Stock Availability.
- **Dynamic Spec Columns**: Any extra spreadsheet columns are automatically imported into the product's technical specification table.
- **Row-Level Pre-Flight Validation**: Highlights missing required fields or malformed records before committing.
- **Duplicate SKU Resolution**: Configurable duplicate policies: Skip duplicates, Update matching products, or Import as separate items.

### 5. Multi-Page Catalog Publishing & PDF Generation
- **Client-Side High-Resolution PDF Engine**: Multi-page PDF generation via jsPDF + html2canvas at print scale (up to 300 DPI).
- **Publication Layout Sections**:
  - **Cover Page**: Brand logo, catalog title, subtitle, cover image, and edition badge.
  - **Dynamic Table of Contents**: Automatically calculates verified page numbers for each product category.
  - **Single-Product Showcase & 2-Up Compact**: Supports full-page hero product displays or high-density 2-product split pages.
  - **Back Cover**: Company details, quality certifications, and sales contact information.
- **Data Export Formats**: PDF Catalog, Product CSV, Product Excel (XLSX), Product JSON, Template JSON, and full Project Backup.

### 6. Template Engine
- **Presets Included**:
  - *Modern Tech & Hardware*: Crisp indigo accents, 2-column specifications, prominent imagery.
  - *Luxury & Editorial*: Elegant Playfair Display serif typography, generous whitespace, warm neutral tones.
  - *Industrial & Spec-Heavy*: High-density layout with structured engineering tables.
  - *2-Product Multi-Page Compact*: Split layout for wholesale line-sheets and distributor flyers.
- **Customizable Properties**: Page geometry (A4 / US Letter, Portrait / Landscape), margins, fonts, colors, alternating table row shading, and headers/footers.

### 7. Strict Data Integrity & Pre-Flight Validation
- **No Invented Facts**: Missing prices or specifications display user-configured placeholders (e.g. *"Inquire for pricing"*, *"Not provided"*, or *"—"*).
- **Validation Audit**: Detects blocking errors (missing titles, blank SKUs, empty catalogs) and warnings (missing photos, duplicate SKUs, potential description overflow) before rendering.

---

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, custom design tokens, Lucide React icons
- **Storage**: IndexedDB (Dexie.js) for persistent offline storage of projects, products, templates, and high-res images
- **PDF Analysis**: PDF.js (`pdfjs-dist`) with local worker
- **PDF Generation**: `jspdf`, `html2canvas`
- **Spreadsheet Processing**: `papaparse` (CSV), `xlsx` (SheetJS)
- **Validation**: Zod & custom catalog pre-flight validators
- **Testing**: Vitest

---

## Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher; tested on v24 LTS)
- npm (v9.0.0 or higher)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```
The compiled, minified bundle will be generated in the `dist/` directory. To preview the production bundle locally:
```bash
npm run preview
```

---

## Quick-Start Walkthrough

1. **Launch Catalog Studio**: Open [http://localhost:5173](http://localhost:5173). The application automatically initializes the pre-loaded **LuxeAero Architectural Lighting & Fixtures (Demo)** catalog with 5 realistic products, technical specifications, and vector product illustrations.
2. **Explore the Live Editor**: Click **Live Catalog Editor** in the sidebar. Use the center stage controls to zoom and page through the Cover Page, Table of Contents, and Product Showcase pages.
3. **Analyze a Reference PDF**: Click **Reference PDF Analyzer** in the sidebar. Upload any existing product catalog PDF to inspect text blocks, font sizes, bounding boxes, and dominant color tokens. Click **Apply Reference As Active Template** to derive a new catalog template from the PDF.
4. **Import Data**: Navigate to **Import CSV/XLSX**. Drop in any spreadsheet to test auto-column mapping, preview normalized rows, and import records.
5. **Export Finished PDF**: Click **Export Catalog PDF** in the top bar. Choose your desired sections (Cover, TOC, Pricing, Specs) and click **Download Catalog PDF**.

---

## Technical Considerations & Limitations

- **Scanned Raster PDFs**: PDF.js extracts text and layout vectors directly from digital/vector PDFs. For scanned, image-only documents without embedded OCR text layers, text extraction will notify the user with a low confidence score and offer manual region configuration.
- **Large Image Storage**: Images are stored in IndexedDB as Base64/Blobs, avoiding `localStorage` 5MB quota restrictions. For catalogs with hundreds of 4K photos, export backup JSON files will be proportionately sized.
- **Print Fidelity**: The PDF generator utilizes exact millimeter dimensions (A4: 210 × 297 mm; Letter: 215.9 × 279.4 mm) matching standard commercial printing specifications.
