import { describe, it, expect } from 'vitest';
import {
  mergeOverrides,
  setNestedProperty,
  getNestedProperty,
  hasOverride,
  removeOverride,
} from '../utils';

describe('mergeOverrides', () => {
  it('должен слить переопределения с оригинальным контентом', () => {
    const original = {
      style: { color: 'red', fontSize: '14px' },
      settings: { width: 100 },
    };

    const overrides = {
      'style.color': 'blue',
      'settings.height': 200,
    };

    const result = mergeOverrides(original, overrides);

    expect(result).toEqual({
      style: { color: 'blue', fontSize: '14px' },
      settings: { width: 100, height: 200 },
    });
  });

  it('должен вернуть переопределения если оригинал null', () => {
    const overrides = {
      'style.color': 'blue',
      'text': 'Hello',
    };

    const result = mergeOverrides(null, overrides);

    expect(result).toEqual(overrides);
  });

  it('должен вернуть оригинал если переопределения null', () => {
    const original = {
      style: { color: 'red' },
      text: 'Hello',
    };

    const result = mergeOverrides(original, null);

    expect(result).toEqual(original);
  });

  it('должен корректно работать с глубокими вложенными путями', () => {
    const original = {
      theme: {
        colors: {
          primary: 'red',
          secondary: 'blue',
        },
      },
    };

    const overrides = {
      'theme.colors.primary': 'green',
      'theme.spacing.margin': '10px',
    };

    const result = mergeOverrides(original, overrides);

    expect(result).toEqual({
      theme: {
        colors: {
          primary: 'green',
          secondary: 'blue',
        },
        spacing: {
          margin: '10px',
        },
      },
    });
  });

  it('должен перезаписывать массивы', () => {
    const original = {
      items: ['item1', 'item2'],
    };

    const overrides = {
      'items': ['newItem1', 'newItem2', 'newItem3'],
    };

    const result = mergeOverrides(original, overrides);

    expect(result).toEqual({
      items: ['newItem1', 'newItem2', 'newItem3'],
    });
  });
});

describe('setNestedProperty', () => {
  it('должен установить значение по вложенному пути', () => {
    const obj = { style: { color: 'red' } };

    setNestedProperty(obj, 'style.fontSize', '14px');

    expect(obj).toEqual({
      style: {
        color: 'red',
        fontSize: '14px',
      },
    });
  });

  it('должен создать промежуточные объекты', () => {
    const obj = {};

    setNestedProperty(obj, 'theme.colors.primary', 'blue');

    expect(obj).toEqual({
      theme: {
        colors: {
          primary: 'blue',
        },
      },
    });
  });

  it('должен перезаписывать существующие значения', () => {
    const obj = { style: { color: 'red' } };

    setNestedProperty(obj, 'style.color', 'blue');

    expect(obj.style.color).toBe('blue');
  });
});

describe('getNestedProperty', () => {
  it('должен получить значение по вложенному пути', () => {
    const obj = {
      style: {
        color: 'red',
        font: { size: '14px' },
      },
    };

    expect(getNestedProperty(obj, 'style.color')).toBe('red');
    expect(getNestedProperty(obj, 'style.font.size')).toBe('14px');
  });

  it('должен вернуть undefined для несуществующего пути', () => {
    const obj = { style: { color: 'red' } };

    expect(getNestedProperty(obj, 'style.fontSize')).toBeUndefined();
    expect(getNestedProperty(obj, 'settings.width')).toBeUndefined();
  });

  it('должен вернуть undefined для null объекта', () => {
    expect(getNestedProperty(null, 'any.path')).toBeUndefined();
  });
});

describe('hasOverride', () => {
  it('должен вернуть true если переопределение существует', () => {
    const overrides = {
      'style.color': 'blue',
      'text': 'Hello',
    };

    expect(hasOverride(overrides, 'style.color')).toBe(true);
    expect(hasOverride(overrides, 'text')).toBe(true);
  });

  it('должен вернуть false если переопределение не существует', () => {
    const overrides = {
      'style.color': 'blue',
    };

    expect(hasOverride(overrides, 'style.fontSize')).toBe(false);
    expect(hasOverride(overrides, 'text')).toBe(false);
  });

  it('должен вернуть false для null переопределений', () => {
    expect(hasOverride(null, 'any.path')).toBe(false);
  });
});

describe('removeOverride', () => {
  it('должен удалить переопределение по пути', () => {
    const overrides = {
      'style.color': 'blue',
      'style.fontSize': '14px',
      'text': 'Hello',
    };

    const result = removeOverride(overrides, 'style.color');

    expect(result).toEqual({
      'style.fontSize': '14px',
      'text': 'Hello',
    });
  });

  it('должен вернуть пустой объект если удаляется единственное переопределение', () => {
    const overrides = {
      'style.color': 'blue',
    };

    const result = removeOverride(overrides, 'style.color');

    expect(result).toEqual({});
  });

  it('должен вернуть пустой объект для null переопределений', () => {
    const result = removeOverride(null, 'any.path');

    expect(result).toEqual({});
  });

  it('должен вернуть неизмененный объект если путь не найден', () => {
    const overrides = {
      'style.color': 'blue',
    };

    const result = removeOverride(overrides, 'style.fontSize');

    expect(result).toEqual(overrides);
  });
});

describe('пограничные случаи mergeOverrides', () => {
  it('должен корректно работать с пустыми объектами', () => {
    expect(mergeOverrides({}, {})).toEqual({});
    expect(mergeOverrides({}, null)).toEqual({});
    expect(mergeOverrides(null, {})).toEqual({});
  });

  it('должен сохранять ссылочную целостность для неизмененных частей', () => {
    const original = {
      style: { color: 'red', font: { size: '14px' } },
      settings: { width: 100 },
    };

    const overrides = {
      'settings.width': 200,
    };

    const result = mergeOverrides(original, overrides);

    // Оригинальный объект style должен остаться неизменным
    expect(result.style).toBe(original.style);
    expect(result.settings).not.toBe(original.settings);
  });

  it('должен корректно обрабатывать сложные типы данных', () => {
    const original = {
      data: [1, 2, 3],
      func: () => 'test',
    };

    const overrides = {
      'data': [4, 5, 6],
      'func': () => 'overridden',
    };

    const result = mergeOverrides(original, overrides);

    expect(result.data).toEqual([4, 5, 6]);
    expect(typeof result.func).toBe('function');
  });

  it('должен работать с путями содержащими точки', () => {
    const original = {
      'style.color': 'red', // Ключ содержит точку
    };

    const overrides = {
      'style.color': 'blue',
    };

    const result = mergeOverrides(original, overrides);

    expect(result['style.color']).toBe('blue');
  });
});
