const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Dimensioni delle icone necessarie
const iconSizes = [
  72, 96, 128, 144, 152, 192, 384, 512
];

async function generateIcons() {
  const svgContent = `
    <svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle -->
      <circle cx="256" cy="256" r="256" fill="#0ea5e9"/>

      <!-- Dumbbell icon -->
      <g transform="translate(256, 256)">
        <!-- Left weight -->
        <rect x="-180" y="-20" width="60" height="40" rx="8" fill="#ffffff"/>
        <!-- Right weight -->
        <rect x="120" y="-20" width="60" height="40" rx="8" fill="#ffffff"/>
        <!-- Bar -->
        <rect x="-120" y="-8" width="240" height="16" rx="8" fill="#ffffff"/>
      </g>

      <!-- Text FIT -->
      <text x="256" y="380" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="48" font-weight="bold">FIT</text>
    </svg>
  `;

  // Crea directory assets/icons se non esiste
  const iconsDir = path.join('public', 'assets', 'icons');
  try {
    await fs.mkdir(iconsDir, { recursive: true });
  } catch (error) {
    // Directory già esistente
  }

  // Genera tutte le dimensioni
  for (const size of iconSizes) {
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));

    console.log(`Generated icon-${size}x${size}.png`);
  }

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);