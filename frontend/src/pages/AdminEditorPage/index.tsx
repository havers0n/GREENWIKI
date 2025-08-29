import React from 'react';
import { useParams } from 'react-router-dom';
import NewLiveEditor from 'widgets/NewLiveEditor';

const AdminEditorPage: React.FC = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>();

  // Если pageSlug не найден, используем значение по умолчанию
  const currentPageSlug = pageSlug || 'home';

  return <NewLiveEditor pageSlug={currentPageSlug} />;
};

export default AdminEditorPage;
