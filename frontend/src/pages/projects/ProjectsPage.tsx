/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { HiClipboardList, HiFlag, HiUser, HiCalendar, HiChevronDown, HiChevronUp, HiSearch, HiFilter, HiCheckCircle, HiTrash,
  HiClock, HiExclamation, HiUpload, HiEye, HiPencil, HiCheck, HiX,HiPlus } from 'react-icons/hi';
import { apiService, useApiCall } from '@/services/api';
import TaskFileModal from '../../components/ui/TaskFileModal';
import { useAuth } from '@/context/AuthContext';
import TaskReviewModal from '@/components/ui/TaskReviewModal';
import ProjectReportPDF from '@/components/ui/ProjectReportPDF';
import UserProjectsPDF from '@/components/ui/UserProjectsPDF';
import UserTasksPDF from '@/components/ui/UserTasksPDF';

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
  endDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Milestone {
  id: string;
  name: string;
  description?: string;
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
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskReviewModalOpen, setTaskReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{id: string, title: string, status: string} | null>(null);
  const { currentUser } = useAuth();
  const { callApi } = useApiCall();

  // Editing states
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectData, setEditingProjectData] = useState<{
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneData, setEditingMilestoneData] = useState<{
    name: string;
    description: string;
    status: string;
    startDate: string;
    endDate: string;
  }>({
    name: '',
    description: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<{
    title: string;
    description: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    assigneeId: string;
  }>({
    title: '',
    description: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: '',
    assigneeId: '' 
  });

const [showAddMilestoneForm, setShowAddMilestoneForm] = useState<Record<string, boolean>>({});
const [showAddTaskForm, setShowAddTaskForm] = useState<Record<string, boolean>>({});
const [newMilestoneData, setNewMilestoneData] = useState({
  name: '',
  description: '',
  status: 'PLANNED',
  startDate: '',
  endDate: ''
});
const [newTaskData, setNewTaskData] = useState({
  title: '',
  description: '',
  priority: 'MEDIUM',
  startDate: '',
  endDate: '',
  assigneeId: ''
});


const toggleAddMilestoneForm = (projectId : string) => {
  setShowAddMilestoneForm(prev => ({
    ...prev,
    [projectId]: !prev[projectId]
  }));

  if (!showAddMilestoneForm[projectId]) {
    setNewMilestoneData({
      name: '',
      description: '',
      status: 'PLANNED',
      startDate: '',
      endDate: ''
    });
  }
};


const toggleAddTaskForm = (milestoneId : string) => {
  setShowAddTaskForm(prev => ({
    ...prev,
    [milestoneId]: !prev[milestoneId]
  }));
  if (!showAddTaskForm[milestoneId]) {
    setNewTaskData({
      title: '',
      description: '',
      priority: 'MEDIUM',
      startDate: '',
      endDate: '',
      assigneeId: ''
    });
  }
};

const addMilestone = async (projectId: string) => {
  try {
    const response = await callApi(() => apiService.milestones.createMilestone(projectId, newMilestoneData));
    if (response.success) {
      const newMilestone = response.data;
      
      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            // Ensure milestones array exists, initialize as empty if null/undefined
            milestones: project.milestones ? [...project.milestones, newMilestone] : [newMilestone]
          };
        }
        return project;
      }));
      
      setShowAddMilestoneForm(prev => ({ ...prev, [projectId]: false }));
      setNewMilestoneData({
        name: '',
        description: '',
        status: 'PLANNED',
        startDate: '',
        endDate: ''
      });
    }
  } catch (error) {
    console.error('Error adding milestone:', error);
  }
};

const deleteMilestone = async (projectId: string, milestoneId: string) => { 
  if (!confirm('Are you sure you want to delete this milestone? This will also delete all associated tasks.')) {
    return;
  }

  console.log(`Milestone id : ${milestoneId} for project id: ${projectId}`);

  try {
    const response = await callApi(() => apiService.milestones.deleteMilestone(milestoneId));

    if (response.success) {
      console.log(`Milestone with id ${milestoneId} deleted successfully.`);

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
                ...project,
                milestones: project.milestones.filter(milestone => milestone.id !== milestoneId)
              }
            : project
        )
      );
    }
  } catch (error) {
    console.error('Error deleting milestone:', error);
  }
};


const addTask = async (projectId: string, milestoneId: string) => {
  try {
    const response = await callApi(() => apiService.tasks.createTask(milestoneId, newTaskData));
    console.log(response);
    window.location.reload();
    if (response.success) {
      const newTask = response.data; // The newly created task
      
      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          return {
            ...project,
            milestones: project.milestones.map(milestone => {
              if (milestone.id === milestoneId) {
                return {
                  ...milestone,
                  tasks: [...(milestone.tasks || []), newTask]
                };
              }
              return milestone;
            })
          };
        }
        return project;
      }));
      
      // Reset form
      setShowAddTaskForm(prev => ({ ...prev, [milestoneId]: false }));
      setNewTaskData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        startDate: '',
        endDate: '',
        assigneeId: ''
      });
    }
  } catch (error) {
    console.error('Error adding task:', error);
  }
};

const deleteTask = async (projectId: string, taskId: string) => {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }

  console.log(`Task id : ${taskId} for project id: ${projectId}`);
  try {
    const response = await callApi(() => apiService.tasks.deleteTask(taskId));
    console.log(response);
    if (response.success) {
      console.log(`Task with id ${taskId} deleted successfully.`);
      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
                ...project,
                milestones: project.milestones.map(milestone => ({
                  ...milestone,
                  tasks: milestone.tasks.filter(task => task.id !== taskId)
                }))
              }
            : project
        )
      );
     
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};



  useEffect(() => {
    document.title = "Project Panel - Project Tracker";
  }, []);

  // Project editing functions
  const startEditingProject = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectData({
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.startDate.split('T')[0],
      endDate: project.endDate.split('T')[0]
    });
  };

  const cancelEditingProject = () => {
    setEditingProjectId(null);
    setEditingProjectData({
      name: '',
      description: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const saveProjectChanges = async () => {
    if (!editingProjectId) return;
    
    try {
      const updateData = {
        name: editingProjectData.name,
        description: editingProjectData.description,
        status: editingProjectData.status,
        startDate: new Date(editingProjectData.startDate).toISOString(),
        endDate: new Date(editingProjectData.endDate).toISOString()
      };

      await callApi(() => apiService.projects.updateProject(editingProjectId, updateData));
      
      setProjects(prev => prev.map(project => 
        project.id === editingProjectId 
          ? { ...project, ...updateData }
          : project
      ));
      
      cancelEditingProject();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  // Milestone editing functions
  const startEditingMilestone = (milestone: Milestone) => {
    setEditingMilestoneId(milestone.id);
    setEditingMilestoneData({
      name: milestone.name,
      description: milestone.description ?? '',
      status: milestone.status,
      startDate: milestone.startDate.split('T')[0],
      endDate: milestone.endDate.split('T')[0]
    });
  };

  const cancelEditingMilestone = () => {
    setEditingMilestoneId(null);
    setEditingMilestoneData({
      name: '',
      description: '',
      status: '',
      startDate: '',
      endDate: ''
    });
  };

  const saveMilestoneChanges = async () => {
    if (!editingMilestoneId) return;
    
    try {
      const updateData = {
        name: editingMilestoneData.name,
        status: editingMilestoneData.status,
        startDate: new Date(editingMilestoneData.startDate).toISOString(),
        endDate: new Date(editingMilestoneData.endDate).toISOString()
      };

      await callApi(() => apiService.milestones.updateMilestone(editingMilestoneId, updateData));
      
      setProjects(prev => prev.map(project => ({
        ...project,
        milestones: project.milestones.map(milestone => 
          milestone.id === editingMilestoneId 
            ? { ...milestone, ...updateData }
            : milestone
        )
      })));
      
      cancelEditingMilestone();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  // Task editing functions
  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'MEDIUM',
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      assigneeId: task.assigneeId || '' 
    });
  };

  const cancelEditingTask = () => {
    setEditingTaskId(null);
    setEditingTaskData({
      title: '',
      description: '',
      status: '',
      priority: '',
      startDate: '',
      endDate: '',
      assigneeId: ''
    });
  };

  const saveTaskChanges = async () => {
    if (!editingTaskId) return;
    
    try {
      const updateData = {
        title: editingTaskData.title,
        description: editingTaskData.description,
        status: editingTaskData.status,
        priority: editingTaskData.priority,
        startDate: editingTaskData.startDate ? new Date(editingTaskData.startDate).toISOString() : undefined,
        endDate: editingTaskData.endDate ? new Date(editingTaskData.endDate).toISOString() : undefined,
        assigneeId: editingTaskData.assigneeId || undefined
      };

      await callApi(() => apiService.tasks.updateTask(editingTaskId, updateData));
      
      setProjects(prev => prev.map(project => ({
        ...project,
        milestones: project.milestones.map(milestone => ({
          ...milestone,
          tasks: milestone.tasks.map(task => 
            task.id === editingTaskId 
              ? { ...task, ...updateData }
              : task
          )
        }))
      })));
      
      cancelEditingTask();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Utility functions
  const calculateTotalTasks = (project: any): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    return project.milestones.reduce((total: number, milestone: Milestone) => {
      return total + (milestone.tasks ? milestone.tasks.length : 0);
    }, 0);
  };

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

  const calculateProjectProgress = (project: any): number => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    
    const completedMilestones = project.milestones.filter(
      (milestone: Milestone) => milestone.status.toLowerCase() === 'completed'
    ).length;
    
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  const extractTags = (project: any): string[] => {
    const tags = [];
    
    if (project.status) tags.push(project.status);
    
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
    
    return [...new Set(tags)];
  };

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await callApi(() => apiService.projects.getAllProjects());
        
        const transformedProjects = response.data?.map((project: any) => ({
          ...project,
          teamMembers: [
            project.creator.email,
            ...(project.members || []).map((member: ProjectMember) => member.user.email)
          ],
          progress: calculateProjectProgress(project),
          tags: extractTags(project),
          priority: project.priority || 'MEDIUM',
          budget: project.budget || null,
          totalTasks: calculateTotalTasks(project),
          completedTasks: calculateCompletedTasks(project),
        })) || [];

        setProjects(transformedProjects);
        console.log('Fetched projects:', transformedProjects);
        
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

  // Modal functions
  const openTaskModal = (task: Task) => {
    setSelectedTask({
      id: task.id,
      title: task.title,
      status: task.status
    });
    setTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setTaskModalOpen(false);
    setSelectedTask(null);
  };

  const openTaskReviewModal = (task: Task) => {
    setSelectedTask({
      id: task.id,
      title: task.title,
      status: task.status
    });
    setTaskReviewModalOpen(true);
  };

  const closeTaskReviewModal = () => {
    setTaskReviewModalOpen(false);
    setSelectedTask(null);
  };

  // UI helper functions
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
      case '':
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
      case 'MEDIUM':
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

  // Filtering logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    
    const matchesRole = (() => {
      if (roleFilter === 'All') return true;
      if (!currentUser?.email) return false;
      
      switch (roleFilter) {
        case 'ADMIN':
          return project.members.some(member => 
            member.user.email === currentUser.email && member.role === 'ADMIN'
          );
        case 'CREATOR':
          return project.creator.email === currentUser.email;
        case 'TASK_COMPLETER':
          return project.members.some(member => 
            member.user.email === currentUser.email && member.role === 'TASK_COMPLETER'
          );
        default:
          return false;
      }
    })();
    
    const matchesPriority = priorityFilter === 'All' || (project.priority && project.priority === priorityFilter);
    
    return matchesSearch && matchesStatus && matchesRole && matchesPriority;
  });

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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HiClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({projects.length} total)
              </span>
            </div>
            <div onClick={(e) => e.stopPropagation()}
              className='flex gap-3'>
                <UserTasksPDF 
                  projects={projects} 
                  currentUser={currentUser} 
                  onDownload={() => console.log('PDF generated')} 
                />
                <UserProjectsPDF 
                  projects={projects}
                  currentUser={currentUser}
                  onDownload={() => {
                    console.log(`PDF report downloaded for all projects created by ${currentUser?.email}`);
                  }}
                />
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
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value=""></option>
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
          <option value="All">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CREATOR">Creator</option>
          <option value="TASK_COMPLETER">Task Completer</option>
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
                className={`p-6 transition-colors duration-300 dark:hover:bg-gray-900 ${
                  editingProjectId === project.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750'
                }`}
                onClick={editingProjectId === project.id ? undefined : () => toggleProjectExpansion(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {editingProjectId === project.id ? (
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-1">
                            <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                              Project Title
                            </label>
                            <input
                              type="text"
                              value={editingProjectData.name}
                              onChange={(e) => setEditingProjectData(prev => ({ ...prev, name: e.target.value }))}
                              className="w-full text-xl font-semibold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter project title"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex gap-2 mt-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveProjectChanges();
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <HiCheck className="w-4 h-4" />
                              Save Changes
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelEditingProject();
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <HiX className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {project.name}
                          </h2>
                          {currentUser && currentUser.email === project.creatorId && (
                               <button
                              onClick={() => startEditingProject(project)}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                              title="Edit project"
                            >
                              <HiPencil className="w-4 h-4" />
                              Edit
                            </button>
                          )}
                          {expandedProjects.includes(project.id) ? 
                            <HiChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : 
                            <HiChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          }
                        </>
                      )}
                    </div>
                    
                    {editingProjectId === project.id ? (
                      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editingProjectData.description}
                            onChange={(e) => setEditingProjectData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows={3}
                            placeholder="Enter project description"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                              Status
                            </label>
                            <select
                              value={editingProjectData.status}
                              onChange={(e) => setEditingProjectData(prev => ({ ...prev, status: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value=""></option>
                              <option value="ACTIVE">Active</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="ON_HOLD">On Hold</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={editingProjectData.startDate}
                              onChange={(e) => setEditingProjectData(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={editingProjectData.endDate}
                              onChange={(e) => setEditingProjectData(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 ml-6">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-MEDIUM border ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <ProjectReportPDF 
                        project={project}
                        onDownload={() => {
                          console.log(`PDF report downloaded for project: ${project.name}`);
                        }}
                      />
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
                    <div className='flex flex-col md:flex-row gap-6 justify-between'>
                      {/* Creator Info */}
                      <div className='md:pl-8 lg:pl-12'>
                        <h3 className="text-lg font-MEDIUM text-gray-900 dark:text-white mb-3">Project Creator</h3>
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
                        <div className='md:pr-8 lg:pr-12'>
                          <h3 className="text-lg font-MEDIUM text-gray-900 dark:text-white mb-3">Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map((tag, index) => (
                              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Milestones Section */}
         <div>
                     <div className="flex items-center justify-between mb-3">
  <h3 className="text-lg font-MEDIUM text-gray-900 dark:text-white flex items-center gap-2">
    <HiFlag className="w-5 h-5" />
    Milestones ({project.milestones.length})
  </h3>
  {currentUser && currentUser.email === project.creatorId && (
    <button
      onClick={() => toggleAddMilestoneForm(project.id)}
      className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
    >
      <HiPlus className="w-4 h-4" />
      Add Milestone
    </button>
  )}
</div>

{/* Add Milestone Form - Only at top level */}
{showAddMilestoneForm[project.id] && (
  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-4 mb-4">
    <h4 className="text-sm font-MEDIUM text-gray-900 dark:text-white mb-3">Add New Milestone</h4>
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
          Milestone Name
        </label>
        <input
          type="text"
          value={newMilestoneData.name}
          onChange={(e) => setNewMilestoneData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter milestone name"
        />
      </div>
       <div>
        <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={newMilestoneData.description}
          onChange={(e) => setNewMilestoneData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter milestone description"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={newMilestoneData.status}
            onChange={(e) => setNewMilestoneData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={newMilestoneData.startDate}
            min={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined}
            onChange={(e) => setNewMilestoneData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={newMilestoneData.endDate}
            onChange={(e) => setNewMilestoneData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => addMilestone(project.id)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
        >
          <HiCheck className="w-4 h-4" />
          Add Milestone
        </button>
        <button
          onClick={() => toggleAddMilestoneForm(project.id)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
        >
          <HiX className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

                      <div className="space-y-3">
                        {project.milestones.map((milestone) => (
                          <div key={milestone.id} className="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                            {/* Milestone Header */}
                            <div 
                              className={`p-4 transition-colors duration-200 ${
                                editingMilestoneId === milestone.id 
                                  ? 'bg-blue-50 dark:bg-blue-900/20' 
                                  : 'cursor-pointer hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-900'
                              }`}
                              onClick={editingMilestoneId === milestone.id ? undefined : () => toggleMilestoneExpansion(milestone.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {editingMilestoneId === milestone.id ? (
                                      <div className="flex items-center gap-3 flex-1">
                                        <div className="flex-1">
                                          <label className="block text-sm font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                            Milestone Name
                                          </label>
                                          <input
                                            type="text"
                                            value={editingMilestoneData.name}
                                            onChange={(e) => setEditingMilestoneData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full font-MEDIUM bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter milestone name"
                                            onClick={(e) => e.stopPropagation()}
                                          />
                                        </div>
                                        
                                        <div className="flex gap-2 mt-6">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              saveMilestoneChanges();
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                          >
                                            <HiCheck className="w-3 h-3" />
                                            Save
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              cancelEditingMilestone();
                                            }}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
                                          >
                                            <HiX className="w-3 h-3" />
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <h4 className="font-MEDIUM text-gray-900 dark:text-white">{milestone.name}</h4>
                                      {currentUser && currentUser.email === project.creatorId && (
  <>
    <button
      onClick={(e) => {
        e.stopPropagation();
        startEditingMilestone(milestone);
      }}
      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
      title="Edit milestone"
    >
      <HiPencil className="w-3 h-3" />
      Edit
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteMilestone(project.id, milestone.id);
      }}
      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
      title="Delete milestone"
    >
      <HiTrash className="w-3 h-3" />
      Delete
    </button>
  </>
)}
                                        {expandedMilestones.includes(milestone.id) ? 
                                          <HiChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : 
                                          <HiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                        }
                                      </>
                                    )}
                                  </div>
                                  
                                  {editingMilestoneId === milestone.id ? (
                                    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                            Status
                                          </label>
                                          <select
                                            value={editingMilestoneData.status}
                                            onChange={(e) => setEditingMilestoneData(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          >
                                            <option value=""></option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="ON_HOLD">On Hold</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                            Start Date
                                          </label>
                                          <input
                                            type="date"
                                            value={editingMilestoneData.startDate}
                                            min={project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : undefined}
                                            onChange={(e) => setEditingMilestoneData(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                            End Date
                                          </label>
                                          <input
                                            type="date"
                                            value={editingMilestoneData.endDate}
                                            onChange={(e) => setEditingMilestoneData(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                      <span>{formatDate(milestone.startDate)} - {formatDate(milestone.endDate)}</span>
                                      <span>{milestone.tasks ? milestone.tasks.length : 0} tasks</span>
                                    </div>
                                  )}
                                </div>
                                {editingMilestoneId !== milestone.id && (
                                  <span className={`px-2 py-1 rounded text-xs font-MEDIUM border ${getStatusColor(milestone.status, 'milestone')}`}>
                                    {milestone.status.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Tasks Section */}
                              {expandedMilestones.includes(milestone.id) && milestone.tasks && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-gray-100 dark:bg-gray-800 animate-slide-down">
                               <div className="flex items-center justify-between mb-3">
                                  <h5 className="text-sm font-MEDIUM text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <HiClipboardList className="w-4 h-4" />
                                    Tasks ({milestone.tasks.length})
                                  </h5>
                                  {currentUser && currentUser.email === project.creatorId && (
                                    <button
                                      onClick={() => toggleAddTaskForm(milestone.id)}
                                      className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                                    >
                                      <HiPlus className="w-3 h-3" />
                                      Add Task
                                    </button>
                                  )}
                                </div>

                                {showAddTaskForm[milestone.id] && (
  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700 p-3 mb-3">
    <h6 className="text-xs font-MEDIUM text-gray-900 dark:text-white mb-2">Add New Task</h6>
    <div className="space-y-2">
      <div>
        <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
          Task Title
        </label>
        <input
          type="text"
          value={newTaskData.title}
          onChange={(e) => setNewTaskData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="Enter task title"
        />
      </div>
      <div>
        <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={newTaskData.description}
          onChange={(e) => setNewTaskData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          rows={2}
          placeholder="Enter task description"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            value={newTaskData.priority}
            onChange={(e) => setNewTaskData(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={newTaskData.startDate}
            min={milestone.startDate ? new Date(milestone.startDate).toISOString().split('T')[0] : undefined}
            onChange={(e) => setNewTaskData(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={newTaskData.endDate}
            onChange={(e) => setNewTaskData(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
            Assignee
          </label>
          <select
            value={newTaskData.assigneeId}
            onChange={(e) => setNewTaskData(prev => ({ ...prev, assigneeId: e.target.value }))}
            className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="" disabled >Select Assignee</option>
            {project.members
              .filter((member) => member.role === 'TASK_COMPLETER')
              .map((member) => (
                <option key={member.id} value={member.user.email}>
                  {member.user.email}
                </option>
              ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => addTask(project.id, milestone.id)}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
        >
          <HiCheck className="w-3 h-3" />
          Add Task
        </button>
        <button
          onClick={() => toggleAddTaskForm(milestone.id)}
          className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
        >
          <HiX className="w-3 h-3" />
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
                                <div className="space-y-2">
                                  {milestone.tasks.map((task) => (
                                    <div key={task.id} className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-600 p-3 ${
                                      editingTaskId === task.id ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}>
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            {getTaskIcon(task.status)}
                                            {editingTaskId === task.id ? (
                                              <div className="flex items-center gap-3 flex-1">
                                                <div className="flex-1">
                                                  <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                    Task Title
                                                  </label>
                                                  <input
                                                    type="text"
                                                    value={editingTaskData.title}
                                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full text-sm font-MEDIUM bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter task title"
                                                  />
                                                </div>
                                              </div>
                                            ) : (
                                              <>
                                                <h6 className="text-sm font-MEDIUM text-gray-900 dark:text-white">{task.title}</h6>
                                              {currentUser && currentUser.email === project.creatorId && (
  <>
    <button
      onClick={(e) => {
        e.stopPropagation();
        startEditingTask(task);
      }}
      className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
      title="Edit task"
    >
      <HiPencil className="w-3 h-3" />
      Edit
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        deleteTask(project.id, task.id);
      }}
      className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
      title="Delete task"
    >
      <HiTrash className="w-3 h-3" />
      Delete
    </button>
  </>
)}
                                              </>
                                            )}
                                          </div>
                                          
                                          {editingTaskId === task.id ? (
                                            <div className="space-y-3">
                                              <div>
                                                <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                  Description
                                                </label>
                                                <textarea
                                                  value={editingTaskData.description}
                                                  onChange={(e) => setEditingTaskData(prev => ({ ...prev, description: e.target.value }))}
                                                  className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  rows={2}
                                                  placeholder="Enter task description"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                <div>
                                                  <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                    Priority
                                                  </label>
                                                  <select
                                                    value={editingTaskData.priority}
                                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, priority: e.target.value }))}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  >
                                                    <option value="LOW">Low</option>
                                                    <option value="MEDIUM">Medium</option>
                                                    <option value="HIGH">High</option>
                                                    <option value="CRITICAL">Critical</option>
                                                  </select>
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                    Start Date
                                                  </label>
                                                  <input
                                                    type="date"
                                                    value={editingTaskData.startDate}
                                                    min={milestone.startDate ? new Date(milestone.startDate).toISOString().split('T')[0] : undefined}
                                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, startDate: e.target.value }))}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                    Due Date
                                                  </label>
                                                  <input
                                                    type="date"
                                                    value={editingTaskData.endDate}
                                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, endDate: e.target.value }))}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-xs font-MEDIUM text-gray-700 dark:text-gray-300 mb-1">
                                                    Assignee
                                                  </label>
                                                  <select
                                                    value={editingTaskData.assigneeId}
                                                    onChange={(e) => setEditingTaskData(prev => ({ ...prev, assigneeId: e.target.value }))}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                  >
                                                    {project.members
                                                    .filter((member) => (
                                                      member.role === 'TASK_COMPLETER'
                                                    ))
                                                    .map((member) => (
                                                      <option key={member.id} value={member.user.email}>
                                                        {member.user.email}
                                                      </option>
                                                    ))}
                                                  </select>
                                                </div>
                                              </div>
                                             <div className="flex gap-2 mt-3">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    saveTaskChanges();
                                                  }}
                                                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                  <HiCheck className="w-4 h-4" />
                                                  Save Changes
                                                </button>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    cancelEditingTask();
                                                  }}
                                                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                                >
                                                  <HiX className="w-4 h-4" />
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              {task.description && (
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                                              )}
                                              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                {task.startDate && task.endDate && (
                                                  <span>{formatDate(task.startDate)} - {formatDate(task.endDate)}</span>
                                                )}
                                                {task.assigneeId && (
                                                  <span className="flex items-center gap-1">
                                                    <HiUser className="w-3 h-3" />
                                                    {task.assigneeId}
                                                  </span>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2 ml-3">
                                          {editingTaskId !== task.id && (
                                            <div className="flex items-center gap-1">
                                              <span className={`px-2 py-1 rounded text-xs font-MEDIUM border ${getStatusColor(task.status, 'task')}`}>
                                                {task.status.replace('_', ' ')}
                                              </span>
                                              {task.priority && (
                                                <span className={`px-2 py-1 rounded text-xs font-MEDIUM ${getPriorityColor(task.priority)}`}>
                                                  {task.priority}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {/* Add Files & Request Review */}
                                          {currentUser && currentUser.email === task.assigneeId && editingTaskId !== task.id && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openTaskModal(task);
                                              }}
                                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                              title="Manage files and request review"
                                            >
                                              <HiUpload className="w-3 h-3" />
                                              Submit Completion Proof
                                            </button>
                                          )}
                                          {/* Review Files & Update Status */}
                                          {currentUser && currentUser.email === project.creatorId && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openTaskReviewModal(task);
                                              }}
                                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors flex items-center gap-1"
                                              title="Review completion proof"
                                            >
                                              <HiEye className="w-3 h-3" />
                                              Review Completion Proof
                                            </button>
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
                      <h3 className="text-lg font-MEDIUM text-gray-900 dark:text-white mb-3">Team Members</h3>
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
            <h3 className="text-lg font-MEDIUM text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t been assigned to any projects yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Task File Modal */}
      {selectedTask && (
        <TaskFileModal
          isOpen={taskModalOpen}
          onClose={closeTaskModal}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskStatus={selectedTask.status}
        />
      )}

      {/* Task Review Modal */}
      {selectedTask && (
        <TaskReviewModal
          isOpen={taskReviewModalOpen}
          onClose={closeTaskReviewModal}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskStatus={selectedTask.status}
        />
      )}
    </div>
  );
};

export default ProjectsPage;