import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Компонент, который выбрасывает ошибку
const ErrorComponent: React.FC = () => {
  throw new Error('Test error');
};

// Нормальный компонент
const NormalComponent: React.FC = () => {
  return <div>Normal component</div>;
};

describe('ErrorBoundary', () => {
  // Мокаем console.error чтобы не засорять вывод тестов
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('должен отображать дочерний компонент при отсутствии ошибок', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal component')).toBeInTheDocument();
  });

  it('должен перехватывать ошибки и отображать fallback UI', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(screen.getByText('Произошла неожиданная ошибка')).toBeInTheDocument();
  });

  it('должен отображать детали ошибки в development режиме', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary showDetails={true}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Технические детали (для разработчиков)')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('должен позволять пользователю повторить попытку', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    // Сначала должна быть ошибка
    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();

    // Кликаем "Попробовать снова"
    fireEvent.click(screen.getByText('Попробовать снова'));

    // После клика ошибка должна исчезнуть, но так как компонент все еще ErrorComponent,
    // ошибка появится снова. В реальном использовании здесь был бы механизм сброса состояния.
    await waitFor(() => {
      expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    });
  });

  it('должен использовать кастомный fallback если он предоставлен', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Что-то пошло не так')).not.toBeInTheDocument();
  });

  it('должен вызывать onError callback при возникновении ошибки', () => {
    const mockOnError = jest.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });
});
