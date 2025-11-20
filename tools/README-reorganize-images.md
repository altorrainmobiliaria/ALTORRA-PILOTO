# Image Reorganization Script

## Overview

This script reorganizes scattered property images into a clean, structured directory system.

## Current Structure (Problematic)

```
ALTORRA-PILOTO/
├── /allure/       (19 files, 3.2MB)
├── /Milan/        (22 files, 11MB)
├── /serena/       (12 files, 2.3MB)
├── /fmia/         (18 files, 6.4MB)
├── /fotoprop/     (13 files, 4.1MB)
└── /multimedia/   (3 files, 707KB)
```

**Problems:**
- Images scattered across 6 directories
- No clear association with property IDs
- Difficult to manage and maintain
- Hard to find which images belong to which property

## New Structure (Clean)

```
ALTORRA-PILOTO/
└── /images/
    ├── properties/
    │   ├── 101-27/           # Property-specific images
    │   │   ├── allure.webp
    │   │   ├── allure1.webp
    │   │   └── ...
    │   ├── 102-11402/
    │   │   ├── 1m.webp
    │   │   └── ...
    │   └── {property-id}/
    │       └── ...
    └── shared/               # Generic/reusable images
        └── hero-*.webp
```

**Benefits:**
- Clear property-to-images mapping
- Easy to add/remove property images
- Organized by property ID
- Scalable structure

## Usage

### 1. Test First (Dry Run)

Always test before executing:

```bash
node tools/reorganize-images.js --dry-run
```

This shows what changes would be made WITHOUT actually moving files.

### 2. Execute Migration

When ready to migrate:

```bash
node tools/reorganize-images.js
```

**What happens:**
1. ✅ Creates backup of `properties/data.json`
2. ✅ Creates new directory structure
3. ✅ Copies images to new locations
4. ✅ Updates all references in data.json
5. ✅ Generates rollback script
6. ✅ Creates detailed migration report

### 3. Verify Changes

After migration:

```bash
# Check that new directories exist
ls -la images/properties/

# Verify data.json was updated
git diff properties/data.json

# Test the website locally
npx serve .
# Visit http://localhost:3000 and check property images
```

### 4. Rollback (if needed)

If something goes wrong:

```bash
bash tools/rollback-images.sh
```

This will:
- Restore the data.json backup
- Move images back to original locations

## Options

```bash
# Dry run (no changes)
node tools/reorganize-images.js --dry-run

# Skip backup creation (not recommended)
node tools/reorganize-images.js --no-backup

# Normal execution
node tools/reorganize-images.js
```

## Safety Features

### Automatic Backup
- Creates timestamped backup of data.json before any changes
- Format: `data.json.backup-{timestamp}`

### Rollback Script
- Generates `tools/rollback-images.sh` with undo commands
- Restores original structure if needed

### Fail-Open Design
- If source image not found, operation is skipped
- If copy fails, original path is preserved
- Errors logged but don't stop migration

### Detailed Reporting
- Shows exactly which files were moved
- Lists any errors encountered
- Saves report to `tools/migration-report-{timestamp}.txt`

## Expected Results

### Statistics
```
📊 STATISTICS:
  • Properties processed:  13
  • Images moved:          ~151
  • Images skipped:        0
  • Errors:                0
  • Duration:              ~2-3s
```

### Files Created
1. `images/properties/{13 subdirectories}/`
2. `properties/data.json` (updated with new paths)
3. `properties/data.json.backup-{timestamp}`
4. `tools/rollback-images.sh`
5. `tools/migration-report-{timestamp}.txt`

## Post-Migration Tasks

### 1. Test Website

```bash
# Start local server
npx serve .

# Test these pages:
# - http://localhost:3000/propiedades-comprar.html
# - http://localhost:3000/propiedades-arrendar.html
# - http://localhost:3000/propiedades-alojamientos.html
# - http://localhost:3000/detalle-propiedad.html?id=101-27
```

Verify:
- ✅ All property cards show images
- ✅ Detail page galleries work
- ✅ No broken image links
- ✅ Carousel navigation works

### 2. Regenerate OG Images

After migration, regenerate social sharing images:

```bash
node tools/generate_og_pages.js
```

### 3. Clean Up Old Directories (Optional)

Once verified everything works:

```bash
# CAUTION: Only after thorough testing!
rm -rf allure/ Milan/ serena/ fmia/ fotoprop/
# Keep multimedia/ if it has generic images
```

### 4. Commit Changes

```bash
git add images/ properties/data.json tools/
git commit -m "🗂️ IMAGE MIGRATION: Reorganized images into structured directories"
git push
```

## Troubleshooting

### "Source not found" errors
- Some images referenced in data.json don't exist
- These will be skipped and logged in the report
- Check the report file for details

### Images not showing after migration
1. Check browser console for 404 errors
2. Verify paths in data.json match actual file locations
3. Run rollback script to restore original state

### Script fails mid-execution
1. Check the migration report for error details
2. Run the rollback script: `bash tools/rollback-images.sh`
3. Fix the issue and try again

## Technical Details

### How It Works

1. **Load Data:** Reads `properties/data.json`
2. **Create Structure:** Creates `/images/properties/` and `/images/shared/`
3. **Process Each Property:**
   - Identifies property ID
   - Determines new path: `/images/properties/{id}/{filename}`
   - Copies image from old location to new location
   - Updates property object with new path
4. **Save Changes:** Writes updated data.json
5. **Generate Report:** Creates detailed log of all operations

### Path Mapping Logic

```javascript
// Property-specific images
/allure/allure.webp → /images/properties/101-27/allure.webp
/Milan/1.webp      → /images/properties/105-4422/1.webp

// Shared images (from /multimedia/)
/multimedia/hero.webp → /images/shared/hero.webp
```

## Maintenance

### Adding New Properties

With new structure, simply:

```bash
# Create property directory
mkdir images/properties/NEW-ID

# Add images
cp ~/new-images/* images/properties/NEW-ID/

# Update data.json
# "image": "/images/properties/NEW-ID/main.webp"
```

### Removing Properties

```bash
# Remove property images
rm -rf images/properties/OLD-ID/

# Remove from data.json
# (edit manually or use script)
```

---

**Created:** 2025-11-20
**Version:** 1.0.0
**Author:** Claude (Altorra Development)
