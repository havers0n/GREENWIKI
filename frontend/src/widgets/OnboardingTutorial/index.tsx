import React, { useState, useEffect } from 'react';
import { Card, Button, Typography } from '@my-forum/ui';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS селектор для выделения элемента
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'drag' | 'wait';
  actionTarget?: string; // Что нужно сделать
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в визуальный редактор!',
    description: 'Это мощный инструмент для создания современных сайтов. Давайте познакомимся с основами за 2 минуты.',
    position: 'center',
  },
  {
    id: 'sidebar',
    title: 'Библиотека блоков',
    description: 'Здесь вы найдете все необходимые элементы: заголовки, текст, изображения, кнопки и многое другое.',
    target: '[data-tutorial="sidebar"]',
    position: 'right',
  },
  {
    id: 'drag-drop',
    title: 'Перетаскивание блоков',
    description: 'Попробуйте перетащить любой блок из библиотеки на рабочую область. Просто зажмите и тяните!',
    target: '[data-tutorial="block-item"]:first-child',
    position: 'right',
    action: 'drag',
    actionTarget: 'canvas',
  },
  {
    id: 'edit-block',
    title: 'Редактирование блоков',
    description: 'Кликните на добавленный блок, чтобы открыть панель редактирования и настроить его содержимое.',
    position: 'center',
    action: 'click',
    actionTarget: '[data-tutorial="canvas"]',
  },
  {
    id: 'inspector',
    title: 'Панель свойств',
    description: 'Здесь вы можете настроить стили, размеры, цвета и другие параметры выбранного блока.',
    target: '[data-tutorial="inspector"]',
    position: 'left',
  },
  {
    id: 'save',
    title: 'Сохранение изменений',
    description: 'Все изменения сохраняются автоматически. Вы всегда можете отменить последние действия.',
    target: '[data-tutorial="save-button"]',
    position: 'top',
  },
  {
    id: 'congrats',
    title: 'Отлично! Вы готовы создавать!',
    description: 'Теперь вы знаете основы. Создавайте удивительные сайты и делитесь ими с миром. Удачи! 🚀',
    position: 'center',
  },
];

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isVisible,
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  useEffect(() => {
    if (!isVisible) return;

    // Выделяем целевой элемент
    const targetElement = step.target ? document.querySelector(step.target) : null;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('tutorial-highlight');

      return () => {
        targetElement.classList.remove('tutorial-highlight');
      };
    }
  }, [step.target, isVisible]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      return;
    }

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsAnimating(false);
    }, 300);
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    const baseClasses = 'absolute z-50 w-80 animate-in fade-in-0 zoom-in-95';

    switch (step.position) {
      case 'top':
        return `${baseClasses} bottom-full mb-2 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-full mt-2 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} right-full mr-2 top-1/2 transform -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full ml-2 top-1/2 transform -translate-y-1/2`;
      case 'center':
        return `${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  const getArrowClasses = () => {
    switch (step.position) {
      case 'top':
        return 'absolute top-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-800';
      case 'bottom':
        return 'absolute bottom-full left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent border-b-white dark:border-b-gray-800';
      case 'left':
        return 'absolute left-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent border-l-white dark:border-l-gray-800';
      case 'right':
        return 'absolute right-full top-1/2 transform -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent border-r-white dark:border-r-gray-800';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />

      {/* Highlight overlay for target element */}
      {step.target && (
        <div className="fixed inset-0 z-45 pointer-events-none">
          <div className="absolute inset-0 bg-black/20" />
          {/* Highlight ring around target */}
          <div
            className="absolute border-4 border-blue-500 rounded-lg animate-pulse"
            style={{
              // This would need to be calculated based on target element position
              // For now, just show a general highlight
            }}
          />
        </div>
      )}

      {/* Tutorial tooltip */}
      <div className={getTooltipPosition()}>
        <Card className="p-6 shadow-2xl border-2 border-blue-200 dark:border-blue-800">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <Typography variant="h3" className="text-lg font-semibold">
                {step.title}
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <Typography className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            {step.description}
          </Typography>

          {/* Action hint */}
          {step.action && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <Typography className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Действие:</strong> {step.action === 'click' ? 'Кликните' : step.action === 'drag' ? 'Перетащите' : 'Подождите'} {step.actionTarget}
              </Typography>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-blue-500'
                    : index < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>

            <Typography className="text-sm text-gray-500">
              {currentStep + 1} из {tutorialSteps.length}
            </Typography>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
            >
              {isLastStep ? 'Завершить' : 'Далее'}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </Card>

        {/* Arrow */}
        {step.position !== 'center' && (
          <div className={getArrowClasses()} />
        )}
      </div>

      {/* Tutorial-specific styles */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 50;
        }

        .tutorial-highlight::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          animation: tutorial-pulse 2s infinite;
          pointer-events: none;
        }

        @keyframes tutorial-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
      `}</style>
    </>
  );
};

export default OnboardingTutorial;
