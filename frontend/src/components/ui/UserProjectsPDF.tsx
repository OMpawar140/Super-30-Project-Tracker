import { HiDownload } from 'react-icons/hi';

// Simple PDF generation using HTML5 Canvas and basic drawing
const UserProjectsPDF = ({ projects, currentUser, onDownload }) => {
  const generatePDF = () => {
    // Filter projects created by current user
    const userProjects = projects.filter(project => 
      project.creator.email === currentUser?.email
    );

    if (userProjects.length === 0) {
      alert('No projects found that were created by you.');
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>All Projects Report</title>
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
            border-bottom: 2px solid #3b82f6;
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
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #3b82f6;
          }
          .summary h2 {
            margin-top: 0;
            color: #1f2937;
          }
          .project {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .project-header {
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          .project-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .project-description {
            color: #4b5563;
            margin-bottom: 15px;
            font-style: italic;
          }
          .project-meta {
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
            min-width: 80px;
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
          }
          .status-active {
            background: #dbeafe;
            color: #1d4ed8;
          }
          .status-completed {
            background: #dcfce7;
            color: #166534;
          }
          .status-planning {
            background: #fed7aa;
            color: #c2410c;
          }
          .status-on-hold {
            background: #fecaca;
            color: #dc2626;
          }
          .milestones-section {
            margin-top: 20px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
          }
          .milestones-title {
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
          }
          .milestone {
            background: #f9fafb;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 6px;
            border-left: 3px solid #6b7280;
          }
          .milestone-name {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .milestone-info {
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
            .project { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>All Projects Report</h1>
          <p><strong>Generated for:</strong> ${currentUser?.email || 'Unknown User'}</p>
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
          <h2>Summary</h2>
          <div class="project-meta">
            <div class="meta-item">
              <span class="meta-label">Total Projects:</span>
              <span class="meta-value">${userProjects.length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Active Projects:</span>
              <span class="meta-value">${userProjects.filter(p => p.status.toLowerCase() === 'active').length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Completed Projects:</span>
              <span class="meta-value">${userProjects.filter(p => p.status.toLowerCase() === 'completed').length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Total Team Members:</span>
              <span class="meta-value">${userProjects.reduce((sum, p) => sum + (p._count?.members || 0), 0)}</span>
            </div>
          </div>
        </div>

        ${userProjects.map((project, index) => `
          <div class="project">
            <div class="project-header">
              <div class="project-title">${project.name}</div>
              <span class="status-badge status-${project.status.toLowerCase().replace('_', '-')}">${project.status.replace('_', ' ')}</span>
            </div>
            
            ${project.description ? `<div class="project-description">${project.description}</div>` : ''}
            
            <div class="project-meta">
              <div class="meta-item">
                <span class="meta-label">Start Date:</span>
                <span class="meta-value">${formatDate(project.startDate)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">End Date:</span>
                <span class="meta-value">${formatDate(project.endDate)}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Team Members:</span>
                <span class="meta-value">${project._count?.members || 0}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Milestones:</span>
                <span class="meta-value">${project._count?.milestones || 0}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Progress:</span>
                <span class="meta-value">${project.progress || 0}%</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Tasks:</span>
                <span class="meta-value">${project.completedTasks || 0}/${project.totalTasks || 0} completed</span>
              </div>
            </div>

            ${project.milestones && project.milestones.length > 0 ? `
              <div class="milestones-section">
                <div class="milestones-title">Milestones (${project.milestones.length}):</div>
                ${project.milestones.map(milestone => `
                  <div class="milestone">
                    <div class="milestone-name">${milestone.name}</div>
                    <div class="milestone-info">
                      ${formatDate(milestone.startDate)} - ${formatDate(milestone.endDate)} | 
                      Status: ${milestone.status.replace('_', ' ')} | 
                      Tasks: ${milestone.tasks ? milestone.tasks.length : 0}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}

        <div class="footer">
          <p>This report was generated automatically from the Project Management System.</p>
          <p>For more detailed information, please visit the project dashboard.</p>
        </div>
      </body>
      </html>
    `;

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

    // Call the onDownload callback if provided
    if (onDownload) {
      onDownload();
    }
  };

  // Filter projects created by current user for button display
  const userProjectsCount = projects.filter(project => 
    project.creator.email === currentUser?.email
  ).length;

  return (
    <button
      onClick={generatePDF}
      disabled={userProjectsCount === 0}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        userProjectsCount === 0
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
      }`}
      title={userProjectsCount === 0 ? 'No projects created by you' : `Generate PDF report for ${userProjectsCount} project(s)`}
    >
      <HiDownload className="w-4 h-4" />
      Export Projects ({userProjectsCount})
    </button>
  );
};

export default UserProjectsPDF;