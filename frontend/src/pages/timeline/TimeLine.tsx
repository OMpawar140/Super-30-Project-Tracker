import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Clock, User, Target } from 'lucide-react';
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

// Sample data
const sampleEvents: TimelineEvent[] = [
  {
    id: '1',
    title: 'Project Alpha',
    type: 'project',
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2024, 3, 30),
    description: 'Main project development phase',
    status: 'In Progress',
    color: 'bg-blue-500 dark:bg-blue-600',
    details: 'This is a comprehensive project involving multiple teams and stakeholders. The project aims to deliver a robust solution for our client needs.',
    assignee: 'John Doe'
  },
  {
    id: '2',
    title: 'Design Phase',
    type: 'task',
    startDate: new Date(2024, 2, 5),
    endDate: new Date(2024, 2, 15),
    description: 'UI/UX design implementation',
    status: 'Completed',
    color: 'bg-green-500 dark:bg-green-600',
    details: 'Complete redesign of the user interface with focus on accessibility and user experience. Includes wireframes, prototypes, and final designs.',
    assignee: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Version 1.0',
    type: 'milestone',
    startDate: new Date(2024, 3, 1),
    endDate: new Date(2024, 3, 1),
    description: 'First major release',
    status: 'Pending',
    color: 'bg-orange-500 dark:bg-orange-600',
    details: 'Major milestone marking the completion of the first version. This includes all core features and basic functionality.',
    assignee: 'Team Lead'
  },
  {
    id: '4',
    title: 'Testing Phase',
    type: 'task',
    startDate: new Date(2024, 3, 15),
    endDate: new Date(2024, 3, 25),
    description: 'Quality assurance and bug fixes',
    status: 'Pending',
    color: 'bg-purple-500 dark:bg-purple-600',
    details: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing. Bug tracking and resolution.',
    assignee: 'QA Team'
  },
];

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

const TimeLinePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [visibleEvents, setVisibleEvents] = useState<string[]>([]);
  // const [isDarkMode] = useState(false);

  // Animation on load
  useEffect(() => {
    setTimelineLoaded(true);
    const timer = setTimeout(() => {
      sampleEvents.forEach((event, index) => {
        setTimeout(() => {
          setVisibleEvents(prev => [...prev, event.id]);
        }, index * 300);
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Apply dark mode class to document
  // useEffect(() => {
  //   if (isDarkMode) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [isDarkMode]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
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
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-700';
      case 'in progress': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'pending': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Timeline</h1>
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              {/* <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 text-gray-600 dark:text-gray-300"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button> */}
              
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
          </div>
          
          {/* Timeline Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="relative">
              {/* Animated Timeline Line */}
              <div className="absolute left-6 top-0 w-0.5 bg-gray-200 dark:bg-gray-600 h-full">
                {timelineLoaded && (
                  <div className="w-full bg-gradient-to-b from-blue-500 to-purple-500 animate-timeline-draw"></div>
                )}
              </div>
              
              {/* Timeline Events */}
              <div className="space-y-8">
                {sampleEvents.map((event) => (
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
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                {event.description}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span className={`
                                px-3 py-1 rounded-full text-xs font-medium border
                                ${getStatusColor(event.status)}
                              `}>
                                {event.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-300 dark:border-gray-600">
                                {event.type}
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
                                <button className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                                  View Details
                                </button>
                                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm transition-colors border border-gray-300 dark:border-gray-600">
                                  Edit
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
          </div>
        </div>
      </div>
    </div>
 
  );
};

export default TimeLinePage;