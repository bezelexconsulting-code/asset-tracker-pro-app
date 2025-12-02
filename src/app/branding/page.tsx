'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Palette, 
  Upload, 
  Eye, 
  Save, 
  RefreshCw, 
  Globe, 
  Clock, 
  DollarSign,
  Languages,
  Monitor,
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import { useBranding, ClientLogo } from '@/components/shared/BrandingProvider';

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

export default function BrandingPage() {
  const { branding, updateBranding } = useBranding();
  const [config, setConfig] = useState<BrandingConfig>({
    companyName: '',
    dashboardTheme: 'light',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (branding) {
      setConfig(branding);
    } else {
      fetchBranding();
    }
  }, [branding]);

  const fetchBranding = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/client/branding');
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/client/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const updatedConfig = await response.json();
        updateBranding(updatedConfig);
        alert('Branding updated successfully!');
      } else {
        alert('Failed to update branding');
      }
    } catch (error) {
      console.error('Failed to save branding:', error);
      alert('Failed to update branding');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon' | 'loginBgImage') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch('/api/upload/branding', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setConfig(prev => ({ ...prev, [type]: url }));
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file');
    }
  };

  const resetToDefaults = () => {
    setConfig({
      companyName: 'Asset Tracker Pro',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#10b981',
      dashboardTheme: 'light',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'en'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branding & Customization</h1>
          <p className="text-gray-600 mt-2">Customize your company's appearance and settings</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>Save Changes</span>
          </Button>
        </div>
      </div>

      {previewMode && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Live Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
              <ClientLogo 
                className="w-12 h-12 rounded-lg"
                fallbackText={config.companyName?.charAt(0) || 'A'}
              />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: config.primaryColor }}>
                  {config.companyName || 'Your Company Name'}
                </h3>
                <p className="text-sm text-gray-600">Asset Management System</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="visual" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visual" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Visual</span>
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>Assets</span>
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Localization</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Theme</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Basic company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={config.companyName}
                  onChange={(e) => setConfig(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter your company name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>Customize your brand colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.primaryColor || '#3b82f6'}
                      onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={config.secondaryColor || '#64748b'}
                      onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.secondaryColor || '#64748b'}
                      onChange={(e) => setConfig(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={config.accentColor || '#10b981'}
                      onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={config.accentColor || '#10b981'}
                      onChange={(e) => setConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Images</CardTitle>
              <CardDescription>Upload your company logo and other brand assets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Company Logo</Label>
                <div className="mt-2 flex items-center space-x-4">
                  {config.logo && (
                    <img src={config.logo} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500">Recommended: 200x200px, PNG or SVG</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Favicon</Label>
                <div className="mt-2 flex items-center space-x-4">
                  {config.favicon && (
                    <img src={config.favicon} alt="Favicon" className="w-8 h-8 object-contain border rounded" />
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                      className="mb-2"
                    />
                    <p className="text-sm text-gray-500">Recommended: 32x32px, ICO or PNG</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Login Background Image</Label>
                <div className="mt-2">
                  {config.loginBgImage && (
                    <img src={config.loginBgImage} alt="Login Background" className="w-full h-32 object-cover border rounded mb-2" />
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'loginBgImage');
                    }}
                    className="mb-2"
                  />
                  <p className="text-sm text-gray-500">Recommended: 1920x1080px, JPG or PNG</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>Configure timezone, currency, and date formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={config.timezone} onValueChange={(value) => setConfig(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={config.currency} onValueChange={(value) => setConfig(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="JPY">JPY (¥)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={config.dateFormat} onValueChange={(value) => setConfig(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Theme</CardTitle>
              <CardDescription>Choose your preferred dashboard appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.dashboardTheme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, dashboardTheme: 'light' }))}
                >
                  <div className="bg-white p-3 rounded border mb-2">
                    <div className="h-2 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <h3 className="font-medium">Light Theme</h3>
                  <p className="text-sm text-gray-600">Clean and bright interface</p>
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.dashboardTheme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, dashboardTheme: 'dark' }))}
                >
                  <div className="bg-gray-800 p-3 rounded border mb-2">
                    <div className="h-2 bg-gray-600 rounded mb-1"></div>
                    <div className="h-2 bg-gray-700 rounded"></div>
                  </div>
                  <h3 className="font-medium">Dark Theme</h3>
                  <p className="text-sm text-gray-600">Easy on the eyes</p>
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    config.dashboardTheme === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, dashboardTheme: 'auto' }))}
                >
                  <div className="bg-gradient-to-r from-white to-gray-800 p-3 rounded border mb-2">
                    <div className="h-2 bg-gray-400 rounded mb-1"></div>
                    <div className="h-2 bg-gray-500 rounded"></div>
                  </div>
                  <h3 className="font-medium">Auto Theme</h3>
                  <p className="text-sm text-gray-600">Follows system preference</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Reset to Defaults</h3>
              <p className="text-sm text-gray-600">Restore all branding settings to default values</p>
            </div>
            <Button variant="outline" onClick={resetToDefaults}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}