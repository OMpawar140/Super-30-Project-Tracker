// types/project.ts - Create this file to export shared interfaces

export interface ProjectFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  teamSize: number;
}

export interface Member {
  userId: string;
  email: string;
  role: 'ADMIN' | 'TASK_COMPLETER';
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assigneeEmail: string;
}

export interface Milestone {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
}

export interface ProjectFormProps {
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
  initialData?: ProjectFormData;
  isLoading?: boolean;
}

export interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMilestones: (milestones: Milestone[]) => void;
  projectMembers: Member[];
  projectDateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface TaskFormProps {
  tasks: Task[];
  projectMembers: Member[];
  milestoneStartDate: string;
  milestoneEndDate: string;
  onAddTask: (task: Task) => void;
  onRemoveTask: (index: number) => void;
  onUpdateTask: (index: number, task: Task) => void;
}