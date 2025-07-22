import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, User, Target, Loader2, AlertCircle, X, Info } from 'lucide-react';
import { apiService, useApiCall } from '@/services/api';

// Types for our data
interface TimelineEvent {
  id: string;
  title: string;
  type: 'project' | 'task' | 'milestone';
  startDate: Date;
  endDate: Date;
  description: string;
  status: string;
  color: string;
  details?: string;
  assignee?: string;
}

// API Service interface (adjust according to your actual API structure)
interface ApiProject {
  id: string | number;
  name?: string;
  title?: string;
  description?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  status?: string;
  type?: string;
  assignee?: string;
  assigned_to?: string;
  details?: string;
  color?: string;
  // Add other fields as needed based on your database schema
}

// Enhanced Tooltip Component
const Tooltip: React.FC<{
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}> = ({ children, content, position = 'right' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
      default:
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
    }
  };
  
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-t-white dark:border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent';
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-b-white dark:border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent';
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-l-white dark:border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent';
      case 'right':
      default:
        return 'right-full top-1/2 transform -translate-y-1/2 border-r-white dark:border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent';
    }
  };
  
  return (
    <div className="relative">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className={`absolute z-50 ${getPositionClasses()}`}>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 animate-fade-in">
            <div className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}></div>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Calendar Component with Week View
const SimpleCalendar: React.FC<{
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: 'month' | 'week';
}> = ({ selectedDate, onDateChange, viewMode }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [currentWeek, setCurrentWeek] = useState(selectedDate);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(startOfWeek);
      weekDay.setDate(startOfWeek.getDate() + i);
      days.push(weekDay);
    }
    return days;
  };
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };
  
  const navigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
      setCurrentMonth(newMonth);
    } else {
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
      setCurrentWeek(newWeek);
    }
  };
  
  const days = viewMode === 'month' ? getDaysInMonth(currentMonth) : getWeekDays(currentWeek);
  const today = new Date();
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('prev')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
          {viewMode === 'month' 
            ? `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`
            : `Week of ${monthNames[currentWeek.getMonth()]} ${currentWeek.getDate()}, ${currentWeek.getFullYear()}`
          }
        </h3>
        <button
          onClick={() => navigate('next')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
      
      {viewMode === 'month' ? (
        <>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 transition-all duration-300">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => day && onDateChange(day)}
                disabled={!day}
                className={`
                  h-8 w-8 text-sm rounded flex items-center justify-center transition-all duration-200 text-gray-700 dark:text-gray-300
                  ${!day ? 'invisible' : ''}
                  ${day && day.toDateString() === selectedDate.toDateString() 
                    ? 'bg-blue-500 dark:bg-blue-600 text-white scale-110' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105 hover:text-gray-900 dark:hover:text-white'
                  }
                  ${day && day.toDateString() === today.toDateString() 
                    ? 'ring-2 ring-blue-300 dark:ring-blue-400' 
                    : ''
                  }
                `}
              >
                {day?.getDate()}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2 transition-all duration-300">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => day && onDateChange(day)}
              className={`
                w-full p-3 text-left rounded-lg transition-all duration-200
                ${day?.toDateString() === selectedDate.toDateString() 
                  ? 'bg-blue-500 dark:bg-blue-600 text-white transform scale-105'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:transform hover:scale-102 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
                ${day?.toDateString() === today.toDateString() 
                  ? 'ring-2 ring-blue-300 dark:ring-blue-400' 
                  : ''
                }
              `}
            >
              <div className="font-medium">
                {day?.toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-sm opacity-75">
                {day?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Project Details Modal Component
const ProjectDetailsModal: React.FC<{
  event: TimelineEvent;
  isOpen: boolean;
  onClose: () => void;
  formatDate: (date: Date) => string;
  getStatusColor: (status: string) => string;
}> = ({ event, isOpen, onClose, formatDate, getStatusColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {event.type === 'project' && <Target className="w-5 h-5 text-blue-500" />}
            {event.type === 'task' && <Clock className="w-5 h-5 text-indigo-500" />}
            {event.type === 'milestone' && <Calendar className="w-5 h-5 text-purple-500" />}
            {event.title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium border
              ${getStatusColor(event.status)}
            `}>
              {event.status}
            </span>
          </div>
          
          {/* Dates */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Timeline</h4>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <span className="font-medium">Start:</span> {formatDate(event.startDate)}
              </div>
            </div>
            {event.type !== 'milestone' && (
              <div className="flex items-center gap-2 mt-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="font-medium">End:</span> {formatDate(event.endDate)}
                </div>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Description</h4>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {event.description}
            </p>
          </div>
          
          {/* Additional Details */}
          {event.details && event.details !== event.description && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Additional Details</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {event.details}
              </p>
            </div>
          )}
          
          {/* Assignee */}
          {event.assignee && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Assigned To</h4>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">{event.assignee}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors border border-gray-300 dark:border-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const TimeLinePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { callApi } = useApiCall();
  // New state for modal
  const [detailsModal, setDetailsModal] = useState<{isOpen: boolean, event: TimelineEvent | null}>({
    isOpen: false,
    event: null
  });
  
  // Define monthNames at the component level to fix the reference error
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    document.title = "Timeline - Project Tracker";
  }, []);

  // Helper function to determine event type based on project data
  const determineEventType = (project: ApiProject): 'project' | 'task' | 'milestone' => {
    if (project.type) {
      const type = project.type.toLowerCase();
      if (type.includes('milestone')) return 'milestone';
      if (type.includes('task')) return 'task';
    }
    // Default to project if no specific type is found
    return 'project';
  };

  // Helper function to determine color based on status or type
  const determineColor = (project: ApiProject): string => {
    if (project.color) return project.color;
    
    const status = project.status?.toLowerCase() || '';
    const type = determineEventType(project);
    
    if (status.includes('completed') || status.includes('done')) {
      return 'bg-green-500 dark:bg-green-600';
    } else if (status.includes('progress') || status.includes('active')) {
      return 'bg-blue-500 dark:bg-blue-600';
    } else if (status.includes('pending') || status.includes('waiting')) {
      return 'bg-orange-500 dark:bg-orange-600';
    } else if (type === 'milestone') {
      return 'bg-purple-500 dark:bg-purple-600';
    } else if (type === 'task') {
      return 'bg-indigo-500 dark:bg-indigo-600';
    }
    
    return 'bg-gray-500 dark:bg-gray-600';
  };

  // Helper function to parse date string to Date object
  const parseDate = (dateString: string | undefined): Date => {
    if (!dateString) return new Date();
    const parsedDate = new Date(dateString);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  // Transform API data to timeline events
  const transformApiDataToEvents = (apiProjects: ApiProject[]): TimelineEvent[] => {
    return apiProjects.map((project) => ({
      id: String(project.id),
      title: project.name || project.title || 'Untitled Project',
      type: determineEventType(project),
      startDate: parseDate(project.start_date || project.startDate),
      endDate: parseDate(project.end_date || project.endDate || project.start_date || project.startDate),
      description: project.description || 'No description available',
      status: project.status || 'Unknown',
      color: determineColor(project),
      details: project.details || project.description || 'No additional details available',
      assignee: project.assignee || project.assigned_to || undefined,
    }));
  };

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace this with your actual API call
      // Assuming callApi and apiService are available in your environment
      const response = await callApi(() => apiService.projects.getAllProjects());
      
      if (response && Array.isArray(response)) {
        const transformedEvents = transformApiDataToEvents(response);
        // Sort events by start date
        transformedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setEvents(transformedEvents);
      } else if (response && response.data && Array.isArray(response.data)) {
        // Handle case where response is wrapped in a data property
        const transformedEvents = transformApiDataToEvents(response.data);
        transformedEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        setEvents(transformedEvents);
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  // Retry mechanism
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchProjects();
  };

  // Initial data fetch
  useEffect(() => {
    fetchProjects();
  }, []);

  // Animation on load
  useEffect(() => {
    if (!loading && events.length > 0) {
      setTimelineLoaded(true);
      const timer = setTimeout(() => {
        events.forEach((event, index) => {
          setTimeout(() => {
            setVisibleEvents(prev => [...prev, event.id]);
          }, index * 300);
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, events]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Check if a date falls within a given range
  const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
    const dateTime = date.getTime();
    return dateTime >= startDate.getTime() && dateTime <= endDate.getTime();
  };

  // Check if a date overlaps with a given range
  const doesDateRangeOverlap = (
    eventStart: Date, 
    eventEnd: Date, 
    periodStart: Date, 
    periodEnd: Date
  ): boolean => {
    return (
      (eventStart <= periodEnd && eventStart >= periodStart) || // Event starts in period
      (eventEnd >= periodStart && eventEnd <= periodEnd) || // Event ends in period
      (eventStart <= periodStart && eventEnd >= periodEnd) // Event completely encompasses period
    );
  };

  // Get start and end dates for selected month
  const getMonthBoundaries = (date: Date): { start: Date; end: Date } => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start, end };
  };

  // Get start and end dates for selected week
  const getWeekBoundaries = (date: Date): { start: Date; end: Date } => {
    const day = date.getDay(); // 0-6, Sunday-Saturday
    const start = new Date(date);
    start.setDate(date.getDate() - day); // Start of week (Sunday)
    
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // End of week (Saturday)
    
    return { start, end };
  };

  // Filter events based on selected date/period
  const filteredEvents = useMemo(() => {
    if (!events.length) return [];

    if (viewMode === 'month') {
      const { start, end } = getMonthBoundaries(selectedDate);
      return events.filter(event => 
        doesDateRangeOverlap(event.startDate, event.endDate, start, end)
      );
    } else { // week view
      const { start, end } = getWeekBoundaries(selectedDate);
      return events.filter(event => 
        doesDateRangeOverlap(event.startDate, event.endDate, start, end)
      );
    }
  }, [events, selectedDate, viewMode]);

  // Clear expanded card when changing date/view
  useEffect(() => {
    setExpandedCard(null);
    // Reset visible events for animation when filter changes
    setVisibleEvents([]);
    if (filteredEvents.length > 0) {
      const timer = setTimeout(() => {
        filteredEvents.forEach((event, index) => {
          setTimeout(() => {
            setVisibleEvents(prev => [...prev, event.id]);
          }, index * 200); // Faster animation for filter changes
        });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [selectedDate, viewMode]);

  // Function to open the modal with a specific event
  const openDetailsModal = (event: TimelineEvent) => {
    setDetailsModal({
      isOpen: true,
      event
    });
  };

  // Function to close the modal
  const closeDetailsModal = () => {
    setDetailsModal({
      isOpen: false,
      event: null
    });
  };

  const renderEventTooltip = (event: TimelineEvent) => (
    <div>
      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
        {event.type === 'project' && <Target className="w-4 h-4" />}
        {event.type === 'task' && <Clock className="w-4 h-4" />}
        {event.type === 'milestone' && <Calendar className="w-4 h-4" />}
        {event.title}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 dark:text-gray-300">Type:</span>
          <span className="capitalize text-gray-500 dark:text-gray-400">{event.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 dark:text-gray-300">Date:</span>
          <span className="text-gray-500 dark:text-gray-400">
            {formatDate(event.startDate)}
            {event.type !== 'milestone' && ` - ${formatDate(event.endDate)}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-600 dark:text-gray-300">Status:</span>
          <span className="text-gray-500 dark:text-gray-400">{event.status}</span>
        </div>
        {event.assignee && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-500 dark:text-gray-400">{event.assignee}</span>
          </div>
        )}
        <p className="text-gray-600 dark:text-gray-400 mt-2">{event.description}</p>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'done':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'in progress':
      case 'active':
      case 'ongoing':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'pending':
      case 'waiting':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
      case 'cancelled':
      case 'canceled':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Timeline</h2>
          <p className="text-gray-600 dark:text-gray-400">Fetching your projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Failed to Load Timeline</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry {retryCount > 0 && `(${retryCount})`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        @keyframes timeline-draw {
          from { height: 0; }
          to { height: 100%; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .animate-timeline-draw {
          animation: timeline-draw 2s ease-out;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Timeline</h1>
              {filteredEvents.length > 0 && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredEvents.length} {filteredEvents.length === 1 ? 'Project' : 'Projects'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={fetchProjects}
                disabled={loading}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 text-gray-600 dark:text-gray-300 disabled:opacity-50"
                title="Refresh data"
              >
                <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    viewMode === 'month'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    viewMode === 'week'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm transform scale-105'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Week
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-h-96 flex overflow-hidden transition-colors duration-300">
          {/* Calendar Section */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-6">
            <SimpleCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
            />
            {events.length > 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {viewMode === 'month' ? (
                    <>Showing projects for {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}</>
                  ) : (
                    <>Showing projects for week of {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                  )}
                </p>
              </div>
            )}
          </div>
          
          {/* Timeline Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            {events.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">There are no projects to display in your timeline.</p>
                  <button
                    onClick={fetchProjects}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Projects for This Period</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no projects scheduled for {viewMode === 'month' ? 
                      `${monthNames[selectedDate.getMonth()]} ${selectedDate.getFullYear()}` : 
                      `the week of ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    }.
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Try selecting a different {viewMode === 'month' ? 'month' : 'week'}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Animated Timeline Line */}
                <div className="absolute left-6 top-0 w-0.5 bg-gray-200 dark:bg-gray-600 h-full">
                  {timelineLoaded && (
                    <div className="w-full bg-gradient-to-b from-blue-500 to-purple-500 animate-timeline-draw"></div>
                  )}
                </div>
                
                {/* Timeline Events */}
                <div className="space-y-8">
                  {filteredEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className={`relative flex items-start transition-all duration-500 ${
                        visibleEvents.includes(event.id) 
                          ? 'opacity-100 transform translate-y-0' 
                          : 'opacity-0 transform translate-y-4'
                      }`}
                    >
                      {/* Timeline Dot with Tooltip */}
                      <Tooltip content={renderEventTooltip(event)} position="right">
                        <div className={`
                          relative z-10 w-12 h-12 rounded-full ${event.color} 
                          flex items-center justify-center cursor-pointer
                          hover:scale-125 transition-all duration-300 shadow-lg
                          hover:shadow-xl
                        `}>
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                          <div className="absolute inset-0 rounded-full bg-white opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                        </div>
                      </Tooltip>
                      
                      {/* Event Content */}
                      <div className="ml-6 flex-1">
                        <div className="bg-gray-750 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-600">
                          <div 
                            className="p-4 cursor-pointer"
                            onClick={() => setExpandedCard(expandedCard === event.id ? null : event.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                  {event.title}
                                  {expandedCard === event.id ? 
                                    <ChevronUp className="w-4 h-4" /> : 
                                    <ChevronDown className="w-4 h-4" />
                                  }
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {formatDate(event.startDate)}
                                  {event.type !== 'milestone' && ` - ${formatDate(event.endDate)}`}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2 ml-4">
                                <span className={`
                                  px-3 py-1 rounded-full text-xs font-medium border
                                  ${getStatusColor(event.status)}
                                `}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Content */}
                          {expandedCard === event.id && (
                            <div className="border-t border-gray-200 dark:border-gray-600 p-4 animate-slide-down">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">Details</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{event.details}</p>
                                </div>
                                {event.assignee && (
                                  <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">Assigned to</h4>
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">{event.assignee}</span>
                                    </div>
                                  </div>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <button 
                                    onClick={() => openDetailsModal(event)} 
                                    className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-1"
                                  >
                                    <Info className="w-4 h-4" />
                                    View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal.event && (
        <ProjectDetailsModal 
          event={detailsModal.event}
          isOpen={detailsModal.isOpen}
          onClose={closeDetailsModal}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
};

export default TimeLinePage;