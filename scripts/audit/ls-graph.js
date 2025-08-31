const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');

class WorkspaceGraphAnalyzer {
  constructor() {
    this.workspaces = [];
    this.workspaceNames = new Set();
    this.externalDeps = new Map();
  }

  analyze() {
    try {
      console.log('🔍 Analyzing workspace dependencies...');

      // Get workspace list
      const workspaceOutput = execSync('pnpm -w list --depth -1 --json', { encoding: 'utf-8' });
      const workspaces = JSON.parse(workspaceOutput);

      console.log(`Found ${workspaces.length} workspaces`);

      // Get workspace info
      for (const ws of workspaces) {
        const pkgPath = join(ws.path, 'package.json');
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
          this.workspaces.push(pkg);
          this.workspaceNames.add(pkg.name);
          console.log(`  - ${pkg.name}@${pkg.version}`);
        } catch (e) {
          console.warn(`Could not read ${pkgPath}`);
        }
      }

      this.analyzeDependencies();
      this.generateGraph();

    } catch (error) {
      console.error('Error analyzing workspaces:', error.message);
    }
  }

  analyzeDependencies() {
    console.log('\n📦 Analyzing dependencies...');

    for (const pkg of this.workspaces) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [depName, version] of Object.entries(allDeps || {})) {
        if (!this.workspaceNames.has(depName)) {
          if (!this.externalDeps.has(depName)) {
            this.externalDeps.set(depName, []);
          }
          this.externalDeps.get(depName).push(pkg.name);
        }
      }
    }

    console.log(`External dependencies: ${this.externalDeps.size}`);
  }

  generateGraph() {
    const nodes = [];
    const edges = [];

    // Add workspace nodes
    for (const pkg of this.workspaces) {
      nodes.push({
        id: pkg.name,
        label: `${pkg.name}@${pkg.version}`,
        type: 'workspace'
      });
    }

    // Add workspace-to-workspace edges
    for (const pkg of this.workspaces) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const depName of Object.keys(allDeps || {})) {
        if (this.workspaceNames.has(depName)) {
          edges.push({
            source: pkg.name,
            target: depName,
            type: 'workspace'
          });
        }
      }
    }

    // Generate Mermaid graph
    const mermaid = this.generateMermaid(nodes, edges);

    writeFileSync('AUDIT/graphs/packages.mermaid', mermaid);
    writeFileSync('AUDIT/raw/workspaces.json', JSON.stringify({ nodes, edges }, null, 2));

    console.log(`\n✅ Generated graph with ${nodes.length} workspaces and ${edges.length} dependencies`);
  }

  generateMermaid(nodes, edges) {
    let mermaid = 'graph TD\n';

    // Add nodes
    for (const node of nodes) {
      const nodeId = node.id.replace(/[@/-]/g, '_');
      mermaid += `    ${nodeId}["${node.label}"]\n`;
    }

    mermaid += '\n';

    // Add edges
    for (const edge of edges) {
      const sourceId = edge.source.replace(/[@/-]/g, '_');
      const targetId = edge.target.replace(/[@/-]/g, '_');
      mermaid += `    ${sourceId} --> ${targetId}\n`;
    }

    return mermaid;
  }
}

// Run analysis
const analyzer = new WorkspaceGraphAnalyzer();
analyzer.analyze();
