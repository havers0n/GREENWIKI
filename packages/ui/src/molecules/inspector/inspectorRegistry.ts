import type { InspectorRegistry } from './types';

/**
 * Централизованный реестр конфигураций для ContextualInspector
 * Каждый блок определяет свою конфигурацию инспектора декларативно
 */
export const inspectorRegistry: InspectorRegistry = {
  // Конфигурация для блока заголовка
  heading: [
    {
      title: 'Содержимое',
      icon: '📝',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'text',
          label: 'Текст заголовка',
          required: true,
          hint: 'Введите текст заголовка',
          placeholder: 'Мой заголовок',
        },
        {
          type: 'Select',
          propName: 'level',
          label: 'Уровень заголовка',
          options: [
            { value: 'h1', label: 'H1' },
            { value: 'h2', label: 'H2' },
            { value: 'h3', label: 'H3' },
            { value: 'h4', label: 'H4' },
            { value: 'h5', label: 'H5' },
            { value: 'h6', label: 'H6' },
          ],
        },
        {
          type: 'Input',
          propName: 'id',
          label: 'ID элемента',
          hint: 'Уникальный идентификатор для ссылки',
          placeholder: 'my-heading',
        },
      ],
    },
    {
      title: 'Стиль текста',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'EnhancedColorPicker',
          propName: 'color',
          label: 'Цвет текста',
          hint: 'Выберите цвет текста',
          presets: ['#000000', '#333333', '#666666', '#999999', '#ffffff'],
        },
        {
          type: 'AlignmentControl',
          propName: 'alignment',
          label: 'Выравнивание',
          size: 'sm',
        },
        {
          type: 'Input',
          propName: 'fontSize',
          label: 'Размер шрифта',
          placeholder: '16px',
          hint: 'Например: 16px, 1.25rem, large',
        },
        {
          type: 'Select',
          propName: 'fontWeight',
          label: 'Насыщенность шрифта',
          options: [
            { value: 'normal', label: 'Обычный' },
            { value: '500', label: 'Средний' },
            { value: '600', label: 'Полужирный' },
            { value: '700', label: 'Жирный' },
            { value: '800', label: 'Очень жирный' },
            { value: '900', label: 'Самый жирный' },
          ],
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока кнопки
  single_button: [
    {
      title: 'Содержимое',
      icon: '🔘',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'text',
          label: 'Текст кнопки',
          required: true,
          hint: 'Текст, который будет отображаться на кнопке',
          placeholder: 'Нажми меня',
        },
        {
          type: 'Input',
          propName: 'href',
          label: 'Ссылка',
          hint: 'URL для перехода при нажатии',
          placeholder: 'https://example.com',
        },
        {
          type: 'Select',
          propName: 'target',
          label: 'Цель ссылки',
          options: [
            { value: '_self', label: 'В том же окне' },
            { value: '_blank', label: 'В новом окне' },
            { value: '_parent', label: 'В родительском фрейме' },
            { value: '_top', label: 'Во всем окне' },
          ],
        },
      ],
    },
    {
      title: 'Внешний вид',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'variant',
          label: 'Стиль кнопки',
          options: [
            { value: 'primary', label: 'Основная' },
            { value: 'secondary', label: 'Вторичная' },
            { value: 'danger', label: 'Опасная' },
            { value: 'ghost', label: 'Призрачная' },
          ],
        },
        {
          type: 'Select',
          propName: 'size',
          label: 'Размер кнопки',
          options: [
            { value: 'xs', label: 'Очень маленькая' },
            { value: 'sm', label: 'Маленькая' },
            { value: 'md', label: 'Средняя' },
            { value: 'lg', label: 'Большая' },
          ],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Основной цвет кнопки',
          presets: ['#007acc', '#28a745', '#dc3545', '#6c757d', '#ffffff'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'textColor',
          label: 'Цвет текста',
          hint: 'Цвет текста кнопки',
          presets: ['#ffffff', '#000000', '#007acc', '#28a745'],
        },
      ],
    },
    {
      title: 'Граница и тень',
      icon: '🔳',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
        {
          type: 'ShadowControl',
          propName: 'shadow',
          label: 'Тень',
        },
      ],
    },
    {
      title: 'Размеры и отступы',
      icon: '📐',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'DimensionControl',
          propName: 'dimensions',
          label: 'Размеры кнопки',
          showConstraints: false,
        },
        {
          type: 'SpacingControl',
          propName: 'padding',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока контейнера
  container_section: [
    {
      title: 'Содержимое',
      icon: '📦',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'id',
          label: 'ID контейнера',
          hint: 'Уникальный идентификатор контейнера',
          placeholder: 'my-container',
        },
        {
          type: 'Textarea',
          propName: 'description',
          label: 'Описание',
          hint: 'Комментарий для разработчиков',
          placeholder: 'Описание контейнера...',
          rows: 3,
        },
      ],
    },
    {
      title: 'Макет',
      icon: '📐',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'DimensionControl',
          propName: 'dimensions',
          label: 'Размеры контейнера',
          showConstraints: true,
        },
        {
          type: 'AlignmentControl',
          propName: 'contentAlignment',
          label: 'Выравнивание содержимого',
          size: 'md',
        },
        {
          type: 'Select',
          propName: 'display',
          label: 'Тип отображения',
          options: [
            { value: 'block', label: 'Блок' },
            { value: 'flex', label: 'Flex' },
            { value: 'grid', label: 'Grid' },
            { value: 'inline-block', label: 'Строчный блок' },
          ],
        },
        {
          type: 'Select',
          propName: 'position',
          label: 'Позиционирование',
          options: [
            { value: 'static', label: 'Статическое' },
            { value: 'relative', label: 'Относительное' },
            { value: 'absolute', label: 'Абсолютное' },
            { value: 'fixed', label: 'Фиксированное' },
            { value: 'sticky', label: 'Липкое' },
          ],
        },
      ],
    },
    {
      title: 'Стиль',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет контейнера',
          showAlpha: true,
          presets: ['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', 'transparent'],
        },
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
        {
          type: 'ShadowControl',
          propName: 'shadow',
          label: 'Тень',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'padding',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока текста (paragraph)
  text: [
    {
      title: 'Содержимое',
      icon: '📝',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Textarea',
          propName: 'content',
          label: 'Текст',
          required: true,
          hint: 'Введите текст параграфа',
          placeholder: 'Ваш текст здесь...',
          rows: 4,
        },
      ],
    },
    {
      title: 'Стиль текста',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'EnhancedColorPicker',
          propName: 'color',
          label: 'Цвет текста',
          hint: 'Выберите цвет текста',
          presets: ['#000000', '#333333', '#666666', '#999999', '#ffffff'],
        },
        {
          type: 'Select',
          propName: 'fontSize',
          label: 'Размер шрифта',
          options: [
            { value: 'sm', label: 'Маленький' },
            { value: 'md', label: 'Средний' },
            { value: 'lg', label: 'Большой' },
            { value: 'xl', label: 'Очень большой' },
          ],
        },
        {
          type: 'Select',
          propName: 'fontWeight',
          label: 'Насыщенность',
          options: [
            { value: 'normal', label: 'Обычный' },
            { value: '500', label: 'Средний' },
            { value: '600', label: 'Полужирный' },
            { value: '700', label: 'Жирный' },
          ],
        },
        {
          type: 'Input',
          propName: 'lineHeight',
          label: 'Межстрочный интервал',
          placeholder: '1.5',
          hint: 'Например: 1.2, 1.5, 2.0',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока изображения
  image: [
    {
      title: 'Изображение',
      icon: '🖼️',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'src',
          label: 'URL изображения',
          required: true,
          hint: 'Ссылка на изображение',
          placeholder: 'https://example.com/image.jpg',
        },
        {
          type: 'Input',
          propName: 'alt',
          label: 'Альтернативный текст',
          hint: 'Описание изображения для доступности',
          placeholder: 'Описание изображения',
        },
        {
          type: 'Input',
          propName: 'title',
          label: 'Заголовок',
          hint: 'Текст при наведении курсора',
          placeholder: 'Заголовок изображения',
        },
      ],
    },
    {
      title: 'Размеры',
      icon: '📐',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'DimensionControl',
          propName: 'dimensions',
          label: 'Размеры изображения',
          showConstraints: true,
        },
        {
          type: 'Select',
          propName: 'objectFit',
          label: 'Масштабирование',
          options: [
            { value: 'cover', label: 'Заполнить (cover)' },
            { value: 'contain', label: 'Вместить (contain)' },
            { value: 'fill', label: 'Растянуть (fill)' },
            { value: 'none', label: 'Без масштабирования' },
            { value: 'scale-down', label: 'Масштабировать вниз' },
          ],
        },
      ],
    },
    {
      title: 'Стиль',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
        {
          type: 'ShadowControl',
          propName: 'shadow',
          label: 'Тень',
        },
        {
          type: 'Input',
          propName: 'opacity',
          label: 'Прозрачность',
          placeholder: '1',
          hint: 'Значение от 0 до 1',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока разделителя
  spacer: [
    {
      title: 'Настройки разделителя',
      icon: '📏',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'height',
          label: 'Высота разделителя',
          placeholder: '20px',
          hint: 'Например: 20px, 2rem, 5vh',
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Цвет разделителя',
          showAlpha: true,
          presets: ['transparent', '#f8f9fa', '#e9ecef', '#dee2e6'],
        },
        {
          type: 'Input',
          propName: 'id',
          label: 'ID элемента',
          hint: 'Уникальный идентификатор',
          placeholder: 'spacer-1',
        },
      ],
    },
  ],

  // Конфигурация для блока секции
  section: [
    {
      title: 'Содержимое',
      icon: '📦',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'id',
          label: 'ID секции',
          hint: 'Уникальный идентификатор секции',
          placeholder: 'section-1',
        },
        {
          type: 'Textarea',
          propName: 'description',
          label: 'Описание',
          hint: 'Комментарий для разработчиков',
          placeholder: 'Описание секции...',
          rows: 2,
        },
      ],
    },
    {
      title: 'Макет',
      icon: '📐',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'DimensionControl',
          propName: 'dimensions',
          label: 'Размеры секции',
          showConstraints: true,
        },
        {
          type: 'Select',
          propName: 'display',
          label: 'Тип отображения',
          options: [
            { value: 'block', label: 'Блок' },
            { value: 'flex', label: 'Flex' },
            { value: 'grid', label: 'Grid' },
          ],
        },
        {
          type: 'Select',
          propName: 'alignItems',
          label: 'Выравнивание по вертикали',
          options: [
            { value: 'stretch', label: 'Растянуть' },
            { value: 'flex-start', label: 'Сверху' },
            { value: 'center', label: 'По центру' },
            { value: 'flex-end', label: 'Снизу' },
          ],
        },
        {
          type: 'Select',
          propName: 'justifyContent',
          label: 'Выравнивание по горизонтали',
          options: [
            { value: 'flex-start', label: 'Слева' },
            { value: 'center', label: 'По центру' },
            { value: 'flex-end', label: 'Справа' },
            { value: 'space-between', label: 'Промежутки' },
            { value: 'space-around', label: 'Вокруг' },
          ],
        },
      ],
    },
    {
      title: 'Стиль',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет секции',
          showAlpha: true,
          presets: ['#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', 'transparent'],
        },
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
        {
          type: 'ShadowControl',
          propName: 'shadow',
          label: 'Тень',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'padding',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока иконки
  icon: [
    {
      title: 'Иконка',
      icon: '🔷',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'name',
          label: 'Название иконки',
          required: true,
          hint: 'Название иконки из Lucide (например: heart, star, check)',
          placeholder: 'heart',
        },
        {
          type: 'Input',
          propName: 'size',
          label: 'Размер',
          placeholder: '24',
          hint: 'Размер иконки в пикселях',
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'color',
          label: 'Цвет иконки',
          hint: 'Цвет заливки иконки',
          presets: ['#000000', '#ffffff', '#3b82f6', '#ef4444', '#10b981'],
        },
        {
          type: 'Input',
          propName: 'strokeWidth',
          label: 'Толщина линии',
          placeholder: '2',
          hint: 'Толщина линии иконки',
        },
      ],
    },
    {
      title: 'Поведение',
      icon: '⚡',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'Input',
          propName: 'href',
          label: 'Ссылка',
          hint: 'URL для перехода при клике',
          placeholder: 'https://example.com',
        },
        {
          type: 'Select',
          propName: 'target',
          label: 'Цель ссылки',
          options: [
            { value: '_self', label: 'В том же окне' },
            { value: '_blank', label: 'В новом окне' },
          ],
        },
        {
          type: 'Switch',
          propName: 'clickable',
          label: 'Кликабельная',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока колонок
  columns: [
    {
      title: 'Структура колонок',
      icon: '📊',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'count',
          label: 'Количество колонок',
          options: [
            { value: '2', label: '2 колонки' },
            { value: '3', label: '3 колонки' },
            { value: '4', label: '4 колонки' },
            { value: '6', label: '6 колонок' },
          ],
        },
        {
          type: 'Select',
          propName: 'gap',
          label: 'Расстояние между колонками',
          options: [
            { value: 'sm', label: 'Маленькое' },
            { value: 'md', label: 'Среднее' },
            { value: 'lg', label: 'Большое' },
            { value: 'xl', label: 'Очень большое' },
          ],
        },
        {
          type: 'Select',
          propName: 'alignItems',
          label: 'Выравнивание по вертикали',
          options: [
            { value: 'stretch', label: 'Растянуть' },
            { value: 'flex-start', label: 'Сверху' },
            { value: 'center', label: 'По центру' },
            { value: 'flex-end', label: 'Снизу' },
          ],
        },
      ],
    },
    {
      title: 'Отзывчивость',
      icon: '📱',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'Select',
          propName: 'mobileLayout',
          label: 'Макет на мобильных',
          options: [
            { value: 'stack', label: 'Вертикальный стек' },
            { value: 'wrap', label: 'Перенос строк' },
            { value: 'scroll', label: 'Горизонтальная прокрутка' },
          ],
        },
        {
          type: 'Select',
          propName: 'tabletLayout',
          label: 'Макет на планшетах',
          options: [
            { value: 'grid', label: 'Сетка' },
            { value: 'flex', label: 'Flex' },
            { value: 'stack', label: 'Стек' },
          ],
        },
      ],
    },
    {
      title: 'Стиль',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет контейнера колонок',
          showAlpha: true,
          presets: ['transparent', '#f8f9fa', '#e9ecef', '#ffffff'],
        },
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'padding',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока табов
  tabs: [
    {
      title: 'Содержимое',
      icon: '📑',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'activeTab',
          label: 'Активная вкладка',
          placeholder: '0',
          hint: 'Индекс активной вкладки (начиная с 0)',
        },
        {
          type: 'Select',
          propName: 'variant',
          label: 'Стиль табов',
          options: [
            { value: 'default', label: 'По умолчанию' },
            { value: 'pills', label: 'Кнопки' },
            { value: 'underline', label: 'Подчеркивание' },
          ],
        },
        {
          type: 'Select',
          propName: 'orientation',
          label: 'Ориентация',
          options: [
            { value: 'horizontal', label: 'Горизонтальная' },
            { value: 'vertical', label: 'Вертикальная' },
          ],
        },
      ],
    },
    {
      title: 'Внешний вид',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'size',
          label: 'Размер',
          options: [
            { value: 'sm', label: 'Маленький' },
            { value: 'md', label: 'Средний' },
            { value: 'lg', label: 'Большой' },
          ],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'activeColor',
          label: 'Цвет активной вкладки',
          hint: 'Цвет выделенной вкладки',
          presets: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'inactiveColor',
          label: 'Цвет неактивных вкладок',
          hint: 'Цвет невыделенных вкладок',
          presets: ['#6b7280', '#9ca3af', '#d1d5db'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет контейнера табов',
          showAlpha: true,
          presets: ['#ffffff', '#f9fafb', '#f3f4f6', 'transparent'],
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока аккордеона
  accordion: [
    {
      title: 'Содержимое',
      icon: '📋',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'variant',
          label: 'Стиль аккордеона',
          options: [
            { value: 'default', label: 'По умолчанию' },
            { value: 'contained', label: 'В контейнере' },
            { value: 'separated', label: 'Разделенные' },
          ],
        },
        {
          type: 'Switch',
          propName: 'multiple',
          label: 'Множественное раскрытие',
          hint: 'Разрешить одновременное раскрытие нескольких элементов',
        },
        {
          type: 'Input',
          propName: 'defaultValue',
          label: 'Активный элемент по умолчанию',
          placeholder: 'item-1',
          hint: 'ID активного элемента при загрузке',
        },
      ],
    },
    {
      title: 'Внешний вид',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'size',
          label: 'Размер',
          options: [
            { value: 'sm', label: 'Маленький' },
            { value: 'md', label: 'Средний' },
            { value: 'lg', label: 'Большой' },
          ],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'headerColor',
          label: 'Цвет заголовков',
          hint: 'Цвет текста заголовков элементов',
          presets: ['#000000', '#1f2937', '#374151', '#6b7280'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'contentColor',
          label: 'Цвет содержимого',
          hint: 'Цвет текста содержимого элементов',
          presets: ['#000000', '#1f2937', '#374151', '#6b7280'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет контейнера аккордеона',
          showAlpha: true,
          presets: ['#ffffff', '#f9fafb', '#f3f4f6', 'transparent'],
        },
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
      ],
    },
    {
      title: 'Анимация',
      icon: '🎬',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'Select',
          propName: 'transition',
          label: 'Тип анимации',
          options: [
            { value: 'default', label: 'По умолчанию' },
            { value: 'smooth', label: 'Плавная' },
            { value: 'bounce', label: 'Отскок' },
            { value: 'none', label: 'Без анимации' },
          ],
        },
        {
          type: 'Input',
          propName: 'transitionDuration',
          label: 'Длительность анимации',
          placeholder: '300',
          hint: 'Длительность в миллисекундах',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'spacing',
          label: 'Отступы',
          allowLinked: true,
        },
      ],
    },
  ],

  // Конфигурация для блока карточки
  card: [
    {
      title: 'Содержимое',
      icon: '🃏',
      collapsible: false,
      defaultExpanded: true,
      controls: [
        {
          type: 'Input',
          propName: 'title',
          label: 'Заголовок',
          hint: 'Заголовок карточки',
          placeholder: 'Заголовок карточки',
        },
        {
          type: 'Textarea',
          propName: 'content',
          label: 'Содержимое',
          hint: 'Основной текст карточки',
          placeholder: 'Содержимое карточки...',
          rows: 3,
        },
        {
          type: 'Input',
          propName: 'imageUrl',
          label: 'URL изображения',
          hint: 'Ссылка на изображение карточки',
          placeholder: 'https://example.com/image.jpg',
        },
        {
          type: 'Input',
          propName: 'linkUrl',
          label: 'Ссылка',
          hint: 'URL для перехода при клике',
          placeholder: 'https://example.com',
        },
      ],
    },
    {
      title: 'Внешний вид',
      icon: '🎨',
      collapsible: true,
      defaultExpanded: true,
      controls: [
        {
          type: 'Select',
          propName: 'variant',
          label: 'Стиль карточки',
          options: [
            { value: 'default', label: 'По умолчанию' },
            { value: 'elevated', label: 'Приподнятая' },
            { value: 'outlined', label: 'Контурная' },
            { value: 'filled', label: 'Заполненная' },
          ],
        },
        {
          type: 'Select',
          propName: 'size',
          label: 'Размер',
          options: [
            { value: 'sm', label: 'Маленькая' },
            { value: 'md', label: 'Средняя' },
            { value: 'lg', label: 'Большая' },
            { value: 'xl', label: 'Очень большая' },
          ],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'backgroundColor',
          label: 'Цвет фона',
          hint: 'Фоновый цвет карточки',
          showAlpha: true,
          presets: ['#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'textColor',
          label: 'Цвет текста',
          hint: 'Цвет текста в карточке',
          presets: ['#000000', '#1f2937', '#374151', '#6b7280'],
        },
        {
          type: 'EnhancedColorPicker',
          propName: 'accentColor',
          label: 'Акцентный цвет',
          hint: 'Цвет для выделенных элементов',
          presets: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        },
      ],
    },
    {
      title: 'Граница и тень',
      icon: '🔳',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'BorderControl',
          propName: 'border',
          label: 'Граница',
          showStyle: true,
          showRadius: true,
        },
        {
          type: 'ShadowControl',
          propName: 'shadow',
          label: 'Тень',
        },
      ],
    },
    {
      title: 'Отступы',
      icon: '📏',
      collapsible: true,
      defaultExpanded: false,
      controls: [
        {
          type: 'SpacingControl',
          propName: 'padding',
          label: 'Внутренние отступы',
          allowLinked: true,
        },
        {
          type: 'SpacingControl',
          propName: 'margin',
          label: 'Внешние отступы',
          allowLinked: true,
        },
      ],
    },
  ],
};

/**
 * Вспомогательная функция для получения конфигурации блока
 */
export function getBlockInspectorConfig(blockType: string): InspectorRegistry[string] | null {
  return inspectorRegistry[blockType] || null;
}

/**
 * Вспомогательная функция для проверки, существует ли конфигурация для блока
 */
export function hasBlockInspectorConfig(blockType: string): boolean {
  return blockType in inspectorRegistry;
}
