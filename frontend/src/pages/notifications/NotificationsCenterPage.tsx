import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Circle,
  Trash2,
  Settings,
  DollarSign,
  Calendar,
  Users,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader2,
  Filter,
  Briefcase,
  Award,
  Shield,
  Clock,
  UserPlus,
  UserX,
  TrendingUp,
  GraduationCap,
  Receipt,
  FileSignature,
  Scale,
  Key,
  Heart,
  Target,
  Zap,
  CheckSquare,
  AlarmClock,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';
import { Notification, NotificationType } from '../../services/notificationsService';
import { NotificationErrorBoundary } from '../../components/notifications/NotificationErrorBoundary';
import { NotificationEmptyState } from '../../components/notifications/NotificationEmptyState';

const NOTIFICATION_ICONS: Record<string, { icon: any; color: string }> = {
  SYSTEM: { icon: AlertCircle, color: 'text-gray-600' },
  ANNOUNCEMENT: { icon: Bell, color: 'text-blue-600' },
  SECURITY: { icon: Shield, color: 'text-red-600' },
  
  EMPLOYEE: { icon: Users, color: 'text-purple-600' },
  ONBOARDING: { icon: UserPlus, color: 'text-green-600' },
  OFFBOARDING: { icon: UserX, color: 'text-orange-600' },
  
  ATTENDANCE: { icon: Clock, color: 'text-blue-600' },
  LEAVE: { icon: Calendar, color: 'text-blue-600' },
  OVERTIME: { icon: Clock, color: 'text-orange-600' },
  SHIFT: { icon: Clock, color: 'text-purple-600' },
  TIMESHEET: { icon: Clock, color: 'text-indigo-600' },
  
  PAYROLL: { icon: DollarSign, color: 'text-green-600' },
  EXPENSE: { icon: Receipt, color: 'text-yellow-600' },
  BENEFIT: { icon: Heart, color: 'text-pink-600' },
  COMPENSATION: { icon: Target, color: 'text-green-600' },
  
  PERFORMANCE: { icon: TrendingUp, color: 'text-purple-600' },
  RECOGNITION: { icon: Award, color: 'text-yellow-600' },
  LEARNING: { icon: GraduationCap, color: 'text-blue-600' },
  GOAL: { icon: Target, color: 'text-indigo-600' },
  
  RECRUITMENT: { icon: Briefcase, color: 'text-purple-600' },
  APPLICANT: { icon: Users, color: 'text-blue-600' },
  INTERVIEW: { icon: Users, color: 'text-green-600' },
  OFFER: { icon: FileSignature, color: 'text-green-600' },
  
  CONTRACT: { icon: FileText, color: 'text-blue-600' },
  CONTRACT_APPROVAL: { icon: CheckSquare, color: 'text-orange-600' },
  CONTRACT_RENEWAL: { icon: RefreshCw, color: 'text-purple-600' },
  CONTRACT_EXPIRY: { icon: AlarmClock, color: 'text-red-600' },
  OBLIGATION: { icon: CheckSquare, color: 'text-yellow-600' },
  
  DOCUMENT: { icon: FileText, color: 'text-gray-600' },
  ESIGNATURE: { icon: FileSignature, color: 'text-blue-600' },
  COMPLIANCE: { icon: Shield, color: 'text-green-600' },
  AUDIT: { icon: Scale, color: 'text-purple-600' },
  
  IAM: { icon: Key, color: 'text-red-600' },
  DELEGATION: { icon: Users, color: 'text-blue-600' },
  ACCESS_REQUEST: { icon: Key, color: 'text-orange-600' },
  ROLE_CHANGE: { icon: Shield, color: 'text-purple-600' },
  
  TASK: { icon: CheckSquare, color: 'text-blue-600' },
  APPROVAL: { icon: CheckCircle, color: 'text-green-600' },
  REMINDER: { icon: Bell, color: 'text-yellow-600' },
  ALERT: { icon: Zap, color: 'text-red-600' },
};

const NOTIFICATION_CATEGORIES = [
  { value: 'all', label: 'All Notifications', count: 0 },
  { value: 'HR', label: 'HR & People', types: ['EMPLOYEE', 'ONBOARDING', 'OFFBOARDING'] },
  { value: 'TIME', label: 'Time & Attendance', types: ['ATTENDANCE', 'LEAVE', 'OVERTIME', 'SHIFT', 'TIMESHEET'] },
  { value: 'FINANCE', label: 'Finance & Payroll', types: ['PAYROLL', 'EXPENSE', 'BENEFIT', 'COMPENSATION'] },
  { value: 'PERFORMANCE', label: 'Performance & Learning', types: ['PERFORMANCE', 'RECOGNITION', 'LEARNING', 'GOAL'] },
  { value: 'RECRUITMENT', label: 'Recruitment', types: ['RECRUITMENT', 'APPLICANT', 'INTERVIEW', 'OFFER'] },
  { value: 'CONTRACTS', label: 'Contracts & Legal', types: ['CONTRACT', 'CONTRACT_APPROVAL', 'CONTRACT_RENEWAL', 'CONTRACT_EXPIRY', 'OBLIGATION'] },
  { value: 'DOCUMENTS', label: 'Documents & Compliance', types: ['DOCUMENT', 'ESIGNATURE', 'COMPLIANCE', 'AUDIT'] },
  { value: 'IAM', label: 'Security & Access', types: ['IAM', 'DELEGATION', 'ACCESS_REQUEST', 'ROLE_CHANGE'] },
  { value: 'SYSTEM', label: 'System & Other', types: ['SYSTEM', 'ANNOUNCEMENT', 'SECURITY', 'TASK', 'APPROVAL', 'REMINDER', 'ALERT'] },
];

export default function NotificationsCenterPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  } = useNotifications();
  
  const retry = refresh; // Use refresh as retry
  const isRetrying = false; // Fallback for empty state component

  const filteredNotifications = (notifications || []).filter((notif) => {
    // Safety check
    if (!notif) return false;
    
    // Read/Unread filter
    if (filter === 'unread' && notif.isRead) return false;
    if (filter === 'read' && !notif.isRead) return false;

    // Category filter
    if (categoryFilter !== 'all') {
      const category = NOTIFICATION_CATEGORIES.find(c => c.value === categoryFilter);
      if (category && category.types && !category.types.includes(notif.type)) {
        return false;
      }
    }

    return true;
  });

  const getIcon = (type: NotificationType) => {
    const config = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.SYSTEM;
    const IconComponent = config.icon;
    return <IconComponent className={`h-5 w-5 ${config.color}`} />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }
    if (notif.linkUrl || notif.actionUrl) {
      navigate(notif.actionUrl || notif.linkUrl || '#');
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return time.toLocaleDateString();
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">Stay updated with important alerts across TribeCore</p>
          </div>
          <Button variant="outline" onClick={() => setShowPreferences(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{unreadCount}</p>
              </div>
              <Circle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Read</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {notifications.length - unreadCount}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{NOTIFICATION_CATEGORIES.length - 1}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {NOTIFICATION_CATEGORIES.map((category) => (
              <Button
                key={category.value}
                variant={categoryFilter === category.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(category.value)}
                className="whitespace-nowrap"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Unread ({unreadCount})
              </Button>
              <Button
                variant={filter === 'read' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('read')}
              >
                Read ({notifications.length - unreadCount})
              </Button>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {categoryFilter !== 'all' 
              ? `${NOTIFICATION_CATEGORIES.find(c => c.value === categoryFilter)?.label} Notifications`
              : 'All Notifications'
            } ({filteredNotifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading notifications...</span>
            </div>
          ) : error ? (
            <NotificationEmptyState
              type="error"
              error={error}
              onRetry={retry}
              onRefresh={refresh}
              isRetrying={isRetrying}
            />
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    notif.isRead 
                      ? 'bg-white border-gray-200' 
                      : 'bg-blue-50 border-blue-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-lg ${notif.isRead ? 'bg-gray-50' : 'bg-white'}`}>
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {/* Title with Priority Badge */}
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold ${notif.isRead ? 'text-gray-900' : 'text-blue-900'}`}>
                              {notif.title}
                            </p>
                            {notif.priority !== 'MEDIUM' && (
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(notif.priority)}`}>
                                {notif.priority}
                              </span>
                            )}
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.message}</p>

                          {/* Metadata Row */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(notif.createdAt)}
                            </span>
                            {notif.senderName && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {notif.senderName}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">
                              {notif.type.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Action Button */}
                          {notif.actionLabel && notif.actionUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(notif.actionUrl!);
                              }}
                            >
                              {notif.actionLabel}
                            </Button>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notif.id);
                              }}
                              className="p-2 hover:bg-white rounded transition-colors"
                              title="Mark as read"
                            >
                              <CheckCircle className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.id);
                            }}
                            className="p-2 hover:bg-white rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <NotificationEmptyState
              type={filter === 'unread' ? 'unread' : 'all'}
              onRefresh={refresh}
            />
          )}
        </CardContent>
      </Card>

      {/* Preferences Modal - Placeholder */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notification Preferences</CardTitle>
              <button
                onClick={() => setShowPreferences(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-600">
                  Configure how you want to receive notifications for different types of events.
                </p>
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <div className="text-center">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Preferences UI coming soon</p>
                    <p className="text-sm mt-1">Control notification channels, frequency, and Do Not Disturb settings</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowPreferences(false)}>
                    Close
                  </Button>
                  <Button onClick={() => {
                    toast.success('Preferences saved!');
                    setShowPreferences(false);
                  }}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
  );
}
