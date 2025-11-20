#!/usr/bin/env node

/**
 * ALTORRA - Convert images to lazy loading
 *
 * Este script convierte atributos src → data-src para lazy loading
 * Excluye logos, hero images y first-fold content
 *
 * Uso: node tools/convert-images-to-lazy.js [archivo.html]
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
  // Imágenes que NO deben ser lazy (críticas para first paint)
  excludePatterns: [
    /logo/i,
    /hero/i,
    /favicon/i,
    /og-image/i,
    /apple-touch/i
  ],

  // Directorios a procesar si no se especifica archivo
  htmlDirs: ['.'],

  // Extensiones de archivos HTML
  htmlExtensions: ['.html', '.htm'],

  // Backup antes de modificar
  createBackup: true,

  // Modo dry-run (solo mostrar cambios sin aplicar)
  dryRun: false
};

/**
 * Check if image should be excluded from lazy loading
 */
function shouldExclude(imgTag) {
  return CONFIG.excludePatterns.some(pattern => pattern.test(imgTag));
}

/**
 * Convert img tags to lazy loading
 */
function convertToLazy(html, filename) {
  let modified = html;
  let count = 0;

  // Find all img tags
  const imgRegex = /<img([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi;

  modified = modified.replace(imgRegex, (match, before, src, after) => {
    // Skip if already has data-src
    if (match.includes('data-src')) {
      return match;
    }

    // Skip if should be excluded
    if (shouldExclude(match)) {
      console.log(`  ⏭️  Excluded: ${src}`);
      return match;
    }

    // Skip inline data URIs
    if (src.startsWith('data:')) {
      return match;
    }

    // Convert to lazy
    const converted = `<img${before}data-src="${src}"${after}>`;
    count++;

    console.log(`  ✓ Converted: ${src}`);
    return converted;
  });

  return { html: modified, count };
}

/**
 * Process a single HTML file
 */
function processFile(filepath) {
  console.log(`\n📄 Processing: ${filepath}`);

  try {
    // Read file
    const html = fs.readFileSync(filepath, 'utf8');

    // Convert images
    const { html: modified, count } = convertToLazy(html, filepath);

    if (count === 0) {
      console.log('  ℹ️  No images to convert');
      return;
    }

    if (CONFIG.dryRun) {
      console.log(`  🔍 DRY RUN: Would convert ${count} images`);
      return;
    }

    // Create backup
    if (CONFIG.createBackup) {
      const backupPath = `${filepath}.backup`;
      fs.writeFileSync(backupPath, html, 'utf8');
      console.log(`  💾 Backup created: ${backupPath}`);
    }

    // Write modified file
    fs.writeFileSync(filepath, modified, 'utf8');
    console.log(`  ✅ Converted ${count} images`);

  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
  }
}

/**
 * Find HTML files in directory
 */
function findHTMLFiles(dir) {
  const files = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip node_modules, hidden dirs, etc
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively search subdirectories
        files.push(...findHTMLFiles(fullPath));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (CONFIG.htmlExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Main function
 */
function main() {
  console.log('🖼️  ALTORRA - Image to Lazy Loading Converter\n');

  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso: node tools/convert-images-to-lazy.js [opciones] [archivo.html]

Opciones:
  --dry-run, -d    Modo prueba (muestra cambios sin aplicar)
  --no-backup      No crear archivos de respaldo
  --help, -h       Mostrar esta ayuda

Ejemplos:
  node tools/convert-images-to-lazy.js index.html
  node tools/convert-images-to-lazy.js --dry-run
  node tools/convert-images-to-lazy.js --no-backup propiedades-comprar.html
`);
    return;
  }

  // Parse options
  if (args.includes('--dry-run') || args.includes('-d')) {
    CONFIG.dryRun = true;
    console.log('🔍 Modo DRY RUN activado\n');
  }

  if (args.includes('--no-backup')) {
    CONFIG.createBackup = false;
  }

  // Get file arguments (non-option args)
  const files = args.filter(arg => !arg.startsWith('-'));

  if (files.length > 0) {
    // Process specified files
    files.forEach(file => {
      if (fs.existsSync(file)) {
        processFile(file);
      } else {
        console.error(`❌ File not found: ${file}`);
      }
    });
  } else {
    // Process all HTML files in project
    console.log('No specific files provided, searching for HTML files...\n');

    const allFiles = [];
    CONFIG.htmlDirs.forEach(dir => {
      allFiles.push(...findHTMLFiles(dir));
    });

    console.log(`Found ${allFiles.length} HTML files\n`);

    if (allFiles.length === 0) {
      console.log('ℹ️  No HTML files found');
      return;
    }

    allFiles.forEach(processFile);
  }

  console.log('\n✅ Done!');

  if (CONFIG.dryRun) {
    console.log('\n💡 Tip: Remove --dry-run to apply changes');
  }
}

// Run
main();
