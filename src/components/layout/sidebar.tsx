'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Users,
  Package,
  CreditCard,
  FileText,
  Nfc,
  ClipboardCheck,
  UserCheck,
  Shield,
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Building,
  Smartphone,
  Wrench,
  DollarSign,
  Palette,
  Zap,
  Bell,
  Search,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  userRole?: string;
  isSuperAdmin?: boolean;
}

interface NavItem {
  name: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
  color?: string;
}

const getNavItems = (userRole?: string, isSuperAdmin?: boolean): NavItem[] => {
  const commonItems: NavItem[] = [
    {
      name: 'Dashboard',
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      color: 'from-blue-500 to-indigo-600',
    },
  ];

  if (isSuperAdmin) {
    return [
      ...commonItems,
      {
        name: 'Super Admin',
        title: 'Super Admin',
        href: '/super-admin',
        icon: Shield,
        color: 'from-red-500 to-pink-600',
      },
      {
        name: 'Owner Dashboard',
        title: 'Owner Dashboard',
        href: '/owner',
        icon: Building,
        color: 'from-purple-500 to-indigo-600',
      },
      {
        name: 'Client Management',
        title: 'Client Management',
        href: '/admin/clients',
        icon: Users,
        color: 'from-green-500 to-emerald-600',
      },
      {
        name: 'Billing',
        title: 'Billing',
        href: '/admin/billing',
        icon: CreditCard,
        color: 'from-yellow-500 to-orange-600',
      },
      {
        name: 'Branding',
        title: 'Branding',
        href: '/branding',
        icon: Palette,
        color: 'from-violet-500 to-purple-600',
      },
    ];
  }

  if (userRole === 'OWNER') {
    return [
      ...commonItems,
      {
        name: 'Owner Dashboard',
        title: 'Owner Dashboard',
        href: '/owner',
        icon: Building,
        color: 'from-purple-500 to-indigo-600',
      },
      {
        name: 'Client Management',
        title: 'Client Management',
        href: '/clients',
        icon: Users,
        color: 'from-green-500 to-emerald-600',
      },
      {
        name: 'Billing',
        title: 'Billing',
        href: '/billing',
        icon: DollarSign,
        color: 'from-yellow-500 to-orange-600',
      },
      {
        name: 'Assets',
        title: 'Assets',
        href: '/inventory',
        icon: Package,
        color: 'from-blue-500 to-cyan-600',
      },
      {
        name: 'Assignments',
        title: 'Assignments',
        href: '/assignments',
        icon: UserCheck,
        color: 'from-teal-500 to-green-600',
      },
      {
        name: 'Check In/Out',
        title: 'Check In/Out',
        href: '/check-in-out',
        icon: ClipboardCheck,
        color: 'from-indigo-500 to-purple-600',
      },
      {
        name: 'Maintenance',
        title: 'Maintenance',
        href: '/maintenance',
        icon: Wrench,
        color: 'from-orange-500 to-red-600',
      },
      {
        name: 'NFC Management',
        title: 'NFC Management',
        href: '/image-management',
        icon: Nfc,
        color: 'from-pink-500 to-rose-600',
      },
      {
        name: 'Branding',
        title: 'Branding',
        href: '/branding',
        icon: Palette,
        color: 'from-violet-500 to-purple-600',
      },
    ];
  }

  if (userRole === 'CLIENT') {
    return [
      ...commonItems,
      {
        name: 'Client Dashboard',
        title: 'Client Dashboard',
        href: '/client',
        icon: Users,
      },
      {
        name: 'Assets',
        title: 'Assets',
        href: '/inventory',
        icon: Package,
      },
      {
        name: 'Assignments',
        title: 'Assignments',
        href: '/assignments',
        icon: UserCheck,
      },
      {
        name: 'Check In/Out',
        title: 'Check In/Out',
        href: '/check-in-out',
        icon: ClipboardCheck,
      },
      {
        name: 'Maintenance',
        title: 'Maintenance',
        href: '/maintenance',
        icon: Wrench,
      },
      {
        name: 'Sub-clients',
        title: 'Sub-clients',
        href: '/client/subclients',
        icon: UserCheck,
      },
      {
        name: 'Reports',
        title: 'Reports',
        href: '/client/reports',
        icon: FileText,
      },
      {
        name: 'NFC Tap',
        title: 'NFC Tap',
        href: '/client/nfc-tap',
        icon: Smartphone,
      },
      {
        name: 'Billing',
        title: 'Billing',
        href: '/client/billing',
        icon: DollarSign,
      },
      {
        name: 'Branding',
        title: 'Branding',
        href: '/branding',
        icon: Palette,
      },
    ];
  }

  return [
    ...commonItems,
    {
      name: 'Assets',
      title: 'Assets',
      href: '/inventory',
      icon: Package,
    },
    {
      name: 'Assignments',
      title: 'Assignments',
      href: '/assignments',
      icon: UserCheck,
    },
    {
      name: 'Check In/Out',
      title: 'Check In/Out',
      href: '/check-in-out',
      icon: ClipboardCheck,
    },
    {
      name: 'Maintenance',
      title: 'Maintenance',
      href: '/maintenance',
      icon: Wrench,
    },
    {
      name: 'NFC Reader',
      title: 'NFC Reader',
      href: '/nfc-reader',
      icon: Smartphone,
    },
    {
      name: 'Branding',
      title: 'Branding',
      href: '/branding',
      icon: Palette,
    },
  ];
};

export function Sidebar({ userRole, isSuperAdmin }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const navItems = getNavItems(userRole, isSuperAdmin);

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div>
        <Link
          href={item.href}
          className={cn(
            'scan-it-nav-item group relative overflow-hidden',
            isActive && 'active',
            level > 0 && 'ml-6'
          )}
          onClick={() => setIsOpen(false)}
        >
          <div className={`scan-it-metric-icon bg-gradient-to-r ${item.color || 'from-gray-400 to-gray-500'} text-white`}>
            <item.icon className="scan-it-icon" />
          </div>
          <span className="flex-1 font-semibold text-base">{item.title}</span>
          {item.badge && (
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse-glow">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-slate-300 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                toggleExpanded(item.title);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="scan-it-icon" />
              ) : (
                <ChevronRight className="scan-it-icon" />
              )}
            </Button>
          )}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl"></div>
          )}
        </Link>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="scan-it-icon" /> : <Menu className="scan-it-icon" />}
      </Button>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-72 transform scan-it-sidebar transition-transform duration-200 ease-in-out md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center px-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Asset Tracker</h2>
                <p className="text-xs text-slate-400">Professional Edition</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-6 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                <Zap className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Quick Scan</span>
              </button>
              <button className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                <Plus className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Add Asset</span>
              </button>
              <button className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
                <Search className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Search</span>
              </button>
              <button className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl relative">
                <Bell className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Alerts</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Navigation</h3>
            {navItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text:white">System Online</p>
                <p className="text-xs text-slate-400">All services running</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
