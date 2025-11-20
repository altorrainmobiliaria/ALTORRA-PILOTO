#!/usr/bin/env node

/**
 * ALTORRA - Analizador de Imágenes
 *
 * Analiza imágenes sin modificarlas
 * Reporta tamaños, formatos, dimensiones
 * Sugiere optimizaciones
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.warn('⚠️  Sharp no disponible - análisis limitado');
  console.warn('   Instalar con: npm install sharp\n');
}

// Stats
const STATS = {
  total: 0,
  byFormat: {},
  bySize: { small: 0, medium: 0, large: 0, huge: 0 },
  totalSize: 0,
  needsOptimization: [],
  suggestions: []
};

// Config
const THRESHOLDS = {
  small: 100 * 1024,      // < 100KB
  medium: 500 * 1024,     // < 500KB
  large: 2 * 1024 * 1024, // < 2MB
  huge: 5 * 1024 * 1024   // < 5MB
};

/**
 * Format bytes
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all images
 */
async function getImageFiles(dir) {
  const files = [];
  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        files.push(...await getImageFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${dir}`, error.message);
  }

  return files;
}

/**
 * Analyze single image
 */
async function analyzeImage(filepath) {
  try {
    const stats = await stat(filepath);
    const size = stats.size;
    const ext = path.extname(filepath).toLowerCase().substring(1);

    STATS.total++;
    STATS.totalSize += size;
    STATS.byFormat[ext] = (STATS.byFormat[ext] || 0) + 1;

    // Categorize by size
    if (size < THRESHOLDS.small) {
      STATS.bySize.small++;
    } else if (size < THRESHOLDS.medium) {
      STATS.bySize.medium++;
    } else if (size < THRESHOLDS.large) {
      STATS.bySize.large++;
    } else {
      STATS.bySize.huge++;
    }

    // Get dimensions if sharp available
    let dimensions = null;
    if (sharp && ['.jpg', '.jpeg', '.png', '.webp'].includes(`.${ext}`)) {
      try {
        const metadata = await sharp(filepath).metadata();
        dimensions = { width: metadata.width, height: metadata.height };
      } catch (e) {
        // Ignore
      }
    }

    // Check if needs optimization
    const needsOpt = shouldOptimize(filepath, size, ext, dimensions);
    if (needsOpt) {
      STATS.needsOptimization.push({
        path: filepath,
        size,
        ext,
        dimensions,
        reason: needsOpt
      });
    }

    return { filepath, size, ext, dimensions };
  } catch (error) {
    console.error(`Error analyzing ${filepath}:`, error.message);
    return null;
  }
}

/**
 * Check if image needs optimization
 */
function shouldOptimize(filepath, size, ext, dimensions) {
  // Large files
  if (size > THRESHOLDS.large) {
    return `Grande (${formatBytes(size)})`;
  }

  // No WebP version
  if (['.jpg', '.jpeg', '.png'].includes(`.${ext}`)) {
    const webpPath = filepath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    if (!fs.existsSync(webpPath)) {
      return 'Sin versión WebP';
    }
  }

  // High resolution without responsive versions
  if (dimensions && dimensions.width > 1600) {
    const basename = path.basename(filepath, `.${ext}`);
    const dirname = path.dirname(filepath);
    const hasResponsive = fs.existsSync(path.join(dirname, `${basename}-800w.${ext}`));
    if (!hasResponsive) {
      return `Alta resolución (${dimensions.width}x${dimensions.height}) sin versiones responsive`;
    }
  }

  return null;
}

/**
 * Generate suggestions
 */
function generateSuggestions() {
  // Large files
  const largeFiles = STATS.needsOptimization.filter(img =>
    img.size > THRESHOLDS.large
  );

  if (largeFiles.length > 0) {
    STATS.suggestions.push({
      type: 'compression',
      priority: 'high',
      count: largeFiles.length,
      message: `${largeFiles.length} imágenes grandes que deberían comprimirse`,
      command: 'node tools/optimize-images.js'
    });
  }

  // Missing WebP
  const missingWebP = STATS.needsOptimization.filter(img =>
    img.reason.includes('WebP')
  );

  if (missingWebP.length > 0) {
    STATS.suggestions.push({
      type: 'webp',
      priority: 'medium',
      count: missingWebP.length,
      message: `${missingWebP.length} imágenes sin versión WebP`,
      command: 'node tools/optimize-images.js'
    });
  }

  // Missing responsive
  const missingResponsive = STATS.needsOptimization.filter(img =>
    img.reason && img.reason.includes('responsive')
  );

  if (missingResponsive.length > 0) {
    STATS.suggestions.push({
      type: 'responsive',
      priority: 'medium',
      count: missingResponsive.length,
      message: `${missingResponsive.length} imágenes de alta resolución sin versiones responsive`,
      command: 'node tools/optimize-images.js'
    });
  }

  // Potential savings
  const potentialSavings = largeFiles.reduce((sum, img) => sum + img.size, 0) * 0.6;
  if (potentialSavings > 1024 * 1024) {
    STATS.suggestions.push({
      type: 'savings',
      priority: 'info',
      message: `Ahorro potencial estimado: ${formatBytes(potentialSavings)} (-60%)`,
      command: null
    });
  }
}

/**
 * Show report
 */
function showReport() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 REPORTE DE ANÁLISIS DE IMÁGENES');
  console.log('='.repeat(70));

  console.log(`\n📁 Total de imágenes: ${STATS.total}`);
  console.log(`💾 Tamaño total: ${formatBytes(STATS.totalSize)}`);

  console.log('\n📊 Por formato:');
  Object.entries(STATS.byFormat)
    .sort((a, b) => b[1] - a[1])
    .forEach(([format, count]) => {
      const bar = '█'.repeat(Math.ceil(count / STATS.total * 40));
      console.log(`  ${format.toUpperCase().padEnd(6)} ${count.toString().padStart(4)} ${bar}`);
    });

  console.log('\n📏 Por tamaño:');
  console.log(`  Pequeñas (< 100KB):  ${STATS.bySize.small}`);
  console.log(`  Medianas (< 500KB):  ${STATS.bySize.medium}`);
  console.log(`  Grandes (< 2MB):     ${STATS.bySize.large}`);
  console.log(`  Muy grandes (> 2MB): ${STATS.bySize.huge}`);

  if (STATS.needsOptimization.length > 0) {
    console.log(`\n⚠️  Imágenes que necesitan optimización: ${STATS.needsOptimization.length}`);

    // Show top 10 largest
    console.log('\n📦 Top 10 más grandes:');
    STATS.needsOptimization
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .forEach((img, i) => {
        console.log(`  ${(i + 1).toString().padStart(2)}. ${formatBytes(img.size).padStart(10)} - ${img.path}`);
        console.log(`      → ${img.reason}`);
      });
  } else {
    console.log('\n✅ Todas las imágenes están bien optimizadas!');
  }

  if (STATS.suggestions.length > 0) {
    console.log('\n💡 SUGERENCIAS:');
    STATS.suggestions.forEach((suggestion, i) => {
      const icon = suggestion.priority === 'high' ? '🔴' :
                   suggestion.priority === 'medium' ? '🟡' : 'ℹ️ ';
      console.log(`\n  ${icon} ${suggestion.message}`);
      if (suggestion.command) {
        console.log(`     Ejecutar: ${suggestion.command}`);
      }
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('Para optimizar: node tools/optimize-images.js [directorio]');
  console.log('='.repeat(70) + '\n');
}

/**
 * Main
 */
async function main() {
  console.log('🔍 ALTORRA - Análisis de Imágenes\n');

  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node tools/analyze-images.js [directorio]

Analiza imágenes y genera reporte sin modificar nada.

Ejemplos:
  node tools/analyze-images.js
  node tools/analyze-images.js multimedia
  node tools/analyze-images.js allure Milan
`);
    return;
  }

  const dirs = args.length > 0 ? args : [
    'allure', 'Milan', 'serena', 'fmia', 'fotoprop', 'multimedia'
  ];

  const existingDirs = dirs.filter(dir => fs.existsSync(dir));

  if (existingDirs.length === 0) {
    console.error('❌ No se encontraron directorios');
    return;
  }

  console.log(`Analizando: ${existingDirs.join(', ')}\n`);

  // Collect all images
  let allImages = [];
  for (const dir of existingDirs) {
    const images = await getImageFiles(dir);
    allImages.push(...images);
  }

  console.log(`Encontradas ${allImages.length} imágenes. Analizando...\n`);

  // Analyze each
  for (const image of allImages) {
    await analyzeImage(image);
  }

  // Generate suggestions
  generateSuggestions();

  // Show report
  showReport();
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
