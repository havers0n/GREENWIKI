import { cn, formatDate, debounce, throttle } from './utils';

// Мокаем console для тестов debounce
const mockConsole = jest.spyOn(console, 'log').mockImplementation();

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('должен объединять строки классов', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('должен обрабатывать undefined значения', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
    });

    it('должен обрабатывать пустые строки', () => {
      expect(cn('class1', '', 'class2')).toBe('class1 class2');
    });

    it('должен обрабатывать массивы классов', () => {
      expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
    });

    it('должен обрабатывать объекты с условными классами', () => {
      expect(cn('base', { 'active': true, 'disabled': false })).toBe('base active');
    });

    it('должен обрабатывать сложные комбинации', () => {
      expect(cn(
        'base',
        ['conditional1', 'conditional2'],
        { 'active': true, 'hidden': false },
        undefined,
        'final'
      )).toBe('base conditional1 conditional2 active final');
    });
  });

  describe('formatDate', () => {
    it('должен форматировать дату в читаемый формат', () => {
      const date = new Date('2024-01-15T10:30:00');
      const result = formatDate(date);

      // Проверяем что результат содержит ожидаемые части
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // MM/DD/YYYY или DD/MM/YYYY
      expect(result).toContain('10:30');
    });

    it('должен обрабатывать строку даты', () => {
      const dateString = '2024-01-15T10:30:00';
      const result = formatDate(dateString);

      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(result).toContain('10:30');
    });

    it('должен возвращать пустую строку для невалидной даты', () => {
      expect(formatDate('invalid')).toBe('');
      expect(formatDate(null as any)).toBe('');
      expect(formatDate(undefined as any)).toBe('');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockConsole.mockClear();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('должен вызывать функцию только после задержки', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(99);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('должен сбрасывать таймер при повторных вызовах', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc();
      jest.advanceTimersByTime(50);

      debouncedFunc(); // Сбрасываем таймер
      jest.advanceTimersByTime(50);
      expect(func).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(func).toHaveBeenCalledTimes(1);
    });

    it('должен передавать аргументы в функцию', () => {
      const func = jest.fn();
      const debouncedFunc = debounce(func, 100);

      debouncedFunc('arg1', 'arg2');
      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('должен вызывать функцию с правильным контекстом', () => {
      const context = { value: 42 };
      const func = jest.fn(function(this: typeof context) {
        return this.value;
      });
      const debouncedFunc = debounce(func.bind(context), 100);

      debouncedFunc();
      jest.advanceTimersByTime(100);

      expect(func).toHaveBeenCalledTimes(1);
      expect(func.mock.results[0].value).toBe(42);
    });
  });

  describe('throttle', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockConsole.mockClear();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('должен ограничивать частоту вызовов функции', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);

      throttledFunc();
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1); // Второй и третий вызовы игнорируются

      jest.advanceTimersByTime(100);
      throttledFunc();
      expect(func).toHaveBeenCalledTimes(2); // После задержки функция вызывается снова
    });

    it('должен передавать аргументы в функцию', () => {
      const func = jest.fn();
      const throttledFunc = throttle(func, 100);

      throttledFunc('arg1', 'arg2');
      expect(func).toHaveBeenCalledWith('arg1', 'arg2');
    });

    it('должен вызывать функцию с правильным контекстом', () => {
      const context = { value: 42 };
      const func = jest.fn(function(this: typeof context) {
        return this.value;
      });
      const throttledFunc = throttle(func.bind(context), 100);

      throttledFunc();
      expect(func).toHaveBeenCalledTimes(1);
      expect(func.mock.results[0].value).toBe(42);
    });
  });
});
