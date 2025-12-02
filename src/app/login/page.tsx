'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading';
import { Building2, Users, UserCheck, Scan, Shield, Zap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        // Redirect based on role will be handled by the callback
        router.push('/dashboard');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:block text-white space-y-8 animate-fade-in">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Scan className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gradient">Asset Tracker Pro</h1>
                <p className="text-xl text-white/90">NFC-Powered Asset Management</p>
              </div>
            </div>
            <p className="text-lg text-white/80 leading-relaxed">
              Transform your asset tracking with cutting-edge NFC technology. 
              Manage clients, track products, and export data seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start space-x-4 p-4 glass-effect rounded-xl">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Scan className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">NFC Tracking</h3>
                <p className="text-white/70 text-sm">Instant asset identification with NFC tap technology</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 glass-effect rounded-xl">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Multi-Client Management</h3>
                <p className="text-white/70 text-sm">Manage multiple clients and their assets efficiently</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 glass-effect rounded-xl">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Real-time Analytics</h3>
                <p className="text-white/70 text-sm">Export tracking data to Excel with detailed reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-slide-up">
          <Card className="shadow-2xl border-0 glass-effect">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="p-4 bg-primary/10 rounded-2xl">
                  <Scan className="h-12 w-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900 lg:hidden">
                Asset Tracker Pro
              </CardTitle>
              <CardTitle className="text-2xl font-bold text-gray-900 hidden lg:block">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 input-focus"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 pr-12 input-focus"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-scale-in">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium btn-primary" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Access Levels</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="p-1.5 bg-blue-500 rounded-full">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Owner</span>
                      <p className="text-xs text-blue-700">Full system management</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="p-1.5 bg-green-500 rounded-full">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-green-900">Client Admin</span>
                      <p className="text-xs text-green-700">Manage assets & workers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="p-1.5 bg-purple-500 rounded-full">
                      <UserCheck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <span className="font-medium text-purple-900">Worker</span>
                      <p className="text-xs text-purple-700">Track assigned assets</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}