export interface ImageMeta {
  width: number;
  height: number;
  aspectRatio: number;
  sizeBytes: number;
  dataUrl: string;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
}

/**
 * Creates high-quality vector SVG product illustrations for demo/fallback products.
 * This guarantees that even without external internet or missing files,
 * demo catalogs render crisp, publication-ready vector products!
 */
export function generateDemoProductSvg(category: string, title: string, color: string = '#4f46e5'): string {
  const encodedTitle = encodeURIComponent(title);
  
  let iconSvg = '';
  if (category.toLowerCase().includes('light') || category.toLowerCase().includes('lamp')) {
    iconSvg = `<path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7M9 21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1H9z" fill="${color}" opacity="0.9"/>`;
  } else if (category.toLowerCase().includes('audio') || category.toLowerCase().includes('headphone')) {
    iconSvg = `<path d="M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  } else if (category.toLowerCase().includes('watch') || category.toLowerCase().includes('jewelry')) {
    iconSvg = `<circle cx="12" cy="12" r="7" fill="none" stroke="${color}" stroke-width="2.5"/><polyline points="12 9 12 12 13.5 13.5" fill="none" stroke="${color}" stroke-width="2.5"/><path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.35-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.34a2 2 0 0 1 2 1.82l.35 3.83" fill="none" stroke="${color}" stroke-width="2"/>`;
  } else if (category.toLowerCase().includes('tool') || category.toLowerCase().includes('hardware')) {
    iconSvg = `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="none" stroke="${color}" stroke-width="2.5"/>`;
  } else {
    // Default sleek cube / equipment
    iconSvg = `<polygon points="12 2 2 7 12 12 22 7 12 2" fill="${color}" opacity="0.85"/><polyline points="2 17 12 22 22 17" fill="none" stroke="${color}" stroke-width="2"/><polyline points="2 12 12 17 22 12" fill="none" stroke="${color}" stroke-width="2"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="600" height="450">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.12"/>
      </filter>
    </defs>
    <rect width="600" height="450" fill="url(#bg)" rx="12"/>
    <g transform="translate(180, 80) scale(10)" filter="url(#shadow)">
      ${iconSvg}
    </g>
    <text x="300" y="380" font-family="Inter, sans-serif" font-size="18" font-weight="600" fill="#334155" text-anchor="middle">
      ${title}
    </text>
    <text x="300" y="405" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
      ${category.toUpperCase()}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
