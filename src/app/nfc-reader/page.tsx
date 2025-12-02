'use client'

import { useState, useEffect } from 'react'
import { nfcManager, NFCData, checkNFCSupport } from '@/lib/nfc'
import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Badge } from '@/components/ui/badge'
import { Nfc, Play, Square, AlertCircle, CheckCircle, Loader2, Trash2, History } from 'lucide-react'

export default function NFCReaderPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [nfcSupport, setNfcSupport] = useState<{ supported: boolean; message: string }>({ supported: false, message: '' })
  const [lastReadData, setLastReadData] = useState<NFCData | null>(null)
  const [scanHistory, setScanHistory] = useState<NFCData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const support = checkNFCSupport()
    setNfcSupport(support)
  }, [])

  const startScanning = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const hasPermission = await nfcManager.requestPermission()
      if (!hasPermission) {
        throw new Error('NFC permission denied')
      }

      await nfcManager.startScanning(
        (data: NFCData) => {
          console.log('NFC tag read:', data)
          setLastReadData(data)
          setScanHistory(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 scans
          setError(null)
        },
        (error: Error) => {
          console.error('NFC scan error:', error)
          setError(error.message)
          setIsScanning(false)
        }
      )

      setIsScanning(true)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to start NFC scanning:', error)
      setError(error instanceof Error ? error.message : 'Failed to start scanning')
      setIsScanning(false)
      setIsLoading(false)
    }
  }

  const stopScanning = async () => {
    try {
      await nfcManager.stopScanning()
      setIsScanning(false)
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to stop NFC scanning:', error)
      setError('Failed to stop scanning')
    }
  }

  const readSingleTag = async () => {
    try {
      setError(null)
      setIsLoading(true)

      const data = await nfcManager.readSingleTag()
      if (data) {
        setLastReadData(data)
        setScanHistory(prev => [data, ...prev.slice(0, 9)])
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to read NFC tag:', error)
      setError(error instanceof Error ? error.message : 'Failed to read tag')
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setScanHistory([])
    setLastReadData(null)
    setError(null)
  }

  if (!nfcSupport.supported) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive" className="text-center p-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">NFC Not Supported</h2>
            <AlertDescription className="text-base">
              {nfcSupport.message}
              <br />
              <span className="text-sm mt-2 block">
                Please use a device with NFC capability and a compatible browser (Chrome, Edge, etc.)
              </span>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="NFC Tag Reader"
          description="Scan NFC tags to read inventory data and manage items"
          icon={Nfc}
          gradient="blue"
        />

        {/* NFC Scanner Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Nfc className="h-6 w-6 text-blue-600 mr-2" />
                NFC Scanner
              </CardTitle>
              {isScanning && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  Scanning...
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Control Buttons */}
            <div className="flex flex-wrap gap-4">
              {!isScanning ? (
                <>
                  <Button
                    onClick={startScanning}
                    disabled={isLoading}
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Start Continuous Scan
                  </Button>
                  <Button
                    onClick={readSingleTag}
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Nfc className="h-4 w-4 mr-2" />
                    )}
                    Read Single Tag
                  </Button>
                </>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex items-center"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Stop Scanning
                </Button>
              )}
              
              {scanHistory.length > 0 && (
                <Button
                  onClick={clearHistory}
                  variant="outline"
                  className="flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Instructions:</div>
                <ul className="text-sm space-y-1">
                  <li>• Hold your device near an NFC tag to read it</li>
                  <li>• Use "Continuous Scan" to read multiple tags</li>
                  <li>• Use "Read Single Tag" for one-time reading</li>
                  <li>• Make sure NFC is enabled on your device</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Last Read Data */}
        {lastReadData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                Last Read Tag
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tag ID</label>
                    <p className="text-sm text-gray-900 font-mono">{lastReadData.id}</p>
                  </div>
                  
                  {lastReadData.itemId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                      <p className="text-sm text-gray-900">{lastReadData.itemId}</p>
                    </div>
                  )}
                  
                  {lastReadData.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <p className="text-sm text-gray-900">{lastReadData.name}</p>
                    </div>
                  )}
                  
                  {lastReadData.serialNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                      <p className="text-sm text-gray-900">{lastReadData.serialNumber}</p>
                    </div>
                  )}
                  
                  {lastReadData.category && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <p className="text-sm text-gray-900">{lastReadData.category}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
                    <p className="text-sm text-gray-900">
                      {lastReadData.timestamp ? new Date(lastReadData.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {lastReadData.customData && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Data</label>
                    <pre className="text-xs text-gray-900 bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(lastReadData.customData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-6 w-6 text-gray-600 mr-2" />
                Scan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanHistory.map((data, index) => (
                  <div key={`${data.id}-${index}`} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-xs text-gray-500">
                        {data.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-1 font-mono text-xs">{data.id.substring(0, 8)}...</span>
                      </div>
                      
                      {data.name && (
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-1">{data.name}</span>
                        </div>
                      )}
                      
                      {data.itemId && (
                        <div>
                          <span className="text-gray-600">Item:</span>
                          <span className="ml-1">{data.itemId}</span>
                        </div>
                      )}
                      
                      {data.category && (
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <span className="ml-1">{data.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}