import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import TaskDetail from './TaskDetail';
import MeetingScheduler from './MeetingScheduler';
import './Calendar.css';

const Calendar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch both tasks and meetings
      const [tasksResponse, meetingsResponse] = await Promise.all([
        axios.get('http://localhost:3000/api/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:3000/api/meetings', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const taskEvents = tasksResponse.data.map(task => {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const isOverdue = dueDate < now && task.status !== 'Completed';

        let backgroundColor = '#3498db'; // Default blue
        let borderColor = '#3498db';

        // Color coding based on priority and status
        if (isOverdue) {
          backgroundColor = '#e74c3c'; // Red for overdue
          borderColor = '#e74c3c';
        } else if (task.priority === 'High') {
          backgroundColor = '#e67e22'; // Orange for high priority
          borderColor = '#e67e22';
        } else if (task.priority === 'Medium') {
          backgroundColor = '#f1c40f'; // Yellow for medium priority
          borderColor = '#f1c40f';
        } else if (task.priority === 'Low') {
          backgroundColor = '#27ae60'; // Green for low priority
          borderColor = '#27ae60';
        }

        // Override with status-based colors
        if (task.status === 'Completed') {
          backgroundColor = '#95a5a6'; // Gray for completed
          borderColor = '#95a5a6';
        }

        return {
          id: `task-${task._id}`,
          title: `📋 ${task.title}`,
          date: task.dueDate,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          textColor: '#fff',
          extendedProps: {
            type: 'task',
            fullTask: task,
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo,
            isOverdue: isOverdue
          }
        };
      });

      const meetingEvents = meetingsResponse.data.map(meeting => {
        const scheduledAt = new Date(meeting.scheduledAt);
        const now = new Date();
        const isPast = scheduledAt < now && meeting.status === 'Scheduled';

        let backgroundColor = '#9b59b6'; // Purple for meetings
        let borderColor = '#9b59b6';

        // Color coding based on status
        if (meeting.status === 'Completed') {
          backgroundColor = '#95a5a6'; // Gray for completed
          borderColor = '#95a5a6';
        } else if (meeting.status === 'Cancelled') {
          backgroundColor = '#e74c3c'; // Red for cancelled
          borderColor = '#e74c3c';
        } else if (isPast) {
          backgroundColor = '#e67e22'; // Orange for past meetings
          borderColor = '#e67e22';
        }

        // Format duration for display
        const formatDuration = (minutes) => {
          if (minutes === 480) return 'Full Day';
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          if (hours > 0 && mins > 0) {
            return `${hours}h ${mins}m`;
          } else if (hours > 0) {
            return `${hours}h`;
          } else {
            return `${mins}m`;
          }
        };

        return {
          id: `meeting-${meeting._id}`,
          title: `📅 ${meeting.title} (${meeting.meetingType})`,
          date: meeting.scheduledAt,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          textColor: '#fff',
          extendedProps: {
            type: 'meeting',
            fullMeeting: meeting,
            meetingType: meeting.meetingType,
            duration: formatDuration(meeting.duration),
            caseName: meeting.caseName,
            status: meeting.status,
            isPast: isPast
          }
        };
      });

      // Combine and sort all events
      const allEvents = [...taskEvents, ...meetingEvents].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
  };

  const handleEventClick = (arg) => {
    const eventType = arg.event.extendedProps.type;
    
    if (eventType === 'task') {
      const task = arg.event.extendedProps.fullTask;
      setSelectedTask(task);
      setShowTaskDetail(true);
    } else if (eventType === 'meeting') {
      const meeting = arg.event.extendedProps.fullMeeting;
      setSelectedMeeting(meeting);
      setShowMeetingScheduler(true);
    }
  };

  const handleEventDrop = (arg) => {
    console.log('Event dropped:', arg.event.title, 'to', arg.event.startStr);
  };

  const handleTaskDetailClose = () => {
    setSelectedTask(null);
    setShowTaskDetail(false);
  };

  const handleTaskUpdated = () => {
    fetchEvents(); // Refresh the calendar
    setShowTaskDetail(false);
  };

  const handleMeetingSchedulerClose = () => {
    setSelectedMeeting(null);
    setShowMeetingScheduler(false);
  };

  const handleMeetingScheduled = () => {
    fetchEvents(); // Refresh the calendar
    setShowMeetingScheduler(false);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`calendar-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="calendar-header">
        <h3>Upcoming Schedule</h3>
        <div className="calendar-actions">
          <button 
            className="refresh-button"
            onClick={fetchEvents}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            className="expand-button"
            onClick={toggleExpanded}
            title={isExpanded ? 'Collapse Calendar' : 'Expand Calendar'}
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>
      
      <div className="calendar-content">
        {loading && <div className="calendar-loading">Loading events...</div>}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={isExpanded ? {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          } : false}
          initialView={isExpanded ? "dayGridMonth" : "dayGridMonth"}
          editable={isExpanded}
          selectable={isExpanded}
          selectMirror={isExpanded}
          dayMaxEvents={isExpanded ? true : 3}
          weekends={true}
          events={events}
          dateClick={isExpanded ? handleDateClick : undefined}
          eventClick={handleEventClick}
          eventDrop={isExpanded ? handleEventDrop : undefined}
          height={isExpanded ? "500px" : "300px"}
          eventDisplay={isExpanded ? "block" : "list-item"}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          titleFormat={{ month: 'short', year: 'numeric' }}
        />
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={showTaskDetail}
          onClose={handleTaskDetailClose}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      {selectedMeeting && (
        <MeetingScheduler
          isOpen={showMeetingScheduler}
          onClose={handleMeetingSchedulerClose}
          onMeetingScheduled={handleMeetingScheduled}
          editingMeeting={selectedMeeting}
        />
      )}
    </div>
  );
};

export default Calendar; 