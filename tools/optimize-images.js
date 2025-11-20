#!/usr/bin/env node

/**
 * ALTORRA - Optimizador de Imágenes
 *
 * Optimiza y comprime imágenes para web
 * Genera versiones WebP automáticamente
 * Crea versiones responsive
 *
 * Requiere: sharp (npm install sharp)
 * Uso: node tools/optimize-images.js [directorio]
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp no está instalado');
  console.error('   Instalar con: npm install sharp');
  process.exit(1);
}

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Configuración
const CONFIG = {
  // Calidad de compresión
  quality: {
    jpeg: 80,    // 80% calidad JPEG
    webp: 80,    // 80% calidad WebP
    png: 8       // Nivel compresión PNG (1-9)
  },

  // Tamaños responsive (ancho en píxeles)
  responsive: {
    enabled: true,
    sizes: [400, 800, 1200, 1600]  // Generar 4 versiones
  },

  // Generación WebP
  webp: {
    enabled: true,
    replaceOriginal: false  // Mantener originales
  },

  // Directorios a procesar
  inputDirs: [
    'allure',
    'Milan',
    'serena',
    'fmia',
    'fotoprop',
    'multimedia'
  ],

  // Directorio de salida (si es diferente)
  outputDir: null,  // null = sobrescribir originales

  // Extensiones soportadas
  extensions: ['.jpg', '.jpeg', '.png', '.webp'],

  // Crear backups
  createBackups: true,

  // Modo dry-run
  dryRun: false,

  // Límite de tamaño para optimizar (bytes)
  minSize: 50 * 1024,  // 50KB mínimo

  // Estadísticas
  stats: {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalBefore: 0,
    totalAfter: 0
  }
};

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get all image files in directory recursively
 */
async function getImageFiles(dir) {
  const files = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }
        files.push(...await getImageFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading ${dir}:`, error.message);
  }

  return files;
}

/**
 * Optimize single image
 */
async function optimizeImage(inputPath) {
  try {
    const stats = await stat(inputPath);
    const sizeBefore = stats.size;

    // Skip if too small
    if (sizeBefore < CONFIG.minSize) {
      console.log(`  ⏭️  Skipped (too small): ${inputPath}`);
      CONFIG.stats.skipped++;
      return;
    }

    CONFIG.stats.totalBefore += sizeBefore;

    const ext = path.extname(inputPath).toLowerCase();
    const basename = path.basename(inputPath, ext);
    const dirname = path.dirname(inputPath);

    // Output path
    const outputDir = CONFIG.outputDir || dirname;
    const outputPath = path.join(outputDir, `${basename}${ext}`);

    if (CONFIG.dryRun) {
      console.log(`  🔍 DRY RUN: Would optimize ${inputPath}`);
      return;
    }

    // Create backup
    if (CONFIG.createBackups && !CONFIG.outputDir) {
      const backupPath = path.join(dirname, `${basename}.backup${ext}`);
      fs.copyFileSync(inputPath, backupPath);
    }

    // Load image
    let image = sharp(inputPath);
    const metadata = await image.metadata();

    // Optimize based on format
    if (ext === '.jpg' || ext === '.jpeg') {
      image = image.jpeg({
        quality: CONFIG.quality.jpeg,
        progressive: true,
        mozjpeg: true
      });
    } else if (ext === '.png') {
      image = image.png({
        compressionLevel: CONFIG.quality.png,
        progressive: true
      });
    } else if (ext === '.webp') {
      image = image.webp({
        quality: CONFIG.quality.webp
      });
    }

    // Save optimized
    await image.toFile(outputPath);

    const statsAfter = await stat(outputPath);
    const sizeAfter = statsAfter.size;
    CONFIG.stats.totalAfter += sizeAfter;

    const saved = sizeBefore - sizeAfter;
    const percent = ((saved / sizeBefore) * 100).toFixed(1);

    console.log(`  ✅ ${inputPath}`);
    console.log(`     ${formatBytes(sizeBefore)} → ${formatBytes(sizeAfter)} (-${percent}%)`);

    // Generate WebP version
    if (CONFIG.webp.enabled && ext !== '.webp') {
      const webpPath = path.join(outputDir, `${basename}.webp`);
      await sharp(inputPath)
        .webp({ quality: CONFIG.quality.webp })
        .toFile(webpPath);

      const webpStats = await stat(webpPath);
      console.log(`     💚 WebP: ${formatBytes(webpStats.size)}`);
    }

    // Generate responsive sizes
    if (CONFIG.responsive.enabled && metadata.width > CONFIG.responsive.sizes[0]) {
      for (const width of CONFIG.responsive.sizes) {
        if (width < metadata.width) {
          const responsivePath = path.join(outputDir, `${basename}-${width}w${ext}`);
          await sharp(inputPath)
            .resize(width, null, { withoutEnlargement: true })
            [ext === '.png' ? 'png' : 'jpeg']({
              quality: CONFIG.quality[ext === '.png' ? 'png' : 'jpeg']
            })
            .toFile(responsivePath);

          const respStats = await stat(responsivePath);
          console.log(`     📐 ${width}w: ${formatBytes(respStats.size)}`);
        }
      }
    }

    CONFIG.stats.processed++;

  } catch (error) {
    console.error(`  ❌ Error: ${inputPath}`, error.message);
    CONFIG.stats.errors++;
  }
}

/**
 * Process directory
 */
async function processDirectory(dir) {
  console.log(`\n📁 Procesando: ${dir}`);

  const images = await getImageFiles(dir);

  if (images.length === 0) {
    console.log('  ℹ️  No images found');
    return;
  }

  console.log(`  Found ${images.length} images\n`);

  for (const image of images) {
    await optimizeImage(image);
  }
}

/**
 * Show statistics
 */
function showStats() {
  const saved = CONFIG.stats.totalBefore - CONFIG.stats.totalAfter;
  const percent = CONFIG.stats.totalBefore > 0
    ? ((saved / CONFIG.stats.totalBefore) * 100).toFixed(1)
    : 0;

  console.log('\n' + '='.repeat(60));
  console.log('📊 ESTADÍSTICAS');
  console.log('='.repeat(60));
  console.log(`Imágenes procesadas: ${CONFIG.stats.processed}`);
  console.log(`Imágenes saltadas:   ${CONFIG.stats.skipped}`);
  console.log(`Errores:             ${CONFIG.stats.errors}`);
  console.log(`\nTamaño original:     ${formatBytes(CONFIG.stats.totalBefore)}`);
  console.log(`Tamaño optimizado:   ${formatBytes(CONFIG.stats.totalAfter)}`);
  console.log(`Espacio ahorrado:    ${formatBytes(saved)} (-${percent}%)`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  ALTORRA - Optimizador de Imágenes\n');

  const args = process.argv.slice(2);

  // Parse arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node tools/optimize-images.js [opciones] [directorio]

Opciones:
  --dry-run, -d        Modo prueba (no modifica archivos)
  --no-backup          No crear backups
  --no-webp            No generar versiones WebP
  --no-responsive      No generar tamaños responsive
  --quality <n>        Calidad JPEG/WebP (1-100, default: 80)
  --output <dir>       Directorio de salida (default: sobrescribir)
  --help, -h           Mostrar esta ayuda

Ejemplos:
  node tools/optimize-images.js multimedia
  node tools/optimize-images.js --dry-run
  node tools/optimize-images.js --quality 90 --no-responsive
  node tools/optimize-images.js --output optimized allure
`);
    return;
  }

  // Parse options
  if (args.includes('--dry-run') || args.includes('-d')) {
    CONFIG.dryRun = true;
    console.log('🔍 Modo DRY RUN activado\n');
  }

  if (args.includes('--no-backup')) {
    CONFIG.createBackups = false;
  }

  if (args.includes('--no-webp')) {
    CONFIG.webp.enabled = false;
  }

  if (args.includes('--no-responsive')) {
    CONFIG.responsive.enabled = false;
  }

  const qualityIndex = args.indexOf('--quality');
  if (qualityIndex !== -1 && args[qualityIndex + 1]) {
    const quality = parseInt(args[qualityIndex + 1]);
    if (quality >= 1 && quality <= 100) {
      CONFIG.quality.jpeg = quality;
      CONFIG.quality.webp = quality;
      console.log(`Calidad configurada: ${quality}%\n`);
    }
  }

  const outputIndex = args.indexOf('--output');
  if (outputIndex !== -1 && args[outputIndex + 1]) {
    CONFIG.outputDir = args[outputIndex + 1];
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    console.log(`Directorio de salida: ${CONFIG.outputDir}\n`);
  }

  // Get directories to process
  const dirsToProcess = args.filter(arg =>
    !arg.startsWith('-') &&
    arg !== args[qualityIndex + 1] &&
    arg !== args[outputIndex + 1]
  );

  const dirs = dirsToProcess.length > 0 ? dirsToProcess : CONFIG.inputDirs;

  // Check if directories exist
  const existingDirs = dirs.filter(dir => fs.existsSync(dir));

  if (existingDirs.length === 0) {
    console.error('❌ No se encontraron directorios para procesar');
    return;
  }

  // Process each directory
  for (const dir of existingDirs) {
    await processDirectory(dir);
  }

  // Show statistics
  showStats();

  if (CONFIG.dryRun) {
    console.log('💡 Tip: Quita --dry-run para aplicar los cambios\n');
  }

  if (CONFIG.createBackups && !CONFIG.outputDir) {
    console.log('💾 Backups creados con extensión .backup\n');
  }
}

// Run
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});
