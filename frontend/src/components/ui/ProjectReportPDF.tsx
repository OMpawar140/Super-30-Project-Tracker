import React from 'react';
import { HiDownload } from 'react-icons/hi';
import { useAuth } from '@/context/AuthContext';

// Types (matching your existing structure)
interface User {
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
  user: User;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
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
  progress?: number;
  teamMembers?: string[];
  priority?: string;
  budget?: number;
  tags?: string[];
  totalTasks?: number;
  completedTasks?: number;
}

interface ProjectReportPDFProps {
  project: Project;
  onDownload?: () => void;
}

const ProjectReportPDF: React.FC<ProjectReportPDFProps> = ({ project, onDownload }) => {
  const { currentUser } = useAuth();

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', dateString, error);
      return 'Invalid Date';
    }
  };

  const formatShortDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error('Invalid date format:', dateString, error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'done':
        return '#10B981'; // green
      case 'active':
      case 'in_progress':
      case 'in progress':
      case 'ongoing':
        return '#3B82F6'; // blue
      case 'planning':
      case 'upcoming':
      case 'not_started':
      case 'todo':
        return '#F59E0B'; // orange
      case 'on_hold':
      case 'blocked':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return '#DC2626';
      case 'high':
        return '#EA580C';
      case 'medium':
        return '#CA8A04';
      case 'low':
        return '#16A34A';
      default:
        return '#6B7280';
    }
  };

  const calculateMilestoneProgress = (milestone: Milestone) => {
    if (!milestone.tasks || milestone.tasks.length === 0) return 0;
    const completedTasks = milestone.tasks.filter(task => 
      task.status.toLowerCase() === 'completed'
    ).length;
    return Math.round((completedTasks / milestone.tasks.length) * 100);
  };

  const generatePDF = async () => {
    try {
      // Create a new window with the report content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow popups to download the PDF report');
        return;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Project Report - ${project.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
              padding: 40px;
              max-width: 210mm;
              margin: 0 auto;
            }
            
            .header {
              text-align: center;
              border-bottom: 3px solid #3B82F6;
              padding-bottom: 30px;
              margin-bottom: 40px;
            }
            
            .header h1 {
              font-size: 2.5em;
              color: #1E40AF;
              margin-bottom: 10px;
              font-weight: bold;
            }
            
            .header .subtitle {
              font-size: 1.2em;
              color: #6B7280;
              font-style: italic;
            }
            
            .generated-info {
              text-align: center;
              margin-bottom: 30px;
              padding: 15px;
              background: #F3F4F6;
              border-radius: 8px;
              font-size: 0.9em;
              color: #4B5563;
            }
            
            .section {
              margin-bottom: 40px;
              break-inside: avoid;
            }
            
            .section-title {
              font-size: 1.8em;
              color: #1F2937;
              border-bottom: 2px solid #E5E7EB;
              padding-bottom: 10px;
              margin-bottom: 20px;
              font-weight: bold;
            }
            
            .project-overview {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .overview-card {
              background: #F9FAFB;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3B82F6;
            }
            
            .overview-card h3 {
              color: #374151;
              margin-bottom: 15px;
              font-size: 1.1em;
            }
            
            .overview-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            
            .overview-item strong {
              color: #1F2937;
            }
            
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.85em;
              font-weight: bold;
              color: white;
              text-transform: capitalize;
            }
            
            .priority-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 0.8em;
              font-weight: bold;
              color: white;
              text-transform: capitalize;
            }
            
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #E5E7EB;
              border-radius: 4px;
              overflow: hidden;
              margin: 5px 0;
            }
            
            .progress-fill {
              height: 100%;
              background: #3B82F6;
              transition: width 0.3s ease;
            }
            
            .description-box {
              background: #F3F4F6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #6B7280;
            }
            
            .milestone-card {
              background: white;
              border: 1px solid #D1D5DB;
              border-radius: 8px;
              margin-bottom: 25px;
              overflow: hidden;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .milestone-header {
              background: #F9FAFB;
              padding: 20px;
              border-bottom: 1px solid #E5E7EB;
            }
            
            .milestone-title {
              font-size: 1.3em;
              color: #1F2937;
              margin-bottom: 10px;
              font-weight: bold;
            }
            
            .milestone-meta {
              display: flex;
              justify-content: space-between;
              align-items: center;
              flex-wrap: wrap;
              gap: 10px;
            }
            
            .milestone-dates {
              color: #6B7280;
              font-size: 0.9em;
            }
            
            .tasks-section {
              padding: 20px;
            }
            
            .task-item {
              background: #FAFAFA;
              border: 1px solid #E5E7EB;
              border-radius: 6px;
              padding: 15px;
              margin-bottom: 15px;
            }
            
            .task-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
            }
            
            .task-title {
              font-weight: bold;
              color: #1F2937;
              margin-bottom: 5px;
            }
            
            .task-meta {
              display: flex;
              gap: 15px;
              font-size: 0.85em;
              color: #6B7280;
              flex-wrap: wrap;
            }
            
            .team-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
            }
            
            .team-member {
              background: #F9FAFB;
              border: 1px solid #E5E7EB;
              border-radius: 8px;
              padding: 15px;
            }
            
            .member-email {
              font-weight: bold;
              color: #1F2937;
              margin-bottom: 5px;
            }
            
            .member-role {
              color: #3B82F6;
              font-size: 0.9em;
              margin-bottom: 5px;
            }
            
            .member-skillset {
              color: #6B7280;
              font-size: 0.85em;
              font-style: italic;
            }
            
            .tags-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 10px;
            }
            
            .tag {
              background: #E5E7EB;
              color: #374151;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 0.8em;
            }
            
            .summary-stats {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin: 30px 0;
            }
            
            .stat-card {
              background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            
            .stat-number {
              font-size: 2em;
              font-weight: bold;
              margin-bottom: 5px;
            }
            
            .stat-label {
              font-size: 0.9em;
              opacity: 0.9;
            }
            
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #E5E7EB;
              text-align: center;
              color: #6B7280;
              font-size: 0.9em;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              .section {
                break-inside: avoid;
              }
              .milestone-card {
                break-inside: avoid;
              }
            }
            
            @page {
              margin: 20mm;
              size: A4;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${project.name}</h1>
            <div class="subtitle">Comprehensive Project Report</div>
          </div>
          
          <div class="generated-info">
            <strong>Report Generated:</strong> ${new Date().toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            <br>
            <strong>Generated By:</strong> ${currentUser?.email}
          </div>

          <div class="section">
            <h2 class="section-title">Project Overview</h2>
            
            <div class="project-overview">
              <div class="overview-card">
                <h3>Project Details</h3>
                <div class="overview-item">
                  <span>Status:</span>
                  <span class="status-badge" style="background-color: ${getStatusColor(project.status)}">
                    ${project.status.replace('_', ' ')}
                  </span>
                </div>
                <div class="overview-item">
                  <span>Progress:</span>
                  <span><strong>${project.progress || 0}%</strong></span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${project.progress || 0}%"></div>
                </div>
                <div class="overview-item">
                  <span>Start Date:</span>
                  <span>${formatShortDate(project.startDate)}</span>
                </div>
                <div class="overview-item">
                  <span>End Date:</span>
                  <span>${formatShortDate(project.endDate)}</span>
                </div>
                ${project.budget ? `
                <div class="overview-item">
                  <span>Budget:</span>
                  <span><strong>$${project.budget.toLocaleString()}</strong></span>
                </div>
                ` : ''}
              </div>
              
              <div class="overview-card">
                <h3>Project Statistics</h3>
                <div class="overview-item">
                  <span>Total Milestones:</span>
                  <span><strong>${project._count.milestones}</strong></span>
                </div>
                <div class="overview-item">
                  <span>Team Members:</span>
                  <span><strong>${project._count.members}</strong></span>
                </div>
                <div class="overview-item">
                  <span>Total Tasks:</span>
                  <span><strong>${project.totalTasks || 0}</strong></span>
                </div>
                <div class="overview-item">
                  <span>Completed Tasks:</span>
                  <span><strong>${project.completedTasks || 0}</strong></span>
                </div>
                <div class="overview-item">
                  <span>Task Completion Rate:</span>
                  <span><strong>${project.totalTasks ? Math.round(((project.completedTasks || 0) / project.totalTasks) * 100) : 0}%</strong></span>
                </div>
              </div>
            </div>

            <div class="description-box">
              <h3 style="margin-bottom: 10px; color: #374151;">Project Description</h3>
              <p>${project.description}</p>
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Project Creator</h2>
            <div class="team-member">
              <div class="member-email">${project.creator.email}</div>
              <div class="member-role">Project Creator</div>
              ${project.creator.skillset ? `<div class="member-skillset">Skills: ${project.creator.skillset}</div>` : ''}
            </div>
          </div>

          <div class="section">
            <h2 class="section-title">Team Members</h2>
            ${project.members.length === 0 ? '<p style="color: #6B7280; font-style: italic;">No team members assigned yet.</p>' : `
            <div class="team-grid">
              ${project.members.map(member => `
                <div class="team-member">
                  <div class="member-email">${member.user.email}</div>
                  <div class="member-role">${member.role.replace('_', ' ')}</div>
                  ${member.user.skillset ? `<div class="member-skillset">Skills: ${member.user.skillset}</div>` : ''}
                  <div style="font-size: 0.8em; color: #9CA3AF; margin-top: 8px;">
                    Joined: ${formatShortDate(member.joinedAt)}
                  </div>
                </div>
              `).join('')}
            </div>
            `}
          </div>

          <div class="section">
            <h2 class="section-title">Milestones & Tasks</h2>
            ${project.milestones.length === 0 ? '<p style="color: #6B7280; font-style: italic;">No milestones defined yet.</p>' : `
            ${project.milestones.map(milestone => `
              <div class="milestone-card">
                <div class="milestone-header">
                  <h3 class="milestone-title">${milestone.name}</h3>
                  <div class="milestone-meta">
                    <div class="milestone-dates">
                      <strong>Duration:</strong> ${formatShortDate(milestone.startDate)} → ${formatShortDate(milestone.endDate)}
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span class="status-badge" style="background-color: ${getStatusColor(milestone.status)}">
                        ${milestone.status.replace('_', ' ')}
                      </span>
                      <span style="font-size: 0.9em; color: #6B7280;">
                        ${calculateMilestoneProgress(milestone)}% Complete
                      </span>
                    </div>
                  </div>
                  ${milestone.description ? `
                  <div style="margin-top: 15px; padding: 10px; background: #F3F4F6; border-radius: 4px; color: #4B5563;">
                    ${milestone.description}
                  </div>
                  ` : ''}
                  <div class="progress-bar" style="margin-top: 10px;">
                    <div class="progress-fill" style="width: ${calculateMilestoneProgress(milestone)}%"></div>
                  </div>
                </div>
                
                <div class="tasks-section">
                  <h4 style="margin-bottom: 15px; color: #374151;">Tasks (${milestone.tasks ? milestone.tasks.length : 0})</h4>
                  ${!milestone.tasks || milestone.tasks.length === 0 ? 
                    '<p style="color: #9CA3AF; font-style: italic;">No tasks defined for this milestone.</p>' : `
                    ${milestone.tasks.map(task => `
                      <div class="task-item">
                        <div class="task-header">
                          <div>
                            <div class="task-title">${task.title}</div>
                            ${task.description ? `<div style="color: #6B7280; font-size: 0.9em; margin-top: 5px;">${task.description}</div>` : ''}
                          </div>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="status-badge" style="background-color: ${getStatusColor(task.status)}">
                              ${task.status.replace('_', ' ')}
                            </span>
                            ${task.priority ? `
                            <span class="priority-badge" style="background-color: ${getPriorityColor(task.priority)}">
                              ${task.priority}
                            </span>
                            ` : ''}
                          </div>
                        </div>
                        <div class="task-meta">
                          ${task.startDate && task.dueDate ? 
                            `<span><strong>Duration:</strong> ${formatShortDate(task.startDate)} → ${formatShortDate(task.dueDate)}</span>` : ''}
                          ${task.assigneeId ? `<span><strong>Assigned to:</strong> ${task.assigneeId}</span>` : ''}
                          <span><strong>Created:</strong> ${formatShortDate(task.createdAt)}</span>
                          ${task.updatedAt !== task.createdAt ? `<span><strong>Updated:</strong> ${formatShortDate(task.updatedAt)}</span>` : ''}
                        </div>
                      </div>
                    `).join('')}
                  `}
                </div>
              </div>
            `).join('')}
            `}
          </div>

          <div class="section">
            <h2 class="section-title">Project Summary</h2>
            <div class="summary-stats">
              <div class="stat-card">
                <div class="stat-number">${project._count.milestones}</div>
                <div class="stat-label">Total Milestones</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${project.totalTasks || 0}</div>
                <div class="stat-label">Total Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${project.completedTasks || 0}</div>
                <div class="stat-label">Completed Tasks</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${project._count.members + 1}</div>
                <div class="stat-label">Team Size</div>
              </div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Project Tracker System</strong></p>
            <p>This report was generated on ${formatDate(new Date().toISOString())} by ${currentUser?.email}.</p>
            <p>Project ID: ${project.id}</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 1000);

      if (onDownload) {
        onDownload();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
      title="Download comprehensive project report as PDF"
    >
      <HiDownload className="w-4 h-4" />
      Download Report
    </button>
  );
};

export default ProjectReportPDF;