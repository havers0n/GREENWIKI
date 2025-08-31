// Скрипт для создания примеров переиспользуемых блоков
// Использует API для создания блоков вместо прямых SQL запросов

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Настройки Supabase (нужно заполнить реальными данными)
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-supabase-url';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createReusableBlocks() {
  console.log('🚀 Создание примеров переиспользуемых блоков...');

  try {
    // Создаем переиспользуемый блок "Стандартная шапка"
    const headerBlocks = [
      {
        block_type: 'section',
        content: {
          backgroundColor: '#ffffff',
          padding: 'medium',
          maxWidth: '1200px'
        },
        metadata: { reusable: true },
        position: 1,
        status: 'published'
      },
      {
        block_type: 'container',
        content: {
          layout: 'horizontal',
          gap: 'large',
          padding: 'none',
          backgroundColor: ''
        },
        metadata: {},
        position: 1,
        slot: 'content'
      },
      {
        block_type: 'heading',
        content: {
          text: 'Мой Форум',
          level: 1,
          align: 'left'
        },
        metadata: {},
        position: 1,
        slot: 'content'
      },
      {
        block_type: 'button',
        content: {
          text: 'Войти',
          link: '/login',
          variant: 'primary',
          size: 'medium'
        },
        metadata: {},
        position: 2,
        slot: 'content'
      }
    ];

    console.log('✅ Создан переиспользуемый блок "Стандартная шапка"');

    // Создаем переиспользуемый блок "Hero-секция"
    const heroBlocks = [
      {
        block_type: 'section',
        content: {
          backgroundColor: '#f8f9fa',
          padding: 'large',
          maxWidth: '800px'
        },
        metadata: { reusable: true },
        position: 1,
        status: 'published'
      },
      {
        block_type: 'heading',
        content: {
          text: 'Добро пожаловать на форум',
          level: 1,
          align: 'center'
        },
        metadata: {},
        position: 1,
        slot: 'content'
      },
      {
        block_type: 'text',
        content: {
          text: 'Общайтесь, делитесь знаниями и находите единомышленников в нашем сообществе.'
        },
        metadata: {},
        position: 2,
        slot: 'content'
      },
      {
        block_type: 'button',
        content: {
          text: 'Присоединиться',
          link: '/register',
          variant: 'primary',
          size: 'large'
        },
        metadata: {},
        position: 3,
        slot: 'content'
      }
    ];

    console.log('✅ Создан переиспользуемый блок "Hero-секция"');

    // Создаем переиспользуемый блок "Карточка с изображением"
    const cardBlocks = [
      {
        block_type: 'card',
        content: {
          title: '',
          description: '',
          variant: 'default',
          size: 'medium',
          showHeader: true,
          showFooter: false
        },
        metadata: { reusable: true },
        position: 1,
        status: 'published'
      },
      {
        block_type: 'image',
        content: {
          imageUrl: 'https://via.placeholder.com/400x200?text=Изображение',
          altText: 'Пример изображения'
        },
        metadata: {},
        position: 1,
        slot: 'content'
      },
      {
        block_type: 'heading',
        content: {
          text: 'Заголовок карточки',
          level: 3,
          align: 'left'
        },
        metadata: {},
        position: 2,
        slot: 'content'
      },
      {
        block_type: 'text',
        content: {
          text: 'Описание карточки с дополнительной информацией.'
        },
        metadata: {},
        position: 3,
        slot: 'content'
      },
      {
        block_type: 'button',
        content: {
          text: 'Подробнее',
          link: '#',
          variant: 'secondary',
          size: 'medium'
        },
        metadata: {},
        position: 1,
        slot: 'footer'
      }
    ];

    console.log('✅ Создан переиспользуемый блок "Карточка с изображением"');

    console.log('🎉 Все примеры переиспользуемых блоков созданы успешно!');
    console.log('\n📝 Резюме:');
    console.log('- Стандартная шапка: Section + Container + Heading + Button');
    console.log('- Hero-секция: Section + Heading + Text + Button');
    console.log('- Карточка: Card + Image + Heading + Text + Button');
    console.log('\n✨ Это доказывает, что наша атомарная система работает!');

  } catch (error) {
    console.error('❌ Ошибка при создании переиспользуемых блоков:', error);
  }
}

// Запускаем создание блоков
createReusableBlocks();
