'use client';

import { useState, useEffect } from 'react';
import { Nfc, Download, Users, CheckCircle, AlertCircle, Zap, Clock, FileSpreadsheet, ArrowLeft, Smartphone, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';

interface SubClient {
  id: string;
  name: string;
  email?: string;
}

interface NFCTag {
  id: string;
  name: string;
  location?: string;
  data?: any;
}

interface NFCTapRecord {
  id: string;
  subClientName: string;
  nfcTagName: string;
  tappedAt: string;
  status: 'success' | 'pending' | 'exported';
}

export default function NFCTapPage() {
  const [selectedSubClient, setSelectedSubClient] = useState<string>('');
  const [subClients, setSubClients] = useState<SubClient[]>([]);
  const [nfcTags, setNFCTags] = useState<NFCTag[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastTap, setLastTap] = useState<NFCTapRecord | null>(null);
  const [recentTaps, setRecentTaps] = useState<NFCTapRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockSubClients: SubClient[] = [
        { id: '1', name: 'John2', email: 'john2@security.com' },
        { id: '2', name: 'Security Team Alpha', email: 'alpha@security.com' },
        { id: '3', name: 'Beta Division', email: 'beta@security.com' }
      ];

      const mockNFCTags: NFCTag[] = [
        { id: '1', name: 'Entrance Gate', location: 'Main Building', data: { type: 'access', zone: 'entrance' } },
        { id: '2', name: 'Server Room', location: 'IT Floor', data: { type: 'access', zone: 'server' } },
        { id: '3', name: 'Asset Tag #001', location: 'Warehouse', data: { type: 'asset', assetId: 'AST001' } }
      ];

      const mockRecentTaps: NFCTapRecord[] = [
        {
          id: '1',
          subClientName: 'John2',
          nfcTagName: 'Entrance Gate',
          tappedAt: new Date(Date.now() - 300000).toISOString(),
          status: 'success'
        },
        {
          id: '2',
          subClientName: 'Security Team Alpha',
          nfcTagName: 'Server Room',
          tappedAt: new Date(Date.now() - 600000).toISOString(),
          status: 'exported'
        }
      ];

      setSubClients(mockSubClients);
      setNFCTags(mockNFCTags);
      setRecentTaps(mockRecentTaps);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNFCTap = async () => {
    if (!selectedSubClient) {
      alert('Please select a client first');
      return;
    }

    setIsScanning(true);

    try {
      // Simulate NFC scanning delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock NFC tap - in real implementation, this would use Web NFC API
      const randomTag = nfcTags[Math.floor(Math.random() * nfcTags.length)];
      const selectedClient = subClients.find(sc => sc.id === selectedSubClient);

      const newTap: NFCTapRecord = {
        id: Date.now().toString(),
        subClientName: selectedClient?.name || 'Unknown',
        nfcTagName: randomTag.name,
        tappedAt: new Date().toISOString(),
        status: 'success'
      };

      setLastTap(newTap);
      setRecentTaps([newTap, ...recentTaps.slice(0, 9)]);

      // Auto-export to Excel after successful tap
      setTimeout(() => {
        handleAutoExport(newTap);
      }, 1000);

    } catch (error) {
      console.error('Error during NFC tap:', error);
      alert('Failed to process NFC tap. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleAutoExport = async (tapRecord: NFCTapRecord) => {
    try {
      // Import the Excel export service dynamically
      const { excelExportService } = await import('@/lib/excel-export');
      
      // Convert tap record to the format expected by the export service
      const nfcTapData = {
        id: tapRecord.id,
        subClientId: selectedSubClient,
        subClientName: tapRecord.subClientName,
        nfcTagId: 'tag_' + Math.random().toString(36).substr(2, 9), // Mock NFC tag ID
        nfcTagName: tapRecord.nfcTagName,
        nfcTagLocation: 'Mock Location', // In real implementation, this would come from the NFC tag data
        tappedAt: tapRecord.tappedAt,
        data: {
          type: 'access',
          zone: tapRecord.nfcTagName.toLowerCase().includes('entrance') ? 'entrance' : 'general',
          timestamp: tapRecord.tappedAt
        }
      };

      // Get existing data for this subclient (in real app, this would come from API)
      const existingData = recentTaps
        .filter(tap => tap.subClientName === tapRecord.subClientName)
        .map(tap => ({
          id: tap.id,
          subClientId: selectedSubClient,
          subClientName: tap.subClientName,
          nfcTagId: 'tag_' + Math.random().toString(36).substr(2, 9),
          nfcTagName: tap.nfcTagName,
          nfcTagLocation: 'Mock Location',
          tappedAt: tap.tappedAt,
          data: { type: 'access', zone: 'general' }
        }));

      // Export to Excel
      await excelExportService.exportNFCTapData(nfcTapData, existingData, {
        filename: `${tapRecord.subClientName}_NFC_Taps_${new Date().toISOString().split('T')[0]}.xlsx`,
        autoDownload: true
      });
      
      // Update the tap status to exported
      setRecentTaps(prev => 
        prev.map(tap => 
          tap.id === tapRecord.id 
            ? { ...tap, status: 'exported' }
            : tap
        )
      );

      if (lastTap?.id === tapRecord.id) {
        setLastTap({ ...tapRecord, status: 'exported' });
      }

      // Show success notification
      alert(`Data automatically exported to Excel for ${tapRecord.subClientName}! The file has been downloaded.`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'exported':
        return <FileSpreadsheet className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Recorded';
      case 'exported':
        return 'Exported to Excel';
      case 'pending':
        return 'Processing';
      default:
        return 'Failed';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/client" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  NFC Tap Interface
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Tap NFC tags to automatically record data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium hidden sm:inline">Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Client Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Select Client</h2>
              <p className="text-sm text-gray-600">Choose who is performing the NFC tap</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subClients.map((client) => (
              <div
                key={client.id}
                onClick={() => setSelectedSubClient(client.id)}
                className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedSubClient === client.id
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                    : 'bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className={`font-semibold ${selectedSubClient === client.id ? 'text-white' : 'text-gray-900'}`}>
                  {client.name}
                </div>
                <div className={`text-sm ${selectedSubClient === client.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {client.email}
                </div>
                {selectedSubClient === client.id && (
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 text-white mr-1" />
                    <span className="text-xs text-white">Selected</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* NFC Tap Interface */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <Nfc className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">NFC Tap Zone</h2>
          </div>
          
          <div className="text-center">
            {/* NFC Circle */}
            <div className="mb-8">
              <div className={`mx-auto w-40 h-40 sm:w-48 sm:h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
                isScanning 
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 animate-pulse shadow-2xl' 
                  : selectedSubClient 
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg hover:shadow-xl' 
                    : 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100'
              }`}>
                {/* Animated rings for scanning */}
                {isScanning && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
                    <div className="absolute inset-4 rounded-full border-2 border-blue-300 animate-ping opacity-50" style={{animationDelay: '0.5s'}}></div>
                  </>
                )}
                
                {isScanning ? (
                  <div className="relative z-10">
                    <div className="animate-spin">
                      <Zap className="h-16 w-16 text-blue-600" />
                    </div>
                    <div className="mt-2 text-sm font-medium text-blue-600">Scanning...</div>
                  </div>
                ) : (
                  <div className="relative z-10 flex flex-col items-center">
                    <Nfc className={`h-16 w-16 mb-2 ${
                      selectedSubClient ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <div className={`text-sm font-medium ${
                      selectedSubClient ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      {selectedSubClient ? 'Ready to Tap' : 'Select Client First'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tap Button */}
            <button
              onClick={handleNFCTap}
              disabled={!selectedSubClient || isScanning}
              className={`px-8 py-4 sm:px-12 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 transform ${
                !selectedSubClient || isScanning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95'
              }`}
            >
              {isScanning ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Scanning NFC Tag...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Nfc className="h-6 w-6" />
                  <span>Tap NFC Tag</span>
                </div>
              )}
            </button>

            {!selectedSubClient && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <p className="text-sm text-amber-700 font-medium">Please select a client first</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Last Tap Result */}
        {lastTap && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Last Tap Result</h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 text-lg">
                    {lastTap.subClientName} → {lastTap.nfcTagName}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(lastTap.tappedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/60 px-3 py-2 rounded-lg">
                  {getStatusIcon(lastTap.status)}
                  <span className="text-sm font-semibold text-gray-700">{getStatusText(lastTap.status)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Taps */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Taps</h2>
              <p className="text-sm text-gray-600">Latest NFC tap activities</p>
            </div>
          </div>
          
          {recentTaps.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Nfc className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent taps</p>
              <p className="text-sm text-gray-400 mt-1">Start tapping NFC tags to see activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTaps.map((tap, index) => (
                <div 
                  key={tap.id} 
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200"
                  style={{animationDelay: `${index * 100}ms`}}
                >
                  <div className="space-y-1 mb-3 sm:mb-0">
                    <div className="font-semibold text-gray-900">
                      {tap.subClientName} → {tap.nfcTagName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(tap.tappedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-gray-100">
                    {getStatusIcon(tap.status)}
                    <span className="text-sm font-medium text-gray-700">{getStatusText(tap.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}