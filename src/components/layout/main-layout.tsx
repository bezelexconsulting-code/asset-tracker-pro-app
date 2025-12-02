'use client';

import { Sidebar } from './sidebar';
import { ClientLogo, useBranding } from '@/components/shared/BrandingProvider';
import { useSession } from 'next-auth/react'

interface MainLayoutProps {
  children: React.ReactNode;
  userRole?: string;
  isSuperAdmin?: boolean;
}

export function MainLayout({ children, userRole, isSuperAdmin }: MainLayoutProps) {
  const { branding } = useBranding();
  const { data: session } = useSession()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} isSuperAdmin={isSuperAdmin} />
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="scan-it-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ClientLogo
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                fallbackText="AT"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {branding?.companyName || 'Asset Tracker Pro'}
                </h1>
                <p className="text-sm text-gray-600">
                  {session?.user?.name ? `Welcome ${session.user.name}` : 'Professional Asset Management'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
