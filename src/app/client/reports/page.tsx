'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Users, 
  Activity, 
  TrendingUp,
  FileSpreadsheet,
  Filter,
  RefreshCw
} from 'lucide-react';

interface SubClientStats {
  subClientId: string;
  subClientName: string;
  subClientEmail: string;
  totalTaps: number;
  firstTap: string | null;
  lastTap: string | null;
}

interface ReportData {
  exportOptions: SubClientStats[];
  totalSubClients: number;
  totalTaps: number;
}

interface NFCTapRecord {
  id: string;
  subClient: {
    id: string;
    name: string;
    email: string;
  };
  nfcTag: {
    id: string;
    name: string;
    location: string;
  };
  tappedAt: string;
  data: any;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [recentActivity, setRecentActivity] = useState<NFCTapRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedSubClient, setSelectedSubClient] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportFormat, setExportFormat] = useState<'single' | 'summary'>('single');

  // Mock client ID - in real app, this would come from authentication
  const clientId = 'client_john_doe';

  useEffect(() => {
    fetchReportData();
    fetchRecentActivity();
  }, []);

  const fetchReportData = async () => {
    try {
      // Mock API call - replace with actual API
      const mockData: ReportData = {
        exportOptions: [
          {
            subClientId: 'subclient_1',
            subClientName: 'John2 Manufacturing',
            subClientEmail: 'john2@manufacturing.com',
            totalTaps: 45,
            firstTap: '2024-01-15T08:30:00Z',
            lastTap: '2024-01-20T17:45:00Z'
          },
          {
            subClientId: 'subclient_2',
            subClientName: 'Sarah Tech Solutions',
            subClientEmail: 'sarah@techsolutions.com',
            totalTaps: 32,
            firstTap: '2024-01-16T09:15:00Z',
            lastTap: '2024-01-20T16:20:00Z'
          },
          {
            subClientId: 'subclient_3',
            subClientName: 'Mike Logistics',
            subClientEmail: 'mike@logistics.com',
            totalTaps: 28,
            firstTap: '2024-01-17T07:45:00Z',
            lastTap: '2024-01-20T18:10:00Z'
          }
        ],
        totalSubClients: 3,
        totalTaps: 105
      };
      
      setReportData(mockData);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      // Mock recent activity data
      const mockActivity: NFCTapRecord[] = [
        {
          id: 'tap_1',
          subClient: {
            id: 'subclient_1',
            name: 'John2 Manufacturing',
            email: 'john2@manufacturing.com'
          },
          nfcTag: {
            id: 'tag_1',
            name: 'Main Entrance',
            location: 'Building A - Entrance'
          },
          tappedAt: '2024-01-20T17:45:00Z',
          data: { type: 'access', zone: 'entrance' }
        },
        {
          id: 'tap_2',
          subClient: {
            id: 'subclient_2',
            name: 'Sarah Tech Solutions',
            email: 'sarah@techsolutions.com'
          },
          nfcTag: {
            id: 'tag_2',
            name: 'Conference Room A',
            location: 'Floor 2 - Room A'
          },
          tappedAt: '2024-01-20T16:20:00Z',
          data: { type: 'access', zone: 'conference' }
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams = {
        clientId,
        subClientId: selectedSubClient === 'all' ? undefined : selectedSubClient,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        format: exportFormat
      };

      // Mock export - replace with actual API call
      console.log('Exporting with params:', exportParams);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real implementation, this would trigger a file download
      alert(`Excel report exported successfully! Format: ${exportFormat}`);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Reports & Analytics"
        description="View subclient activities and export data"
        actions={
          <Button onClick={fetchReportData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Sub-Clients"
          value={reportData?.totalSubClients || 0}
          description="Active clients in your system"
          icon={Users}
        />
        <StatsCard
          title="Total NFC Taps"
          value={reportData?.totalTaps || 0}
          description="All-time tap records"
          icon={Activity}
        />
        <StatsCard
          title="Avg Taps/Client"
          value={reportData ? Math.round(reportData.totalTaps / reportData.totalSubClients) : 0}
          description="Average activity per client"
          icon={TrendingUp}
        />
      </div>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2" />
            Export Data
          </CardTitle>
          <CardDescription>
            Generate Excel reports for your subclient activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sub-Client</label>
              <Select value={selectedSubClient} onValueChange={setSelectedSubClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Clients</SelectItem>
                  {reportData?.exportOptions.map((option) => (
                    <SelectItem key={option.subClientId} value={option.subClientId}>
                      {option.subClientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={exportFormat} onValueChange={(value: 'single' | 'summary') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single Sheet</SelectItem>
                  <SelectItem value="summary">Summary + Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleExport} 
            disabled={exporting}
            className="w-full md:w-auto"
          >
            {exporting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Generating...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sub-Client Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Sub-Client Activity
          </CardTitle>
          <CardDescription>
            Detailed statistics for each sub-client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData?.exportOptions.map((subClient) => (
              <div key={subClient.subClientId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{subClient.subClientName}</h3>
                  <p className="text-sm text-muted-foreground">{subClient.subClientEmail}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{subClient.totalTaps}</div>
                    <div className="text-xs text-muted-foreground">Total Taps</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm">
                      {subClient.firstTap ? formatDate(subClient.firstTap) : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">First Tap</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm">
                      {subClient.lastTap ? formatDate(subClient.lastTap) : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">Last Tap</div>
                  </div>
                  <Badge variant={subClient.totalTaps > 30 ? 'default' : 'secondary'}>
                    {subClient.totalTaps > 30 ? 'High Activity' : 'Normal'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest NFC tap records across all sub-clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{activity.subClient.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {activity.nfcTag.name} • {activity.nfcTag.location}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">{formatDate(activity.tappedAt)}</div>
                  <Badge variant="outline" className="text-xs">
                    {activity.data?.type || 'access'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}