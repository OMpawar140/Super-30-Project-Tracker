/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { HiClipboardList, HiFlag, HiUser, HiCalendar, HiChevronDown, HiChevronUp, HiSearch, HiFilter, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import { apiService, useApiCall } from '@/services/api';

// Types for our data (updated to match backend structure)
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

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

interface Project {
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
  // Computed fields
  progress?: number;
  teamMembers?: string[];
  priority?: string;
  budget?: number;
  tags?: string[];
  totalTasks?: number;
  completedTasks?: number;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const { callApi } = useApiCall();
  
  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await callApi(() => apiService.projects.getAllProjects());
        
        // Transform backend data to match our UI expectations
        const transformedProjects = response.data?.map((project: any) => ({
          ...project,
          teamMembers: [
            project.creator.email,
            ...(project.members || []).map((member: ProjectMember) => member.user.email)
          ],
          progress: calculateProjectProgress(project),
          tags: extractTags(project),
          priority: project.priority || 'medium', // Default priority since API doesn't provide it
          budget: project.budget || null,
          totalTasks: calculateTotalTasks(project),
          completedTasks: calculateCompletedTasks(project),
          // Keep dates as strings since they're already in ISO format
        })) || [];

        setProjects(transformedProjects);
        console.log('Fetched projects:', transformedProjects);
        
        // Animate items on load
        setTimeout(() => {
          transformedProjects.forEach((project: Project, index: number) => {
            setTimeout(() => {
              setAnimatedItems(prev => [...prev, project.id]);
            }, index * 200);
          });
        }, 100);
        
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Calculate total tasks across all milestones
  const calculateTotalTasks = (project: any): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    return project.milestones.reduce((total: number, milestone: Milestone) => {
      return total + (milestone.tasks ? milestone.tasks.length : 0);
    }, 0);
  };

  // Calculate completed tasks across all milestones
  const calculateCompletedTasks = (project: any): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    return project.milestones.reduce((total: number, milestone: Milestone) => {
      if (!milestone.tasks) return total;
      const completedTasks = milestone.tasks.filter(
        (task: Task) => task.status.toLowerCase() === 'completed'
      ).length;
      return total + completedTasks;
    }, 0);
  };

  // Calculate project progress based on milestones
  const calculateProjectProgress = (project: any): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    const completedMilestones = project.milestones.filter(
      (milestone: Milestone) => milestone.status.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  // Extract tags from project data (you can customize this logic)
  const extractTags = (project: any): string[] => {
    const tags = [];
    
    // Add status as tag
    if (project.status) tags.push(project.status);
    
    // Add member roles as tags
    if (project.members) {
      project.members.forEach((member: ProjectMember) => {
        if (member.role) {
          tags.push(member.role);
        }
        if (member.user.skillset) {
          tags.push(member.user.skillset);
        }
      });
    }
    
    return [...new Set(tags)]; // Remove duplicates
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleMilestoneExpansion = (milestoneId: string) => {
    setExpandedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const getStatusColor = (status: string, _type: 'project' | 'task' | 'milestone' = 'project') => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'done':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'active':
      case 'in_progress':
      case 'in progress':
      case 'ongoing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'planning':
      case 'upcoming':
      case 'not_started':
      case 'not started':
      case 'todo':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
      case 'on_hold':
      case 'on hold':
      case 'delayed':
      case 'blocked':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getTaskIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'done':
        return <HiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
      case 'in progress':
      case 'ongoing':
        return <HiClock className="w-4 h-4 text-blue-500" />;
      case 'blocked':
      case 'on_hold':
        return <HiExclamation className="w-4 h-4 text-red-500" />;
      default:
        return <HiClock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || (project.priority && project.priority === priorityFilter);
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HiClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({projects.length} total)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="TASK_COMPLETOR">Task Completor</option>
              <option value="CREATOR">Creator</option>
            </select>
            <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

          </div>
        </div>



        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-md ${
                animatedItems.includes(project.id) 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              {/* Project Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-300"
                onClick={() => toggleProjectExpansion(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h2>
                      {expandedProjects.includes(project.id) ? 
                        <HiChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : 
                        <HiChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      }
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
                    
                    {/* Project Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiUser className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project._count.members} members
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiFlag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project._count.milestones} milestones
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiClipboardList className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project.completedTasks || 0}/{project.totalTasks || 0} tasks
                        </span>
                      </div>
                      {project.budget && (
                        <div className="text-gray-600 dark:text-gray-400">
                          Budget: ${project.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 ml-6">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{project.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedProjects.includes(project.id) && (
                <div className="border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                  <div className="p-6 space-y-6">
                    {/* Creator Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Project Creator</h3>
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg w-fit">
                        <HiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{project.creator.email}</span>
                        {project.creator.skillset && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({project.creator.skillset})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <HiFlag className="w-5 h-5" />
                        Milestones ({project.milestones.length})
                      </h3>
                      <div className="space-y-3">
                        {project.milestones.map((milestone) => (
                          <div key={milestone.id} className="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                            {/* Milestone Header */}
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900 transition-colors duration-200"
                              onClick={() => toggleMilestoneExpansion(milestone.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{milestone.name}</h4>
                                    {expandedMilestones.includes(milestone.id) ? 
                                      <HiChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : 
                                      <HiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</span>
                                    <span>{milestone.tasks ? milestone.tasks.length : 0} tasks</span>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(milestone.status, 'milestone')}`}>
                                  {milestone.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>

                            {/* Tasks Section */}
                            {expandedMilestones.includes(milestone.id) && milestone.tasks && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-100 dark:bg-gray-800 animate-slide-down">
                                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                  <HiClipboardList className="w-4 h-4" />
                                  Tasks ({milestone.tasks.length})
                                </h5>
                                <div className="space-y-2">
                                  {milestone.tasks.map((task) => (
                                    <div key={task.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 p-3 cursor-pointer">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            {getTaskIcon(task.status)}
                                            <h6 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h6>
                                          </div>
                                          {task.description && (
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                                          )}
                                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                            {task.startDate && task.dueDate && (
                                              <span>{formatDate(task.startDate)} - {formatDate(task.dueDate)}</span>
                                            )}
                                            {task.assigneeId && (
                                              <span className="flex items-center gap-1 text-base">
                                                <HiUser className="w-4 h-4" />
                                                {task.assigneeId}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 ml-3">
                                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status, 'task')}`}>
                                            {task.status.replace('_', ' ')}
                                          </span>
                                          {task.priority && (
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                              {task.priority}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  {milestone.tasks.length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-sm py-2">No tasks defined for this milestone.</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {project.milestones.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No milestones defined yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Team Members</h3>
                      <div className="space-y-2">
                        {project.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            <HiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{member.user.email}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                              {member.role.replace('_', ' ')}
                            </span>
                            {member.user.skillset && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {member.user.skillset}
                              </span>
                            )}
                          </div>
                        ))}
                        {project.members.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No team members assigned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <HiClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t been assigned to any projects yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;