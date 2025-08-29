import React from 'react';
import { Typography, Button } from '../../../shared/ui/atoms';
import { useBlockIcon } from '../model/useInspectorLogic';
import type { InspectorHeaderProps } from '../types';

/**
 * Заголовок ContextualInspector
 * Отвечает за отображение иконки блока, названия и кнопки закрытия
 */
const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  block,
  onClose
}) => {
  const blockIcon = useBlockIcon(block.block_type);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">{blockIcon}</span>
        <Typography as="h2" variant="h2" className="text-lg">
          {block.block_type}
        </Typography>
      </div>
      <Button onClick={onClose} size="sm" variant="ghost">
        ✕
      </Button>
    </div>
  );
};

InspectorHeader.displayName = 'InspectorHeader';

export { InspectorHeader };
export default InspectorHeader;
