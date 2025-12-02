import { headers } from 'next/headers';
import { prisma } from './prisma';
import { Client } from '@prisma/client';

/**
 * Get tenant information from request headers
 */
export async function getTenantFromHeaders(): Promise<string | null> {
  const headersList = headers();
  return headersList.get('x-tenant-id') || headersList.get('x-client-id');
}

/**
 * Get client information by tenant ID
 */
export async function getClientByTenant(tenantId: string): Promise<Client | null> {
  try {
    const client = await prisma.client.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { customDomain: tenantId },
          { companyName: { contains: tenantId, mode: 'insensitive' } }
        ]
      }
    });
    return client;
  } catch (error) {
    console.error('Error fetching client by tenant:', error);
    return null;
  }
}

/**
 * Get client branding configuration
 */
export async function getClientBranding(clientId: string): Promise<{
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
} | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        companyName: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        favicon: true,
        loginBgImage: true,
        dashboardTheme: true,
        timezone: true,
        dateFormat: true,
        currency: true,
        language: true,
      }
    });

    if (!client) return null;
    return {
      companyName: client.companyName,
      logo: client.logo || undefined,
      primaryColor: client.primaryColor || undefined,
      secondaryColor: client.secondaryColor || undefined,
      accentColor: client.accentColor || undefined,
      favicon: client.favicon || undefined,
      loginBgImage: client.loginBgImage || undefined,
      dashboardTheme: client.dashboardTheme,
      timezone: client.timezone,
      dateFormat: client.dateFormat,
      currency: client.currency,
      language: client.language,
    };
  } catch (error) {
    console.error('Error fetching client branding:', error);
    return null;
  }
}

/**
 * Ensure user has access to tenant data
 */
export function validateTenantAccess(userClientId: string | null, tenantId: string | null, isSuperAdmin: boolean = false): boolean {
  if (isSuperAdmin) return true;
  if (!tenantId) return true; // No tenant restriction
  return userClientId === tenantId;
}

/**
 * Get tenant-scoped Prisma client
 * This ensures all queries are automatically scoped to the tenant
 */
export function getTenantPrisma(clientId: string | null) {
  if (!clientId) return prisma;
  
  // Return a proxy that automatically adds clientId filter to relevant queries
  return new Proxy(prisma, {
    get(target, prop) {
      const originalMethod = target[prop as keyof typeof target];
      
      if (typeof originalMethod === 'object' && originalMethod !== null) {
        // Handle model methods (e.g., prisma.item, prisma.user)
        return new Proxy(originalMethod, {
          get(modelTarget, modelProp) {
            const modelMethod = modelTarget[modelProp as keyof typeof modelTarget];
            
            if (typeof modelMethod === 'function') {
              return function(...args: any[]) {
                // Auto-inject clientId filter for tenant-scoped models
                const tenantScopedModels = ['item', 'device', 'user', 'worker', 'subClient', 'invoice'];
                const modelName = prop as string;
                
                if (tenantScopedModels.includes(modelName) && args[0] && typeof args[0] === 'object') {
                  if (args[0].where) {
                    args[0].where = { ...args[0].where, clientId };
                  } else {
                    args[0].where = { clientId };
                  }
                }
                
                return (modelMethod as any).apply(modelTarget, args);
              };
            }
            
            return modelMethod;
          }
        });
      }
      
      return originalMethod;
    }
  });
}
