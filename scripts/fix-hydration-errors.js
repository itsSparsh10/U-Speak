const fs = require('fs');
const path = require('path');

// Files that need hydration fixes
const filesToFix = [
  'app/dashboard/page.tsx',
  'app/learning-lessons/page.tsx',
  'app/users/page.tsx',
  'components/dashboard/pending-assignments.tsx',
  'components/dashboard/top-low-performing-videos.tsx',
  'components/videos/video-report.tsx',
  'components/videos/video-list.tsx'
];

// Patterns to replace
const patterns = [
  {
    // Replace new Date().toLocaleDateString() with useFormattedDate hook
    find: /new Date\(([^)]+)\)\.toLocaleDateString\(\)/g,
    replace: (match, dateVar) => `useFormattedDate(${dateVar})`
  },
  {
    // Replace new Date().toLocaleDateString() with formatDate utility
    find: /new Date\(([^)]+)\)\.toLocaleDateString\(/g,
    replace: (match, dateVar) => `formatDate(${dateVar}, `
  },
  {
    // Add imports for useFormattedDate and formatDate
    find: /import.*from.*['"]@\/lib\/utils['"];?/g,
    replace: `import { cn, formatDate, useFormattedDate } from '@/lib/utils';`
  },
  {
    // Add useState and useEffect imports if not present
    find: /import.*useState.*from.*['"]react['"];?/g,
    replace: `import { useState, useEffect } from 'react';`
  }
];

function fixHydrationErrors() {
  filesToFix.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Apply patterns
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.find, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });

    // Add imports if needed
    if (!content.includes('useFormattedDate') && content.includes('toLocaleDateString')) {
      if (content.includes("from '@/lib/utils'")) {
        content = content.replace(
          /import.*from.*['"]@\/lib\/utils['"];?/g,
          `import { cn, formatDate, useFormattedDate } from '@/lib/utils';`
        );
      } else {
        content = content.replace(
          /import.*from.*['"]react['"];?/g,
          `import { useState, useEffect } from 'react';\nimport { formatDate, useFormattedDate } from '@/lib/utils';`
        );
      }
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed hydration errors in: ${filePath}`);
    } else {
      console.log(`No changes needed in: ${filePath}`);
    }
  });
}

fixHydrationErrors(); 