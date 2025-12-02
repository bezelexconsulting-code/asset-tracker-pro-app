'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface BrandingConfig {
  logo?: string;
  companyName: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  favicon?: string;
  loginBgImage?: string;
  dashboardTheme: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  language: string;
}

interface BrandingContextType {
  branding: BrandingConfig | null;
  isLoading: boolean;
  updateBranding: (config: BrandingConfig) => void;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: null,
  isLoading: true,
  updateBranding: () => {},
});

export const useBranding = () => useContext(BrandingContext);

interface BrandingProviderProps {
  children: React.ReactNode;
  initialBranding?: BrandingConfig;
  clientId?: string;
}

export function BrandingProvider({ children, initialBranding, clientId }: BrandingProviderProps) {
  const [branding, setBranding] = useState<BrandingConfig | null>(initialBranding || null);
  const [isLoading, setIsLoading] = useState(!initialBranding);

  useEffect(() => {
    if (!initialBranding && clientId) {
      fetchBranding(clientId);
    }
  }, [clientId, initialBranding]);

  useEffect(() => {
    if (branding) {
      applyBrandingStyles(branding);
    }
  }, [branding]);

  const fetchBranding = async (clientId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/client/branding?clientId=${clientId}`);
      if (response.ok) {
        const brandingData = await response.json();
        setBranding(brandingData);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBranding = (config: BrandingConfig) => {
    setBranding(config);
  };

  const applyBrandingStyles = (config: BrandingConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for dynamic theming
    if (config.primaryColor) {
      root.style.setProperty('--brand-primary', config.primaryColor);
    }
    if (config.secondaryColor) {
      root.style.setProperty('--brand-secondary', config.secondaryColor);
    }
    if (config.accentColor) {
      root.style.setProperty('--brand-accent', config.accentColor);
    }

    // Update favicon if provided
    if (config.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.favicon;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = config.favicon;
        document.head.appendChild(newFavicon);
      }
    }

    // Update page title with company name
    if (config.companyName) {
      const titleElement = document.querySelector('title');
      if (titleElement) {
        const currentTitle = titleElement.textContent || '';
        if (!currentTitle.includes(config.companyName)) {
          titleElement.textContent = `${config.companyName} - Asset Tracker`;
        }
      }
    }

    // Apply theme class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${config.dashboardTheme}`);
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

// Hook for getting brand colors with fallbacks
export function useBrandColors() {
  const { branding } = useBranding();
  
  return {
    primary: branding?.primaryColor || '#3b82f6',
    secondary: branding?.secondaryColor || '#64748b',
    accent: branding?.accentColor || '#10b981',
  };
}

// Component for displaying client logo
export function ClientLogo({ className = '', fallbackText }: { className?: string; fallbackText?: string }) {
  const { branding } = useBranding();
  
  if (branding?.logo) {
    return (
      <img 
        src={branding.logo} 
        alt={`${branding.companyName} Logo`}
        className={className}
      />
    );
  }
  
  return (
    <div className={`flex items-center justify-center bg-gray-200 text-gray-600 font-semibold ${className}`}>
      {fallbackText || branding?.companyName?.charAt(0) || 'A'}
    </div>
  );
}