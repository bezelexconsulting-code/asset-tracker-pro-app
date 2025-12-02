export const dynamic = 'force-dynamic'
export const revalidate = 0
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BrandingProvider } from '@/components/shared/BrandingProvider'
import { getTenantFromHeaders, getClientBranding } from '@/lib/tenant'
import MobileNavigation from '@/components/layout/mobile-navigation'
import PWAInstallPrompt from '@/components/shared/pwa-install-prompt'
import ServiceWorkerRegister from '@/components/shared/service-worker-register'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Asset Tracker Pro',
  description: 'White-label multi-tenant asset tracking system with NFC technology',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Asset Tracker Pro',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'apple-touch-fullscreen': 'yes',
  } as Record<string, string>,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get tenant information for server-side branding
  const tenantId = await getTenantFromHeaders();
  const initialBranding = tenantId ? await getClientBranding(tenantId) : null;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon-192x192.svg" />
      </head>
      <body className={`${inter.className} bg-gray-50`}>
        <BrandingProvider initialBranding={initialBranding || undefined} clientId={tenantId || undefined}>
          <div className="min-h-screen bg-gray-50">
            {children}
            <MobileNavigation />
            <PWAInstallPrompt />
            <ServiceWorkerRegister />
          </div>
        </BrandingProvider>
      </body>
    </html>
  )
}
