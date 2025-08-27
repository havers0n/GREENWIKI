// Скрипт для назначения роли администратора через консоль браузера
// Откройте http://localhost:5174/admin, откройте консоль (F12) и выполните:
//
// 1. Сначала посмотрите текущего пользователя:
//    console.log(window.__MY_FORUM_USER__);
//
// 2. Назначьте роль admin:
//    await window.grantAdminRole();

(function() {
  // Добавляем глобальную переменную для отладки
  window.__MY_FORUM_USER__ = null;

  // Добавляем функцию для назначения роли
  window.grantAdminRole = async function() {
    try {
      const supabase = window.supabase || null;
      if (!supabase) {
        console.error('Supabase client not found. Make sure you are on the admin page.');
        return;
      }

      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found.');
        return;
      }

      console.log('Current user:', user);

      // Назначаем роль admin
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating role:', error);
        return;
      }

      console.log('✅ Role updated successfully:', data);

      // Обновляем страницу
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Сохраняем пользователя для отладки
  if (typeof window !== 'undefined' && window.supabase) {
    window.supabase.auth.getUser().then(({ data: { user } }) => {
      window.__MY_FORUM_USER__ = user;
    });
  }

  console.log(`
🔧 Admin Role Debug Tools Loaded!

Использование:
1. Посмотреть текущего пользователя:
   console.log(window.__MY_FORUM_USER__);

2. Назначить роль администратора:
   await window.grantAdminRole();

3. Проверить таблицу profiles:
   await window.supabase.from('profiles').select('*');
  `);
})();
