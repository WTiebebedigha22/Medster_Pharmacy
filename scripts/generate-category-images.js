/**
 * Generates category-specific SVG placeholder images for all product categories.
 * Run: node scripts/generate-category-images.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, '../public/images/categories');

const categories = [
  { id: 'injections-infusions', name: 'Injections & Infusions', bg: '#e0f2fe', color: '#0284c7', icon: '💉' },
  { id: 'tablets-capsules', name: 'Tablets & Capsules', bg: '#fef2f2', color: '#dc2626', icon: '💊' },
  { id: 'syrups-suspensions', name: 'Syrups & Suspensions', bg: '#f0fdf4', color: '#16a34a', icon: '🧪' },
  { id: 'creams-ointments', name: 'Creams & Ointments', bg: '#fdf8f0', color: '#ea580c', icon: '🧴' },
  { id: 'eye-ear-nasal-drops', name: 'Eye, Ear & Nasal Drops', bg: '#f0f9ff', color: '#0284c7', icon: '👁️' },
  { id: 'oral-care', name: 'Oral Care', bg: '#fffbeb', color: '#d97706', icon: '🪥' },
  { id: 'contraceptives', name: 'Contraceptives', bg: '#fdf2f8', color: '#db2777', icon: '🛡️' },
  { id: 'vitamins-supplements', name: 'Vitamins & Supplements', bg: '#f0fdf4', color: '#16a34a', icon: '💪' },
  { id: 'pain-relief', name: 'Pain Relief', bg: '#fef2f2', color: '#dc2626', icon: '🤕' },
  { id: 'antibiotics', name: 'Antibiotics & Anti-infectives', bg: '#f5f3ff', color: '#7c3aed', icon: '🦠' },
  { id: 'medical-supplies', name: 'Medical Supplies', bg: '#f8fafc', color: '#475569', icon: '🏥' },
  { id: 'diagnostic-tests', name: 'Diagnostic Tests', bg: '#ecfdf5', color: '#059669', icon: '🔬' },
  { id: 'food-beverages', name: 'Food & Beverages', bg: '#fffbeb', color: '#d97706', icon: '🍽️' },
  { id: 'personal-care', name: 'Personal Care', bg: '#fdf2f8', color: '#db2777', icon: '🧖' },
  { id: 'cough-cold', name: 'Cough & Cold Syrups', bg: '#e0f2fe', color: '#0284c7', icon: '🤧' },
  { id: 'digestive-health', name: 'Antacids & Digestive Health', bg: '#f0fdf4', color: '#65a30d', icon: '🏪' },
  { id: 'cardiovascular', name: 'Cardiovascular Health', bg: '#fef2f2', color: '#dc2626', icon: '❤️' },
  { id: 'diabetes-care', name: 'Diabetes Care', bg: '#fdf8f0', color: '#ea580c', icon: '🩸' },
  { id: 'fertility-sexual', name: 'Fertility & Sexual Health', bg: '#fdf2f8', color: '#ec4899', icon: '👶' },
  { id: 'antimalarials', name: 'Antimalarials', bg: '#fefce8', color: '#a16207', icon: '🦟' },
  { id: 'feminine-care', name: 'Feminine Care', bg: '#fdf2f8', color: '#e11d48', icon: '👩' },
  { id: 'respiratory', name: 'Respiratory', bg: '#ecfdf5', color: '#059669', icon: '🫁' },
  { id: 'first-aid', name: 'First Aid', bg: '#fef2f2', color: '#dc2626', icon: '🚑' },
  { id: 'general-health', name: 'General Health', bg: '#f0f9ff', color: '#2563eb', icon: '🌟' },
];

function generateSVG(cat) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${cat.bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:white;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#bg)" rx="12"/>
  <!-- Circle icon bg -->
  <circle cx="150" cy="130" r="50" fill="${cat.color}" opacity="0.1"/>
  <text x="150" y="140" text-anchor="middle" font-size="40">${cat.icon}</text>
  <text x="150" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${cat.color}" font-weight="bold">${cat.name}</text>
  <text x="150" y="245" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#94a3b8">Medster Pharmacy</text>
  <!-- Decorative dots -->
  <circle cx="50" cy="260" r="3" fill="${cat.color}" opacity="0.2"/>
  <circle cx="70" cy="270" r="2" fill="${cat.color}" opacity="0.15"/>
  <circle cx="230" cy="265" r="3" fill="${cat.color}" opacity="0.2"/>
  <circle cx="250" cy="275" r="2" fill="${cat.color}" opacity="0.15"/>
</svg>`;
}

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let count = 0;
for (const cat of categories) {
  const filePath = path.join(outputDir, `${cat.id}.svg`);
  fs.writeFileSync(filePath, generateSVG(cat), 'utf-8');
  console.log(`✅ Generated: ${cat.id}.svg`);
  count++;
}

console.log(`\n🎉 Generated ${count} category images in ${outputDir}`);

