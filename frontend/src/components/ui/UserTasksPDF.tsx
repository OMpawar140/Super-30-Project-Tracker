import { HiDownload } from 'react-icons/hi';
import { type User } from 'firebase/auth';

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

interface UserTask {
  projectName: string;
  projectStatus: string;
  milestoneName: string;
  milestoneStatus: string;
  assignment: string;
  startDate?: string;
  dueDate?: string;
  priority?: string;
  status: string;
  [key: string]: any;
}


// PDF generation component for user's assigned tasks
const UserTasksPDF = ({ projects, currentUser, onDownload }: {projects: Project[], currentUser: User, onDownload: () => void}) => {
  const generatePDF = () => {
    // Extract all tasks where current user is a TASK_COMPLETER
    const userTasks: UserTask[] = [];
    
    projects.forEach(project => {
      if (project.milestones && project.milestones.length > 0) {
        project.milestones.forEach(milestone => {
          if (milestone.tasks && milestone.tasks.length > 0) {
            milestone.tasks.forEach(task => {
              // Check if current user is assigned as TASK_COMPLETER
              if (task.assigneeId === currentUser?.email) {
                  userTasks.push({
                    ...task,
                    projectName: project.name,
                    projectStatus: project.status,
                    milestoneName: milestone.name,
                    milestoneStatus: milestone.status,
                    assignment: task.title,
                    startDate: task.startDate,
                    endDate: task.endDate,
                    priority: task.priority,
                    status: task.status,
                  });
              }
            });
          }
        });
      }
    });

    if (userTasks.length === 0) {
      alert('No tasks found where you are assigned as a task completer.');
      return;
    }

    // Create a new window for PDF content
    const printWindow = window.open('', '_blank');
    
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        });
      } catch (error) {
        console.error(error);
        return 'Invalid Date';
      }
    };

    const formatDateTime = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (error) {
        console.error(error);
        return 'Invalid Date';
      }
    };

    // Group tasks by status for summary
    const tasksByStatus = userTasks.reduce((acc: Record<string, number>, task) => {
      const status = task.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group tasks by project for better organization
    const tasksByProject = userTasks.reduce((acc: Record<string, UserTask[]>, task) => {
      const projectName = task.projectName;
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(task);
      return acc;
    }, {} as Record<string, UserTask[]>);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Assigned Tasks Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #10b981;
          }
          .header h1 {
            color: #1f2937;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0;
          }
          .summary {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #10b981;
          }
          .summary h2 {
            margin-top: 0;
            color: #1f2937;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .summary-item {
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border: 1px solid #d1fae5;
          }
          .summary-number {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
          }
          .summary-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
          }
          .project-section {
            margin-bottom: 40px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
          }
          .project-header {
            background: #f9fafb;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .project-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
          }
          .task {
            margin: 0;
            padding: 20px;
            border-bottom: 1px solid #f3f4f6;
            background: white;
          }
          .task:last-child {
            border-bottom: none;
          }
          .task-header {
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 10px;
          }
          .task-title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
            flex: 1;
            min-width: 200px;
          }
          .task-description {
            color: #4b5563;
            margin: 10px 0 15px 0;
            font-style: italic;
          }
          .task-meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .meta-label {
            font-weight: bold;
            color: #374151;
            min-width: 90px;
          }
          .meta-value {
            color: #6b7280;
            flex: 1;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .status-in-progress, .status-in_progress {
            background: #dbeafe;
            color: #1d4ed8;
          }
          .status-completed {
            background: #dcfce7;
            color: #166534;
          }
          .status-blocked {
            background: #fecaca;
            color: #dc2626;
          }
          .status-review, .status-under-review, .status-under_review {
            background: #e0e7ff;
            color: #4338ca;
          }
          .priority-high {
            background: #fecaca;
            color: #dc2626;
          }
          .priority-medium {
            background: #fed7aa;
            color: #c2410c;
          }
          .priority-low {
            background: #dcfce7;
            color: #166534;
          }
          .milestone-info {
            background: #f8fafc;
            padding: 10px;
            border-radius: 6px;
            margin-top: 15px;
            border-left: 3px solid #6b7280;
          }
          .milestone-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 5px;
          }
          .milestone-details {
            font-size: 12px;
            color: #6b7280;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .project-section { break-inside: avoid; }
            .task { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Assigned Tasks Report</h1>
          <p><strong>Generated for:</strong> ${currentUser?.email || 'Unknown User'}</p>
          <p><strong>Role:</strong> Task Completer</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })} IST</p>
        </div>

        <div class="summary">
          <h2>Tasks Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-number">${userTasks.length}</div>
              <div class="summary-label">Total Tasks</div>
            </div>
            ${Object.entries(tasksByStatus).map(([status, count]) => `
              <div class="summary-item">
                <div class="summary-number">${count}</div>
                <div class="summary-label">${status.replace('_', ' ')}</div>
              </div>
            `).join('')}
            <div class="summary-item">
              <div class="summary-number">${Object.keys(tasksByProject).length}</div>
              <div class="summary-label">Projects</div>
            </div>
          </div>
        </div>

        ${Object.entries(tasksByProject).map(([projectName, tasks]) => `
          <div class="project-section">
            <div class="project-header">
              <h3 class="project-title">${projectName}</h3>
            </div>
            
            ${tasks.map(task => `
              <div class="task">
                <div class="task-header">
                  <h4 class="task-title">${task.title}</h4>
                  <span class="status-badge status-${(task.status || 'pending').toLowerCase().replace('_', '-')}">${(task.status || 'PENDING').replace('_', ' ')}</span>
                </div>
                
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                
                <div class="task-meta">
                  <div class="meta-item">
                    <span class="meta-label">Start Date:</span>
                    <span class="meta-value">${formatDate(task.startDate)}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">End Date:</span>
                    <span class="meta-value">${formatDate(task.endDate)}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Priority:</span>
                    <span class="meta-value">
                      <span class="status-badge priority-${(task.priority || 'medium').toLowerCase()}">${(task.priority || 'MEDIUM').replace('_', ' ')}</span>
                    </span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Progress:</span>
                    <span class="meta-value">${task.progress || 0}%</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Assigned On:</span>
                    <span class="meta-value">${formatDateTime(task.assignment?.assignedAt)}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Project Status:</span>
                    <span class="meta-value">
                      <span class="status-badge status-${task.projectStatus.toLowerCase().replace('_', '-')}">${task.projectStatus.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <div class="milestone-info">
                  <div class="milestone-title">Milestone: ${task.milestoneName}</div>
                  <div class="milestone-details">
                    Status: ${task.milestoneStatus.replace('_', ' ')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}

        <div class="footer">
          <p>This report contains all tasks where you are assigned as a Task Completer.</p>
          <p>Generated automatically from the Project Management System.</p>
        </div>
      </body>
      </html>
    `;

    if(printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Close the window after printing (optional)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 250);
      };
    } else {
      console.error('Failed to open print window. It may have been blocked by the browser.');
    }

    // Call the onDownload callback if provided
    if (onDownload) {
      onDownload();
    }
  };

  // Count tasks where current user is a TASK_COMPLETER
  // const userTasksCount = projects.reduce((count, project) => {
  //   if (project.milestones && project.milestones.length > 0) {
  //     project.milestones.forEach(milestone => {
  //       if (milestone.tasks && milestone.tasks.length > 0) {
  //         milestone.tasks.forEach(task => {
  //           if (task.assignments && task.assignments.length > 0) {
  //             const userAssignment = task.assignments.find(assignment => 
  //               assignment.user.email === currentUser?.email && 
  //               assignment.role === 'TASK_COMPLETER'
  //             );
  //             if (userAssignment) {
  //               count++;
  //             }
  //           }
  //         });
  //       }
  //     });
  //   }
  //   return count;
  // }, 0);

  const userTasksCount = projects.reduce((count, project) => {
    const isTaskCompleter = project.members?.some(
      member => member.user.email === currentUser?.email && member.role === 'TASK_COMPLETER'
    );

    if (!isTaskCompleter) return count;

    project.milestones?.forEach(milestone => {
      milestone.tasks?.forEach(task => {
        count++; // Since the user is a TASK_COMPLETER in this project, count all tasks
      });
    });

    return count;
  }, 0);

  return (
    <button
      onClick={generatePDF}
      disabled={userTasksCount === 0}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        userTasksCount === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
      }`}
      title={userTasksCount === 0 ? 'No tasks assigned to you as task completer' : `Generate PDF report for ${userTasksCount} assigned task(s)`}
    >
      <HiDownload className="w-4 h-4" />
      Export Tasks ({userTasksCount})
    </button>
  );
};

export default UserTasksPDF;