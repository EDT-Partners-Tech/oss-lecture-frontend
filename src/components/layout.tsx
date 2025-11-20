/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
