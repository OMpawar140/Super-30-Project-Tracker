import React, { useState } from 'react';
import { HiMenu, HiX, HiHome, HiClipboardList, HiCalendar, HiBell, HiLogout  } from 'react-icons/hi';
import ThemeToggle from '../components/ui/ThemeToggle';
import NotificationOverlay from '@/pages/notifications/NotificationOverlay';


interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationItems = [
    { name: 'Dashboard', icon: HiHome, href: '/dashboard' },
    { name: 'Projects', icon: HiClipboardList, href: '/projects' },
    { name: 'Timeline', icon: HiCalendar, href: '/timeline' },
    { name: 'Notifications', icon: HiBell, href: '/notifications' },
    { name: 'Logout', icon: HiLogout , href: '/auth' },
  ];

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
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white group transition-colors duration-150"
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </a>
            ))}
          </nav>
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
              <NotificationOverlay />
              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User avatar"
                />
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  John Doe
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
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