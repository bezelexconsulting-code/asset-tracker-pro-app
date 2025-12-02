'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Building2, Users, Settings, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  id: string;
  companyName: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  _count: {
    users: number;
    assets: number;
  };
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customDomain?: string;
  dashboardTheme?: string;
  timezone?: string;
  currency?: string;
  language?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  clientId: string;
  client: {
    companyName: string;
  };
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDialog, setShowClientDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);

  // Redirect if not super admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isSuperAdmin) {
      redirect('/dashboard');
    }
  }, [session, status]);

  // Fetch clients and users
  useEffect(() => {
    if (session?.user?.isSuperAdmin) {
      fetchClients();
      fetchUsers();
    }
  }, [session]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/super-admin/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/super-admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleCreateClient = async (formData: FormData) => {
    try {
      const response = await fetch('/api/super-admin/clients', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Client created successfully');
        fetchClients();
        setShowClientDialog(false);
      } else {
        toast.error('Failed to create client');
      }
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleUpdateClientStatus = async (clientId: string, status: string) => {
    try {
      const response = await fetch(`/api/super-admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success('Client status updated');
        fetchClients();
      } else {
        toast.error('Failed to update client status');
      }
    } catch (error) {
      toast.error('Failed to update client status');
    }
  };

  const handleUpdateBranding = async (clientId: string, branding: any) => {
    try {
      const response = await fetch(`/api/super-admin/clients/${clientId}/branding`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        toast.success('Branding updated successfully');
        fetchClients();
        setSelectedClient(null);
      } else {
        toast.error('Failed to update branding');
      }
    } catch (error) {
      toast.error('Failed to update branding');
    }
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session?.user?.isSuperAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage clients and their white-label configurations</p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Client Management</h2>
            <Dialog open={showClientDialog} onOpenChange={setShowClientDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Client</DialogTitle>
                  <DialogDescription>
                    Add a new client organization to the platform
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateClient(formData);
                }}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" name="companyName" required />
                    </div>
                    <div>
                      <Label htmlFor="email">Admin Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="adminName">Admin Name</Label>
                      <Input id="adminName" name="adminName" required />
                    </div>
                    <div>
                      <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
                      <Input id="customDomain" name="customDomain" placeholder="client.yourdomain.com" />
                    </div>
                    <Button type="submit" className="w-full">Create Client</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Card key={client.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{client.companyName}</CardTitle>
                  <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{client._count.users} users</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{client._count.assets} assets</span>
                    </div>
                    {client.customDomain && (
                      <div className="text-sm text-muted-foreground">
                        Domain: {client.customDomain}
                      </div>
                    )}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Branding
                      </Button>
                      <Select
                        value={client.status}
                        onValueChange={(status) => handleUpdateClientStatus(client.id, status)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">User Management</h2>
            <Button onClick={() => setShowUserDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage users across all client organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.client.companyName} • {user.role}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-2xl font-semibold">Platform Analytics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.filter(c => c.status === 'ACTIVE').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {clients.reduce((sum, client) => sum + client._count.assets, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Branding Configuration Dialog */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure Branding - {selectedClient.companyName}</DialogTitle>
              <DialogDescription>
                Customize the white-label appearance for this client
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const branding = Object.fromEntries(formData.entries());
              handleUpdateBranding(selectedClient.id, branding);
            }}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      name="primaryColor"
                      type="color"
                      defaultValue={selectedClient.primaryColor || '#3b82f6'}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      name="secondaryColor"
                      type="color"
                      defaultValue={selectedClient.secondaryColor || '#64748b'}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <Input
                    id="accentColor"
                    name="accentColor"
                    type="color"
                    defaultValue={selectedClient.accentColor || '#10b981'}
                  />
                </div>
                <div>
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input
                    id="customDomain"
                    name="customDomain"
                    defaultValue={selectedClient.customDomain || ''}
                    placeholder="client.yourdomain.com"
                  />
                </div>
                <div>
                  <Label htmlFor="dashboardTheme">Dashboard Theme</Label>
                  <Select name="dashboardTheme" defaultValue={selectedClient.dashboardTheme || 'light'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      defaultValue={selectedClient.timezone || 'UTC'}
                      placeholder="America/New_York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      name="currency"
                      defaultValue={selectedClient.currency || 'USD'}
                      placeholder="USD"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select name="language" defaultValue={selectedClient.language || 'en'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setSelectedClient(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}