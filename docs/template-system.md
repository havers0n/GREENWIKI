# 🎨 Система шаблонов CMS

## Обзор

Система шаблонов позволяет создавать переиспользуемые макеты страниц и компонентов с возможностью настройки через переменные и контент.

## 🏗️ Архитектура шаблонов

### Типы шаблонов

```typescript
enum TemplateType {
  PAGE = 'page',           // Полностраничный шаблон
  LAYOUT = 'layout',       // Макет с областями для контента
  COMPONENT = 'component', // Переиспользуемый компонент
  PARTIAL = 'partial',     // Частичное представление
  EMAIL = 'email',         // Шаблон email
  THEME = 'theme'          // Полная тема сайта
}
```

### Структура шаблона

```typescript
interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description?: string;

  // Метаданные
  version: string;
  author: string;
  tags: string[];

  // Содержимое
  content: string;          // Основной контент шаблона
  styles?: string;          // CSS стили
  scripts?: string;         // JavaScript код

  // Переменные и настройки
  variables: TemplateVariable[];
  settings: TemplateSettings;

  // Области контента (для layout шаблонов)
  regions: TemplateRegion[];

  // Зависимости
  dependencies: TemplateDependency[];
}
```

## 🎯 Создание и использование шаблонов

### 1. **Базовый шаблон страницы**

```html
<!-- templates/page-basic.html -->
<!DOCTYPE html>
<html lang="{{ language }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ page.title }}</title>
    <style>{{ styles }}</style>
</head>
<body>
    <header>
        <nav>{{ navigation }}</nav>
    </header>

    <main>
        <h1>{{ page.title }}</h1>
        <div>{{ page.content }}</div>
    </main>

    <footer>
        <p>{{ site.footer_text }}</p>
    </footer>

    <script>{{ scripts }}</script>
</body>
</html>
```

### 2. **Шаблон с областями (Layout)**

```html
<!-- templates/layout-blog.html -->
<div class="blog-layout">
    <aside class="sidebar">
        {{ region.sidebar }}
    </aside>

    <main class="content">
        <article>
            <header>
                {{ region.header }}
            </header>

            <div class="post-content">
                {{ region.content }}
            </div>

            <footer>
                {{ region.footer }}
            </footer>
        </article>
    </main>
</div>
```

### 3. **Компонент-шаблон**

```html
<!-- components/card.html -->
<div class="card {{ variant }}">
    {% if image %}
        <img src="{{ image }}" alt="{{ title }}" class="card-image">
    {% endif %}

    <div class="card-content">
        <h3 class="card-title">{{ title }}</h3>

        {% if subtitle %}
            <p class="card-subtitle">{{ subtitle }}</p>
        {% endif %}

        <div class="card-text">{{ content }}</div>

        {% if actions %}
            <div class="card-actions">
                {{ actions }}
            </div>
        {% endif %}
    </div>
</div>
```

## 🔧 Template Engine

### Переменные и контекст

```typescript
interface RenderContext {
  // Системные переменные
  site: {
    name: string;
    url: string;
    language: string;
    theme: string;
  };

  // Переменные страницы
  page: {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    created_at: string;
    updated_at: string;
  };

  // Пользовательские переменные
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };

  // Дополнительный контекст
  [key: string]: any;
}
```

### Template Functions

```typescript
class TemplateEngine {
  // Рендеринг шаблона
  render(template: Template, context: RenderContext): string

  // Регистрация хелперов
  registerHelper(name: string, helper: Function): void

  // Компиляция шаблона
  compile(template: string): CompiledTemplate

  // Кеширование скомпилированных шаблонов
  getCache(): TemplateCache
}
```

### Встроенные хелперы

```javascript
// Условные операторы
{{#if user.is_admin}}
  <div>Admin panel</div>
{{/if}}

// Циклы
{{#each posts}}
  <article>{{ this.title }}</article>
{{/each}}

// Форматирование
{{format_date page.created_at 'DD.MM.YYYY'}}
{{truncate page.content 150}}

// URL генерация
{{url 'page' page.slug}}
{{asset 'css/main.css'}}
```

## 🎨 Темы и стилизация

### Структура темы

```
themes/
├── default/
│   ├── templates/
│   │   ├── page.html
│   │   ├── layout.html
│   │   └── components/
│   ├── styles/
│   │   ├── main.css
│   │   ├── components.css
│   │   └── variables.css
│   ├── scripts/
│   │   ├── main.js
│   │   └── components.js
│   ├── assets/
│   │   ├── images/
│   │   └── fonts/
│   └── theme.json
```

### Конфигурация темы

```json
{
  "name": "Default Theme",
  "version": "1.0.0",
  "author": "CMS Team",
  "description": "Базовая тема CMS",

  "variables": {
    "primary_color": "#007bff",
    "secondary_color": "#6c757d",
    "font_family": "'Inter', sans-serif",
    "font_size_base": "16px"
  },

  "regions": {
    "header": {
      "name": "Шапка сайта",
      "multiple": false
    },
    "content": {
      "name": "Основной контент",
      "multiple": true
    },
    "sidebar": {
      "name": "Боковая панель",
      "multiple": true
    },
    "footer": {
      "name": "Подвал сайта",
      "multiple": false
    }
  },

  "templates": {
    "page": "templates/page.html",
    "post": "templates/post.html",
    "archive": "templates/archive.html"
  }
}
```

## 🔄 Рабочий процесс шаблонов

### 1. **Создание шаблона**

```typescript
const template = await templateService.create({
  name: 'Blog Post',
  type: TemplateType.PAGE,
  content: blogPostTemplate,
  variables: [
    { name: 'title', type: 'string', required: true },
    { name: 'content', type: 'html', required: true },
    { name: 'author', type: 'string', required: false }
  ]
});
```

### 2. **Применение шаблона к контенту**

```typescript
const renderedPage = await templateEngine.render(template, {
  page: {
    title: 'Мой первый пост',
    content: '<p>Содержимое поста...</p>',
    author: 'Иван Иванов'
  },
  site: {
    name: 'Мой блог',
    url: 'https://myblog.com'
  }
});
```

### 3. **Наследование шаблонов**

```typescript
// Базовый шаблон
const baseTemplate = {
  content: `
    <html>
      <head><title>{{ page.title }}</title></head>
      <body>
        {{ content }}
      </body>
    </html>
  `
};

// Дочерний шаблон
const blogTemplate = {
  extends: 'base',
  content: `
    {{> base }}
    {{#content}}
      <article>
        <h1>{{ page.title }}</h1>
        <div>{{ page.content }}</div>
      </article>
    {{/content}}
  `
};
```

## 🎯 Продвинутые возможности

### 1. **Условные блоки**

```html
{{#if page.featured_image}}
  <div class="hero-image">
    <img src="{{ page.featured_image }}" alt="{{ page.title }}">
  </div>
{{/if}}

{{#unless page.is_draft}}
  <div class="published-date">{{ page.published_at }}</div>
{{/unless}}
```

### 2. **Частичные шаблоны**

```html
<!-- partials/header.html -->
<header>
  <nav>
    <ul>
      {{#each navigation}}
        <li><a href="{{ url }}">{{ title }}</a></li>
      {{/each}}
    </ul>
  </nav>
</header>

<!-- В основном шаблоне -->
{{> header navigation=site.navigation }}
```

### 3. **Ассинхронные хелперы**

```javascript
// Регистрация асинхронного хелпера
templateEngine.registerHelper('fetch_related_posts', async function(category, options) {
  const posts = await api.getPostsByCategory(category);
  return options.fn(posts);
});

// Использование в шаблоне
{{#fetch_related_posts page.category}}
  {{#each this}}
    <article>{{ title }}</article>
  {{/each}}
{{/fetch_related_posts}}
```

## 🔍 Отладка и разработка

### Template Debugger

```typescript
// Включение режима отладки
templateEngine.setDebugMode(true);

// Получение информации о рендеринге
const debugInfo = templateEngine.renderWithDebug(template, context);

console.log('Render time:', debugInfo.renderTime);
console.log('Used variables:', debugInfo.usedVariables);
console.log('Missing variables:', debugInfo.missingVariables);
```

### Template Validator

```typescript
// Проверка синтаксиса шаблона
const validation = templateEngine.validate(template);

if (!validation.valid) {
  console.log('Errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
}
```

## 🚀 Оптимизация производительности

### 1. **Кеширование скомпилированных шаблонов**

```typescript
class TemplateCache {
  private cache = new Map<string, CompiledTemplate>();

  get(key: string): CompiledTemplate | null {
    return this.cache.get(key) || null;
  }

  set(key: string, template: CompiledTemplate): void {
    this.cache.set(key, template);
  }

  invalidate(pattern: string): void {
    // Очистка кеша по паттерну
  }
}
```

### 2. **Lazy loading шаблонов**

```typescript
// Загрузка шаблонов по требованию
const templateLoader = {
  async load(templateId: string): Promise<Template> {
    if (this.cache.has(templateId)) {
      return this.cache.get(templateId);
    }

    const template = await api.loadTemplate(templateId);
    this.cache.set(templateId, template);
    return template;
  }
};
```

### 3. **Template precompilation**

```typescript
// Предварительная компиляция часто используемых шаблонов
const precompiledTemplates = {
  'page-basic': compiledBasicTemplate,
  'component-card': compiledCardTemplate,
  'layout-blog': compiledBlogLayout
};
```

## 📚 Примеры использования

### Блог

```html
<!-- templates/blog-post.html -->
<article class="blog-post">
  <header>
    <h1>{{ page.title }}</h1>
    <div class="meta">
      <span>Автор: {{ page.author }}</span>
      <span>Дата: {{ format_date page.created_at }}</span>
      {{#if page.tags}}
        <div class="tags">
          {{#each page.tags}}
            <span class="tag">{{ this }}</span>
          {{/each}}
        </div>
      {{/if}}
    </div>
  </header>

  {{#if page.featured_image}}
    <img src="{{ page.featured_image }}" alt="{{ page.title }}" class="featured-image">
  {{/if}}

  <div class="content">
    {{ page.content }}
  </div>

  {{#if related_posts}}
    <section class="related-posts">
      <h2>Похожие статьи</h2>
      {{#each related_posts}}
        <article class="related-post">
          <h3><a href="{{ url }}">{{ title }}</a></h3>
          <p>{{ truncate excerpt 100 }}</p>
        </article>
      {{/each}}
    </section>
  {{/if}}
</article>
```

### E-commerce

```html
<!-- templates/product-page.html -->
<div class="product-page">
  <div class="product-gallery">
    {{#each product.images}}
      <img src="{{ this.url }}" alt="{{ this.alt }}">
    {{/each}}
  </div>

  <div class="product-info">
    <h1>{{ product.name }}</h1>
    <div class="price">{{ format_price product.price }}</div>

    {{#if product.discount}}
      <div class="discount">
        Скидка: {{ product.discount }}%
        <div class="old-price">{{ format_price product.original_price }}</div>
      </div>
    {{/if}}

    <div class="description">{{ product.description }}</div>

    <form class="add-to-cart">
      <input type="number" name="quantity" value="1" min="1">
      <button type="submit">Добавить в корзину</button>
    </form>
  </div>
</div>
```

---

Система шаблонов предоставляет мощный и гибкий способ создания и управления контентом, позволяя разработчикам и дизайнерам работать независимо и эффективно.
