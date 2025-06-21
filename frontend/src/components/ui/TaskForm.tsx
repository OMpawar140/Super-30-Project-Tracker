import React, { useState } from 'react';
import { HiPlus, HiTrash, HiCalendar } from 'react-icons/hi';
import { Button } from './button';
import Input from './Input type 2';
import type {
  Member, 
  Task, 
} from '@/types/project';

interface TaskFormProps {
  tasks: Task[];
  projectMembers: Member[];
  milestoneStartDate: string;
  milestoneEndDate: string;
  onAddTask: (task: Task) => void;
  onRemoveTask: (index: number) => void;
  onUpdateTask: (index: number, task: Task) => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  tasks,
  projectMembers,
  milestoneStartDate,
  milestoneEndDate,
  onAddTask,
  onRemoveTask,
  onUpdateTask,
}) => {
  const [newTask, setNewTask] = useState<Task>({
    title: '',
    description: '',
    startDate: milestoneStartDate,
    endDate: milestoneEndDate,
    priority: 'MEDIUM',
    assigneeEmail: '',
  });

  const [showAddTask, setShowAddTask] = useState(false);

  const priorityOptions = [
    { value: 'LOW', label: 'Low', color: 'text-green-600' },
    { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-600' },
    { value: 'HIGH', label: 'High', color: 'text-orange-600' },
    { value: 'URGENT', label: 'Urgent', color: 'text-red-600' },
  ];

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert('Please fill in task title and description.');
      return;
    }

    if (!newTask.assigneeEmail) {
      alert('Please select an assignee for the task.');
      return;
    }

    onAddTask(newTask);
    setNewTask({
      title: '',
      description: '',
      startDate: milestoneStartDate,
      endDate: milestoneEndDate,
      priority: 'MEDIUM',
      assigneeEmail: '',
    });
    setShowAddTask(false);
  };

  const updateTask = (index: number, field: keyof Task, value: any) => {
    const updatedTask = { ...tasks[index], [field]: value };
    onUpdateTask(index, updatedTask);
  };

  return (
    <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-md font-medium text-gray-900 dark:text-white">
          Tasks ({tasks.length})
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowAddTask(!showAddTask)}
        >
          <HiPlus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Existing Tasks */}
      {tasks.length > 0 && (
        <div className="space-y-4 mb-4">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Input
                    label="Task Title"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder="Enter task title"
                    className="mb-2"
                    required
                  />
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm"
                    placeholder="Enter task description"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveTask(index)}
                  className="text-red-600 hover:text-red-700 ml-2"
                >
                  <HiTrash className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  type="date"
                  label="Start Date"
                  value={task.startDate}
                  onChange={(e) => updateTask(index, 'startDate', e.target.value)}
                  icon={<HiCalendar className="w-4 h-4" />}
                  min={milestoneStartDate}
                  max={milestoneEndDate}
                  required
                />
                <Input
                  type="date"
                  label="End Date"
                  value={task.endDate}
                  onChange={(e) => updateTask(index, 'endDate', e.target.value)}
                  icon={<HiCalendar className="w-4 h-4" />}
                  min={task.startDate || milestoneStartDate}
                  max={milestoneEndDate}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(index, 'priority', e.target.value as Task['priority'])}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                    required
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assignee
                  </label>
                  <select
                    value={task.assigneeEmail}
                    onChange={(e) => updateTask(index, 'assigneeEmail', e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                    required
                  >
                    <option value="">Select Assignee</option>
                    {projectMembers.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.userId.toString()} ({member.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Task Form */}
      {showAddTask && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-2 border-dashed border-blue-300 dark:border-blue-600">
          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Add New Task
          </h5>
          
          <div className="space-y-3">
            <Input
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task title"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Enter task description"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                type="date"
                label="Start Date"
                value={newTask.startDate}
                onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                icon={<HiCalendar className="w-4 h-4" />}
                min={milestoneStartDate}
                max={milestoneEndDate}
                required
              />
              <Input
                type="date"
                label="End Date"
                value={newTask.endDate}
                onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                icon={<HiCalendar className="w-4 h-4" />}
                min={newTask.startDate || milestoneStartDate}
                max={milestoneEndDate}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  required
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assignee
                </label>
                <select
                  value={newTask.assigneeEmail}
                  onChange={(e) => setNewTask({ ...newTask, assigneeEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
                  required
                >
                  <option value="">Select Assignee</option>
                  {projectMembers
                    .filter((member) => member.role === 'TASK_COMPLETER')
                    .map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.userId} ({member.role})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddTask(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleAddTask}
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>
      )}

      {tasks.length === 0 && !showAddTask && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">No tasks added yet.</p>
          <p className="text-xs mt-1">Click "Add Task" to create your first task.</p>
        </div>
      )}
    </div>
  );
};

export default TaskForm;
