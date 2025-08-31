# Аудит интернационализации (i18n)

## Обзор состояния i18n

### Текущий статус: 🔴 Отсутствует система интернационализации

**Обнаруженные проблемы:**
- 100+ жестко закодированных строк на русском языке
- Отсутствие i18n фреймворка
- Нет поддержки множественного числа
- Проблемы с форматированием дат и чисел
- Отсутствие поддержки RTL языков

## Детальный анализ проблем

### 🔴 Критические проблемы

#### 1. Массовое использование жестко закодированных строк

**Найденные примеры:**

```typescript
// frontend/src/widgets/ComponentShowcase.tsx
<CategoryCard
  title="Серверы"
  description="Список всех серверов Majestic RP"
/>

// frontend/src/widgets/ContextualInspector/index.tsx
return { text: 'Опубликован', color: 'text-green-600', icon: '✓' };
return { text: 'Черновик', color: 'text-yellow-600', icon: '○' };

// frontend/src/pages/DnDTestPage.tsx
addTestResult('Начато перетаскивание блока');
addTestResult('Блок отпущен вне зоны сброса');
```

**Количество найденных строк:**
- 50+ строк в `ComponentShowcase.tsx` (демо-данные)
- 20+ строк в `ContextualInspector/index.tsx`
- 15+ строк в `DnDTestPage.tsx`
- 10+ строк в различных компонентах

#### 2. Отсутствие поддержки множественного числа

**Найденные случаи:**

```typescript
// frontend/src/pages/AdminMediaPage.tsx
if (!confirm(`Удалить ${selectedFiles.length} выбранных файлов?`)) return;

// ❌ Проблема - нет правильного склонения
// Правильно должно быть:
// 1 файл, 2 файла, 5 файлов

// frontend/src/widgets/NewLiveEditor/index.tsx
const ok = window.confirm('Вы уверены, что хотите удалить блок и все его дочерние элементы?');
// ❌ Нет учета количества элементов
```

#### 3. Проблемы с форматированием дат и чисел

**Найденные проблемы:**

```typescript
// frontend/src/entities/property/ui/PropertyCard.tsx
{new Intl.NumberFormat('en-US').format(property.price)}$
// ❌ Форматирование цен в американском стиле для русской аудитории

// frontend/src/pages/AdminUsersPage.tsx
new Date(user.lastLoginAt).toLocaleString('ru-RU')
// ✅ Правильно, но нет fallback для других локалей

// frontend/src/widgets/PagesManager.tsx
new Date(p.updated_at).toLocaleString()
// ❌ Нет указания локали - зависит от браузера
```

#### 4. Отсутствие поддержки RTL языков

**Текущая ситуация:**
- Все тексты написаны слева направо
- Нет поддержки арабского, иврита, персидского языков
- CSS не адаптирован для RTL

### 🟡 Предупреждения

#### 1. Демографические данные в коде

```typescript
// frontend/src/widgets/ComponentShowcase.tsx
{
  id: '1',
  name: 'Дом #1554',
  price: 9500000,
  residents: 15,
  garageSpaces: 15
}
// Эти данные должны быть извлечены в отдельные файлы локализации
```

#### 2. Жестко закодированные категории и фильтры

```typescript
// frontend/src/widgets/ComponentShowcase.tsx
<FilterTabs options={['Все', 'Дома', 'Квартиры', 'Офисы', 'Склады']} />

// Эти категории должны быть в словаре локализации
```

## Рекомендации по внедрению i18n

### P0 (Критично - немедленная реализация):

#### 1. Выбор и внедрение i18n фреймворка

**Рекомендуемые варианты:**

```typescript
// Вариант 1: react-i18next (рекомендуется)
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('welcome.message')}</div>;
};

// Вариант 2: next-intl (для Next.js проектов)
// Вариант 3: formatjs (для enterprise решений)
```

#### 2. Создание структуры файлов локализации

```
frontend/src/
├── i18n/
│   ├── locales/
│   │   ├── ru.json
│   │   ├── en.json
│   │   └── de.json
│   ├── index.ts
│   └── types.ts
```

#### 3. Создание базового словаря

```json
// ru.json
{
  "common": {
    "save": "Сохранить",
    "cancel": "Отмена",
    "delete": "Удалить",
    "edit": "Редактировать",
    "add": "Добавить",
    "loading": "Загрузка...",
    "error": "Ошибка",
    "success": "Успешно"
  },
  "blocks": {
    "heading": "Заголовок",
    "text": "Текст",
    "image": "Изображение",
    "button": "Кнопка"
  },
  "status": {
    "published": "Опубликован",
    "draft": "Черновик"
  }
}

// en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "add": "Add",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  }
}
```

### P1 (Важно - в ближайшие 2 недели):

#### 1. Внедрение поддержки множественного числа

```typescript
// ru.json
{
  "files": {
    "one": "{{count}} файл",
    "few": "{{count}} файла",
    "many": "{{count}} файлов"
  }
}

// Использование
const { t } = useTranslation();
t('files', { count: fileCount });
```

#### 2. Форматирование дат и чисел

```typescript
// Внедрение Intl API с fallback
const formatDate = (date: Date, locale: string = 'ru-RU') => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
};

const formatPrice = (price: number, locale: string = 'ru-RU') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'RUB'
  }).format(price);
};
```

#### 3. Создание i18n хука для компонентов

```typescript
// hooks/useI18n.ts
export const useI18n = () => {
  const { t, i18n } = useTranslation();

  const formatDate = useCallback((date: Date) => {
    return new Intl.DateTimeFormat(i18n.language).format(date);
  }, [i18n.language]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat(i18n.language).format(num);
  }, [i18n.language]);

  return { t, formatDate, formatNumber, locale: i18n.language };
};
```

### P2 (Оптимизация - в ближайший месяц):

#### 1. Поддержка RTL языков

```typescript
// i18n/index.ts
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'ru',
    fallbackLng: 'en',
    supportedLngs: ['ru', 'en', 'ar', 'he'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    }
  });

// CSS для RTL
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
```

#### 2. Ленивая загрузка локалей

```typescript
// Ленивый импорт словарей
const loadLocale = async (locale: string) => {
  const messages = await import(`./locales/${locale}.json`);
  return messages.default;
};
```

#### 3. Интеграция с CMS

```typescript
// API для получения переводов из БД
const fetchTranslations = async (locale: string) => {
  const response = await api.get(`/api/translations/${locale}`);
  return response.data;
};
```

## Метрики интернационализации

### Целевые показатели:

- **Coverage:** Минимум 95% строк должны быть переведены
- **Languages:** Поддержка 3+ языков (RU, EN, DE)
- **Pluralization:** Правильное склонение во всех поддерживаемых языках
- **RTL:** Поддержка 1+ RTL языка
- **Performance:** Время загрузки переводов < 100ms

### Текущие показатели:

- **Coverage:** 0% (нет системы i18n)
- **Hardcoded strings:** 100+ строк на русском
- **Languages:** 1 (русский, жестко закодирован)
- **Pluralization:** Отсутствует
- **RTL:** Не поддерживается

## Инструменты для i18n

### Рекомендуемые инструменты:

1. **react-i18next** - основная библиотека
2. **i18next-browser-languagedetector** - автоопределение языка
3. **i18next-http-backend** - загрузка переводов
4. **Lingui** - CLI для извлечения строк
5. **Crowdin/Transifex** - платформы для переводов

### Автоматизированные инструменты:

```bash
# Извлечение строк для перевода
npx lingui extract

# Проверка на непереведенные строки
npx lingui compile --strict

# Валидация JSON файлов переводов
npx lingui validate
```

## План внедрения

### Фаза 1: Базовая настройка (1 неделя)
1. Установить react-i18next
2. Создать базовую структуру файлов
3. Извлечь наиболее критичные строки (навигация, кнопки, ошибки)

### Фаза 2: Расширение покрытия (2 недели)
1. Добавить поддержку множественного числа
2. Внедрить правильное форматирование дат/чисел
3. Перевести основные компоненты (формы, таблицы, модальные окна)

### Фаза 3: Продвинутая функциональность (1 месяц)
1. Добавить поддержку RTL
2. Интегрировать с CMS для редактирования переводов
3. Внедрить автоматизированное тестирование переводов

### Фаза 4: Оптимизация (постоянно)
1. Мониторинг покрытия переводов
2. Оптимизация производительности
3. Добавление новых языков по запросу

## Заключение

**Текущий статус i18n:** 🔴 Полное отсутствие системы интернационализации

**Основные проблемы:**
- 100+ жестко закодированных строк на русском
- Отсутствие инфраструктуры для переводов
- Нет поддержки множественного числа
- Проблемы с форматированием дат и чисел

**Рекомендуемый план действий:**
1. **Неделя 1:** Внедрить базовую систему i18n и перевести критически важные строки
2. **Неделя 2:** Добавить поддержку множественного числа и правильное форматирование
3. **Месяц 1:** Расширить покрытие и добавить поддержку дополнительных языков

**Ожидаемый результат:**
- Полная готовность к международной аудитории
- Улучшение SEO для разных языков
- Возможность быстрого добавления новых языков
- Соответствие требованиям глобальных проектов
