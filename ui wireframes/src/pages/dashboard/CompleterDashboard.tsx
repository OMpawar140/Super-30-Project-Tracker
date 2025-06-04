import React from 'react';
import { HiClock, HiLightningBolt, HiUpload } from 'react-icons/hi';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const CompleterDashboard: React.FC = () => {
  // Mock data - replace with real data from your backend
  const tasks = [
    {
      id: 1,
      title: 'Design Homepage Layout',
      project: 'Website Redesign',
      deadline: '2024-03-25',
      priority: 'high',
      status: 'in-progress',
      description: 'Create a modern and responsive homepage design following the provided wireframes.',
    },
    {
      id: 2,
      title: 'Implement User Authentication',
      project: 'Mobile App Development',
      deadline: '2024-03-28',
      priority: 'medium',
      status: 'not-started',
      description: 'Set up user authentication flow using Firebase Authentication.',
    },
    {
      id: 3,
      title: 'Write Content for Blog Posts',
      project: 'Marketing Campaign',
      deadline: '2024-03-22',
      priority: 'low',
      status: 'review',
      description: 'Create engaging blog content for the upcoming product launch.',
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'review':
        return 'text-purple-500 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'completed':
        return 'text-green-500 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View and manage your assigned tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {tasks.map((task) => (
            <Card
              key={task.id}
              variant="hover"
              className="transform transition-all duration-200 hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {task.project}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {task.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <HiClock className="w-5 h-5 mr-1" />
                    Due {new Date(task.deadline).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <HiLightningBolt className="w-4 h-4 mr-1" />
                      Get Help
                    </Button>
                    <Button size="sm">
                      <HiUpload className="w-4 h-4 mr-1" />
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    In Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    2
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Under Review
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    1
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Completed
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    5
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Assistant
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get intelligent suggestions and help with your tasks
                </p>
                <Button variant="outline" fullWidth>
                  <HiLightningBolt className="w-5 h-5 mr-2" />
                  Ask Task Intel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompleterDashboard; 