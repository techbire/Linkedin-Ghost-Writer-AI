import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import sharp from 'sharp';

interface SlideData {
  title: string;
  content: string;
  number: number;
}

interface ExportRequest {
  slides: SlideData[];
  carouselTitle: string;
  design: {
    colors: string[];
    backgroundTexture: string;
    showNumbers: boolean;
    logo?: string;
  };
  headshot?: {
    show: boolean;
    image?: string;
    name: string;
    handle: string;
    introOutroOnly: boolean;
  };
}

function generateSVG(
  slide: SlideData,
  design: ExportRequest['design'],
  headshot: ExportRequest['headshot'],
  totalSlides: number
): string {
  const { title, content, number } = slide;
  const { colors, backgroundTexture, showNumbers, logo } = design;

  const width = 1080;
  const height = 1080; // Always square
  
  const bgColor = colors[2] || '#FFFFFF';
  const textColor = colors[0] || '#000000';
  const accentColor = colors[1] || '#333333';

  const isIntro = number === 1;
  const isOutro = number === totalSlides;
  const showHeadshot = headshot?.show && headshot.image && 
    (!headshot.introOutroOnly || isIntro || isOutro);

  // Background pattern
  let backgroundPattern = '';
  switch (backgroundTexture) {
    case 'Gradient':
      backgroundPattern = `<defs>
        <linearGradient id="bg-gradient-${number}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg-gradient-${number})"/>`;
      break;
    case 'Dots':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <defs><pattern id="dots-${number}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="${accentColor}" opacity="0.2"/>
      </pattern></defs>
      <rect width="${width}" height="${height}" fill="url(#dots-${number})"/>`;
      break;
    case 'Lines':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <defs><pattern id="lines-${number}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="40" stroke="${accentColor}" stroke-width="1" opacity="0.2"/>
      </pattern></defs>
      <rect width="${width}" height="${height}" fill="url(#lines-${number})"/>`;
      break;
    case 'Waves':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <path d="M0,${height * 0.8} Q${width * 0.25},${height * 0.75} ${width * 0.5},${height * 0.8} T${width},${height * 0.8} L${width},${height} L0,${height} Z" 
        fill="${accentColor}" opacity="0.1"/>`;
      break;
    case 'Grid':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <defs><pattern id="grid-${number}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.2"/>
      </pattern></defs>
      <rect width="${width}" height="${height}" fill="url(#grid-${number})"/>`;
      break;
    default:
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>`;
  }

  const logoSVG = logo ? `<image href="${logo}" x="${width - 160}" y="40" width="120" height="40" preserveAspectRatio="xMaxYMin meet"/>` : '';
  const numberSVG = showNumbers ? `<text x="${width / 2}" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${number}</text>` : '';

  const titleY = showNumbers ? 320 : 240;
  const titleLines = wrapText(title, 20);
  const titleSVG = `<text x="${width / 2}" y="${titleY}" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="${textColor}" text-anchor="middle">
    ${titleLines.map((line, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`).join('')}
  </text>`;

  const contentY = titleY + 140 + (titleLines.length * 35);
  const contentLines = wrapText(content, 35);
  const contentSVG = `<text x="${width / 2}" y="${contentY}" font-family="Arial, sans-serif" font-size="36" fill="${textColor}" text-anchor="middle">
    ${contentLines.map((line, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 50}">${escapeXml(line)}</tspan>`).join('')}
  </text>`;

  const headshotSVG = showHeadshot ? `
    <g transform="translate(${width / 2}, ${height - 120})">
      <defs>
        <clipPath id="clip-circle-${number}">
          <circle cx="0" cy="0" r="40"/>
        </clipPath>
      </defs>
      <circle cx="0" cy="0" r="40" fill="${accentColor}"/>
      <image href="${headshot.image}" x="-40" y="-40" width="80" height="80" clip-path="url(#clip-circle-${number})" preserveAspectRatio="xMidYMid slice"/>
      <text x="60" y="8" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="start">${escapeXml(headshot.handle)}</text>
    </g>
  ` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  ${backgroundPattern}
  ${logoSVG}
  ${numberSVG}
  ${titleSVG}
  ${contentSVG}
  ${headshotSVG}
</svg>`;
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxChars) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function POST(req: NextRequest) {
  try {
    const exportData: ExportRequest = await req.json();
    const { slides, carouselTitle, design, headshot } = exportData;

    if (!slides || slides.length === 0) {
      return NextResponse.json(
        { error: 'No slides to export' },
        { status: 400 }
      );
    }

    // Create a ZIP file
    const zip = new JSZip();

    // Generate and add each slide as PNG
    for (const slide of slides) {
      const svg = generateSVG(slide, design, headshot, slides.length);
      const pngBuffer = await sharp(Buffer.from(svg))
        .png()
        .toBuffer();
      
      zip.file(`slide-${slide.number.toString().padStart(2, '0')}.png`, pngBuffer);
    }

    // Add metadata file
    const metadata = {
      title: carouselTitle,
      slideCount: slides.length,
      exportedAt: new Date().toISOString(),
      design: {
        backgroundTexture: design.backgroundTexture,
        showNumbers: design.showNumbers,
      },
    };
    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    // Return ZIP file
    const filename = `${carouselTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-carousel.zip`;
    
    return new Response(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting carousel:', error);
    return NextResponse.json(
      { error: 'Failed to export carousel', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
