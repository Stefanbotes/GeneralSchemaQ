#!/bin/bash
# NTAQV2 Legacy Files Cleanup Script
# Created: October 21, 2025
# Purpose: Remove legacy ntaqv2 directories and files from root

echo "========================================="
echo "NTAQV2 Legacy Files Cleanup Script"
echo "========================================="
echo ""
echo "This script will remove the following legacy files:"
echo "  - /home/ubuntu/ntaqv2/"
echo "  - /home/ubuntu/ntaqv2-clean/"
echo "  - /home/ubuntu/ntaqv2-final/"
echo "  - /home/ubuntu/ntaqv2_*.md"
echo "  - /home/ubuntu/ntaqv2_*.pdf"
echo ""
echo "A backup has been created at:"
echo "  /home/ubuntu/code_artifacts/ntaqv2_legacy_backup_20251021_105659.tar.gz"
echo ""
read -p "Are you sure you want to proceed? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "=== Starting cleanup ==="
echo ""

# Remove legacy directories
if [ -d "/home/ubuntu/ntaqv2" ]; then
    rm -rf /home/ubuntu/ntaqv2/
    echo "✓ Removed /home/ubuntu/ntaqv2/"
else
    echo "⊘ /home/ubuntu/ntaqv2/ already removed"
fi

if [ -d "/home/ubuntu/ntaqv2-clean" ]; then
    rm -rf /home/ubuntu/ntaqv2-clean/
    echo "✓ Removed /home/ubuntu/ntaqv2-clean/"
else
    echo "⊘ /home/ubuntu/ntaqv2-clean/ already removed"
fi

if [ -d "/home/ubuntu/ntaqv2-final" ]; then
    rm -rf /home/ubuntu/ntaqv2-final/
    echo "✓ Removed /home/ubuntu/ntaqv2-final/"
else
    echo "⊘ /home/ubuntu/ntaqv2-final/ already removed"
fi

# Remove legacy documentation files
if ls /home/ubuntu/ntaqv2_*.md 1> /dev/null 2>&1; then
    rm /home/ubuntu/ntaqv2_*.md
    echo "✓ Removed markdown files"
else
    echo "⊘ No markdown files to remove"
fi

if ls /home/ubuntu/ntaqv2_*.pdf 1> /dev/null 2>&1; then
    rm /home/ubuntu/ntaqv2_*.pdf
    echo "✓ Removed PDF files"
else
    echo "⊘ No PDF files to remove"
fi

echo ""
echo "=== Verifying cleanup ==="
echo ""
echo "Remaining ntaq files in root:"
ls -la /home/ubuntu/ | grep ntaq || echo "(None found - cleanup successful!)"

echo ""
echo "=== Cleanup complete! ==="
echo ""
echo "The active app remains at: /home/ubuntu/code_artifacts/ntaqv2/"
echo "Backup available at: /home/ubuntu/code_artifacts/ntaqv2_legacy_backup_20251021_105659.tar.gz"
