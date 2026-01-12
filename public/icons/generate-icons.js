/**
 * Script to generate PNG icons from SVG
 * 
 * This script requires sharp to be installed:
 * npm install --save-dev sharp
 * 
 * Then run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Error: sharp is not installed.');
  console.error('Please install it with: npm install --save-dev sharp');
  console.error('Or use an online tool to convert the SVG to PNG at the required sizes.');
  process.exit(1);
}

const svgPath = path.join(__dirname, 'icon.svg');
const sizes = [
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon.png' }
];

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error(`SVG file not found at ${svgPath}`);
    return;
  }

  console.log('Generating icons from SVG...');

  for (const { size, name } of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, name));
      console.log(`✓ Generated ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\nIcons generated successfully!');
  console.log('Note: You may want to replace these with icons generated from your actual logo.');
}

generateIcons().catch(console.error);
