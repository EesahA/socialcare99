import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import TaskDetail from './TaskDetail';
import './Calendar.css';

const Calendar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const taskEvents = response.data.map(task => {
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
          id: task._id,
          title: task.title,
          date: task.dueDate,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          textColor: '#fff',
          extendedProps: {
            fullTask: task, // Store the complete task object
            priority: task.priority,
            status: task.status,
            assignedTo: task.assignedTo,
            isOverdue: isOverdue
          }
        };
      });

      setEvents(taskEvents);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
  };

  const handleEventClick = (arg) => {
    const task = arg.event.extendedProps.fullTask;
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleEventDrop = (arg) => {
    console.log('Event dropped:', arg.event.title, 'to', arg.event.startStr);
  };

  const handleTaskDetailClose = () => {
    setSelectedTask(null);
    setShowTaskDetail(false);
  };

  const handleTaskUpdated = () => {
    fetchTasks(); // Refresh the calendar
    setShowTaskDetail(false);
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
            onClick={fetchTasks}
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
        {loading && <div className="calendar-loading">Loading tasks...</div>}
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
    </div>
  );
};

export default Calendar; 