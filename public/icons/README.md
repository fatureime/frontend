# App Icons for faturëime

This directory should contain the following icon files generated from your logo.

## Required Icons

1. **icon-192x192.png** - 192x192 pixels
   - Used for Android home screen and Chrome install prompt
   - Should be a square icon with your logo centered

2. **icon-512x512.png** - 512x512 pixels
   - Used for Android home screen and splash screens
   - Should be a square icon with your logo centered

3. **apple-touch-icon.png** - 180x180 pixels
   - Used for iOS home screen when adding to home screen
   - Should be a square icon with your logo centered

4. **favicon.ico** (optional) - 32x32 pixels
   - Standard browser favicon
   - Can be placed in the root public directory

## Quick Start - Generate Icons from SVG

A placeholder SVG icon (`icon.svg`) has been created based on your logo description. To generate PNG icons:

### Option 1: Using Node.js Script (Recommended)

1. Install sharp (if not already installed):
   ```bash
   cd frontend
   npm install --save-dev sharp
   ```

2. Run the generation script:
   ```bash
   node public/icons/generate-icons.js
   ```

This will create all required PNG icons from the SVG.

### Option 2: Using Online Tools

1. Upload `icon.svg` or your actual logo to one of these tools:
   - https://realfavicongenerator.net/ (recommended)
   - https://www.pwabuilder.com/imageGenerator
   - https://favicon.io/

2. Download the generated icons and place them in this directory.

### Option 3: Using ImageMagick (Command Line)

```bash
# Convert SVG to required sizes
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png
convert icon.svg -resize 180x180 apple-touch-icon.png
```

### Option 4: Using Your Logo

If you have your actual logo file (PNG, JPG, etc.), you can:

1. Use image editing software (Photoshop, GIMP, etc.) to:
   - Export your logo at the required sizes
   - Ensure icons are square (add padding if needed)
   - Save as PNG format

2. Or use online tools mentioned above with your logo file.

## Logo Description

Your logo features:
- Blue rounded square document icon with an "F" and lines
- Green checkmark overlay
- Glowing effect

The placeholder SVG (`icon.svg`) in this directory represents this design.

## Important Notes

- Icons must be square (same width and height)
- PNG format is required (except favicon.ico)
- Icons should have transparent backgrounds or match your app's theme
- The app will work without these icons, but they're required for proper PWA installation experience
