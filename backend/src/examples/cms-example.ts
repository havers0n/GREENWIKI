import { createCMSEngine, CMSEngine } from '../core/engine/CMSEngine';
import { ExamplePlugin } from '../core/PluginManager';

// Example of how to use the CMS Engine
export async function runCMSExample() {
  console.log('🚀 Starting CMS Engine Example...\n');

  // 1. Configure the CMS Engine
  const cmsConfig = {
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/my_forum',
      schema: 'public'
    },
    cache: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: 300 // 5 minutes
    },
    plugins: {
      enabled: ['example-plugin'],
      autoLoad: true
    },
    security: {
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: '24h',
      bcryptRounds: 12
    }
  };

  // 2. Create and initialize the CMS Engine
  const cms = createCMSEngine(cmsConfig);

  try {
    // 3. Register example plugin
    const examplePlugin = new ExamplePlugin();
    await cms.plugins.register(examplePlugin);

    // 4. Initialize the engine
    await cms.initialize();

    // 5. Create a test user
    console.log('\n👤 Creating test user...');
    const testUser = await cms.users.create({
      email: 'admin@example.com',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: 'securePassword123!',
      role: 'admin'
    });
    console.log('✅ User created:', testUser.email);

    // 6. Authenticate user
    console.log('\n🔐 Authenticating user...');
    const authResult = await cms.users.authenticate('admin@example.com', 'securePassword123!');
    if (authResult) {
      console.log('✅ User authenticated:', authResult.user.email);
      console.log('🔑 Token generated:', authResult.token.substring(0, 20) + '...');
    }

    // 7. Create a test template
    console.log('\n📄 Creating test template...');
    const testTemplate = await cms.templates.create({
      name: 'page-template',
      description: 'Basic page template',
      type: 'page',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <title>{{content.title}}</title>
        </head>
        <body>
          <header>
            <h1>{{content.title}}</h1>
          </header>
          <main>
            <div>{{content.body}}</div>
          </main>
          <footer>
            <p>Generated at: {{timestamp}}</p>
          </footer>
        </body>
        </html>
      `,
      variables: [
        {
          name: 'content',
          type: 'object',
          required: true,
          description: 'Page content data'
        }
      ]
    });
    console.log('✅ Template created:', testTemplate.name);

    // 8. Create test content
    console.log('\n📝 Creating test content...');
    const context = cms.createContext(testUser.id);

    const testContent = await cms.content.create({
      type: 'page',
      title: 'Welcome Page',
      slug: 'welcome',
      content: {
        title: 'Welcome to Our CMS',
        body: '<p>This is a sample page created with our CMS Engine.</p>'
      },
      authorId: testUser.id
    });
    console.log('✅ Content created:', testContent.title);

    // 9. Render template with content
    console.log('\n🎨 Rendering template...');
    const renderedHtml = await cms.templates.render(testTemplate.id, {
      content: testContent.content,
      user: { name: testUser.firstName },
      site: { name: 'My Forum CMS' }
    });
    console.log('✅ Template rendered successfully');

    // 10. Test API endpoints
    console.log('\n📡 Testing API endpoints...');
    const apiRequest = {
      method: 'GET',
      url: '/api/content',
      headers: { 'Content-Type': 'application/json' },
      query: { limit: '10', offset: '0' },
      userId: testUser.id
    };

    const apiResponse = await cms.api.handleRequest(apiRequest);
    console.log('✅ API response:', apiResponse.statusCode);

    // 11. Get CMS status
    console.log('\n📊 Getting CMS status...');
    const status = await cms.getStatus();
    console.log('✅ CMS Status:', {
      initialized: status.initialized,
      cache: status.cache.connected ? 'Connected' : 'Disconnected',
      plugins: status.plugins.loaded,
      uptime: `${Math.round(status.uptime / 1000)}s`
    });

    // 12. List active plugins
    console.log('\n🔌 Active plugins:');
    const activePlugins = cms.plugins.getLoadedPlugins();
    activePlugins.forEach(plugin => {
      console.log(`  - ${plugin.name} v${plugin.version}`);
    });

    // 13. Get recent events
    console.log('\n📋 Recent events:');
    const recentEvents = (cms.events as any).subscriptions || new Map();
    console.log(`  - Total event types: ${recentEvents.size}`);

    console.log('\n🎉 CMS Engine Example completed successfully!');
    console.log('📚 The CMS is ready for production use.');

    return cms;

  } catch (error) {
    console.error('❌ CMS Engine Example failed:', error);
    throw error;
  }
}

// Export for use in other modules
export { runCMSExample };
