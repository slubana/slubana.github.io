#!/usr/bin/env node

/**
 * Local-only Gallery Image Processor
 * Converts high-res originals to optimized WebP thumbs + full images
 * Generates manifest for Jekyll build
 *
 * DO NOT run this in CI/GitHub Actions - run locally only!
 */

import sharp from 'sharp';
import { glob } from 'fast-glob';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname } from 'path';

const INPUT_DIR = 'gallery-originals';
const OUTPUT_THUMB_DIR = 'assets/gallery/thumb';
const OUTPUT_FULL_DIR = 'assets/gallery/full';
const MANIFEST_PATH = '_data/gallery_manifest.json';

const THUMB_SIZE = 900;
const THUMB_QUALITY = 78;
const FULL_SIZE = 2400;
const FULL_QUALITY = 82;

// Match YYYY-MM-DD_ prefix
const DATE_PREFIX_REGEX = /^(\d{4}-\d{2}-\d{2})_/;

async function processImages() {
  console.log('🖼️  Starting gallery image processing...\n');

  // Create output directories
  await mkdir(OUTPUT_THUMB_DIR, { recursive: true });
  await mkdir(OUTPUT_FULL_DIR, { recursive: true });

  // Find all image files in gallery-originals
  const imageFiles = await glob(`${INPUT_DIR}/*.{jpg,jpeg,png,webp}`, {
    caseSensitiveMatch: false
  });

  if (imageFiles.length === 0) {
    console.log('ℹ️  No images found in gallery-originals/');
    console.log('   Creating empty manifest...\n');
    await writeFile(MANIFEST_PATH, JSON.stringify([], null, 2));
    console.log('✅ Empty manifest created.');
    return;
  }

  console.log(`Found ${imageFiles.length} image(s) in ${INPUT_DIR}/\n`);

  // Process each image
  const manifest = [];

  for (const filePath of imageFiles) {
    const filename = basename(filePath);
    const match = filename.match(DATE_PREFIX_REGEX);

    // Skip files that don't match YYYY-MM-DD_ prefix
    if (!match) {
      console.log(`⏭️  Skipping ${filename} (no YYYY-MM-DD_ prefix)`);
      continue;
    }

    const date = match[1];
    const id = filename.replace(extname(filename), '');
    const outputName = `${id}.webp`;

    console.log(`📸 Processing: ${filename}`);
    console.log(`   Date: ${date}`);

    try {
      // Generate thumbnail
      await sharp(filePath)
        .resize(THUMB_SIZE, THUMB_SIZE, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: THUMB_QUALITY })
        .toFile(`${OUTPUT_THUMB_DIR}/${outputName}`);

      console.log(`   ✓ Thumb: ${OUTPUT_THUMB_DIR}/${outputName}`);

      // Generate full-size image
      await sharp(filePath)
        .resize(FULL_SIZE, FULL_SIZE, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: FULL_QUALITY })
        .toFile(`${OUTPUT_FULL_DIR}/${outputName}`);

      console.log(`   ✓ Full:  ${OUTPUT_FULL_DIR}/${outputName}\n`);

      // Add to manifest
      manifest.push({
        id,
        date,
        full: `/assets/gallery/full/${outputName}`,
        thumb: `/assets/gallery/thumb/${outputName}`
      });
    } catch (error) {
      console.error(`   ❌ Error processing ${filename}:`, error.message);
    }
  }

  // Sort manifest: date desc, then filename desc
  manifest.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date); // Newer first
    }
    return b.id.localeCompare(a.id); // Filename desc as tiebreaker
  });

  // Write manifest
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`✅ Processed ${manifest.length} image(s)`);
  console.log(`📝 Manifest written to ${MANIFEST_PATH}`);
  console.log('\n🎉 Done! Commit the following:');
  console.log(`   - ${OUTPUT_THUMB_DIR}/`);
  console.log(`   - ${OUTPUT_FULL_DIR}/`);
  console.log(`   - ${MANIFEST_PATH}`);
}

processImages().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
