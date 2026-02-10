// Layout principal con sidebar
import React from 'react';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="container max-w-7xl py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
