import { execSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface PackageInfo {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface WorkspaceNode {
  id: string;
  label: string;
  type: 'workspace' | 'external';
}

interface WorkspaceEdge {
  source: string;
  target: string;
  type: 'workspace' | 'external';
}

class WorkspaceGraphAnalyzer {
  private workspaces: PackageInfo[] = [];
  private workspaceNames: Set<string> = new Set();
  private externalDeps: Map<string, string[]> = new Map();

  analyze() {
    try {
      // Get workspace list
      const workspaceOutput = execSync('pnpm -w list --depth -1 --json', { encoding: 'utf-8' });
      const workspaces = JSON.parse(workspaceOutput);

      // Get workspace info
      for (const ws of workspaces) {
        const pkgPath = join(ws.path, 'package.json');
        try {
          const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
          this.workspaces.push(pkg);
          this.workspaceNames.add(pkg.name);
        } catch (e) {
          console.warn(`Could not read ${pkgPath}`);
        }
      }

      this.analyzeDependencies();
      this.generateGraph();

    } catch (error) {
      console.error('Error analyzing workspaces:', error);
    }
  }

  private analyzeDependencies() {
    for (const pkg of this.workspaces) {
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      for (const [depName, version] of Object.entries(allDeps || {})) {
        if (!this.workspaceNames.has(depName)) {
          // External dependency
          if (!this.externalDeps.has(depName)) {
            this.externalDeps.set(depName, []);
          }
          this.externalDeps.get(depName)!.push(pkg.name);
        }
      }
    }
  }

  private generateGraph() {
    const nodes: WorkspaceNode[] = [];
    const edges: WorkspaceEdge[] = [];

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

    console.log(`Generated graph with ${nodes.length} workspaces and ${edges.length} dependencies`);
    console.log(`External dependencies: ${this.externalDeps.size}`);
  }

  private generateMermaid(nodes: WorkspaceNode[], edges: WorkspaceEdge[]): string {
    let mermaid = 'graph TD\n';

    // Add nodes
    for (const node of nodes) {
      mermaid += `    ${node.id.replace(/[@/-]/g, '_')}["${node.label}"]\n`;
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
