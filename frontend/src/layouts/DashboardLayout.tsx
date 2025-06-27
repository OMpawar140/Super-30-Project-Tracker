import { useEffect, useState } from 'react';
import { HiMenu, HiX, HiHome, HiClipboardList, HiCalendar, HiBell, HiLogout } from 'react-icons/hi';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiService, useApiCall } from '@/services/api';
import { useNavigation } from '@/hooks/useNavigation';
import logo from '@/assets/Images/TrackPro-icon-preview.png';

// Import your components
import Dashboard from '@/components/ui/Dashboard';
import ProjectsPage from '@/pages/projects/ProjectsPage';
import Timeline from '@/pages/timeline/TimeLine';
import NotificationsPage from '@/pages/notifications/index';
import Profile from '@/pages/profile/Profile';
import { NotificationBell } from '@/pages/notifications/NotificationBell';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const { callApi } = useApiCall();
  const { activeTab, navigateTo } = useNavigation();

  const handleLogout = async () => {
    try {
      await callApi(() => apiService.auth.logout());
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      await logout();
    }
  };

  useEffect(() => {
    document.title = 'Dashboard - Project Tracker';
  }, []);

  const navigationItems = [
    { name: 'Dashboard', icon: HiHome, component: Dashboard },
    { name: 'Projects', icon: HiClipboardList, component: ProjectsPage },
    { name: 'Timeline', icon: HiCalendar, component: Timeline },
    { name: 'Notifications', icon: HiBell, component: NotificationsPage },
  ];

  type TabName = 'Dashboard' | 'Projects' | 'Timeline' | 'Notifications' | 'Profile';

  const componentMap: Record<TabName, React.FC> = {
    Dashboard: Dashboard,
    Projects: ProjectsPage,
    Timeline: Timeline,
    Notifications: NotificationsPage,
    Profile: Profile,
  };

  const renderContent = () => {
    const Component = componentMap[activeTab as TabName] || Dashboard;
    return <Component />;
  };

  const handleNotificationClick = () => {
    navigateTo('Notifications');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-200 ease-in-out z-30 lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              <img src={logo} alt="TrackPro Logo" className="h-8 w-8 inline-block mr-2" />
              Project Tracker
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <HiX className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigateTo(item.name)}
                className={`w-full flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-150 hover:cursor-pointer ${
                  activeTab === item.name
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-100'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </button>
            ))}
          </nav>
          
          <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => {
                navigateTo('Profile');
              }}
              className="flex items-center pb-8 text-center justify-center border-b border-gray-200 dark:border-gray-700 w-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer group"
            >
              {currentUser?.photoURL && (
                <img
                  src={currentUser.photoURL}
                  alt="User avatar"
                  className="h-6 w-6 rounded-full mr-2 border border-gray-200 group-hover:border-gray-300 transition-colors"
                />
              ) || <User className="h-4 w-4 mr-2 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors" />}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {currentUser?.displayName || currentUser?.email}
              </span>
            </button>
            <Button
              onClick={handleLogout}
              variant="outline"
              className='w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-red-700 dark:text-gray-300 dark:hover:text-red-400 hover:border-red-400 cursor-pointer'
            >
              <HiLogout/>
              Logout
            </Button>
          </div>    
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm z-20">
          <div className="h-full px-4 flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <HiMenu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <NotificationBell onNotificationClick={handleNotificationClick} />
              <div className="flex items-center">
                {currentUser?.photoURL && (
                  <img
                    src={currentUser.photoURL}
                    alt="User avatar"
                    className="h-6 w-6 rounded-full mr-2 border border-gray-200"
                  />
                ) || <User className="h-4 w-4 mr-2" />}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser?.displayName || currentUser?.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;