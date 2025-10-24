# NTAQV2 Directory Structure Analysis

## Investigation Summary

### Current Situation
- **Running app location**: `/home/ubuntu/code_artifacts/ntaqv2/`
- **Process ID**: 7666 (next-server v14.2.28)
- **Port**: 3000
- **Git status**: Active repository with recent commits

### Directory Inventory

#### 1. `/home/ubuntu/code_artifacts/ntaqv2/` ✓ ACTIVE
- **Status**: Currently running and actively maintained
- **Last modified**: Oct 21 10:48 (most recent)
- **Git**: Yes (4 commits including recent fixes)
- **Size**: Full Next.js app with all dependencies
- **Purpose**: Main working version

#### 2. `/home/ubuntu/ntaqv2/` ⚠️ LEGACY
- **Status**: Legacy version, not in use
- **Last modified**: Oct 21 10:30
- **Git**: No
- **Notable**: Has `.next` build folder and dev.log
- **Purpose**: Appears to be an older working copy

#### 3. `/home/ubuntu/ntaqv2-final/` ⚠️ LEGACY
- **Status**: Legacy version with git
- **Last modified**: Oct 21 10:03
- **Git**: Yes (initialized but older than code_artifacts)
- **Purpose**: Appears to be an intermediate version

#### 4. `/home/ubuntu/ntaqv2-clean/` ⚠️ LEGACY
- **Status**: Incomplete/partial setup
- **Last modified**: Oct 21 10:00 (oldest)
- **Contents**: Only contains `nextjs_space` subdirectory
- **Purpose**: Appears to be abandoned attempt

#### 5. Root Directory Files ⚠️ LEGACY
- `ntaqv2_app_review.md` (21 KB)
- `ntaqv2_app_review.pdf` (168 KB)
- `ntaqv2_complete_app_review.md` (34 KB)
- `ntaqv2_complete_app_review.pdf` (131 KB)
- **Purpose**: Documentation files that may be outdated

### Analysis: Should the App Be in Root or code_artifacts?

#### DeepAgent Guidelines
According to system guidelines:
- Code artifacts **should** be in `/home/ubuntu/code_artifacts/`
- This is the standard location for DeepAgent to manage code projects
- The `show_code_artifact` tool expects projects in this location

#### Current Best Practice
✅ **CORRECT LOCATION**: `/home/ubuntu/code_artifacts/ntaqv2/`

**Reasons:**
1. Follows DeepAgent's standard directory structure
2. Already has active git repository
3. Contains most recent changes and commits
4. Currently running successfully
5. Easier to manage and version control
6. Separates code projects from system files

#### Why Root Directories Exist
The legacy directories in root appear to be from:
- Previous cloning/setup attempts
- Intermediate versions during troubleshooting
- Manual copies made during debugging
- They are NOT being used by the running application

### Recommendation

#### ✓ KEEP in code_artifacts
The app should **remain** in `/home/ubuntu/code_artifacts/ntaqv2/` because:
- It's the active, maintained version
- Follows DeepAgent conventions
- Has proper version control
- Currently working correctly
- No benefit to moving to root

#### ✗ CLEAN UP Legacy Files
The following should be removed to avoid confusion:
1. `/home/ubuntu/ntaqv2/` - 40+ files, legacy version
2. `/home/ubuntu/ntaqv2-clean/` - incomplete setup
3. `/home/ubuntu/ntaqv2-final/` - older version with git
4. `/home/ubuntu/ntaqv2_*.md` and `*.pdf` - documentation files (move to code_artifacts if needed)

#### Disk Space to Reclaim
Estimated: ~500 MB - 1 GB from legacy directories and node_modules

### Preview Button Issue

The preview button not appearing is **NOT** related to directory location. 

**Actual causes could be:**
1. Missing configuration in DeepAgent UI
2. Port detection issues
3. Need to use specific surfacing methods
4. Framework-specific requirements for Next.js apps
5. Preview feature might need explicit enablement

**The solution is NOT to move the app out of code_artifacts.**

### Action Plan

1. ✅ **Keep app in current location** (`/home/ubuntu/code_artifacts/ntaqv2/`)
2. 🧹 **Clean up legacy directories** (after user confirmation)
3. 📋 **Document the cleanup** (create backup if needed)
4. 🔍 **Investigate preview button separately** (not a directory issue)
5. 📊 **Surface correctly** using `show_code_artifact` tool

### Cleanup Commands (After Confirmation)

```bash
# Create backup archive of legacy directories (just in case)
cd /home/ubuntu
tar -czf ntaqv2_legacy_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  ntaqv2/ ntaqv2-clean/ ntaqv2-final/ \
  ntaqv2_*.md ntaqv2_*.pdf

# Move backup to safe location
mv ntaqv2_legacy_backup_*.tar.gz /home/ubuntu/code_artifacts/

# Remove legacy directories
rm -rf /home/ubuntu/ntaqv2/
rm -rf /home/ubuntu/ntaqv2-clean/
rm -rf /home/ubuntu/ntaqv2-final/

# Remove outdated documentation files
rm /home/ubuntu/ntaqv2_*.md
rm /home/ubuntu/ntaqv2_*.pdf

# Verify cleanup
ls -la /home/ubuntu/ | grep ntaq
```

### Conclusion

**The app is already in the CORRECT location.**

The user's suggestion to "take it out of code_artifacts" would actually:
- ❌ Move it away from the standard location
- ❌ Break DeepAgent conventions
- ❌ Not solve the preview button issue
- ❌ Create more confusion

**Instead, we should:**
- ✅ Keep the app where it is
- ✅ Clean up legacy files
- ✅ Focus on preview button configuration separately

---

**Date**: October 21, 2025
**Investigator**: DeepAgent
**Status**: Investigation Complete
