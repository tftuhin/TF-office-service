const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Coffee cup SVG
const coffeeSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a2b45"/>

  <!-- Coffee cup body -->
  <path d="M100 150 L120 400 Q120 430 150 430 L350 430 Q380 430 380 400 L400 150 Z"
        fill="none" stroke="#D4A574" stroke-width="16" stroke-linejoin="round"/>

  <!-- Coffee inside -->
  <path d="M115 180 L135 400 Q135 420 160 420 L340 420 Q365 420 365 400 L385 180 Z"
        fill="#8B4513" opacity="0.9"/>

  <!-- Cup handle -->
  <path d="M410 220 Q470 220 470 300 Q470 380 410 380"
        fill="none" stroke="#D4A574" stroke-width="16" stroke-linecap="round"/>

  <!-- Steam -->
  <path d="M180 120 Q180 60 200 30" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
  <path d="M280 100 Q280 40 310 20" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
  <path d="M380 130 Q380 60 410 30" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" opacity="0.8"/>
</svg>`;

const sizes = [
  { name: 'mdpi', size: 48 },
  { name: 'hdpi', size: 72 },
  { name: 'xhdpi', size: 96 },
  { name: 'xxhdpi', size: 144 },
  { name: 'xxxhdpi', size: 192 }
];

async function generateIcons() {
  try {
    for (const size of sizes) {
      const dir = path.join('android/app/src/main/res', `mipmap-${size.name}`);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Generate PNG from SVG using sharp
      await sharp(Buffer.from(coffeeSvg))
        .resize(size.size, size.size)
        .png()
        .toFile(path.join(dir, 'ic_launcher.png'));

      console.log(`✓ Generated ic_launcher.png for ${size.name} (${size.size}x${size.size})`);
    }

    console.log('\n✅ Coffee cup icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
