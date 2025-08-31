import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface CycleInfo {
  files: string[];
  length: number;
  description: string;
}

class DependencyCycleAnalyzer {
  private cycles: CycleInfo[] = [];

  analyze() {
    console.log('🔄 Analyzing dependency cycles...');

    try {
      // Use madge to detect cycles
      const madgeOutput = execSync('npx madge --circular --json frontend/src', {
        encoding: 'utf-8',
        cwd: process.cwd()
      });

      const madgeData = JSON.parse(madgeOutput);
      this.processMadgeOutput(madgeData);

    } catch (error: any) {
      // If madge fails, try alternative approach
      console.warn('Madge failed, trying TypeScript analysis...');
      this.analyzeTypeScriptCycles();
    }

    this.generateReport();
  }

  private processMadgeOutput(madgeData: any) {
    if (madgeData && typeof madgeData === 'object') {
      for (const [file, deps] of Object.entries(madgeData)) {
        if (Array.isArray(deps)) {
          const cycle = this.findCycle(file, deps as string[], madgeData);
          if (cycle && cycle.length > 1) {
            this.cycles.push({
              files: cycle,
              length: cycle.length,
              description: `Cycle detected: ${cycle.join(' → ')}`
            });
          }
        }
      }
    }
  }

  private findCycle(startFile: string, deps: string[], allDeps: any): string[] | null {
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (current: string): string[] | null => {
      if (visited.has(current)) {
        if (path.includes(current)) {
          return path.slice(path.indexOf(current));
        }
        return null;
      }

      visited.add(current);
      path.push(current);

      const currentDeps = allDeps[current] || [];
      for (const dep of currentDeps) {
        const cycle = dfs(dep);
        if (cycle) {
          return cycle;
        }
      }

      path.pop();
      return null;
    };

    return dfs(startFile);
  }

  private analyzeTypeScriptCycles() {
    try {
      // Use tsc to find circular dependencies
      const tscOutput = execSync('npx tsc --noEmit --listFiles', {
        encoding: 'utf-8',
        cwd: join(process.cwd(), 'frontend')
      });

      // Parse TypeScript files and their imports
      const tsFiles = tscOutput
        .split('\n')
        .filter(line => line.endsWith('.ts') || line.endsWith('.tsx'))
        .filter(line => !line.includes('node_modules'));

      for (const file of tsFiles) {
        try {
          const content = readFileSync(file, 'utf-8');
          const imports = this.extractImports(content, file);
          this.checkForCycles(file, imports, tsFiles);
        } catch (e) {
          // Skip files that can't be read
        }
      }
    } catch (error) {
      console.warn('TypeScript analysis also failed:', error);
    }
  }

  private extractImports(content: string, filePath: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const relativePath = filePath.replace(/\\/g, '/').replace(/^.*\/frontend\/src\//, '');

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        // Resolve relative import
        const resolved = this.resolveRelativeImport(relativePath, importPath);
        if (resolved) {
          imports.push(resolved);
        }
      } else if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
        // Resolve alias import
        const resolved = this.resolveAliasImport(importPath);
        if (resolved) {
          imports.push(resolved);
        }
      }
    }

    return imports;
  }

  private resolveRelativeImport(fromPath: string, importPath: string): string | null {
    try {
      const fromDir = fromPath.substring(0, fromPath.lastIndexOf('/'));
      const resolved = join(fromDir, importPath).replace(/\\/g, '/');

      // Normalize path
      const parts = resolved.split('/');
      const normalized: string[] = [];

      for (const part of parts) {
        if (part === '..') {
          normalized.pop();
        } else if (part !== '.' && part !== '') {
          normalized.push(part);
        }
      }

      return normalized.join('/');
    } catch {
      return null;
    }
  }

  private resolveAliasImport(importPath: string): string | null {
    // Common alias patterns
    if (importPath.startsWith('@/')) {
      return importPath.substring(2);
    }
    if (importPath.startsWith('~/')) {
      return importPath.substring(2);
    }
    return null;
  }

  private checkForCycles(file: string, imports: string[], allFiles: string[]) {
    // Simple cycle detection - check if any imported file imports back
    const fileBase = file.replace(/\\/g, '/').replace(/^.*\/frontend\/src\//, '').replace(/\.(ts|tsx)$/, '');

    for (const importPath of imports) {
      try {
        const importFile = allFiles.find(f =>
          f.replace(/\\/g, '/').includes(importPath) &&
          (f.endsWith('.ts') || f.endsWith('.tsx'))
        );

        if (importFile) {
          const importContent = readFileSync(importFile, 'utf-8');
          const importImports = this.extractImports(importContent, importFile);

          // Check if import file imports back to original file
          if (importImports.some(imp =>
            imp.includes(fileBase) ||
            fileBase.includes(imp)
          )) {
            this.cycles.push({
              files: [fileBase, importPath],
              length: 2,
              description: `Bidirectional dependency: ${fileBase} ↔ ${importPath}`
            });
          }
        }
      } catch (e) {
        // Skip problematic files
      }
    }
  }

  private generateReport() {
    const report = this.generateMarkdownReport();

    writeFileSync('AUDIT/raw/cycles.json', JSON.stringify(this.cycles, null, 2));
    writeFileSync('AUDIT/cycles.md', report);

    console.log(`🔄 Found ${this.cycles.length} dependency cycles`);
  }

  private generateMarkdownReport(): string {
    let report = '# Dependency Cycle Analysis\n\n';

    if (this.cycles.length === 0) {
      report += '✅ **No dependency cycles detected**\n\n';
      report += 'This is excellent! Your codebase has clean dependency structure.\n\n';
      return report;
    }

    report += `## Summary\n\n`;
    report += `❌ **${this.cycles.length} dependency cycles detected**\n\n`;
    report += 'Dependency cycles can cause:\n';
    report += '- Tight coupling between modules\n';
    report += '- Difficult testing and mocking\n';
    report += '- Circular import errors\n';
    report += '- Reduced maintainability\n\n';

    report += '## Detected Cycles\n\n';

    for (let i = 0; i < this.cycles.length; i++) {
      const cycle = this.cycles[i];
      report += `### Cycle ${i + 1} (${cycle.length} files)\n\n`;
      report += `**Files:**\n`;
      for (const file of cycle.files) {
        report += `- \`${file}\`\n`;
      }
      report += `\n**Description:** ${cycle.description}\n\n`;

      if (cycle.length === 2) {
        report += '**Fix:** Consider extracting shared logic into a separate module or using dependency injection.\n\n';
      } else {
        report += '**Fix:** Break the cycle by introducing an interface or mediator pattern.\n\n';
      }
    }

    report += '## Recommendations\n\n';
    report += '1. **Extract interfaces** for cyclic dependencies\n';
    report += '2. **Use dependency injection** to break tight coupling\n';
    report += '3. **Introduce mediator patterns** for complex interactions\n';
    report += '4. **Consider module restructuring** to eliminate cycles\n\n';

    return report;
  }
}

// Run analysis
const analyzer = new DependencyCycleAnalyzer();
analyzer.analyze();
