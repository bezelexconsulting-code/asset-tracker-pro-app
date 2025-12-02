const fs = require('fs');
const path = require('path');

// Simple placeholder SVG icons for PWA
const icon192 = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="24" fill="#1e40af"/>
  <rect x="48" y="60" width="96" height="72" rx="8" fill="white" fill-opacity="0.9"/>
  <rect x="72" y="84" width="48" height="24" rx="4" fill="#1e40af"/>
  <circle cx="96" cy="96" r="12" fill="white"/>
</svg>`;

const icon512 = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="64" fill="#1e40af"/>
  <rect x="128" y="160" width="256" height="192" rx="16" fill="white" fill-opacity="0.9"/>
  <rect x="192" y="224" width="128" height="64" rx="8" fill="#1e40af"/>
  <circle cx="256" cy="256" r="32" fill="white"/>
</svg>`;

// Write the SVG files
fs.writeFileSync(path.join(__dirname, 'icon-192x192.svg'), icon192);
fs.writeFileSync(path.join(__dirname, 'icon-512x512.svg'), icon512);

console.log('PWA icons generated successfully!');