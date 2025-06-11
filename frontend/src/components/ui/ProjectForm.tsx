import React, { useState } from 'react';
import { HiCalendar } from 'react-icons/hi';
import { Button } from './button';
import Input from './Input type 2';
import MemberModal from './MemberModal';
import { apiService, useApiCall } from '@/services/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  teamSize: number;
}

interface Member {
  userId: string;
  role: 'ADMIN' | 'TASK_COMPLETER';
}

interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  initialData?: ProjectFormData;
  isLoading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  onSubmit,
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
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

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
      
      // Assuming the API returns the created project with an ID
      const projectId = response?.data?.id || response?.id;
      setCreatedProjectId(projectId);

      // Call the parent's onSubmit callback
      onSubmit(formData);

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

      // Open the member modal after a short delay
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
    setCreatedProjectId(null);
    // Call the parent's onCancel callback
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onCancel();
  };

 const handleSaveMembers = (members: Member[]) => {
  (async () => {
    try {
      if (createdProjectId && members.length > 0) {
        // Map userId -> userId for backend compatibility
        const formattedMembers = members.map(m => ({
          userId: m.userId,
          role: m.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'TASK_COMPLETER'
        }));

        await callApi(() => apiService.projects.addProjectMember(createdProjectId, formattedMembers));

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
  })();
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
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
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
    </>
  );
};

export default ProjectForm;