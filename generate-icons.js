const fs = require('fs');
const path = require('path');

// Simple coffee cup SVG
const coffeeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="512" height="512" fill="#1a2b45"/>

  <!-- Coffee cup -->
  <path d="M100 150 L120 400 Q120 430 150 430 L350 430 Q380 430 380 400 L400 150 Z"
        fill="none" stroke="#8B6F47" stroke-width="12" stroke-linejoin="round"/>

  <!-- Coffee inside -->
  <path d="M115 180 L135 400 Q135 420 160 420 L340 420 Q365 420 365 400 L385 180 Z"
        fill="#D2691E" opacity="0.8"/>

  <!-- Cup handle -->
  <path d="M410 200 Q460 200 460 300 Q460 400 410 400"
        fill="none" stroke="#8B6F47" stroke-width="12" stroke-linecap="round"/>

  <!-- Steam wisps -->
  <path d="M200 120 Q200 80 220 60" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
  <path d="M280 130 Q280 80 300 50" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
  <path d="M360 120 Q360 70 380 40" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
</svg>`;

// Icon sizes needed for Android
const sizes = [
  { name: 'mdpi', size: 48, dpi: 160 },
  { name: 'hdpi', size: 72, dpi: 240 },
  { name: 'xhdpi', size: 96, dpi: 320 },
  { name: 'xxhdpi', size: 144, dpi: 480 },
  { name: 'xxxhdpi', size: 192, dpi: 640 }
];

// For now, just save the SVG and document what needs to be done
console.log('Coffee cup SVG generated. You can convert it using:');
console.log('');
sizes.forEach(size => {
  const dir = `android/app/src/main/res/mipmap-${size.name}`;
  console.log(`# For ${size.name} (${size.size}x${size.size})`);
  console.log(`# Place the converted PNG in: ${dir}/ic_launcher.png`);
});

// Save SVG for reference
fs.writeFileSync('coffee-icon.svg', coffeeSvg);
console.log('\nSVG saved to: coffee-icon.svg');
console.log('');
console.log('To convert SVG to PNG, you can use:');
console.log('1. Inkscape: inkscape coffee-icon.svg -w 192 -h 192 -o android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png');
console.log('2. Or use online converter: https://cloudconvert.com/svg-to-png');
