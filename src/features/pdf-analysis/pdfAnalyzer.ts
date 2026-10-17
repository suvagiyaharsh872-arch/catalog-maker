import * as pdfjsLib from 'pdfjs-dist';
import type { 
  AnalyzedPdfPage, 
  ExtractedTextBlock, 
  LayoutBox, 
  ReferencePdfData 
} from '../../types';

// Configure the worker to use the local public worker file
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export async function analyzeReferencePdf(file: File): Promise<ReferencePdfData> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const pageCount = pdfDoc.numPages;

  const analyzedPages: AnalyzedPdfPage[] = [];

  // Analyze up to 10 pages for speed, but always include pages 1 to min(pageCount, 10)
  const pagesToScan = Math.min(pageCount, 10);

  for (let pageNum = 1; pageNum <= pagesToScan; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 }); // High-DPI preview
    
    // 1. Render to Canvas to create thumbnail & visual inspection image
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
    }
    const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.85);

    // 2. Extract Text Content & Positions
    const textContent = await page.getTextContent();
    const textBlocks: ExtractedTextBlock[] = [];

    const pageWidth = viewport.width;
    const pageHeight = viewport.height;

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim().length > 0) {
        // item.transform: [scaleX, skewY, skewX, scaleY, tx, ty]
        // Note: PDF coordinates origin is bottom-left, canvas is top-left
        const tx = item.transform[4] * 1.5;
        const ty = pageHeight - (item.transform[5] * 1.5);
        const fontSize = Math.abs(item.transform[0] || item.transform[3]) * 1.5;
        const estimatedWidth = (item.width || item.str.length * fontSize * 0.5) * 1.5;
        const estimatedHeight = fontSize * 1.2;

        textBlocks.push({
          text: item.str.trim(),
          x: Math.max(0, Math.min(100, (tx / pageWidth) * 100)),
          y: Math.max(0, Math.min(100, ((ty - estimatedHeight) / pageHeight) * 100)),
          width: Math.min(100, (estimatedWidth / pageWidth) * 100),
          height: Math.min(100, (estimatedHeight / pageHeight) * 100),
          fontSize,
          fontName: item.fontName,
        });
      }
    }

    // 3. Layout Detection Heuristics
    const detected = detectRegionsFromTextBlocks(textBlocks, pageWidth, pageHeight);

    // 4. Color sampling from the rendered canvas
    const detectedColors = sampleDominantColors(canvas);

    analyzedPages.push({
      pageIndex: pageNum - 1,
      widthPts: page.view[2] - page.view[0],
      heightPts: page.view[3] - page.view[1],
      aspectRatio: viewport.width / viewport.height,
      thumbnailUrl,
      textBlocks,
      detectedColors,
      suggestedRegions: detected.regions,
      confidence: detected.confidence,
    });
  }

  // Choose the best representative product page (typically page 1 or 2 with highest text + image balance)
  let bestPageIndex = 0;
  let maxScore = -1;
  analyzedPages.forEach((p, idx) => {
    let score = p.confidence;
    // Pages with both a title and specs candidates score highest as product pages
    if (p.suggestedRegions.title) score += 20;
    if (p.suggestedRegions.specsTable) score += 25;
    if (p.suggestedRegions.sku) score += 15;
    if (score > maxScore) {
      maxScore = score;
      bestPageIndex = idx;
    }
  });

  return {
    fileName: file.name,
    fileSize: file.size,
    pageCount,
    uploadedAt: Date.now(),
    pages: analyzedPages,
    selectedPageIndex: bestPageIndex,
  };
}

function detectRegionsFromTextBlocks(
  blocks: ExtractedTextBlock[], 
  pageWidth: number, 
  pageHeight: number
): { regions: AnalyzedPdfPage['suggestedRegions']; confidence: number } {
  const regions: AnalyzedPdfPage['suggestedRegions'] = {};
  let confidence = 50;

  if (blocks.length === 0) {
    return { regions, confidence: 10 };
  }

  // Sort blocks by font size descending
  const sortedBySize = [...blocks].sort((a, b) => b.fontSize - a.fontSize);
  
  // 1. Title Candidate: Largest font size block in the upper 45% of the page
  const titleCandidate = sortedBySize.find(b => b.y < 45 && b.text.length > 3 && !isPriceText(b.text));
  if (titleCandidate) {
    regions.title = {
      text: titleCandidate.text,
      box: {
        x: Math.max(5, titleCandidate.x - 2),
        y: Math.max(4, titleCandidate.y - 1),
        w: Math.min(90, titleCandidate.width + 10),
        h: Math.min(15, titleCandidate.height + 3),
      },
    };
    confidence += 15;
  }

  // 2. SKU Candidate: look for SKU regex or "Item:", "Model:", "Code:" or alphanum pattern
  const skuRegex = /(sku|item|model|code|art|ref|p\/n)[\s#:]*([a-z0-9-_]+)/i;
  const skuBlock = blocks.find(b => skuRegex.test(b.text));
  if (skuBlock) {
    const match = skuBlock.text.match(skuRegex);
    regions.sku = {
      text: match ? match[0] : skuBlock.text,
      box: {
        x: skuBlock.x,
        y: skuBlock.y,
        w: Math.max(20, skuBlock.width + 5),
        h: Math.max(4, skuBlock.height + 2),
      },
    };
    confidence += 10;
  } else {
    // Look for short alphanumeric uppercase code near title
    const potentialSku = blocks.find(b => 
      b.y < 50 && 
      /^[A-Z0-9-]{4,15}$/.test(b.text) && 
      b.text !== regions.title?.text
    );
    if (potentialSku) {
      regions.sku = {
        text: potentialSku.text,
        box: {
          x: potentialSku.x,
          y: potentialSku.y,
          w: Math.max(20, potentialSku.width + 5),
          h: Math.max(4, potentialSku.height + 2),
        },
      };
      confidence += 5;
    }
  }

  // 3. Price Candidate: Currency symbols
  const priceBlock = blocks.find(b => isPriceText(b.text));
  if (priceBlock) {
    regions.price = {
      text: priceBlock.text,
      box: {
        x: priceBlock.x,
        y: priceBlock.y,
        w: Math.max(18, priceBlock.width + 4),
        h: Math.max(5, priceBlock.height + 2),
      },
    };
    confidence += 10;
  }

  // 4. Header & Footer detection
  const headerBlock = blocks.find(b => b.y < 8 && b.fontSize < 14);
  if (headerBlock) {
    regions.header = {
      text: headerBlock.text,
      box: { x: 5, y: 2, w: 90, h: 6 },
    };
  }

  const footerBlock = blocks.find(b => b.y > 90);
  if (footerBlock) {
    regions.footer = {
      text: footerBlock.text,
      box: { x: 5, y: 92, w: 90, h: 6 },
    };
  }

  // 5. Specs Table Candidate: Lines with colon or key-value pairs
  const colonLines = blocks.filter(b => b.text.includes(':') && b.y > 30);
  if (colonLines.length >= 2) {
    const rows = colonLines.slice(0, 8).map(b => {
      const parts = b.text.split(':');
      return {
        key: parts[0].trim(),
        value: parts.slice(1).join(':').trim(),
      };
    });

    const minY = Math.min(...colonLines.map(b => b.y));
    const maxY = Math.max(...colonLines.map(b => b.y + b.height));
    const minX = Math.min(...colonLines.map(b => b.x));
    const maxX = Math.max(...colonLines.map(b => b.x + b.width));

    regions.specsTable = {
      rows,
      box: {
        x: Math.max(5, minX - 2),
        y: Math.max(10, minY - 2),
        w: Math.min(90, Math.max(40, maxX - minX + 6)),
        h: Math.min(50, Math.max(20, maxY - minY + 4)),
      },
    };
    confidence += 15;
  }

  // 6. Image Area Candidate: Look for significant unoccupied area in top half
  // If title is on top, image is typically either top-left (45% width) or centered (50% width)
  const titleY = regions.title?.box.y || 10;
  const specsY = regions.specsTable?.box.y || 55;
  
  regions.imageArea = {
    box: {
      x: 10,
      y: Math.min(48, Math.max(16, titleY + 12)),
      w: 80,
      h: Math.min(40, Math.max(25, specsY - titleY - 14)),
    },
  };

  return { regions, confidence: Math.min(95, confidence) };
}

function isPriceText(text: string): boolean {
  return /[$€£¥₹]\s*\d+([.,]\d{2})?|\d+([.,]\d{2})?\s*(usd|eur|gbp|inr)/i.test(text);
}

function sampleDominantColors(canvas: HTMLCanvasElement): string[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return ['#4f46e5', '#0f172a', '#f8fafc'];

  try {
    const width = Math.min(canvas.width, 100);
    const height = Math.min(canvas.height, 100);
    const imgData = ctx.getImageData(0, 0, width, height).data;

    const colorCounts = new Map<string, number>();

    for (let i = 0; i < imgData.length; i += 16) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue;
      // Skip pure white or near white/black for brand accent detection
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      if (brightness > 240 || brightness < 20) continue;

      // Group colors by rounding
      const hex = `#${((1 << 24) + ((r & 0xf0) << 16) + ((g & 0xf0) << 8) + (b & 0xf0)).toString(16).slice(1)}`;
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
    }

    const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]);
    const topHex = sorted.slice(0, 4).map(e => e[0]);
    return topHex.length > 0 ? topHex : ['#4f46e5', '#0f172a', '#64748b'];
  } catch (e) {
    return ['#4f46e5', '#0f172a', '#f8fafc'];
  }
}
