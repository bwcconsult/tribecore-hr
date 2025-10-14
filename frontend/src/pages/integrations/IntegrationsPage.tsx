import { useState } from 'react';
import {
  Settings,
  Check,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  Slack,
  Calendar,
  Mail,
  Users,
  Database,
  Cloud,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  category: string;
}

export default function IntegrationsPage() {
  const [filter, setFilter] = useState('all');

  const integrations: Integration[] = [
    {
      id: '1',
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: Slack,
      status: 'connected',
      lastSync: '2 minutes ago',
      category: 'Communication',
    },
    {
      id: '2',
      name: 'Google Workspace',
      description: 'Email, calendar, and document sync',
      icon: Mail,
      status: 'connected',
      lastSync: '1 hour ago',
      category: 'Productivity',
    },
    {
      id: '3',
      name: 'Microsoft Teams',
      description: 'Enterprise collaboration platform',
      icon: Users,
      status: 'disconnected',
      category: 'Communication',
    },
    {
      id: '4',
      name: 'SAP SuccessFactors',
      description: 'HR management system integration',
      icon: Database,
      status: 'error',
      lastSync: '3 days ago',
      category: 'HRIS',
    },
    {
      id: '5',
      name: 'Azure Active Directory',
      description: 'Single sign-on and user management',
      icon: Cloud,
      status: 'connected',
      lastSync: '30 minutes ago',
      category: 'Authentication',
    },
    {
      id: '6',
      name: 'Google Calendar',
      description: 'Calendar events and scheduling',
      icon: Calendar,
      status: 'connected',
      lastSync: '5 minutes ago',
      category: 'Productivity',
    },
  ];

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    errors: integrations.filter(i => i.status === 'error').length,
  };

  const filteredIntegrations = integrations.filter(
    integration => filter === 'all' || integration.status === filter
  );

  const handleSync = (name: string) => {
    toast.success(`Syncing ${name}...`);
  };

  const handleConnect = (name: string) => {
    toast.success(`Connecting to ${name}...`);
  };

  const handleDisconnect = (name: string) => {
    toast.success(`Disconnecting from ${name}...`);
  };

  const handleConfigure = (name: string) => {
    toast.success(`Opening ${name} configuration...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'disconnected':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Check className="h-4 w-4" />;
      case 'disconnected':
        return <Pause className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-1">Connect TribeCore with your favorite tools</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.connected}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.errors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'connected' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('connected')}
            >
              Connected
            </Button>
            <Button
              variant={filter === 'disconnected' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('disconnected')}
            >
              Available
            </Button>
            <Button
              variant={filter === 'error' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('error')}
            >
              Errors
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-xs text-gray-500">{integration.category}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    {integration.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>
                
                {integration.lastSync && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last synced: {integration.lastSync}
                  </p>
                )}

                <div className="flex gap-2">
                  {integration.status === 'connected' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSync(integration.name)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConfigure(integration.name)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(integration.name)}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {integration.status === 'disconnected' && (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleConnect(integration.name)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  
                  {integration.status === 'error' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSync(integration.name)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConfigure(integration.name)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Fix
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
