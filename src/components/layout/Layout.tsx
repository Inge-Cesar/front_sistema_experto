import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)}></div>
      )}
      
      <Sidebar isOpen={isSidebarOpen} />
      
      <div className="main-content">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="content-wrapper">
          {children}
        </main>
        
        <Footer />
      </div>
    </div>
  );
};
