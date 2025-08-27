import React from 'react';
import LayoutManager from 'widgets/LayoutManager';

const AdminHomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <LayoutManager pageIdentifier="homepage" />
    </div>
  );
};

export default AdminHomePage;