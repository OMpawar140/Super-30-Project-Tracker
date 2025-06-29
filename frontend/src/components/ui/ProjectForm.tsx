/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useCallback, useMemo } from 'react';
import { HiCalendar } from 'react-icons/hi';
import { Button } from './button';
import Input from './Input type 2';
import MemberModal from './MemberModal';
import MilestoneModal from './MilestoneModal';
import { apiService, useApiCall } from '@/services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import type { 
  ProjectFormData, 
  Member, 
  Milestone, 
  ProjectFormProps 
} from '@/types/project';

const MySwal = withReactContent(Swal);


// Determine theme for SweetAlert
const theme = localStorage.getItem('theme');

const sweetAlertOptions: Record<string, unknown> = {
    background: theme === "dark" ? 'rgba(0, 0, 0, 0.9)' : '#fff', 
    color: theme === "dark" ? '#fff' : '#000', 
    confirmButtonText: 'OK', 
    confirmButtonColor: theme === "dark" ? '#3085d6' : '#0069d9', 
    cancelButtonColor: theme === "dark" ? '#d33' : '#dc3545', 
};


// Loading spinner component
const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <svg 
      className={`animate-spin ${sizeClasses[size]} text-white`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};

// Workflow steps type
type WorkflowStep = 'project' | 'members' | 'milestones';

// Loading states interface
interface LoadingStates {
  creatingProject: boolean;
  savingMembers: boolean;
  savingMilestones: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onCancel,
  initialData,
  isLoading = false,
}) => {
  // Form data state
  const [formData, setFormData] = useState<ProjectFormData>(
    initialData || {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      teamSize: 1,
    }
  );
  
  // Workflow state management
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('project');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
   
  // Modal states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);


  // Loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    creatingProject: false,
    savingMembers: false,
    savingMilestones: false,
  });

  const { callApi } = useApiCall();

  // Form validation
  const formErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Project description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
      
      if (endDate <= startDate) {
        errors.endDate = 'End date must be after start date';
      }
    }
    
    return errors;
  }, [formData]);

  const isFormValid = Object.keys(formErrors).length === 0;

  // Update loading state helper
  const updateLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Handle form input changes
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Show success toast
  const showSuccessToast = useCallback(async (title: string, text: string) => {
    await MySwal.fire({
       ...sweetAlertOptions,
      title,
      text,
      icon: 'success',
      // confirmButtonColor: '#6366f1',
      // background: '#18181b',
      // color: '#fff',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
  }, []);

  // Show error toast
  const showErrorToast = useCallback(async (title: string, text: string) => {
    await MySwal.fire({
       ...sweetAlertOptions,
      title,
      text,
      icon: 'error',
      // confirmButtonColor: '#ef4444',
      // background: '#18181b',
      // color: '#fff',
      toast: true,
      position: 'top-end',
    });
  }, []);

  // Handle project creation
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      await showErrorToast('Validation Error', 'Please fix the form errors before submitting');
      return;
    }

    updateLoadingState('creatingProject', true);

    try {
      const response = await callApi(() => apiService.projects.createProject(formData));
      console.log('Project created:', response);
      
      const projectId = response?.data?.id || response?.id;
      
      if (!projectId) {
        throw new Error('Project ID not returned from API');
      }
      
      setCreatedProjectId(projectId);

      await showSuccessToast('Project Created!', 'Your project was created successfully.');

      // Move to member invitation step with a small delay for UX
      setCurrentStep('members');
      setTimeout(() => {
        setShowMemberModal(true);
      }, 500);

    } catch (error) {
      console.error('Error creating project:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      
      await showErrorToast('Creation Failed', `Failed to create project: ${errorMessage}`);
    } finally {
      updateLoadingState('creatingProject', false);
    }
  }, [formData, isFormValid, callApi, updateLoadingState, showSuccessToast, showErrorToast]);

  // Handle member modal close
  const handleMemberModalClose = useCallback(async () => {
    setShowMemberModal(false);
    
    // Always proceed to milestones step for better UX
    setCurrentStep('milestones');
    setTimeout(() => {
      setShowMilestoneModal(true);
    }, 300);
  }, []);

  // Handle saving members
  const handleSaveMembers = useCallback(async (members: Member[]) => {
    if (!createdProjectId) {
      await showErrorToast('Error', 'Project ID not found');
      return;
    }

    updateLoadingState('savingMembers', true);

    try {
      if (members.length > 0) {
        const formattedMembers = members.map(member => ({
          userId: member.userId,
          role: member.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'TASK_COMPLETER'
        }));

        await callApi(() => 
          apiService.projects.addProjectMember(createdProjectId, formattedMembers)
        );

        setProjectMembers(members);

        await showSuccessToast(
          'Members Added!', 
          `Successfully added ${members.length} member(s) to the project.`
        );
      }
    } catch (error) {
      console.error('Error adding members:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add members';

      await showErrorToast('Member Addition Failed', errorMessage);
    } finally {
      updateLoadingState('savingMembers', false);
    }
  }, [createdProjectId, callApi, updateLoadingState, showSuccessToast, showErrorToast]);

  // Handle milestone modal close
  const handleMilestoneModalClose = useCallback(async () => {
    setShowMilestoneModal(false);
    await completeWorkflow();
  }, []);

  // Handle saving milestones
  const handleSaveMilestones = useCallback(async (milestonesData: Milestone[]) => {
    if (!createdProjectId) {
      await showErrorToast('Error', 'Project ID not found');
      return;
    }

    updateLoadingState('savingMilestones', true);

    try {
      if (milestonesData.length > 0) {
        let createdMilestonesCount = 0;
        let createdTasksCount = 0;

        for (const milestone of milestonesData) {
          const milestoneResponse = await callApi(() => 
            apiService.milestones.createMilestone(createdProjectId, {
              name: milestone.title,
              description: milestone.description,
              startDate: milestone.startDate,
              endDate: milestone.endDate,
              status: 'PLANNED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
          );

          const milestoneId = milestoneResponse?.data?.id || milestoneResponse?.id;

          if (!milestoneId) {
            throw new Error(`Failed to create milestone: ${milestone.title}`);
          }

          createdMilestonesCount++;

          // Create tasks for this milestone
          if (milestone.tasks && milestone.tasks.length > 0) {
            for (const task of milestone.tasks) {
              await callApi(() => 
                apiService.tasks.createTask(milestoneId, {
                  title: task.title,
                  description: task.description,
                  startDate: task.startDate,
                  endDate: task.endDate,
                  priority: task.priority,
                  assigneeId: task.assigneeEmail,
                })
              );
              createdTasksCount++;
            }
          }
        }

        setMilestones(milestonesData);

        await showSuccessToast(
          'Milestones & Tasks Added!', 
          `Successfully created ${createdMilestonesCount} milestone(s) with ${createdTasksCount} task(s).`
        );
      }
    } catch (error) {
      console.error('Error adding milestones:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add milestones and tasks';

      await showErrorToast('Milestone Creation Failed', errorMessage);
    } finally {
      updateLoadingState('savingMilestones', false);
    }
  }, [createdProjectId, callApi, updateLoadingState, showSuccessToast, showErrorToast]);

  // Complete workflow
  const completeWorkflow = useCallback(async () => {
    await MySwal.fire({
      title: 'Project Setup Complete!',
      text: 'Your project has been successfully created and configured.',
      icon: 'success',
      confirmButtonColor: '#6366f1',
      background: '#18181b',
      color: '#fff',
      timer: 3000,
      showConfirmButton: false,
    });

    // Reset all states
    setCreatedProjectId(null);
    setProjectMembers([]);
    setMilestones([]);
    setCurrentStep('project');
    
    // Call the parent's onCancel to close/reset the form
    onCancel();
  }, [onCancel]);

  // Determine if any operation is loading
  const isAnyLoading = Object.values(loadingStates).some(Boolean) || isLoading;

  console.log(currentStep , 'Current Step' , milestones, 'Milestones');


  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
            required
            error={formErrors.name}
            disabled={isAnyLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            disabled={isAnyLoading}
            className={`w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white ${
              formErrors.description 
                ? 'border-red-500 dark:border-red-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter project description"
            required
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {formErrors.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="date"
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              icon={<HiCalendar className="w-5 h-5" />}
              required
              error={formErrors.startDate}
              disabled={isAnyLoading}
            />
          </div>
          <div>
            <Input
              type="date"
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              icon={<HiCalendar className="w-5 h-5" />}
              required
              error={formErrors.endDate}
              disabled={isAnyLoading}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isAnyLoading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isAnyLoading || !isFormValid}
            className="cursor-pointer flex items-center gap-2"
          >
            {loadingStates.creatingProject && <LoadingSpinner size="sm" />}
            {loadingStates.creatingProject 
              ? 'Creating...' 
              : (initialData ? 'Update Project' : 'Create Project')
            }
          </Button>
        </div>
      </form>

      {/* Member Modal */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={handleMemberModalClose}
        onSaveMembers={handleSaveMembers}
        isLoading={loadingStates.savingMembers}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={showMilestoneModal}
        onClose={handleMilestoneModalClose}
        onSaveMilestones={handleSaveMilestones}
        projectMembers={projectMembers}
        projectDateRange={{
          startDate: formData.startDate,
          endDate: formData.endDate
        }}
        isLoading={loadingStates.savingMilestones}
      />
    </>
  );
};

export default ProjectForm;