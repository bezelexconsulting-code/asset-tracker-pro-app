'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { LoadingSpinner } from '@/components/ui/loading';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Scan, MapPin, Clock, User, Package, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface TapRecord {
  id: string;
  nfcTagId: string;
  assetName?: string;
  location?: string;
  notes?: string;
  tappedAt: string;
  workerName?: string;
}

interface AssetInfo {
  id: string;
  name: string;
  category?: string;
  serialNumber?: string;
  location?: string;
  subClientName?: string;
}

export default function NFCTapPage() {
  const [nfcTagId, setNfcTagId] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null);
  const [recentTaps, setRecentTaps] = useState<TapRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isNFCSupported, setIsNFCSupported] = useState(false);

  useEffect(() => {
    // Check if NFC is supported
    if ('NDEFReader' in window) {
      setIsNFCSupported(true);
    }
    fetchRecentTaps();
  }, []);

  const fetchRecentTaps = async () => {
    try {
      const response = await fetch('/api/nfc/tap?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentTaps(data.taps || []);
      }
    } catch (error) {
      console.error('Error fetching recent taps:', error);
    }
  };

  const fetchAssetInfo = async (tagId: string) => {
    try {
      const response = await fetch(`/api/client/assets?nfcTagId=${tagId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.assets && data.assets.length > 0) {
          setAssetInfo(data.assets[0]);
        } else {
          setAssetInfo(null);
        }
      }
    } catch (error) {
      console.error('Error fetching asset info:', error);
      setAssetInfo(null);
    }
  };

  const handleNFCTagChange = (value: string) => {
    setNfcTagId(value);
    if (value.length > 3) {
      fetchAssetInfo(value);
    } else {
      setAssetInfo(null);
    }
  };

  const startNFCReading = async () => {
    if (!isNFCSupported) {
      setMessage({ type: 'error', text: 'NFC is not supported on this device' });
      return;
    }

    try {
      // @ts-ignore - NDEFReader is experimental
      const ndef = new NDEFReader();
      await ndef.scan();
      
      setMessage({ type: 'success', text: 'NFC reader activated. Tap an NFC tag...' });
      
      // @ts-ignore
      ndef.addEventListener('reading', ({ message, serialNumber }) => {
        const tagId = serialNumber || 'unknown';
        setNfcTagId(tagId);
        fetchAssetInfo(tagId);
        setMessage({ type: 'success', text: `NFC tag detected: ${tagId}` });
      });

    } catch (error) {
      console.error('Error starting NFC reading:', error);
      setMessage({ type: 'error', text: 'Failed to start NFC reading. Please check permissions.' });
    }
  };

  const handleTapSubmit = async () => {
    if (!nfcTagId.trim()) {
      setMessage({ type: 'error', text: 'Please enter or scan an NFC tag ID' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/nfc/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nfcTagId: nfcTagId.trim(),
          location: location.trim(),
          notes: notes.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: 'Tap recorded successfully!' });
        
        // Reset form
        setNfcTagId('');
        setLocation('');
        setNotes('');
        setAssetInfo(null);
        
        // Refresh recent taps
        fetchRecentTaps();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to record tap' });
      }
    } catch (error) {
      console.error('Error recording tap:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 5000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="NFC Asset Tracker"
          description="Tap or scan NFC tags to track assets"
          icon={Scan}
        />

        {/* Message Display */}
        {message && (
          <Alert className={`border-l-4 ${message.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <AlertDescription className={`${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.text}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* NFC Scanning Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>Scan NFC Tag</span>
            </CardTitle>
            <CardDescription>
              Use NFC or manually enter tag ID
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* NFC Button */}
            {isNFCSupported && (
              <Button 
                onClick={startNFCReading}
                className="w-full h-12 text-lg"
                variant="outline"
              >
                <Smartphone className="h-5 w-5 mr-2" />
                Activate NFC Reader
              </Button>
            )}

            {/* Manual Input */}
            <div>
              <label className="text-sm font-medium">NFC Tag ID</label>
              <Input
                value={nfcTagId}
                onChange={(e) => handleNFCTagChange(e.target.value)}
                placeholder="Enter or scan NFC tag ID"
                className="text-lg h-12"
              />
            </div>

            {/* Asset Info Display */}
            {assetInfo && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Asset Found</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{assetInfo.name}</h3>
                  <p className="text-sm text-gray-600">
                    {assetInfo.category} • {assetInfo.serialNumber}
                  </p>
                  {assetInfo.subClientName && (
                    <p className="text-sm text-gray-600">Client: {assetInfo.subClientName}</p>
                  )}
                  {assetInfo.location && (
                    <p className="text-sm text-gray-600">Location: {assetInfo.location}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Location Input */}
            <div>
              <label className="text-sm font-medium">Current Location</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you scanning this?"
                className="h-12"
              />
            </div>

            {/* Notes Input */}
            <div>
              <label className="text-sm font-medium">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this scan..."
                className="w-full p-3 border rounded-md resize-none"
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleTapSubmit}
              disabled={loading || !nfcTagId.trim()}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Recording...</span>
                </div>
              ) : (
                'Record Tap'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Taps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Taps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTaps.map((tap) => (
                <div key={tap.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {tap.assetName || `Tag: ${tap.nfcTagId}`}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      {tap.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{tap.location}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(tap.tappedAt).toLocaleTimeString()}</span>
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Recorded
                  </Badge>
                </div>
              ))}
              {recentTaps.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No recent taps
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}