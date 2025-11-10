import React, { useState } from 'react';
import Sidebar from './sidebar';
import TopBar from './topbar';

interface DashboardProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<DashboardProps> = ({ title, children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />
      <div className="flex-1 p-6 bg-background">
        <TopBar onMenuClick={toggleSidebar} title={title} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
