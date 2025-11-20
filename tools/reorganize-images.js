#!/usr/bin/env node

/**
 * ALTORRA - Image Reorganization Script
 *
 * Reorganizes scattered property images into structured directories:
 * OLD: /allure/, /Milan/, /serena/, /fmia/, /fotoprop/, /multimedia/
 * NEW: /images/properties/{property-id}/ OR /images/shared/
 *
 * Features:
 * - Creates backup of data.json
 * - Moves images to new structure
 * - Updates all references in data.json
 * - Generates rollback script
 * - Creates detailed migration report
 *
 * Usage: node tools/reorganize-images.js [--dry-run] [--no-backup]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  dataJsonPath: './properties/data.json',
  newImagesRoot: './images',
  oldDirs: ['allure', 'Milan', 'serena', 'fmia', 'fotoprop', 'multimedia'],
  backupSuffix: '.backup-' + Date.now(),
  dryRun: process.argv.includes('--dry-run'),
  noBackup: process.argv.includes('--no-backup')
};

// Stats
const stats = {
  propertiesProcessed: 0,
  imagesMoved: 0,
  imagesSkipped: 0,
  errors: [],
  startTime: Date.now()
};

// Rollback commands
const rollbackCommands = [];

/**
 * Load and parse data.json
 */
function loadData() {
  try {
    const raw = fs.readFileSync(CONFIG.dataJsonPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('❌ Error loading data.json:', e.message);
    process.exit(1);
  }
}

/**
 * Save data.json
 */
function saveData(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(CONFIG.dataJsonPath, json, 'utf8');
    console.log('✅ data.json updated successfully');
  } catch (e) {
    console.error('❌ Error saving data.json:', e.message);
    throw e;
  }
}

/**
 * Create backup of data.json
 */
function createBackup() {
  if (CONFIG.noBackup) {
    console.log('⚠️  Skipping backup (--no-backup flag)');
    return null;
  }

  const backupPath = CONFIG.dataJsonPath + CONFIG.backupSuffix;
  try {
    fs.copyFileSync(CONFIG.dataJsonPath, backupPath);
    console.log(`📦 Backup created: ${backupPath}`);
    return backupPath;
  } catch (e) {
    console.error('❌ Failed to create backup:', e.message);
    process.exit(1);
  }
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    if (CONFIG.dryRun) {
      console.log(`[DRY RUN] Would create: ${dirPath}`);
    } else {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created: ${dirPath}`);
    }
  }
}

/**
 * Move file from old path to new path
 */
function moveImage(oldPath, newPath) {
  const fullOldPath = path.join('.', oldPath);
  const fullNewPath = path.join('.', newPath);

  // Check if source exists
  if (!fs.existsSync(fullOldPath)) {
    stats.imagesSkipped++;
    stats.errors.push(`Source not found: ${oldPath}`);
    return false;
  }

  // Ensure destination directory exists
  ensureDir(path.dirname(fullNewPath));

  if (CONFIG.dryRun) {
    console.log(`[DRY RUN] Would move: ${oldPath} → ${newPath}`);
  } else {
    try {
      fs.copyFileSync(fullOldPath, fullNewPath);
      console.log(`📸 Moved: ${oldPath} → ${newPath}`);

      // Add to rollback commands
      rollbackCommands.push(`mv "${fullNewPath}" "${fullOldPath}"`);

      stats.imagesMoved++;
    } catch (e) {
      stats.errors.push(`Failed to move ${oldPath}: ${e.message}`);
      return false;
    }
  }

  return true;
}

/**
 * Get new image path for property
 */
function getNewImagePath(propertyId, oldPath) {
  // Extract filename from old path
  const filename = path.basename(oldPath);

  // Determine if this is a shared/generic image or property-specific
  const isShared = oldPath.includes('/multimedia/');

  if (isShared) {
    return `/images/shared/${filename}`;
  } else {
    return `/images/properties/${propertyId}/${filename}`;
  }
}

/**
 * Process a single property
 */
function processProperty(property) {
  const updates = {
    image: null,
    images: []
  };

  // Process main image
  if (property.image) {
    const newPath = getNewImagePath(property.id, property.image);
    if (moveImage(property.image, newPath)) {
      updates.image = newPath;
    }
  }

  // Process gallery images
  if (Array.isArray(property.images)) {
    updates.images = property.images.map(oldPath => {
      const newPath = getNewImagePath(property.id, oldPath);
      if (moveImage(oldPath, newPath)) {
        return newPath;
      }
      return oldPath; // Keep old path if move failed
    });
  }

  stats.propertiesProcessed++;
  return updates;
}

/**
 * Generate migration report
 */
function generateReport() {
  const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);

  const report = `
╔════════════════════════════════════════════════════════════════╗
║        ALTORRA - Image Reorganization Report                  ║
╚════════════════════════════════════════════════════════════════╝

📊 STATISTICS:
  • Properties processed:  ${stats.propertiesProcessed}
  • Images moved:          ${stats.imagesMoved}
  • Images skipped:        ${stats.imagesSkipped}
  • Errors:                ${stats.errors.length}
  • Duration:              ${duration}s

${stats.errors.length > 0 ? `
⚠️  ERRORS:
${stats.errors.map(e => '  • ' + e).join('\n')}
` : '✅ No errors encountered'}

📁 NEW STRUCTURE:
  /images/
    ├── properties/
    │   ├── {property-id}/
    │   │   ├── main.webp
    │   │   ├── gallery-1.webp
    │   │   └── ...
    └── shared/
        └── generic-images.webp

${CONFIG.dryRun ? `
🔍 DRY RUN MODE - No files were actually moved
Run without --dry-run to execute migration
` : `
✅ Migration completed successfully!

📝 ROLLBACK:
A rollback script has been created at: tools/rollback-images.sh
Run it to revert all changes if needed.
`}

═══════════════════════════════════════════════════════════════════
`;

  console.log(report);

  // Save report to file
  if (!CONFIG.dryRun) {
    const reportPath = `./tools/migration-report-${Date.now()}.txt`;
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

/**
 * Generate rollback script
 */
function generateRollback(backupPath) {
  if (CONFIG.dryRun || rollbackCommands.length === 0) return;

  const rollbackScript = `#!/bin/bash
# ALTORRA Image Migration Rollback Script
# Generated: ${new Date().toISOString()}

echo "🔄 Rolling back image migration..."

# Restore data.json backup
if [ -f "${backupPath}" ]; then
  cp "${backupPath}" "${CONFIG.dataJsonPath}"
  echo "✅ Restored data.json from backup"
fi

# Move images back
${rollbackCommands.join('\n')}

echo "✅ Rollback complete!"
echo "You may want to remove the /images directory:"
echo "  rm -rf ./images"
`;

  const rollbackPath = './tools/rollback-images.sh';
  fs.writeFileSync(rollbackPath, rollbackScript, 'utf8');
  fs.chmodSync(rollbackPath, '755');
  console.log(`📝 Rollback script created: ${rollbackPath}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🚀 ALTORRA Image Reorganization Script');
  console.log('═══════════════════════════════════════\n');

  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be moved\n');
  }

  // Create backup
  const backupPath = createBackup();

  // Load data
  console.log('\n📖 Loading data.json...');
  const data = loadData();
  console.log(`Found ${data.length} properties\n`);

  // Create new directory structure
  console.log('📁 Creating new directory structure...');
  ensureDir(path.join(CONFIG.newImagesRoot, 'properties'));
  ensureDir(path.join(CONFIG.newImagesRoot, 'shared'));
  console.log('');

  // Process each property
  console.log('🔄 Processing properties...\n');
  data.forEach(property => {
    console.log(`\n--- Property: ${property.id} (${property.title}) ---`);
    const updates = processProperty(property);

    // Update property with new paths
    if (updates.image) property.image = updates.image;
    if (updates.images.length > 0) property.images = updates.images;
  });

  // Save updated data.json
  if (!CONFIG.dryRun) {
    console.log('\n💾 Saving updated data.json...');
    saveData(data);
  }

  // Generate rollback script
  if (!CONFIG.dryRun) {
    console.log('\n📝 Generating rollback script...');
    generateRollback(backupPath);
  }

  // Generate report
  console.log('');
  generateReport();

  // Exit
  process.exit(stats.errors.length > 0 ? 1 : 0);
}

// Run
main();
