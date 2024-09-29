'use client';

import React, { PropsWithChildren } from 'react';
import { Header, Sidebar, withAuth } from '../../components';

const DashboardLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default withAuth(DashboardLayout);
