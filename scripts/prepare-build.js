#!/usr/bin/env node

/**
 * Prepare Build Script
 * 
 * This script ensures the .next directory structure is properly created
 * before Next.js build process starts. This prevents ENOENT errors in
 * Vercel's build environment.
 */

const fs = require('fs');
const path = require('path');

// Disable Next.js telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.DISABLE_NEXT_TELEMETRY = '1';

const rootDir = path.join(__dirname, '..');
const nextDir = path.join(rootDir, '.next');
const traceDir = path.join(nextDir, 'trace');

console.log('🔧 Preparing build environment...');

// Function to ensure directory exists
function ensureDir(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${path.relative(rootDir, dirPath)}`);
    } else {
      console.log(`✓ Directory exists: ${path.relative(rootDir, dirPath)}`);
    }
  } catch (error) {
    console.error(`❌ Error creating directory ${dirPath}:`, error.message);
    // Don't throw - let Next.js handle directory creation if this fails
  }
}

// Function to create a placeholder file
function createPlaceholder(filePath, content = '') {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Created file: ${path.relative(rootDir, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error creating file ${filePath}:`, error.message);
  }
}

// Ensure critical directories exist
ensureDir(nextDir);
ensureDir(traceDir);
ensureDir(path.join(nextDir, 'cache'));
ensureDir(path.join(nextDir, 'server'));
ensureDir(path.join(nextDir, 'static'));

// Create placeholder files to prevent trace errors
createPlaceholder(path.join(nextDir, 'trace-0'), '');
createPlaceholder(path.join(nextDir, 'trace-1'), '');

// Create a build-manifest placeholder
createPlaceholder(
  path.join(nextDir, 'build-manifest.json'),
  JSON.stringify({ pages: {}, devFiles: [], ampDevFiles: [], polyfillFiles: [], lowPriorityFiles: [] }, null, 2)
);

console.log('✅ Build environment preparation complete!\n');
