/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { HiPlus, HiDotsVertical, HiClock, HiUsers, HiCheck } from 'react-icons/hi';
import Card from './Card';
import Button from './Button type 2';
import Modal from './Modal';
import ProjectForm, { type ProjectFormData } from './ProjectForm';
import { apiService, useApiCall } from '@/services/api';

// Types for backend data (reusing from your Projects page)
interface User {
  email: string;
  skillset?: string | null;
}

interface ProjectMember {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  updatedAt: string;
  projectId: string;
  user: User;
}

interface Milestone {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
}

interface BackendProject {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
  creator: User;
  members: ProjectMember[];
  milestones: Milestone[];
  _count: {
    milestones: number;
    members: number;
  };
}

// Transformed project type for UI
interface DashboardProject {
  id: string;
  name: string;
  progress: number;
  tasks: number;
  completedTasks: number;
  team: number;
  dueDate: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { callApi } = useApiCall();

  // Transform backend project data to dashboard format
  const transformProjectForDashboard = (project: BackendProject): DashboardProject => {
    // Calculate progress based on milestones
    const completedMilestones = project.milestones.filter(
      milestone => milestone.status.toLowerCase() === 'completed'
    ).length;
    const progress = project.milestones.length > 0 
      ? Math.round((completedMilestones / project.milestones.length) * 100)
      : 0;

    // Map backend status to dashboard status
    const mapStatus = (backendStatus: string): string => {
      switch (backendStatus.toLowerCase()) {
        case 'active':
        case 'in_progress':
          return 'on-track';
        case 'planning':
        case 'not_started':
          return 'at-risk';
        case 'completed':
          return 'completed';
        case 'on_hold':
        case 'delayed':
          return 'at-risk';
        default:
          return 'on-track';
      }
    };

    return {
      id: project.id,
      name: project.name,
      progress,
      tasks: project._count.milestones,
      completedTasks: completedMilestones,
      team: project._count.members ,
      dueDate: project.endDate,
      status: mapStatus(project.status),
    };
  };

  // Fetch projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await callApi(() => apiService.projects.getAllProjects());
        
        if (response.data) {
          const transformedProjects = response.data.map(transformProjectForDashboard);
          setProjects(transformedProjects);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    try {
      // Call your backend API to create project
      const response = await callApi(() => apiService.projects.createProject(data));
      
      if (response.data) {
        // Transform and add the new project to the list
        const newProject = transformProjectForDashboard(response.data);
        setProjects(prev => [...prev, newProject]);
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating project:', err);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your ongoing projects ({projects.length} total)
          </p>
        </div>
        <Button
          className="flex items-center cursor-pointer"
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
                  <HiDotsVertical className="w-5 h-5 cursor-pointer" />
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

      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by creating your first project
          </p>
          <Button className='cursor-pointer' onClick={() => setIsCreateModalOpen(true)}>
            <HiPlus className="w-5 h-5 mr-2" />
            Create Project
          </Button>
        </div>
      )}

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
    </>
  );
};

export default Dashboard;