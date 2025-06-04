import React, { useState } from 'react';
import { HiCalendar, HiUsers } from 'react-icons/hi';
import Button from '../ui/Button';
import Input from '../ui/Input';

export interface ProjectFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  teamSize: number;
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
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      teamSize: 1,
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Project Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter project title"
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

      <div>
        <Input
          type="number"
          label="Team Size"
          name="teamSize"
          value={formData.teamSize.toString()}
          onChange={handleChange}
          min={1}
          max={20}
          icon={<HiUsers className="w-5 h-5" />}
          required
        />
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
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm; 