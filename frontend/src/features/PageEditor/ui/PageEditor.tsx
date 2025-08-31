import React from 'react';
import NewLiveEditor from '../../../widgets/NewLiveEditor';

/**
 * PageEditor - абстракция для редактора страниц
 * Инкапсулирует логику редактирования страниц и использует NewLiveEditor из widgets
 * Соблюдает принципы FSD - features могут импортировать из widgets
 */
interface PageEditorProps {
  pageSlug: string;
}

const PageEditor: React.FC<PageEditorProps> = ({ pageSlug }) => {
  return <NewLiveEditor pageSlug={pageSlug} />;
};

export default PageEditor;
