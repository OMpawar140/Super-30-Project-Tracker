/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { HiClipboardList, HiFlag, HiUser, HiCalendar, HiChevronDown, HiChevronUp, HiSearch, HiFilter, HiCheckCircle, HiTrash,
  HiClock, HiExclamation, HiUpload, HiEye, HiPencil, HiCheck, HiX,HiPlus, 
  HiRefresh,
  HiUserAdd,
  HiChatAlt} from 'react-icons/hi';
import { apiService, useApiCall } from '@/services/api';
import TaskFileModal from '../../components/ui/TaskFileModal';
import { useAuth } from '@/context/AuthContext';
import TaskReviewModal from '@/components/ui/TaskReviewModal';
import ProjectReportPDF from '@/components/ui/ProjectReportPDF';
import UserProjectsPDF from '@/components/ui/UserProjectsPDF';
import UserTasksPDF from '@/components/ui/UserTasksPDF';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { type User as FirebaseUser } from 'firebase/auth';
const MySwal = withReactContent(Swal);

// Types for our data (updated to match backend structure)
interface ProjectUser {
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
  user: ProjectUser;
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
  creator: ProjectUser;
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
  const [priorityFilter] = useState<string>('All');
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskReviewModalOpen, setTaskReviewModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{id: string, title: string, status: string} | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('All');
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

const [isEditMode, setIsEditMode] = useState(false);
const [showAddMember, setShowAddMember] = useState(false);
const [newMemberEmail, setNewMemberEmail] = useState('');
const [newMemberRole, setNewMemberRole] = useState('TASK_COMPLETER');
const [isAddingMember, setIsAddingMember] = useState(false);
const [taskReviews, setTaskReviews] = useState<Record<string, any[]>>({});
const [reviewsLoading, setReviewsLoading] = useState<Record<string, boolean>>({});
const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

// Function to toggle edit mode
const toggleEditMode = () => {
  setIsEditMode(!isEditMode);
  setShowAddMember(false); // Close add member form when toggling edit mode
  setNewMemberEmail('');
  setNewMemberRole('TASK_COMPLETER');
};

// Function to close edit mode
const closeEditMode = () => {
  setIsEditMode(false);
  setShowAddMember(false);
  setNewMemberEmail('');
  setNewMemberRole('TASK_COMPLETER');
};

// const updateMemberRole = async (projectId: string, memberId: string, newRole: string) => {
//   try {
//     // Call your API to update the member's role
//     const response = await callApi(() => apiService.projects.updateProjectMemberRole(projectId, memberId, newRole));
    
//     if (response.ok) {
//       // Update local state or refetch project data
//       // This depends on your state management approach
//     }
//   } catch (error) {
//     console.error('Error updating member role:', error);
//   }
// };

// Function to add a new member
const addMember = async (projectId: string, email: string, role: string) => {
  if (!email.trim()) {
    alert('Please enter a valid email address');
    return;
  }

  setIsAddingMember(true);
  
  try {
    // Replace with your actual API call
    const response = await callApi(() => apiService.projects.addProjectMember(projectId, { email, role }));
    console.log(response);
    
    if (response.success) {
      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(proj =>
          proj.id === projectId
            ? {
                ...proj,
                members: [...proj.members, response.data[0].member]
              }
            : proj
        )
      );
      
      // Reset form
      setNewMemberEmail('');
      setNewMemberRole('TASK_COMPLETER');
      setShowAddMember(false);
      
      console.log('Member added successfully');
      await MySwal.fire({
        title: 'Member added successfully',
        icon: 'success',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        background: '#18181b',
        color: '#fff',
        position: 'top-end',
        toast: true,
        timer: 3000,
      });
    }
  } catch (error) {
    console.error('Error adding member:', error);
    alert('Failed to add member. Please try again.');
    await MySwal.fire({
      title: 'Failed to add member',
      text: 'Please try again.',
      icon: 'error',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      background: '#18181b',
      color: '#fff',
      position: 'top-end',
      toast: true,
      timer: 3000,
    });
  } finally {
    setIsAddingMember(false);
  }
};

// Function to remove a member
const removeMember = async (projectId: string, memberId: string) => {
  const result = await MySwal.fire({
    title: 'Remove this member?',
    text: `Are you sure you want to remove this member from the project?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, remove the member.',
    cancelButtonText: 'No, keep the member.',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: '#6b7280',
    background: '#18181b',
    color: '#fff',
  });

  if(!result.isConfirmed) {
    return;
  }

  try {
    // Replace with your actual API call
    const response = await callApi(() => apiService.projects.removeProjectMember(projectId, memberId));
    
    if (response.success) {
      // Update local state
      setProjects(prevProjects =>
        prevProjects.map(proj =>
          proj.id === projectId
            ? {
                ...proj,
                members: proj.members.filter(member => member.id !== memberId)
              }
            : proj
        )
      );
      
      console.log('Member removed successfully');
      await MySwal.fire({
        title: 'Member removed successfully',
        icon: 'success',
        confirmButtonColor: '#6366f1',
        cancelButtonColor: '#6b7280',
        background: '#18181b',
        color: '#fff',
        position: 'top-end',
        toast: true,
        timer: 3000,
      });
    }
  } catch (error) {
    console.error('Error removing member:', error);
    await MySwal.fire({
      title: 'Failed to remove member',
      text: 'Please try again. Check if the member is assigned any tasks before removing.',
      icon: 'error',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      background: '#18181b',
      color: '#fff',
      position: 'top-end',
      toast: true,
      timer: 3000,
    });
  }
};

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

const deleteProject = async (projectId: string) => { 
  // if (!confirm('Are you sure you want to delete this project? This project will be archived for 7 days before permanent deletion. You still have the option to restore it during this period.')) {
  //   return;
  // }

  const result = await MySwal.fire({
      title: 'Delete this project?',
      text: `This project will be archived for next 7 days and can be recovered till then. 
        After 7 days, it will be permanently deleted and cannot be recovered again.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive it',
      cancelButtonText: 'No, keep it active',
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#6b7280',
      background: '#18181b',
      color: '#fff',
    });

    if(!result.isConfirmed) {
      return;
    }

  console.log(`Deleting (archiving) Project id: ${projectId}`);

  try {
    const response = await callApi(() => apiService.projects.archiveProject(projectId));

    if (response.success) {
      console.log(`Project with id ${projectId} deleted successfully.`);

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
                ...project,
                status: 'ARCHIVED',
              }
            : project
        )
      );
    }
  } catch (error) {
    console.error('Error deleting project:', error);
  }
};

const restoreProject = async (projectId: string) => { 
  
  console.log(`Restoring Project id: ${projectId}`);

  try {
    const response = await callApi(() => apiService.projects.restoreProject(projectId));

    if (response.success) {
      console.log(`Project with id ${projectId} restored successfully.`);

      // alert('Project restored successfully! Now you have all the data back.');

      Swal.fire({
        title: "Project restored successfully!",
        text: 'Now you have all your data back.',
        icon: "success",
        toast: true,
        position: 'top-end',
      });

      setProjects(prevProjects =>
        prevProjects.map(project =>
          project.id === projectId
            ? {
                ...project,
                status: 'ACTIVE',
              }
            : project
        )
      );
    }
  } catch (error) {
    console.error('Error restoring project:', error);
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

// Add this function to handle status change
const handleStatusChange = async (projectId: string, newStatus: string) => {
  try {
    const response = await callApi(() => apiService.projects.updateProjectStatus(projectId, newStatus));

    if (response.success) {
      // Update the local state
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: newStatus }
          : project
      ));
      
      // Show success message
      Swal.fire({
        title: "Status updated!",
        text: `Project status changed to ${newStatus.replace('_', ' ')}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error(`Error changing project status to ${newStatus}:`, error);
    Swal.fire({
      title: "Error",
      text: `Failed to change project status to ${newStatus}`,
      icon: "error",
    });
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

  // Function to fetch task reviews
const fetchTaskReviews = async (taskId: string) => {
  try {
    setReviewsLoading(prev => ({ ...prev, [taskId]: true }));
    const response = await callApi(() => apiService.tasks.getTaskReviews(taskId));
    if (response.success) {
      setTaskReviews(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    }
  } catch (error) {
    console.error('Error fetching task reviews:', error);
  } finally {
    setReviewsLoading(prev => ({ ...prev, [taskId]: false }));
  }
};

// Function to toggle task reviews visibility
const toggleTaskReviews = (taskId: string) => {
  const isExpanded = expandedReviews[taskId];
  
  setExpandedReviews(prev => ({
    ...prev,
    [taskId]: !isExpanded
  }));
  
  // Only fetch if expanding and not already loaded
  if (!isExpanded && !taskReviews[taskId]) {
    fetchTaskReviews(taskId);
  }
};

// Function to get review status icon
const getReviewStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <HiCheckCircle className="w-3 h-3 text-green-500" />;
    case 'REJECTED':
      return <HiX className="w-3 h-3 text-red-500" />;
    default:
      return <HiClock className="w-3 h-3 text-gray-400" />;
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
      project.members.some((member: ProjectMember) => {
        if (member.user.email === currentUser?.email) {
          tags.push(member.role);
        }
        if (member.user.skillset) {
          tags.push(member.user.skillset);
        }
      });
    }
    
    return [...new Set(tags)];
  };

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
        // console.log('Fetched projects:', transformedProjects);
        
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

  // Fetch projects from API
  useEffect(() => {
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

  // Add this new function to handle task status updates
  const handleTaskStatusUpdate = (taskId: string, newStatus: string) => {
    setProjects(prev => prev.map(project => ({
      ...project,
      milestones: project.milestones.map(milestone => ({
        ...milestone,
        tasks: milestone.tasks.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus }
            : task
        )
      }))
    })));
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
              <button
                onClick={fetchProjects}
                title='Refresh projects'
                className='cursor-pointer'
              >
                <HiRefresh className='dark:text-white'/>
              </button>
            </div>
            <div onClick={(e) => e.stopPropagation()}
              className='flex gap-3'>
                <UserTasksPDF 
                  projects={projects as any} 
                  currentUser={currentUser as any} 
                  onDownload={() => console.log('PDF generated')} 
                />
                <UserProjectsPDF 
                  projects={projects as any}
                  currentUser={currentUser as any}
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
                title='Status Filter'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300 cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative">
        <select
          title='Role Filter'
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
                          {currentUser?.email && (currentUser.email === project?.creatorId ||
                            project?.members?.some(
                              (member) =>
                                member?.user?.email === currentUser.email && member.role === 'ADMIN'
                            )) && (
                            <>
                              {project.status !== 'ARCHIVED' ? (
                                <>
                                <button
                                onClick={() => startEditingProject(project)}
                                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                title="Edit project"
                              >
                                <HiPencil className="w-4 h-4" />
                                Edit
                              </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProject(project.id);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                                  title="Delete milestone"
                                >
                                  <HiTrash className="w-3 h-3" />
                                  Delete
                                </button>
                                </>
                              ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      restoreProject(project.id);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                                    title="Delete milestone"
                                  >
                                    <HiRefresh className="w-3 h-3" />
                                    Restore
                                  </button>
                                )}
                            </>
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
                              title='Status'
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
                              title='Start Date'
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
                              title='End Date'
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

                        {/* Add Status Change Buttons - only for project creators */}
                        {currentUser && currentUser.email === project.creatorId && (
                          <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                            {project.status !== 'ON_HOLD' && project.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleStatusChange(project.id, 'ON_HOLD')}
                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors"
                                title="Put project on hold - pause all activities"
                              >
                                Put On Hold
                              </button>
                            )}

                            {project.status === 'ON_HOLD' && (
                              <button
                                onClick={() => handleStatusChange(project.id, 'ACTIVE')}
                                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                                title="Resume project activities"
                              >
                                Resume Project
                              </button>
                            )}
                            
                            {project.status !== 'COMPLETED' && project.status !== 'ARCHIVED' && (
                              <button
                                onClick={() => handleStatusChange(project.id, 'COMPLETED')}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                                title="Mark project as completed"
                              >
                                Mark Completed
                              </button>
                            )}
                          </div>
                        )}
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
  {currentUser && (currentUser.email === project?.creatorId ||
    project?.members?.some(
      (member) =>
        member?.user?.email === currentUser.email && member.role === 'ADMIN'
    )) && project.status !== 'ARCHIVED' && (
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
            title='Status'
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
            title='Start Date'
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
            title='End Date'
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
                                        {currentUser && (currentUser.email === project?.creatorId ||
                                          project?.members?.some(
                                            (member) =>
                                              member?.user?.email === currentUser.email && member.role === 'ADMIN'
                                          )) && project.status !== 'ARCHIVED' && (
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
                                  {currentUser && (currentUser.email === project?.creatorId ||
                                    project?.members?.some(
                                      (member) =>
                                        member?.user?.email === currentUser.email && member.role === 'ADMIN'
                                    )) && project.status !== 'ARCHIVED' && (
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
                                            title='Priority'
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
                                            title='Start Date'
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
                                            title='Due Date'
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
                                            title='Assignee'
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
                                              {currentUser && (currentUser.email === project?.creatorId ||
                                                project?.members?.some(
                                                  (member) =>
                                                    member?.user?.email === currentUser.email && member.role === 'ADMIN'
                                                )) && project.status !== 'ARCHIVED' && task.status !== 'COMPLETED' && (
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
                                                    title='Priority'
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
                                                    title='Start Date'
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
                                                    title='Due Date'
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
                                                    title='Assignee'
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

                                              {/* Task Reviews Section - Show for both task assignee and project creator */}
                                              {currentUser && (currentUser.email === task.assigneeId || currentUser.email === project.creatorId) && (
                                                <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-2">
                                                  <button
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      toggleTaskReviews(task.id);
                                                    }}
                                                    className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                                  >
                                                    <HiChatAlt className="w-3 h-3" />
                                                    <span>
                                                      {currentUser.email === task.assigneeId 
                                                        ? 'View Feedback & Reviews' 
                                                        : 'View Task Reviews'
                                                      }
                                                    </span>
                                                    {expandedReviews[task.id] ? 
                                                      <HiChevronUp className="w-3 h-3" /> : 
                                                      <HiChevronDown className="w-3 h-3" />
                                                    }
                                                  </button>
                                                  
                                                  {expandedReviews[task.id] && (
                                                    <div className="mt-2">
                                                      {reviewsLoading[task.id] ? (
                                                        <div className="flex items-center justify-center py-3">
                                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                            Loading reviews...
                                                          </span>
                                                        </div>
                                                      ) : taskReviews[task.id] && taskReviews[task.id].length > 0 ? (
                                                        <div className="space-y-2">
                                                          {taskReviews[task.id].map((review: any, index: number) => (
                                                            <div key={index} className={`rounded p-2 border-l-4 ${
                                                              review.status === 'APPROVED' 
                                                                ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500'
                                                                : 'bg-red-50 dark:bg-red-900/20 border-l-red-500'
                                                            }`}>
                                                              <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                                    Review by {review.reviewer.email}
                                                                  </span>
                                                                  {currentUser.email === project.creatorId && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                      (You)
                                                                    </span>
                                                                  )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                  {getReviewStatusIcon(review.status)}
                                                                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                                                                    review.status === 'APPROVED' 
                                                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                                                                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                                                                  }`}>
                                                                    {review.status}
                                                                  </span>
                                                                </div>
                                                              </div>
                                                              {review.comment && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-white dark:bg-gray-800 p-2 rounded border">
                                                                  <span className="font-medium">Feedback:</span> {review.comment}
                                                                </p>
                                                              )}
                                                              <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                                                  {formatDate(review.createdAt)}
                                                                </span>
                                                                {currentUser.email === task.assigneeId && (
                                                                  <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                                    {review.status === 'APPROVED' 
                                                                      ? '✓ Task approved - Well done!' 
                                                                      : '✗ Needs improvement - Please address the feedback'
                                                                    }
                                                                  </span>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      ) : (
                                                        <div className="text-center py-3">
                                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            No reviews yet.
                                                          </p>
                                                          {currentUser.email === project.creatorId && (
                                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                              Reviews will appear here once submitted.
                                                            </p>
                                                          )}
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )}
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
                                          {currentUser && currentUser.email === task.assigneeId && editingTaskId !== task.id && project.status !== 'ARCHIVED' && (
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
                                          {currentUser && currentUser.email === project.creatorId && project.status !== 'ARCHIVED' && task.status !== 'UPCOMING' && task.status !== "IN_PROGRESS" && (
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
                        {currentUser && (currentUser.email === project?.creatorId ||
                            project?.members?.some(
                              (member) =>
                                member?.user?.email === currentUser.email && member.role === 'ADMIN'
                            )) && (
                          <>
                            {!isEditMode && project.status !== 'ARCHIVED' ? (
                              // Edit button (shown when not in edit mode)
                              <button
                                onClick={toggleEditMode}
                                className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                                title="Edit team members"
                              >
                                <HiPencil className="w-4 h-4" />
                                Edit
                              </button>
                            ) : (
                              // Close button and Add Member button (shown when in edit mode)
                              <div className="flex items-center gap-2">
                                {!showAddMember && project.status !== 'ARCHIVED' && (
                                  <button
                                    onClick={() => setShowAddMember(true)}
                                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                                    title="Add team member"
                                  >
                                    <HiUserAdd className="w-4 h-4" />
                                    Add Member
                                  </button>
                                )}
                                { project.status !== 'ARCHIVED'&& (
                                  <button
                                  onClick={closeEditMode}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                                  title="Close edit mode"
                                >
                                  <HiX className="w-4 h-4" />
                                  Close
                                </button>)}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Add Member Form (only shown in edit mode) */}
                      {isEditMode && showAddMember && project.status !== 'ARCHIVED' && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add New Member</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={newMemberEmail}
                                onChange={(e) => setNewMemberEmail(e.target.value)}
                                placeholder="Enter member's email"
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                              </label>
                              <select
                                title='Role'
                                value={newMemberRole}
                                onChange={(e) => setNewMemberRole(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                        focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="TASK_COMPLETER">Task Completer</option>
                                <option value="ADMIN">Admin</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => addMember(project.id, newMemberEmail, newMemberRole)}
                                disabled={isAddingMember}
                                className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 
                                        disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
                              >
                                <HiPlus className="w-3 h-3" />
                                {isAddingMember ? 'Adding...' : 'Add Member'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddMember(false);
                                  setNewMemberEmail('');
                                  setNewMemberRole('TASK_COMPLETER');
                                }}
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Members List */}
                      <div className="space-y-2">
                        {project.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            <div className="flex items-center gap-2 flex-1">
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
                            
                            {/* Delete button (only shown in edit mode) */}
                            {isEditMode && project.creator.email !== member.user.email && (
                              <button
                                onClick={() => removeMember(project.id, member.id)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-600 hover:bg-red-700 
                                        text-white text-xs rounded transition-colors"
                                title="Remove member"
                              >
                                <HiTrash className="w-3 h-3" />
                              </button>
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
          onTaskStatusUpdate={handleTaskStatusUpdate}
        />
      )}
    </div>
  );
};

export default ProjectsPage;