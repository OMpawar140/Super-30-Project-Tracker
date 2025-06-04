import React, { useState, useEffect } from 'react';
import { HiClipboardList, HiClock, HiFlag, HiUser, HiCalendar, HiChevronDown, HiChevronUp, HiSearch, HiFilter } from 'react-icons/hi';
import DashboardLayout from '../../layouts/DashboardLayout';
// Types for our data
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  dueDate: Date;
  completedDate?: Date;
  progress: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Delayed';
  dependencies: string[];
  completionPercentage: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: Date;
  endDate: Date;
  progress: number;
  tasks: Task[];
  milestones: Milestone[];
  teamMembers: string[];
  budget?: number;
  tags: string[];
}

// Sample data
const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'E-commerce Platform Redesign',
    description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX and enhanced functionality.',
    status: 'Active',
    priority: 'High',
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2024, 5, 30),
    progress: 65,
    teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'],
    budget: 50000,
    tags: ['Web Development', 'UI/UX', 'E-commerce'],
    tasks: [
      {
        id: 't1',
        title: 'User Research & Analysis',
        description: 'Conduct comprehensive user research to understand current pain points',
        status: 'Completed',
        priority: 'High',
        assignee: 'Jane Smith',
        dueDate: new Date(2024, 2, 15),
        completedDate: new Date(2024, 2, 14),
        progress: 100
      },
      {
        id: 't2',
        title: 'Wireframe Creation',
        description: 'Create detailed wireframes for all major pages',
        status: 'Completed',
        priority: 'High',
        assignee: 'Jane Smith',
        dueDate: new Date(2024, 2, 28),
        completedDate: new Date(2024, 2, 26),
        progress: 100
      },
      {
        id: 't3',
        title: 'Frontend Development',
        description: 'Implement the new design using React and modern CSS',
        status: 'In Progress',
        priority: 'High',
        assignee: 'John Doe',
        dueDate: new Date(2024, 4, 15),
        progress: 70
      },
      {
        id: 't4',
        title: 'Backend Integration',
        description: 'Integrate frontend with existing backend APIs',
        status: 'Not Started',
        priority: 'Medium',
        assignee: 'Mike Johnson',
        dueDate: new Date(2024, 4, 30),
        progress: 0
      }
    ],
    milestones: [
      {
        id: 'm1',
        title: 'Design Phase Complete',
        description: 'All designs and wireframes approved by stakeholders',
        targetDate: new Date(2024, 3, 1),
        status: 'Completed',
        dependencies: ['t1', 't2'],
        completionPercentage: 100
      },
      {
        id: 'm2',
        title: 'MVP Launch',
        description: 'Minimum viable product ready for beta testing',
        targetDate: new Date(2024, 4, 15),
        status: 'In Progress',
        dependencies: ['t3'],
        completionPercentage: 70
      },
      {
        id: 'm3',
        title: 'Full Launch',
        description: 'Complete platform launch with all features',
        targetDate: new Date(2024, 5, 30),
        status: 'Upcoming',
        dependencies: ['t3', 't4'],
        completionPercentage: 0
      }
    ]
  },
  {
    id: '2',
    title: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2024, 7, 31),
    progress: 25,
    teamMembers: ['Sarah Wilson', 'Tom Brown', 'Lisa Davis'],
    budget: 75000,
    tags: ['Mobile Development', 'iOS', 'Android'],
    tasks: [
      {
        id: 't5',
        title: 'Market Research',
        description: 'Analyze competitor apps and market requirements',
        status: 'In Progress',
        priority: 'High',
        assignee: 'Sarah Wilson',
        dueDate: new Date(2024, 3, 20),
        progress: 60
      },
      {
        id: 't6',
        title: 'Technical Architecture',
        description: 'Define technical stack and architecture',
        status: 'Not Started',
        priority: 'High',
        assignee: 'Tom Brown',
        dueDate: new Date(2024, 4, 5),
        progress: 0
      }
    ],
    milestones: [
      {
        id: 'm4',
        title: 'Project Kickoff',
        description: 'All planning and research completed',
        targetDate: new Date(2024, 3, 25),
        status: 'In Progress',
        dependencies: ['t5'],
        completionPercentage: 60
      }
    ]
  }
];

const ProjectsPage: React.FC = () => {
  const [projects] = useState<Project[]>(sampleProjects);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [expandedMilestones, setExpandedMilestones] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [isDarkMode] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);

  // Animation on load
  useEffect(() => {
    const timer = setTimeout(() => {
      projects.forEach((project, index) => {
        setTimeout(() => {
          setAnimatedItems(prev => [...prev, project.id]);
        }, index * 200);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [projects]);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleMilestoneExpansion = (milestoneId: string) => {
    setExpandedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const getStatusColor = (status: string, _type: 'project' | 'task' | 'milestone' = 'project') => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'active':
      case 'in progress':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'planning':
      case 'upcoming':
      case 'not started':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
      case 'on hold':
      case 'delayed':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium':
        return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <HiClipboardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              {/* <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 text-gray-600 dark:text-gray-300"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <HiSun className="w-5 h-5" /> : <HiMoon className="w-5 h-5" />}
              </button> */}
              
              {/* <button className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-300">
                <HiPlus className="w-4 h-4" />
                New Project
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="All">All Status</option>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
              <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
            
            {/* Priority Filter */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-8 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-300"
              >
                <option value="All">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <HiFilter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-500 hover:shadow-md ${
                animatedItems.includes(project.id) 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-4'
              }`}
            >
              {/* Project Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-300"
                onClick={() => toggleProjectExpansion(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h2>
                      {expandedProjects.includes(project.id) ? 
                        <HiChevronUp className="w-5 h-5 text-gray-400 dark:text-gray-500" /> : 
                        <HiChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      }
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">{project.description}</p>
                    
                    {/* Project Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDate(project.startDate)} - {formatDate(project.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HiUser className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {project.teamMembers.length} members
                        </span>
                      </div>
                      {project.budget && (
                        <div className="text-gray-600 dark:text-gray-400">
                          Budget: ${project.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 ml-6">
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-32">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedProjects.includes(project.id) && (
                <div className="border-t border-gray-200 dark:border-gray-700 animate-slide-down">
                  <div className="p-6 space-y-6">
                    {/* Tags */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tasks Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <HiClock className="w-5 h-5" />
                        Tasks ({project.tasks.length})
                      </h3>
                      <div className="space-y-3">
                        {project.tasks.map((task) => (
                          <div key={task.id} className="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                              onClick={() => toggleTaskExpansion(task.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
                                    {expandedTasks.includes(task.id) ? 
                                      <HiChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : 
                                      <HiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <span>Due: {formatDate(task.dueDate)}</span>
                                    <span>Assignee: {task.assignee}</span>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(task.status, 'task')}`}>
                                    {task.status}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                  </span>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {task.progress}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {expandedTasks.includes(task.id) && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-4 animate-slide-down">
                                <div className="space-y-3">
                                  <div className="w-full">
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                      <span>Progress</span>
                                      <span>{task.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 dark:bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${task.progress}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  {task.completedDate && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      Completed: {formatDate(task.completedDate)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestones Section */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <HiFlag className="w-5 h-5" />
                        Milestones ({project.milestones.length})
                      </h3>
                      <div className="space-y-3">
                        {project.milestones.map((milestone) => (
                          <div key={milestone.id} className="bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div 
                              className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
                              onClick={() => toggleMilestoneExpansion(milestone.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h4>
                                    {expandedMilestones.includes(milestone.id) ? 
                                      <HiChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : 
                                      <HiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                    }
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{milestone.description}</p>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Target: {formatDate(milestone.targetDate)}
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 ml-4">
                                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(milestone.status, 'milestone')}`}>
                                    {milestone.status}
                                  </span>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {milestone.completionPercentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {expandedMilestones.includes(milestone.id) && (
                              <div className="border-t border-gray-200 dark:border-gray-600 p-4 animate-slide-down">
                                <div className="space-y-3">
                                  <div className="w-full">
                                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                      <span>Completion</span>
                                      <span>{milestone.completionPercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="bg-purple-500 dark:bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${milestone.completionPercentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  {milestone.dependencies.length > 0 && (
                                    <div>
                                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dependencies:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {milestone.dependencies.map((dep, index) => (
                                          <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                                            {dep}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Members */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Team Members</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.teamMembers.map((member, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            <HiUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{member}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <HiClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;