import React from 'react';

interface PageEditorLayoutProps {
  sidebarContent: React.ReactNode;
  mainContent: React.ReactNode;
}

const PageEditorLayout: React.FC<PageEditorLayoutProps> = ({ sidebarContent, mainContent }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-96 shrink-0">
        {sidebarContent}
      </aside>
      <section className="flex-1 min-w-0">
        {mainContent}
      </section>
    </div>
  );
};

export default PageEditorLayout;


