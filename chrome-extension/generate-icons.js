const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Coffee cup SVG for extension icons
const coffeeSvg = `<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#1a2b45"/>

  <!-- Coffee cup body -->
  <path d="M25 35 L30 105 Q30 112 38 112 L90 112 Q98 112 98 105 L103 35 Z"
        fill="none" stroke="#D4A574" stroke-width="4" stroke-linejoin="round"/>

  <!-- Coffee inside -->
  <path d="M29 42 L34 105 Q34 110 41 110 L87 110 Q94 110 94 105 L99 42 Z"
        fill="#8B4513" opacity="0.9"/>

  <!-- Cup handle -->
  <path d="M105 50 Q125 50 125 78 Q125 106 105 106"
        fill="none" stroke="#D4A574" stroke-width="4" stroke-linecap="round"/>

  <!-- Steam -->
  <path d="M45 28 Q45 15 50 5" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
  <path d="M70 25 Q70 12 78 2" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
</svg>`;

const sizes = [16, 48, 128];

async function generateIcons() {
  const dir = 'icons';

  // Create icons directory
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    for (const size of sizes) {
      await sharp(Buffer.from(coffeeSvg))
        .resize(size, size)
        .png()
        .toFile(path.join(dir, `icon-${size}.png`));

      console.log(`✓ Generated icon-${size}.png`);
    }

    console.log('\n✅ All extension icons generated!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
