/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../lib/firebase';

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token for API calls
const getAuthToken = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getAuthToken();
  
  // Don't set Content-Type if body is FormData
  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// API service object
export const apiService = {
  // Auth endpoints
  auth: {
    emailRegister: (email: string) =>
      apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),

    // Verify current token
    verifyToken: () => apiCall('/auth/verify-token', { method: 'POST' }),
    
    // Get user profile
    getProfile: () => apiCall('/auth/profile'),
    
    // Logout (revoke tokens)
    logout: () => apiCall('/auth/logout', { method: 'POST' }),
    
    // Create custom token
    createCustomToken: (claims: Record<string, any>) =>
      apiCall('/auth/custom-token', {
        method: 'POST',
        body: JSON.stringify({ claims }),
      }),
  },

  // Public endpoints (no auth required)
  public: {
    // Get public data
    getPublicData: () => apiCall('/public'),
    
    // Get feed (with optional auth)
    getFeed: () => apiCall('/feed'),
  },

  // Protected endpoints (auth required)
  protected: {
    // Get dashboard data
    getDashboard: () => apiCall('/dashboard'),
    
    // Get user settings
    getUserSettings: () => apiCall('/user/settings'),
    
    // Update user settings
    updateUserSettings: (settings: Record<string, any>) =>
      apiCall('/user/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }),
  },

  // Admin endpoints (admin role required)
  admin: {
    // Get admin data
    getAdminData: () => apiCall('/admin/users'),
  },

  // Project management endpoints
  projects: {
    // Get all projects (maps to GET /api/projects)
    getAllProjects: () => apiCall('/projects'),
    
    // Get project by ID (maps to GET /api/projects/:id)
    getProjectById: (id: string) => apiCall(`/projects/${id}`),
    
    // Create new project (maps to POST /api/projects)
    createProject: (projectData: Record<string, any>) =>
      apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),
    
    // Update existing project (maps to PUT /api/projects/:id)
    updateProject: (id: string, projectData: Record<string, any>) =>
      apiCall(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      }),
    
    // Delete project (maps to DELETE /api/projects/:id)
    deleteProject: (id: string) =>
      apiCall(`/projects/${id}`, { method: 'DELETE' }),


    // Get project members (maps to GET /api/projects/:id/members)
    getProjectMembers: (id: string) => apiCall(`/projects/${id}/members`),

    // Add project member (maps to POST /api/projects/:id/members)
    addProjectMember: (id: string, memberData: Record<string, any>) =>
      apiCall(`/projects/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(memberData),
      }),

    // Remove project member (maps to DELETE /api/projects/:id/members/:userId)
    removeProjectMember: (id: string, userId: string) =>
      apiCall(`/projects/${id}/members/${userId}`, { method: 'DELETE' }),
  },

  // Milestone management endpoints
  milestones: {
    // Get all milestones for a project (maps to GET /api/projects/:id/milestones)
    getProjectMilestones: (id: string) => 
      apiCall(`/projects/${id}/milestones`),
    
    // Get milestone by ID (maps to GET /api/milestones/:id)
    getMilestoneById: (id: string) => apiCall(`/milestones/${id}`),
    
    // Create new milestone (maps to POST /api/projects/:id/milestones)
    createMilestone: (id: string, milestoneData: Record<string, any>) =>
      apiCall(`/projects/${id}/milestones`, {
        method: 'POST',
        body: JSON.stringify(milestoneData),
      }),
    
    // Update existing milestone (maps to PUT /api/milestones/:id)
    updateMilestone: (id: string, milestoneData: Record<string, any>) =>
      apiCall(`/milestones/${id}`, {
        method: 'PUT',
        body: JSON.stringify(milestoneData),
      }),
    
    // Delete milestone (maps to DELETE /api/milestones/:id)
    deleteMilestone: (id: string) =>
      apiCall(`/milestones/${id}`, { method: 'DELETE' }),

    // Update milestone status (maps to PATCH /api/milestones/:id/status)
    updateMilestoneStatus: (id: string, status: string) =>
      apiCall(`/milestones/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    // Reorder milestones (maps to PUT /api/projects/:projectId/milestones/reorder)
    reorderMilestones: (projectId: string, milestoneIds: string[]) =>
      apiCall(`/projects/${projectId}/milestones/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ milestoneIds }),
      }),
  },

  // Task management endpoints
  tasks: {
    // Get all tasks for a milestone (maps to GET /api/milestones/:milestoneId/tasks)
    getMilestoneTasks: (milestoneId: string) => 
      apiCall(`/milestones/${milestoneId}/tasks`),
    
    // Get all tasks for a project (maps to GET /api/projects/:projectId/tasks)
    getProjectTasks: (projectId: string) => 
      apiCall(`/projects/${projectId}/tasks`),
    
    // Get task by ID (maps to GET /api/tasks/:id)
    getTaskById: (id: string) => apiCall(`/tasks/${id}`),
    
    // Create new task (maps to POST /api/milestones/:milestoneId/tasks)
    createTask: (milestoneId: string, taskData: Record<string, any>) =>
      apiCall(`/milestones/${milestoneId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(taskData),
      }),
    
    // Update existing task (maps to PUT /api/tasks/:id)
    updateTask: (id: string, taskData: Record<string, any>) =>
      apiCall(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(taskData),
      }),
    
    // Delete task (maps to DELETE /api/tasks/:id)
    deleteTask: (id: string) =>
      apiCall(`/tasks/${id}`, { method: 'DELETE' }),

    // Update task status (maps to PATCH /api/tasks/:id/status)
    updateTaskStatus: (id: string, status: string) =>
      apiCall(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),

    // Assign task to user (maps to PATCH /api/tasks/:id/assign)
    assignTask: (id: string, userId: string) =>
      apiCall(`/tasks/${id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ userId }),
      }),

    // Unassign task (maps to PATCH /api/tasks/:id/unassign)
    unassignTask: (id: string) =>
      apiCall(`/tasks/${id}/unassign`, { method: 'PATCH' }),

    // Update task priority (maps to PATCH /api/tasks/:id/priority)
    updateTaskPriority: (id: string, priority: string) =>
      apiCall(`/tasks/${id}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority }),
      }),

    // Add comment to task (maps to POST /api/tasks/:id/comments)
    addTaskComment: (id: string, comment: string) =>
      apiCall(`/tasks/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ comment }),
      }),

    // Get task comments (maps to GET /api/tasks/:id/comments)
    getTaskComments: (id: string) => apiCall(`/tasks/${id}/comments`),

    // Update task due date (maps to PATCH /api/tasks/:id/due-date)
    updateTaskDueDate: (id: string, dueDate: string) =>
      apiCall(`/tasks/${id}/due-date`, {
        method: 'PATCH',
        body: JSON.stringify({ dueDate }),
      }),

    // Get tasks assigned to current user (maps to GET /api/tasks/assigned-to-me)
    getMyTasks: () => apiCall('/tasks/assigned-to-me'),

    // Get tasks by status (maps to GET /api/tasks?status=:status)
    getTasksByStatus: (status: string, projectId?: string) => {
      const params = new URLSearchParams({ status });
      if (projectId) params.append('projectId', projectId);
      return apiCall(`/tasks?${params.toString()}`);
    },

    // Get overdue tasks (maps to GET /api/tasks/overdue)
    getOverdueTasks: (projectId?: string) => {
      const params = projectId ? `?projectId=${projectId}` : '';
      return apiCall(`/tasks/overdue${params}`);
    },

    // Reorder tasks within a milestone (maps to PUT /api/milestones/:milestoneId/tasks/reorder)
    reorderTasks: (milestoneId: string, taskIds: string[]) =>
      apiCall(`/milestones/${milestoneId}/tasks/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ taskIds }),
      }),

    // Move task to different milestone (maps to PATCH /api/tasks/:id/move)
    moveTask: (id: string, milestoneId: string) =>
      apiCall(`/tasks/${id}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ milestoneId }),
      }),

    // Bulk update tasks (maps to PUT /api/tasks/bulk)
    bulkUpdateTasks: (updates: { taskId: string; updates: Record<string, any> }[]) =>
      apiCall('/tasks/bulk', {
        method: 'PUT',
        body: JSON.stringify({ updates }),
      }),
  },

  files: {
    // Get all files (maps to GET /api/files)
    getAllFiles: (searchParams?: Record<string, any>) => {
      const queryString = searchParams ? 
        '?' + new URLSearchParams(searchParams).toString() : '';
      return apiCall(`/files${queryString}`);
    },
    
    // Upload file (maps to POST /api/files/upload)
    uploadFile: (taskId: string, file: File, metadata?: Record<string, any>) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          formData.append(key, metadata[key]);
        });
      }
      return apiCall('/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it for FormData
        // headers: {},
      }).then(result => {
      console.log('Upload result:', result);
      return result;
    });
    },
    
    // Get file details/preview (maps to GET /api/files/:key)
    getFileDetails: (key: string) => apiCall(`/files/${key}/preview`),
    
    // Update file metadata (maps to PUT /api/files/:key)
    // updateFileMetadata: (key: string, metadata: Record<string, any>) =>
    //   apiCall(`/files/${key}`, {
    //     method: 'PUT',
    //     body: JSON.stringify(metadata),
    //   }),
    
    // Delete file (maps to DELETE /api/files/:key)
    deleteFile: (key: string) => apiCall(`/files/${key}`, { method: 'DELETE' }),

    // Download file (maps to GET /api/files/:key/download)
    downloadFile: (key: string) => {
      // Return the URL for direct download or handle blob response
      return apiCall(`/files/${key}/download`, {
        responseType: 'blob'
      });
    },

    // Get file signed URL (maps to GET /api/files/:key/url)
    getFileUrl: (key: string, expires?: number) => {
      const queryString = expires ? `?expires=${expires}` : '';
      return apiCall(`/files/${key}/url${queryString}`);
    },

    // Share file (maps to POST /api/files/:key/share)
    // shareFile: (key: string, shareData: Record<string, any>) =>
    //   apiCall(`/files/${key}/share`, {
    //     method: 'POST',
    //     body: JSON.stringify(shareData),
    //   }),

    // Bulk delete files (maps to POST /api/files/bulk/delete)
    bulkDeleteFiles: (keys: string[]) =>
      apiCall('/files/bulk/delete', {
        method: 'POST',
        body: JSON.stringify({ keys }),
      }),

    // Bulk download files (maps to POST /api/files/bulk/download)
    bulkDownloadFiles: (keys: string[]) =>
      apiCall('/files/bulk/download', {
        method: 'POST',
        body: JSON.stringify({ keys }),
        responseType: 'blob'
      }),

    // Health check (maps to GET /api/files/health)
    healthCheck: () => apiCall('/files/health'),
  },

  users: {
    // Get all users (maps to GET /api/users)
    getAllUsers: () => apiCall('/users'),
    
    // Get user by ID (maps to GET /api/users/:id)
    getUserById: (id: string) => apiCall(`/users/${id}`),
    
    // Get user by email (maps to GET /api/users/email/:email)
    getUserByEmail: (email: string) => apiCall(`/users/email/${encodeURIComponent(email)}`),
    
    // Create new user (maps to POST /api/users)
    createUser: (userData: { email: string; skillset: string[] }) =>
      apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    
    // Update existing user (maps to PUT /api/users/:id)
    updateUser: (id: string, userData: { email?: string; skillset?: string[] }) =>
      apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      }),
    
    // Delete user (maps to DELETE /api/users/:id)
    deleteUser: (id: string) =>
      apiCall(`/users/${id}`, { method: 'DELETE' }),

    // Search users by skillset (maps to GET /api/users/search/skills?skills=skill1,skill2)
    searchUsersBySkills: (skills: string[]) =>
      apiCall(`/users/search/skills?skills=${skills.join(',')}`),

    // Add skill to user (maps to POST /api/users/:id/skills)
    addUserSkill: (id: string, skill: string) =>
      apiCall(`/users/${id}/skills`, {
        method: 'POST',
        body: JSON.stringify({ skill }),
      }),

    // Remove skill from user (maps to DELETE /api/users/:id/skills/:skill)
    removeUserSkill: (id: string, skill: string) =>
      apiCall(`/users/${id}/skills/${encodeURIComponent(skill)}`, { 
        method: 'DELETE' 
      }),

    // Update user skillset (maps to PUT /api/users/:id/skills)
    updateUserSkillset: (id: string, skillset: string[]) =>
      apiCall(`/users/${id}/skills`, {
        method: 'PUT',
        body: JSON.stringify({ skillset }),
      }),

    // Get users with specific skill (maps to GET /api/users/skill/:skill)
    getUsersWithSkill: (skill: string) =>
      apiCall(`/users/skill/${encodeURIComponent(skill)}`),
  }
};

// Custom hook for API calls with loading and error states
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callApi = async (apiFunction: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction();
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { callApi, loading, error };
};

// React hook import (add this to your imports)
import { useState } from 'react';

export default apiService;