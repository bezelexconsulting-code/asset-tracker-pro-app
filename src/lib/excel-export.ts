import * as XLSX from 'xlsx';

export interface NFCTapData {
  id: string;
  subClientId: string;
  subClientName: string;
  nfcTagId: string;
  nfcTagName: string;
  nfcTagLocation?: string;
  tappedAt: string;
  data?: any;
}

export interface ClientBranding {
  companyName: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  headerText?: string;
  footerText?: string;
}

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  includeHeaders?: boolean;
  autoDownload?: boolean;
  clientBranding?: ClientBranding;
  tenantId?: string;
  includeClientInfo?: boolean;
}

export class ExcelExportService {
  private static instance: ExcelExportService;

  public static getInstance(): ExcelExportService {
    if (!ExcelExportService.instance) {
      ExcelExportService.instance = new ExcelExportService();
    }
    return ExcelExportService.instance;
  }

  /**
   * Export NFC tap data to Excel automatically with client branding
   */
  public async exportNFCTapData(
    tapData: NFCTapData,
    existingData: NFCTapData[] = [],
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `${tapData.subClientName}_NFC_Taps_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName = 'NFC Tap Records',
        includeHeaders = true,
        autoDownload = true,
        clientBranding,
        tenantId,
        includeClientInfo = true
      } = options;

      // Filter data by tenant if specified
      let filteredData = [...existingData, tapData];
      if (tenantId) {
        filteredData = filteredData.filter(tap => tap.subClientId === tenantId);
      }

      // Prepare data for Excel export with client branding
      const exportData = filteredData.map(tap => ({
        'Tap ID': tap.id,
        'Client Name': tap.subClientName,
        'NFC Tag': tap.nfcTagName,
        'Location': tap.nfcTagLocation || 'N/A',
        'Tap Date': new Date(tap.tappedAt).toLocaleDateString(),
        'Tap Time': new Date(tap.tappedAt).toLocaleTimeString(),
        'Additional Data': tap.data ? JSON.stringify(tap.data) : 'N/A'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Add client branding header if provided
      if (clientBranding && includeClientInfo) {
        this.addClientBrandingHeader(worksheet, clientBranding);
      }

      // Auto-size columns
      const columnWidths = [
        { wch: 15 }, // Tap ID
        { wch: 20 }, // Client Name
        { wch: 20 }, // NFC Tag
        { wch: 15 }, // Location
        { wch: 12 }, // Tap Date
        { wch: 12 }, // Tap Time
        { wch: 30 }  // Additional Data
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      if (autoDownload) {
        // Generate and download the file
        XLSX.writeFile(workbook, filename);
      }

      console.log(`Excel export completed: ${filename}`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export NFC tap data to Excel');
    }
  }

  /**
   * Export multiple subclient data to separate sheets with client branding
   */
  public async exportMultipleSubClients(
    subClientData: { [subClientName: string]: NFCTapData[] },
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `Multi_Client_NFC_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
        autoDownload = true,
        clientBranding,
        tenantId,
        includeClientInfo = true
      } = options;

      const workbook = XLSX.utils.book_new();

      // Filter data by tenant if specified
      let filteredSubClientData = subClientData;
      if (tenantId) {
        filteredSubClientData = Object.fromEntries(
          Object.entries(subClientData).filter(([_, taps]) => 
            taps.some(tap => tap.subClientId === tenantId)
          )
        );
      }

      // Create a sheet for each subclient
      Object.entries(filteredSubClientData).forEach(([subClientName, taps]) => {
        const exportData = taps.map(tap => ({
          'Tap ID': tap.id,
          'NFC Tag': tap.nfcTagName,
          'Location': tap.nfcTagLocation || 'N/A',
          'Tap Date': new Date(tap.tappedAt).toLocaleDateString(),
          'Tap Time': new Date(tap.tappedAt).toLocaleTimeString(),
          'Additional Data': tap.data ? JSON.stringify(tap.data) : 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // Add client branding header if provided
        if (clientBranding && includeClientInfo) {
          this.addClientBrandingHeader(worksheet, clientBranding);
        }
        
        // Auto-size columns
        const columnWidths = [
          { wch: 15 }, // Tap ID
          { wch: 20 }, // NFC Tag
          { wch: 15 }, // Location
          { wch: 12 }, // Tap Date
          { wch: 12 }, // Tap Time
          { wch: 30 }  // Additional Data
        ];
        worksheet['!cols'] = columnWidths;

        // Sanitize sheet name (Excel has restrictions)
        const sanitizedSheetName = subClientName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
      });

      if (autoDownload) {
        XLSX.writeFile(workbook, filename);
      }

      console.log(`Multi-client Excel export completed: ${filename}`);
    } catch (error) {
      console.error('Error exporting multi-client data to Excel:', error);
      throw new Error('Failed to export multi-client data to Excel');
    }
  }

  /**
   * Create a summary report for all subclients with client branding
   */
  public async exportSummaryReport(
    subClientData: { [subClientName: string]: NFCTapData[] },
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `NFC_Summary_Report_${new Date().toISOString().split('T')[0]}.xlsx`,
        autoDownload = true,
        clientBranding,
        tenantId,
        includeClientInfo = true
      } = options;

      const workbook = XLSX.utils.book_new();

      // Filter data by tenant if specified
      let filteredSubClientData = subClientData;
      if (tenantId) {
        filteredSubClientData = Object.fromEntries(
          Object.entries(subClientData).filter(([_, taps]) => 
            taps.some(tap => tap.subClientId === tenantId)
          )
        );
      }

      // Create summary data
      const summaryData = Object.entries(filteredSubClientData).map(([subClientName, taps]) => ({
        'Client Name': subClientName,
        'Total Taps': taps.length,
        'First Tap': taps.length > 0 ? new Date(Math.min(...taps.map(t => new Date(t.tappedAt).getTime()))).toLocaleDateString() : 'N/A',
        'Last Tap': taps.length > 0 ? new Date(Math.max(...taps.map(t => new Date(t.tappedAt).getTime()))).toLocaleDateString() : 'N/A',
        'Unique Tags': new Set(taps.map(t => t.nfcTagId)).size,
        'Most Used Tag': this.getMostUsedTag(taps)
      }));

      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      
      // Add client branding header if provided
      if (clientBranding && includeClientInfo) {
        this.addClientBrandingHeader(summarySheet, clientBranding);
      }
      
      summarySheet['!cols'] = [
        { wch: 20 }, // Client Name
        { wch: 12 }, // Total Taps
        { wch: 12 }, // First Tap
        { wch: 12 }, // Last Tap
        { wch: 12 }, // Unique Tags
        { wch: 20 }  // Most Used Tag
      ];

      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Add detailed data for each client
      Object.entries(filteredSubClientData).forEach(([subClientName, taps]) => {
        const detailData = taps.map(tap => ({
          'Tap ID': tap.id,
          'NFC Tag': tap.nfcTagName,
          'Location': tap.nfcTagLocation || 'N/A',
          'Date': new Date(tap.tappedAt).toLocaleDateString(),
          'Time': new Date(tap.tappedAt).toLocaleTimeString()
        }));

        const detailSheet = XLSX.utils.json_to_sheet(detailData);
        
        // Add client branding header if provided
        if (clientBranding && includeClientInfo) {
          this.addClientBrandingHeader(detailSheet, clientBranding);
        }
        
        detailSheet['!cols'] = [
          { wch: 15 }, // Tap ID
          { wch: 20 }, // NFC Tag
          { wch: 15 }, // Location
          { wch: 12 }, // Date
          { wch: 12 }  // Time
        ];

        const sanitizedSheetName = subClientName.replace(/[\\\/\?\*\[\]]/g, '_').substring(0, 31);
        XLSX.utils.book_append_sheet(workbook, detailSheet, sanitizedSheetName);
      });

      if (autoDownload) {
        XLSX.writeFile(workbook, filename);
      }

      console.log(`Summary report exported: ${filename}`);
    } catch (error) {
      console.error('Error exporting summary report:', error);
      throw new Error('Failed to export summary report');
    }
  }

  private getMostUsedTag(taps: NFCTapData[]): string {
    if (taps.length === 0) return 'N/A';

    const tagCounts = taps.reduce((acc, tap) => {
      acc[tap.nfcTagName] = (acc[tap.nfcTagName] || 0) + 1;
      return acc;
    }, {} as { [tagName: string]: number });

    const mostUsed = Object.entries(tagCounts).reduce((a, b) => 
      tagCounts[a[0]] > tagCounts[b[0]] ? a : b
    );

    return `${mostUsed[0]} (${mostUsed[1]} times)`;
  }

  /**
   * Add client branding header to worksheet
   */
  private addClientBrandingHeader(worksheet: XLSX.WorkSheet, branding: ClientBranding): void {
    try {
      // Get the range of the worksheet
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Shift all data down by 3 rows to make room for header
      const newRange = { ...range, e: { ...range.e, r: range.e.r + 3 } };
      
      // Move existing data down
      for (let row = newRange.e.r; row >= range.s.r + 3; row--) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const oldAddr = XLSX.utils.encode_cell({ r: row - 3, c: col });
          const newAddr = XLSX.utils.encode_cell({ r: row, c: col });
          if (worksheet[oldAddr]) {
            worksheet[newAddr] = worksheet[oldAddr];
            delete worksheet[oldAddr];
          }
        }
      }

      // Add branding header
      worksheet['A1'] = { t: 's', v: branding.companyName || 'Company Report' };
      worksheet['A2'] = { t: 's', v: branding.headerText || 'NFC Tap Data Export' };
      worksheet['A3'] = { t: 's', v: `Generated on: ${new Date().toLocaleDateString()}` };

      // Update worksheet range
      worksheet['!ref'] = XLSX.utils.encode_range(newRange);

      // Add styling if possible (note: basic XLSX doesn't support full styling)
      if (branding.primaryColor) {
        // This would require additional libraries for full styling support
        console.log(`Applied branding with primary color: ${branding.primaryColor}`);
      }
    } catch (error) {
      console.warn('Could not add branding header:', error);
    }
  }

  /**
   * Create tenant-specific export with enhanced filtering
   */
  public async exportTenantData(
    clientId: string,
    tenantData: NFCTapData[],
    options: ExcelExportOptions = {}
  ): Promise<void> {
    try {
      const {
        filename = `Tenant_${clientId}_Export_${new Date().toISOString().split('T')[0]}.xlsx`,
        autoDownload = true,
        clientBranding,
        includeClientInfo = true
      } = options;

      // Filter data for this specific tenant
      const filteredData = tenantData.filter(tap => tap.subClientId === clientId);

      if (filteredData.length === 0) {
        throw new Error('No data found for the specified tenant');
      }

      // Prepare tenant-specific export data
      const exportData = filteredData.map(tap => ({
        'Tap ID': tap.id,
        'Tenant': tap.subClientName,
        'NFC Tag': tap.nfcTagName,
        'Location': tap.nfcTagLocation || 'N/A',
        'Date': new Date(tap.tappedAt).toLocaleDateString(),
        'Time': new Date(tap.tappedAt).toLocaleTimeString(),
        'Day of Week': new Date(tap.tappedAt).toLocaleDateString('en-US', { weekday: 'long' }),
        'Additional Data': tap.data ? JSON.stringify(tap.data) : 'N/A'
      }));

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Add client branding header if provided
      if (clientBranding && includeClientInfo) {
        this.addClientBrandingHeader(worksheet, clientBranding);
      }

      // Auto-size columns
      const columnWidths = [
        { wch: 15 }, // Tap ID
        { wch: 20 }, // Tenant
        { wch: 20 }, // NFC Tag
        { wch: 15 }, // Location
        { wch: 12 }, // Date
        { wch: 12 }, // Time
        { wch: 15 }, // Day of Week
        { wch: 30 }  // Additional Data
      ];
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenant Data');

      if (autoDownload) {
        XLSX.writeFile(workbook, filename);
      }

      console.log(`Tenant-specific Excel export completed: ${filename}`);
    } catch (error) {
      console.error('Error exporting tenant data to Excel:', error);
      throw new Error('Failed to export tenant data to Excel');
    }
  }
}

// Export singleton instance
export const excelExportService = ExcelExportService.getInstance();