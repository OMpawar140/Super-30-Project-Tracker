import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService, useApiCall } from '../../services/api';
import { User , Shield, LogOut, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { callApi, loading, error } = useApiCall();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dashboardData, setDashboardData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userSettings, setUserSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
    loadUserSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await callApi(() => apiService.protected.getDashboard());
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const loadUserSettings = async () => {
    try {
      const settings = await callApi(() => apiService.protected.getUserSettings());
      setUserSettings(settings);
    } catch (err) {
      console.error('Failed to load user settings:', err);
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint first
      await callApi(() => apiService.auth.logout());
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      // Always call Firebase logout
      await logout();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateSettings = async (newSettings: any) => {
    try {
      const updated = await callApi(() => 
        apiService.protected.updateUserSettings(newSettings)
      );
      setUserSettings(updated);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                {currentUser?.photoURL && (
                    <img
                        src={currentUser.photoURL}
                        alt="User avatar"
                        className="h-6 w-6 rounded-full mr-2 border border-gray-200"
                    />
                ) || <User className="h-4 w-4 mr-2" />}
                <span>{currentUser?.displayName || currentUser?.email}</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Welcome back
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {currentUser?.displayName || 'User'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Data */}
            {dashboardData && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Dashboard Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="text-sm font-medium text-gray-900">{dashboardData.user?.uid}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{dashboardData.user?.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">{dashboardData.timestamp}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-sm font-medium text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Test Buttons */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  API Test
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={loadDashboardData}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                    Refresh Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  User Settings
                </h3>
                
                {userSettings && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Notifications</p>
                        <p className="text-sm text-gray-500">Receive email notifications</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={userSettings.settings?.notifications || false}
                        onChange={(e) => updateSettings({ notifications: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Theme
                      </label>
                      <select
                        value={userSettings.settings?.theme || 'light'}
                        onChange={(e) => updateSettings({ theme: e.target.value })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;