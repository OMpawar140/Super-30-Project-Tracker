/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
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

const ProjectForm: React.FC<ProjectFormProps> = ({
  onCancel,
  initialData,
  isLoading = false,
}) => {
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
  const [currentStep, setCurrentStep] = useState<'project' | 'members' | 'milestones'>('project');
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
   

  
  // Modal states
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  const { callApi } = useApiCall();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the API to create the project
      const response = await callApi(() => apiService.projects.createProject(formData));
      console.log('form data:', formData);
      console.log('Project created:', response);
      
      // Assuming the API returns the created project with an ID
      const projectId = response?.data?.id || response?.id;
      setCreatedProjectId(projectId);

      // Call the parent's onSubmit callback
      // onSubmit(formData);

      // Show success message
      await MySwal.fire({
        title: 'Project Created!',
        text: 'Your project was created successfully.',
        icon: 'success',
        confirmButtonColor: '#6366f1',
        background: '#18181b',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false,
      });

      // Move to member invitation step
      setCurrentStep('members');
      setTimeout(() => {
        setShowMemberModal(true);
      }, 100);

    } catch (err) {
      console.error('Error creating project:', err);
      
      // Show error message
      await MySwal.fire({
        title: 'Error!',
        text: 'Failed to create project. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#18181b',
        color: '#fff',
      });
    }
  };

  const handleMemberModalClose = async () => {
    setShowMemberModal(false);
    
    // Show options to continue or skip
    // const result = await MySwal.fire({
    //   title: 'Add Milestones & Tasks?',
    //   text: 'Would you like to add milestones and tasks to your project now?',
    //   icon: 'question',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes, Add Milestones',
    //   cancelButtonText: 'Skip for Now',
    //   confirmButtonColor: '#6366f1',
    //   cancelButtonColor: '#6b7280',
    //   background: '#18181b',
    //   color: '#fff',
    // });

    // if (result.isConfirmed) {
    setCurrentStep('milestones');
    setShowMilestoneModal(true);
    // } else {
    //   // Complete the workflow
    //   await completeWorkflow();
    // }
  };

  const handleSaveMembers = async (members: Member[]) => {
    try {
      if (createdProjectId && members.length > 0) {
        // Map userId -> userId for backend compatibility
        const formattedMembers = members.map(m => ({
          userId: m.userId,
          role: m.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'TASK_COMPLETER'
        }));

        await callApi(() => apiService.projects.addProjectMember(createdProjectId, formattedMembers));

        // Store members for later use in task assignment
        setProjectMembers(members);

        await MySwal.fire({
          title: 'Members Added!',
          text: `Successfully added ${members.length} member(s) to the project.`,
          icon: 'success',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error adding members:', error);

      await MySwal.fire({
        title: 'Error!',
        text: 'Failed to add members. You can add them later from project settings.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        background: '#18181b',
        color: '#fff',
      });
    }
  };

  const handleMilestoneModalClose = async () => {
    setShowMilestoneModal(false);
    await completeWorkflow();
  };

  const handleSaveMilestones = async (milestonesData: Milestone[]) => {

    console.log('Saving milestones:', milestonesData);

    try {
      if (createdProjectId && milestonesData.length > 0) {
        // Save milestones to backend
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

          console.log('Created milestone:', milestoneResponse);

          // Save tasks for this milestone
          if (milestone.tasks.length > 0) {
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
            }
          }
        }

        setMilestones(milestonesData);

        await MySwal.fire({
          title: 'Milestones & Tasks Added!',
          text: `Successfully created ${milestonesData.length} milestone(s) with tasks.`,
          icon: 'success',
          confirmButtonColor: '#6366f1',
          background: '#18181b',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error adding milestones:', error);

      await MySwal.fire({
        title: 'Error!',
        text: 'Failed to add milestones and tasks. You can add them later from project dashboard.',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        background: '#18181b',
        color: '#fff',
      });
    }
  };

  const completeWorkflow = async () => {
    await MySwal.fire({
      title: 'Project Setup Complete!',
      text: 'Your project has been successfully created and configured. You can manage it from the Projects page later.',
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
  };

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
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter project description"
            required
          />
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
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className='cursor-pointer'
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className='cursor-pointer'>
            {isLoading ? 'Creating...' : (initialData ? 'Update Project' : 'Create Project')}
          </Button>
        </div>
      </form>

      {/* Member Modal */}
      <MemberModal
        isOpen={showMemberModal}
        onClose={handleMemberModalClose}
        onSaveMembers={handleSaveMembers}
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
      />
    </>
  );
};

export default ProjectForm;