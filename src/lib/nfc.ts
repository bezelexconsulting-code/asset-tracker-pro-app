'use client'

// NFC utility functions for reading and writing NFC tags
export interface NFCData {
  id: string
  itemId?: string
  name?: string
  serialNumber?: string
  category?: string
  timestamp?: string
  customData?: Record<string, any>
}

export class NFCManager {
  private ndef: any = null

  constructor() {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      this.ndef = new (window as any).NDEFReader()
    }
  }

  // Check if NFC is supported
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'NDEFReader' in window
  }

  // Request NFC permissions
  async requestPermission(): Promise<boolean> {
    try {
      if (!this.isSupported()) {
        throw new Error('NFC is not supported on this device')
      }

      // Check if permissions API is available
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'nfc' as any })
        return permission.state === 'granted'
      }

      return true // Assume granted if permissions API not available
    } catch (error) {
      console.error('Error requesting NFC permission:', error)
      return false
    }
  }

  // Start scanning for NFC tags
  async startScanning(onTagRead: (data: NFCData) => void, onError?: (error: Error) => void): Promise<void> {
    try {
      if (!this.ndef) {
        throw new Error('NFC not supported')
      }

      await this.ndef.scan()
      console.log('NFC scan started')

      this.ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        console.log('NFC tag detected:', serialNumber)
        
        const nfcData: NFCData = {
          id: serialNumber,
          timestamp: new Date().toISOString()
        }

        // Parse NDEF records
        for (const record of message.records) {
          if (record.recordType === 'text') {
            try {
              const textDecoder = new TextDecoder(record.encoding)
              const text = textDecoder.decode(record.data)
              
              // Try to parse as JSON
              try {
                const jsonData = JSON.parse(text)
                Object.assign(nfcData, jsonData)
              } catch {
                // If not JSON, treat as plain text
                nfcData.customData = { text }
              }
            } catch (error) {
              console.error('Error decoding text record:', error)
            }
          } else if (record.recordType === 'url') {
            const textDecoder = new TextDecoder()
            nfcData.customData = { 
              ...nfcData.customData, 
              url: textDecoder.decode(record.data) 
            }
          }
        }

        onTagRead(nfcData)
      })

      this.ndef.addEventListener('readingerror', (error: any) => {
        console.error('NFC reading error:', error)
        if (onError) {
          onError(new Error('Failed to read NFC tag'))
        }
      })

    } catch (error) {
      console.error('Error starting NFC scan:', error)
      if (onError) {
        onError(error as Error)
      }
    }
  }

  // Stop scanning
  async stopScanning(): Promise<void> {
    try {
      if (this.ndef) {
        // Remove event listeners
        this.ndef.removeEventListener('reading', () => {})
        this.ndef.removeEventListener('readingerror', () => {})
        console.log('NFC scan stopped')
      }
    } catch (error) {
      console.error('Error stopping NFC scan:', error)
    }
  }

  // Write data to NFC tag
  async writeTag(data: NFCData): Promise<boolean> {
    try {
      if (!this.ndef) {
        throw new Error('NFC not supported')
      }

      const jsonString = JSON.stringify(data)
      
      await this.ndef.write({
        records: [
          {
            recordType: 'text',
            data: jsonString
          }
        ]
      })

      console.log('NFC tag written successfully')
      return true
    } catch (error) {
      console.error('Error writing NFC tag:', error)
      return false
    }
  }

  // Read a single tag (one-time read)
  async readSingleTag(): Promise<NFCData | null> {
    return new Promise((resolve, reject) => {
      let hasRead = false

      const onTagRead = (data: NFCData) => {
        if (!hasRead) {
          hasRead = true
          this.stopScanning()
          resolve(data)
        }
      }

      const onError = (error: Error) => {
        if (!hasRead) {
          hasRead = true
          this.stopScanning()
          reject(error)
        }
      }

      this.startScanning(onTagRead, onError)

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!hasRead) {
          hasRead = true
          this.stopScanning()
          reject(new Error('NFC read timeout'))
        }
      }, 30000)
    })
  }
}

// Create a singleton instance
export const nfcManager = new NFCManager()

// Utility functions
export const formatNFCData = (data: NFCData): string => {
  return JSON.stringify(data, null, 2)
}

export const parseNFCData = (jsonString: string): NFCData | null => {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

// Check if device supports NFC
export const checkNFCSupport = (): { supported: boolean; message: string } => {
  if (typeof window === 'undefined') {
    return { supported: false, message: 'Not running in browser environment' }
  }

  if (!('NDEFReader' in window)) {
    return { supported: false, message: 'NFC is not supported on this device or browser' }
  }

  return { supported: true, message: 'NFC is supported' }
}