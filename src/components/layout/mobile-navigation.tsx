'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Package, 
  Users, 
  BarChart3,
  Home,
  Search,
  Settings
} from 'lucide-react'

interface MobileNavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
}

export default function MobileNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(true)

  const navigation: MobileNavItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard' || pathname === '/'
    },
    {
      name: 'Assets',
      href: '/inventory',
      icon: Package,
      active: pathname.startsWith('/inventory')
    },
    {
      name: 'Customers',
      href: '/customers',
      icon: Users,
      active: pathname.startsWith('/customers')
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      active: pathname.startsWith('/reports')
    }
  ]

  const handleNavClick = (href: string) => {
    router.push(href)
  }

  // Hide navigation on scroll down, show on scroll up
  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false

    const updateNavigation = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      lastScrollY = currentScrollY
      ticking = false
    }

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateNavigation)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-transform duration-300 md:hidden ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex justify-around items-center h-16 px-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.href)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                item.active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${item.active ? 'font-bold' : ''}`} />
              <span className={`text-xs font-medium ${item.active ? 'font-bold' : ''}`}>
                {item.name}
              </span>
              {item.active && (
                <div className="absolute bottom-1 w-6 h-1 bg-blue-600 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Safe area for mobile devices */}
      <div className="h-safe-bottom bg-white"></div>
    </nav>
  )
}