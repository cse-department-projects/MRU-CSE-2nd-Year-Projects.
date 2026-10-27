// Script to generate D-MERS application icons
// Run: node desktop/generate-icons.cjs
// Requires: npm install --save-dev sharp (if available) OR uses canvas

const fs = require('fs');
const path = require('path');

// Create icons directory
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// D-MERS Shield SVG Icon - Emergency Navy Blue with Red Shield Check
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <!-- Background circle -->
  <rect width="256" height="256" rx="48" fill="#1E3A8A"/>
  
  <!-- Shield body -->
  <path d="M128 36L56 68v60c0 44 31.5 85 72 96 40.5-11 72-52 72-96V68L128 36z" 
        fill="#DC2626" opacity="0.25"/>
  <path d="M128 36L56 68v60c0 44 31.5 85 72 96 40.5-11 72-52 72-96V68L128 36z" 
        fill="none" stroke="white" stroke-width="6" stroke-linejoin="round"/>
  
  <!-- Checkmark inside shield -->
  <polyline points="96,128 116,148 160,108" 
            stroke="white" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  
  <!-- Emergency pulse dot -->
  <circle cx="196" cy="60" r="16" fill="#EF4444"/>
  <circle cx="196" cy="60" r="8" fill="white"/>
</svg>`;

// Write SVG
const svgPath = path.join(iconsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon, 'utf8');
console.log('✓ Created icon.svg');

// Create a simple PNG placeholder message
console.log('\nIcon SVG created at:', svgPath);
console.log('\nTo generate PNG/ICO icons for the installer:');
console.log('Option 1: Use https://convertio.co/svg-ico/ to convert icon.svg to icon.ico');
console.log('Option 2: Run: npm install -g svg2png && svg2png desktop/icons/icon.svg --output=desktop/icons/icon.png');
console.log('Option 3: Use ImageMagick: magick desktop/icons/icon.svg desktop/icons/icon.ico');
console.log('\nPlace icon.ico in desktop/icons/ before running npm run package:windows');
