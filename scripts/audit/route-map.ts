import { glob } from 'glob';
import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { join, relative } from 'path';

interface RouteInfo {
  path: string;
  file: string;
  component: string;
  lazy?: boolean;
  guards?: string[];
}

interface RouteAnalysis {
  routes: RouteInfo[];
  totalRoutes: number;
  lazyRoutes: number;
  staticRoutes: number;
  routeGroups: Record<string, RouteInfo[]>;
}

class RouteAnalyzer {
  private routes: RouteInfo[] = [];
  private routePatterns = [
    // React Router patterns
    /createBrowserRouter|createRoutesFromElements/,
    /<Route[^>]*path=["']([^"']+)["'][^>]*>/g,
    /path:\s*["']([^"']+)["']/g,
    // Next.js patterns
    /export\s+default\s+function\s+(\w+)/,
    // File-based routing patterns
    /pages\/.*\/([^/]+\.tsx?)$/,
  ];

  async analyze() {
    console.log('🔍 Analyzing routes...');

    // Find all route-related files
    const routeFiles = await glob('frontend/src/**/*.{ts,tsx}', {
      ignore: ['**/node_modules/**', '**/dist/**']
    });

    for (const file of routeFiles) {
      await this.analyzeFile(file);
    }

    this.generateReport();
  }

  private async analyzeFile(filePath: string) {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const relativePath = relative(process.cwd(), filePath);

      // Check if file contains routing logic
      if (this.isRouteFile(content)) {
        const fileRoutes = this.extractRoutes(content, relativePath);
        this.routes.push(...fileRoutes);
      }
    } catch (error) {
      console.warn(`Could not analyze ${filePath}:`, error);
    }
  }

  private isRouteFile(content: string): boolean {
    return this.routePatterns.some(pattern =>
      pattern.test(content) ||
      content.includes('react-router') ||
      content.includes('next/router') ||
      content.includes('useNavigate') ||
      content.includes('useParams')
    );
  }

  private extractRoutes(content: string, filePath: string): RouteInfo[] {
    const routes: RouteInfo[] = [];

    // Extract React Router routes
    const routeMatches = content.matchAll(/<Route[^>]*path=["']([^"']+)["'][^>]*component=\{([^}]+)\}[^>]*>/g);
    for (const match of routeMatches) {
      routes.push({
        path: match[1],
        file: filePath,
        component: match[2].trim(),
        lazy: content.includes('lazy(')
      });
    }

    // Extract programmatic routes
    const pathMatches = content.matchAll(/path:\s*["']([^"']+)["']/g);
    for (const match of pathMatches) {
      routes.push({
        path: match[1],
        file: filePath,
        component: 'Programmatic Route',
        lazy: content.includes('lazy(')
      });
    }

    // If no explicit routes found but file looks like a page component
    if (routes.length === 0 && (filePath.includes('/pages/') || filePath.includes('/routes/'))) {
      const componentMatch = content.match(/export\s+(?:default\s+)?(?:function|const)\s+(\w+)/);
      if (componentMatch) {
        routes.push({
          path: this.inferPathFromFile(filePath),
          file: filePath,
          component: componentMatch[1],
          lazy: false
        });
      }
    }

    return routes;
  }

  private inferPathFromFile(filePath: string): string {
    // Convert file path to route path
    const relativePath = relative('frontend/src', filePath);
    let path = relativePath
      .replace(/\/pages\//, '/')
      .replace(/\/routes\//, '/')
      .replace(/\.tsx?$/, '')
      .replace(/\/index$/, '/')
      .replace(/^\/+/, '/');

    // Handle dynamic routes
    path = path.replace(/\[([^\]]+)\]/g, ':$1');

    return path || '/';
  }

  private generateReport() {
    const analysis: RouteAnalysis = {
      routes: this.routes,
      totalRoutes: this.routes.length,
      lazyRoutes: this.routes.filter(r => r.lazy).length,
      staticRoutes: this.routes.filter(r => !r.lazy).length,
      routeGroups: this.groupRoutesByFeature()
    };

    // Generate Markdown report
    const report = this.generateMarkdownReport(analysis);

    writeFileSync('AUDIT/raw/routes.json', JSON.stringify(analysis, null, 2));
    writeFileSync('AUDIT/FRONTEND_AUDIT.md', report);

    console.log(`📊 Found ${analysis.totalRoutes} routes`);
    console.log(`   Lazy routes: ${analysis.lazyRoutes}`);
    console.log(`   Static routes: ${analysis.staticRoutes}`);
  }

  private groupRoutesByFeature(): Record<string, RouteInfo[]> {
    const groups: Record<string, RouteInfo[]> = {};

    for (const route of this.routes) {
      const feature = this.extractFeatureFromPath(route.file);
      if (!groups[feature]) {
        groups[feature] = [];
      }
      groups[feature].push(route);
    }

    return groups;
  }

  private extractFeatureFromPath(filePath: string): string {
    const parts = filePath.split('/');
    const featuresIndex = parts.findIndex(p => p === 'features' || p === 'pages' || p === 'widgets');

    if (featuresIndex !== -1 && featuresIndex < parts.length - 1) {
      return parts[featuresIndex + 1];
    }

    return 'shared';
  }

  private generateMarkdownReport(analysis: RouteAnalysis): string {
    let report = '# Frontend Route Analysis\n\n';

    report += `## Summary\n\n`;
    report += `- **Total Routes**: ${analysis.totalRoutes}\n`;
    report += `- **Lazy Routes**: ${analysis.lazyRoutes}\n`;
    report += `- **Static Routes**: ${analysis.staticRoutes}\n\n`;

    report += `## Route Groups\n\n`;
    for (const [group, routes] of Object.entries(analysis.routeGroups)) {
      report += `### ${group} (${routes.length} routes)\n\n`;
      for (const route of routes) {
        report += `- \`${route.path}\` → ${route.component} (${route.lazy ? 'lazy' : 'static'})\n`;
      }
      report += '\n';
    }

    report += `## Detailed Routes\n\n`;
    report += '| Path | Component | File | Lazy |\n';
    report += '|------|-----------|------|------|\n';

    for (const route of analysis.routes) {
      report += `| \`${route.path}\` | ${route.component} | ${route.file} | ${route.lazy ? '✅' : '❌'} |\n`;
    }

    return report;
  }
}

// Run analysis
const analyzer = new RouteAnalyzer();
analyzer.analyze().catch(console.error);
