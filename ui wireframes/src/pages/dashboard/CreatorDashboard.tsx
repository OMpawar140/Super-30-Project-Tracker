import React, { useState } from 'react';
import { HiPlus, HiDotsVertical, HiClock, HiUsers, HiCheck } from 'react-icons/hi';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ProjectForm, { type ProjectFormData } from '../../components/forms/ProjectForm';

const CreatorDashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with real data from your backend
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      progress: 75,
      tasks: 12,
      completedTasks: 9,
      team: 5,
      dueDate: '2024-04-15',
      status: 'on-track',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      progress: 45,
      tasks: 20,
      completedTasks: 9,
      team: 8,
      dueDate: '2024-05-01',
      status: 'at-risk',
    },
    {
      id: 3,
      name: 'Marketing Campaign',
      progress: 90,
      tasks: 15,
      completedTasks: 13,
      team: 4,
      dueDate: '2024-03-30',
      status: 'completed',
    },
  ];

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    // Add your project creation logic here
    console.log('Creating project:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoading(false);
    setIsCreateModalOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-400';
      case 'at-risk':
        return 'bg-yellow-400';
      case 'completed':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your ongoing projects
          </p>
        </div>
        <Button
          className="flex items-center"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <HiPlus className="w-5 h-5 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            variant="hover"
            className="transform transition-all duration-200 hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h3>
                <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <HiDotsVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-in-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <HiCheck className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.completedTasks}/{project.tasks}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Tasks
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <HiUsers className="w-5 h-5 text-gray-400 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.team}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Team Members
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <HiClock className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Due {new Date(project.dueDate).toLocaleDateString()}
                  </span>
                </div>
                <div
                  className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                    project.status
                  )}`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {/* Add your activity feed items here */}
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <HiCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Task completed: Homepage design
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    2 hours ago
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Project
              </Button>
              <Button variant="outline" fullWidth>
                Schedule Meeting
              </Button>
              <Button variant="outline" fullWidth>
                Generate Report
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={isLoading}
        />
      </Modal>
    </DashboardLayout>
  );
};

export default CreatorDashboard; 