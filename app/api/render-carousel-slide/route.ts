import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

interface SlideData {
  title: string;
  content: string;
  number: number;
  showNumber: boolean;
  design: {
    colors: string[];
    backgroundTexture: string;
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

function generateSVG(slide: SlideData, isIntro: boolean, isOutro: boolean): string {
  const { title, content, number, showNumber, design, headshot } = slide;
  const { colors, backgroundTexture, logo } = design;

  const width = 1080;
  const height = 1080; // Always square
  
  const bgColor = colors[2] || '#FFFFFF';
  const textColor = colors[0] || '#000000';
  const accentColor = colors[1] || '#333333';

  // Determine if headshot should show
  const showHeadshot = headshot?.show && headshot.image && 
    (!headshot.introOutroOnly || isIntro || isOutro);

  // Background pattern based on texture
  let backgroundPattern = '';
  switch (backgroundTexture) {
    case 'Gradient':
      backgroundPattern = `<defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg-gradient)"/>`;
      break;
    case 'Dots':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="2" fill="${accentColor}" opacity="0.2"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#dots)"/>`;
      break;
    case 'Lines':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <pattern id="lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="40" stroke="${accentColor}" stroke-width="1" opacity="0.2"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#lines)"/>`;
      break;
    case 'Waves':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <path d="M0,${height * 0.8} Q${width * 0.25},${height * 0.75} ${width * 0.5},${height * 0.8} T${width},${height * 0.8} L${width},${height} L0,${height} Z" 
        fill="${accentColor}" opacity="0.1"/>`;
      break;
    case 'Grid':
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>
      <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="none" stroke="${accentColor}" stroke-width="1" opacity="0.2"/>
      </pattern>
      <rect width="${width}" height="${height}" fill="url(#grid)"/>`;
      break;
    default:
      backgroundPattern = `<rect width="${width}" height="${height}" fill="${bgColor}"/>`;
  }

  // Logo positioning (top-right corner)
  const logoSVG = logo ? `<image href="${logo}" x="${width - 160}" y="40" width="120" height="40" preserveAspectRatio="xMaxYMin meet"/>` : '';

  // Number display
  const numberSVG = showNumber ? `<text x="${width / 2}" y="200" font-family="Arial, sans-serif" font-size="80" font-weight="bold" fill="${textColor}" text-anchor="middle">${number}</text>` : '';

  // Title positioning (centered)
  const titleY = showNumber ? 320 : 240;
  const titleSVG = `<text x="${width / 2}" y="${titleY}" font-family="Arial, sans-serif" font-size="56" font-weight="bold" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
    <tspan x="${width / 2}" dy="0">${wrapText(title, 20).map((line, i) => 
      `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 70}">${escapeXml(line)}</tspan>`
    ).join('')}</tspan>
  </text>`;

  // Content positioning (centered)
  const contentY = titleY + 140 + (wrapText(title, 20).length * 35);
  const contentLines = wrapText(content, 35);
  const contentSVG = `<text x="${width / 2}" y="${contentY}" font-family="Arial, sans-serif" font-size="36" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
    ${contentLines.map((line, i) => 
      `<tspan x="${width / 2}" dy="${i === 0 ? 0 : 50}">${escapeXml(line)}</tspan>`
    ).join('')}
  </text>`;

  // Headshot positioning (bottom)
  const headshotSVG = showHeadshot ? `
    <g transform="translate(${width / 2}, ${height - 120})">
      <circle cx="0" cy="0" r="40" fill="${accentColor}"/>
      <image href="${headshot.image}" x="-40" y="-40" width="80" height="80" clip-path="circle(40px at 40px 40px)" preserveAspectRatio="xMidYMid slice"/>
      <text x="60" y="0" font-family="Arial, sans-serif" font-size="24" fill="${textColor}" text-anchor="start" dominant-baseline="middle">${escapeXml(headshot.handle)}</text>
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
    const slideData: SlideData & { totalSlides: number } = await req.json();

    // Determine if this is intro or outro slide
    const isIntro = slideData.number === 1;
    const isOutro = slideData.number === slideData.totalSlides;

    // Generate SVG
    const svg = generateSVG(slideData, isIntro, isOutro);

    // Convert SVG to PNG using sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer();

    // Convert Buffer to Uint8Array for Response
    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="slide-${slideData.number}.png"`,
      },
    });
  } catch (error) {
    console.error('Error rendering carousel slide:', error);
    return NextResponse.json(
      { error: 'Failed to render slide', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
