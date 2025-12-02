'use client'

import { useState, useEffect } from 'react'
import { Download, Smartphone, Tablet, Monitor, CheckCircle, ArrowRight, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function DownloadPage() {
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [copied, setCopied] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [appUrl, setAppUrl] = useState('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const userAgent = navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
    setIsAndroid(/android/.test(userAgent))
    setAppUrl(window.location.origin)

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      }
      setDeferredPrompt(null)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const features = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Optimized",
      description: "Built specifically for mobile devices with touch-friendly interface"
    },
    {
      icon: <Tablet className="w-6 h-6" />,
      title: "Cross-Platform",
      description: "Works seamlessly on iOS, Android, and desktop devices"
    },
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Offline Ready",
      description: "Access your assets even without internet connection"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "NFC Support",
      description: "Quick asset check-in/out with NFC technology"
    }
  ]

  const instructions = [
    {
      platform: "iPhone & iPad",
      steps: [
        "Open this page in Safari",
        "Tap the Share button (↗)",
        "Scroll down and tap 'Add to Home Screen'",
        "Tap 'Add' to install the app"
      ]
    },
    {
      platform: "Android",
      steps: [
        "Open this page in Chrome",
        "Tap the menu (⋮) in the top right",
        "Select 'Add to Home Screen'",
        "Tap 'Add' to install the app"
      ]
    },
    {
      platform: "Desktop",
      steps: [
        "Open this page in Chrome, Edge, or Firefox",
        "Look for the install button in the address bar",
        "Click 'Install' to add the app to your computer",
        "Access from your app menu or desktop"
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Asset Tracker Pro</h1>
            </div>
            <Link 
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Login
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4 mr-2" />
              Progressive Web App
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Technician App
              <span className="block text-blue-600">Ready to Install</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Access your asset tracking system from anywhere with our mobile-optimized Progressive Web App. 
              Install it on your device for quick access and offline functionality.
            </p>
          </div>

          {/* Install Button */}
          <div className="mb-12">
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5 mr-3" />
                Install App Now
              </button>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  App is ready to install - follow the instructions below
                </div>
              </div>
            )}
          </div>

          {/* App Link */}
          <div className="bg-white rounded-xl p-6 shadow-lg border max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">App URL:</span>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-600 break-all">
              {isClient ? appUrl : 'Loading...'}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Install the Technician App?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Instructions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Installation Instructions
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {instructions.map((instruction, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {instruction.platform}
                </h3>
                <ol className="space-y-3">
                  {instruction.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mr-3 mt-0.5 flex-shrink-0">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Install the app now or access the web version directly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/tech"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ExternalLink className="w-5 h-5 mr-3" />
              Open Web App
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Go to Login
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white border-t">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-600">
            Need help? Contact support or check our documentation.
          </p>
        </div>
      </footer>
    </div>
  )
}