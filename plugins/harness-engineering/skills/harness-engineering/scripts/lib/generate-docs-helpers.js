/**
 * Helper functions for generate-docs.js.
 *
 * Extracts JSDoc descriptions, export names, builds directory trees,
 * and collects module index data from source files.
 */

const fs = require('node:fs');
const path = require('node:path');

const SKIP_DIRS = new Set(['node_modules', '.git', 'coverage', 'dist', 'build', 'fixtures']);

// ---------------------------------------------------------------------------
// JSDoc & Export Extraction
// ---------------------------------------------------------------------------

/**
 * Extract the first description line from a file's JSDoc comment.
 * @param {string} filePath - Absolute path to a .js or .ts file
 * @returns {string} Description text, or empty string
 */
function extractJSDocDescription(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }

  // Skip if file has no JSDoc/TSDoc comment in first 500 chars
  const preview = content.slice(0, 500);
  if (!preview.includes('/**')) {
    return '';
  }

  // Single-line: /** desc */
  const singleLine = content.match(/^\/\*\*\s+(.+?)\s*\*\//m);
  if (singleLine) {
    return singleLine[1].replace(/\s*\*\/$/, '').trim();
  }

  // Multi-line: first non-empty line after /**
  const multiLine = content.match(/^\/\*\*\s*\n([\s\S]*?)\*\//m);
  if (multiLine) {
    const lines = multiLine[1].split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/^\s*\*\s?/, '').trim();
      if (cleaned && !cleaned.startsWith('@')) {
        return cleaned;
      }
    }
  }
  return '';
}

/**
 * Extract exported names from a module (capped at 5).
 * Reads CommonJS (`module.exports`, `exports.name`) and ES modules (`export function`, `export const`).
 * @param {string} filePath - Absolute path to a .js or .ts file
 * @returns {string[]} Array of export names (max 5)
 */
function extractExports(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  const names = new Set();

  // module.exports = { name1, name2, ... }
  const objMatch = content.match(/module\.exports\s*=\s*\{([^}]*)\}/s);
  if (objMatch) {
    const body = objMatch[1];
    const keyRe = /\b([a-zA-Z_$][\w$]*)\b(?:\s*[,:}\n]|\s*$)/g;
    let m;
    while ((m = keyRe.exec(body)) !== null) {
      names.add(m[1]);
    }
  }

  // exports.name = ...
  const namedRe = /exports\.([a-zA-Z_$][\w$]*)\s*=/g;
  let m;
  while ((m = namedRe.exec(content)) !== null) {
    names.add(m[1]);
  }

  // ES modules: export function/const/class/interface/type
  const esExportRe = /export\s+(?:async\s+)?function\s+([a-zA-Z_$][\w$]*)/g;
  while ((m = esExportRe.exec(content)) !== null) {
    names.add(m[1]);
  }

  const esConstRe = /export\s+(?:const|let|var)\s+([a-zA-Z_$][\w$]*)/g;
  while ((m = esConstRe.exec(content)) !== null) {
    names.add(m[1]);
  }

  const esClassRe = /export\s+class\s+([a-zA-Z_$][\w$]*)/g;
  while ((m = esClassRe.exec(content)) !== null) {
    names.add(m[1]);
  }

  const esTypeRe = /export\s+(?:type|interface)\s+([a-zA-Z_$][\w$]*)/g;
  while ((m = esTypeRe.exec(content)) !== null) {
    names.add(m[1]);
  }

  // export { name1, name2 }
  const esNamedExportRe = /export\s*\{([^}]+)\}/g;
  while ((m = esNamedExportRe.exec(content)) !== null) {
    const exports = m[1].split(',').map(e => e.trim().split(' as ')[0].trim());
    for (const exp of exports) {
      if (exp && /^[a-zA-Z_$][\w$]*$/.test(exp)) {
        names.add(exp);
      }
    }
  }

  // default export
  if (/export\s+default\s+(?:class|function|const|let|var)/.test(content)) {
    names.add('default');
  }

  return [...names].slice(0, 5);
}

// ---------------------------------------------------------------------------
// Directory Tree Builder
// ---------------------------------------------------------------------------

/**
 * Build an ASCII directory tree with JSDoc annotations.
 * @param {string} rootDir - Project root directory
 * @param {string[]} dirs - Top-level directories to include (e.g. ['src/', 'bin/'])
 * @returns {string} ASCII tree string
 */
function buildDirectoryTree(rootDir, dirs) {
  const lines = [];
  for (const dir of dirs) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    lines.push(dir);
    buildTreeRecursive(fullPath, '', lines);
  }
  return lines.join('\n');
}

/**
 * Recursively build tree lines for a directory.
 * @param {string} dirPath - Directory to scan
 * @param {string} prefix - Line prefix for indentation
 * @param {string[]} lines - Accumulator for output lines
 */
function buildTreeRecursive(dirPath, prefix, lines) {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  entries = entries.filter(e => {
    if (e.name.startsWith('.')) {
      return false;
    }
    if (e.isDirectory() && SKIP_DIRS.has(e.name)) {
      return false;
    }
    return true;
  });

  const sortedDirs = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const sortedFiles = entries.filter(e => e.isFile()).sort((a, b) => a.name.localeCompare(b.name));
  const sorted = [...sortedDirs, ...sortedFiles];

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const isLast = i === sorted.length - 1;
    const connector = isLast ? '\u2514\u2500\u2500 ' : '\u251c\u2500\u2500 ';
    const childPrefix = isLast ? '    ' : '\u2502   ';

    if (entry.isDirectory()) {
      lines.push(`${prefix}${connector}${entry.name}/`);
      buildTreeRecursive(path.join(dirPath, entry.name), prefix + childPrefix, lines);
    } else {
      let annotation = '';
      if (entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
        const desc = extractJSDocDescription(path.join(dirPath, entry.name));
        if (desc) {
          annotation = `  # ${desc}`;
        }
      }
      lines.push(`${prefix}${connector}${entry.name}${annotation}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Module Index Builder
// ---------------------------------------------------------------------------

/**
 * Build a markdown table of src/ modules with JSDoc descriptions and exports.
 * @param {string} rootDir - Project root directory
 * @returns {string} Markdown table
 */
function buildModuleIndex(rootDir) {
  const srcDir = path.join(rootDir, 'src');
  const rows = [];
  collectModules(srcDir, rows);

  const header = '| Module | Purpose | Key Exports |';
  const sep = '|--------|---------|-------------|';
  const dataRows = rows.map(r => `| \`${r.module}\` | ${r.purpose} | ${r.exports} |`);
  return [header, sep, ...dataRows].join('\n');
}

/**
 * Recursively collect module info from a src/ directory.
 * @param {string} dirPath - Directory to scan
 * @param {Array<{module: string, purpose: string, exports: string}>} rows - Accumulator
 * @param {string} [relPrefix=''] - Relative path prefix for nested dirs
 */
function collectModules(dirPath, rows, relPrefix = '') {
  let entries;
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  const sortedDirs = entries.filter(e => e.isDirectory() && !SKIP_DIRS.has(e.name) && !e.name.startsWith('.'))
    .sort((a, b) => a.name.localeCompare(b.name));
  const sortedFiles = entries.filter(e => e.isFile() && (e.name.endsWith('.js') || e.name.endsWith('.ts')))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const file of sortedFiles) {
    const fullPath = path.join(dirPath, file.name);
    const modulePath = relPrefix ? `${relPrefix}/${file.name}` : file.name;
    const desc = extractJSDocDescription(fullPath);
    const exps = extractExports(fullPath);
    rows.push({
      module: modulePath,
      purpose: desc || '',
      exports: exps.map(e => `\`${e}()\``).join(', '),
    });
  }

  for (const dir of sortedDirs) {
    collectModules(path.join(dirPath, dir.name), rows, relPrefix ? `${relPrefix}/${dir.name}` : dir.name);
  }
}

module.exports = {
  SKIP_DIRS,
  extractJSDocDescription,
  extractExports,
  buildDirectoryTree,
  buildModuleIndex,
};