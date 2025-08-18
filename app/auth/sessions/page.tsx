"use client";

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Globe, AlertTriangle, LogOut, Shield } from 'lucide-react';
import { AuthService } from '../../../lib/services/authService';
import { Session } from '../../../lib/types/auth';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSessions: Session[] = [
        {
          id: 'session-1',
          userId: 'user-1',
          deviceInfo: {
            type: 'desktop',
            browser: 'Chrome 120.0',
            os: 'Windows 11',
            deviceId: 'desktop-001'
          },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          isActive: true,
          lastActivityAt: '2024-01-15T10:30:00Z',
          createdAt: '2024-01-15T08:00:00Z'
        },
        {
          id: 'session-2',
          userId: 'user-1',
          deviceInfo: {
            type: 'mobile',
            browser: 'Safari 17.0',
            os: 'iOS 17.0',
            deviceId: 'iphone-001'
          },
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
          isActive: true,
          lastActivityAt: '2024-01-15T09:15:00Z',
          createdAt: '2024-01-15T07:30:00Z'
        },
        {
          id: 'session-3',
          userId: 'user-1',
          deviceInfo: {
            type: 'desktop',
            browser: 'Firefox 121.0',
            os: 'macOS 14.0',
            deviceId: 'macbook-001'
          },
          ipAddress: '192.168.1.102',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
          isActive: false,
          lastActivityAt: '2024-01-14T18:00:00Z',
          createdAt: '2024-01-14T09:00:00Z'
        }
      ];

      setSessions(mockSessions);
      
      // Set current session (first active session)
      const currentSession = mockSessions.find(s => s.isActive);
      if (currentSession) {
        setCurrentSessionId(currentSession.id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await AuthService.revokeSession(sessionId);
      // Remove session from local state
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      await AuthService.revokeAllOtherSessions();
      // Keep only current session
      setSessions(prev => prev.filter(s => s.id === currentSessionId));
    } catch (error) {
      console.error('Failed to revoke other sessions:', error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'desktop':
        return <Monitor className="h-5 w-5" />;
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Globe className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getDeviceBadgeColor = (type: string) => {
    switch (type) {
      case 'desktop':
        return 'bg-blue-100 text-blue-800';
      case 'mobile':
        return 'bg-green-100 text-green-800';
      case 'tablet':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
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

  const isCurrentSession = (sessionId: string) => {
    return sessionId === currentSessionId;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Active Sessions</h1>
        <p className="text-gray-600 mt-2">Manage your device sessions and security</p>
      </div>

      {/* Security Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Review your active sessions regularly. If you notice any unfamiliar devices, 
              revoke those sessions immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          {sessions.filter(s => s.isActive).length} active session(s)
        </div>
        <button
          onClick={revokeAllOtherSessions}
          disabled={sessions.filter(s => s.isActive && s.id !== currentSessionId).length === 0}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield className="h-4 w-4 mr-2" />
          Revoke All Other Sessions
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`bg-white rounded-lg shadow p-6 border-2 ${
              isCurrentSession(session.id) ? 'border-blue-500' : 'border-transparent'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${getDeviceBadgeColor(session.deviceInfo.type)}`}>
                  {getDeviceIcon(session.deviceInfo.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {session.deviceInfo.browser} on {session.deviceInfo.os}
                    </h3>
                    {isCurrentSession(session.id) && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Current Session
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(session.isActive)}`}>
                      {session.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDeviceBadgeColor(session.deviceInfo.type)}`}>
                      {session.deviceInfo.type.charAt(0).toUpperCase() + session.deviceInfo.type.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">IP Address:</span> {session.ipAddress}
                    </div>
                    <div>
                      <span className="font-medium">Device ID:</span> {session.deviceInfo.deviceId}
                    </div>
                    <div>
                      <span className="font-medium">Last Activity:</span> {formatDate(session.lastActivityAt)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(session.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">User Agent:</span>
                    <p className="text-xs text-gray-500 mt-1 break-all">{session.userAgent}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isCurrentSession(session.id) && session.isActive && (
                  <button
                    onClick={() => revokeSession(session.id)}
                    className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Sessions */}
      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any active sessions at the moment.
          </p>
        </div>
      )}

      {/* Security Tips */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Enable two-factor authentication for additional security</span>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Regularly review and revoke unused sessions</span>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Use strong, unique passwords for your account</span>
          </div>
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Log out from shared or public devices</span>
          </div>
        </div>
      </div>
    </div>
  );
}
