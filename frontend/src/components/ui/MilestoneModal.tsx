/* eslint-disable @typescript-eslint/no-explicit-any */
// MilestoneModal.tsx
import React, { useState } from 'react';
import { HiPlus, HiTrash } from 'react-icons/hi';
import { Button } from './button';
import Input from './Input type 2';
import TaskForm from './TaskForm';
import type { 
  Member, 
  Task, 
  Milestone,
} from '@/types/project';
import Swal from 'sweetalert2';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMilestones: (milestones: Milestone[]) => void;
  projectMembers: Member[];
  projectDateRange: {
    startDate: string;
    endDate: string;
  };
  isLoading?: boolean;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  onClose,
  onSaveMilestones,
  projectMembers,
  projectDateRange,
}) => {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      title: '',
      description: '',
      startDate: projectDateRange.startDate,
      endDate: projectDateRange.endDate,
      tasks: [],
    },
  ]);

  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(0);

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        startDate: projectDateRange.startDate,
        endDate: projectDateRange.endDate,
        tasks: [],
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
    if (expandedMilestone === index) {
      setExpandedMilestone(null);
    }
  };

  const updateMilestone = (index: number, field: keyof Milestone, value: any) => {
    setMilestones(
      milestones.map((milestone, i) =>
        i === index ? { ...milestone, [field]: value } : milestone
      )
    );
  };

  const addTaskToMilestone = (milestoneIndex: number, task: Task) => {
    setMilestones(
      milestones.map((milestone, i) =>
        i === milestoneIndex
          ? { ...milestone, tasks: [...milestone.tasks, task] }
          : milestone
      )
    );
  };

  const removeTaskFromMilestone = (milestoneIndex: number, taskIndex: number) => {
    setMilestones(
      milestones.map((milestone, i) =>
        i === milestoneIndex
          ? {
              ...milestone,
              tasks: milestone.tasks.filter((_, ti) => ti !== taskIndex),
            }
          : milestone
      )
    );
  };

  const updateTaskInMilestone = (
    milestoneIndex: number,
    taskIndex: number,
    updatedTask: Task
  ) => {
    setMilestones(
      milestones.map((milestone, i) =>
        i === milestoneIndex
          ? {
              ...milestone,
              tasks: milestone.tasks.map((task, ti) =>
                ti === taskIndex ? updatedTask : task
              ),
            }
          : milestone
      )
    );
  };

  const handleSave = () => {
    // Validate milestones
    const validMilestones = milestones.filter(
      (milestone) => milestone.title.trim() && milestone.description.trim()
    );

    if(validMilestones.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Milestones',
        text: 'You have not added any milestones. Do you want to skip this step?',
        showCancelButton: true,
        confirmButtonText: 'Yes, skip',
        cancelButtonText: 'No, go back',
        position: 'top-end',
        toast: true,
        timer: 5000,
        timerProgressBar: true,
      })

      return;
    }

    onSaveMilestones(validMilestones);
    onClose();
  };

  const handleSkip = () => {
    onSaveMilestones([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Milestones & Tasks
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Create milestones and organize tasks to track project progress
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {milestones.map((milestone, milestoneIndex) => (
              <div
                key={milestoneIndex}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Milestone {milestoneIndex + 1}
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
                      onClick={() =>
                        setExpandedMilestone(
                          expandedMilestone === milestoneIndex ? null : milestoneIndex
                        )
                      }
                    >
                      {expandedMilestone === milestoneIndex ? 'Collapse' : 'Expand'}
                    </Button>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMilestone(milestoneIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <HiTrash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Milestone Title"
                    value={milestone.title}
                    onChange={(e) =>
                      updateMilestone(milestoneIndex, 'title', e.target.value)
                    }
                    placeholder="Enter milestone title"
                    required
                    className={`block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200`}
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) =>
                        updateMilestone(milestoneIndex, 'description', e.target.value)
                      }
                      rows={2}
                      className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter milestone description"
                      required
                    />
                  </div>
                  <Input
                    type="date"
                    label="Start Date"
                    value={milestone.startDate}
                    onChange={(e) =>
                      updateMilestone(milestoneIndex, 'startDate', e.target.value)
                    }
                   
                    min={projectDateRange.startDate}
                    max={projectDateRange.endDate}
                    required
                  className={`block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200`}

                  />
                  <Input
                    type="date"
                    label="End Date"
                    value={milestone.endDate}
                    onChange={(e) =>
                      updateMilestone(milestoneIndex, 'endDate', e.target.value)
                    }
                    min={milestone.startDate || projectDateRange.startDate}
                    max={projectDateRange.endDate}
                    required
                  className={`block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-200`}
                  />
                </div>

                {expandedMilestone === milestoneIndex && (
                  <TaskForm
                    tasks={milestone.tasks}
                    projectMembers={projectMembers}
                    milestoneStartDate={milestone.startDate}
                    milestoneEndDate={milestone.endDate}
                    onAddTask={(task) => addTaskToMilestone(milestoneIndex, task)}
                    onRemoveTask={(taskIndex) =>
                      removeTaskFromMilestone(milestoneIndex, taskIndex)
                    }
                    onUpdateTask={(taskIndex, task) =>
                      updateTaskInMilestone(milestoneIndex, taskIndex, task)
                    }
                  />
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addMilestone}
              className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2"
            >
              <HiPlus className="w-4 h-4 mr-2" />
              Add Another Milestone
            </Button>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={handleSkip} className="border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2">
            Skip Milestones
          </Button>
          <Button type="button" onClick={handleSave} className="  border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center justify-center gap-2">
            Save Milestones & Tasks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MilestoneModal;