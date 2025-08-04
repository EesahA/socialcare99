import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

const Calendar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Review Client Intake Forms',
      date: '2024-01-15',
      backgroundColor: '#e74c3c',
      borderColor: '#e74c3c',
      textColor: '#fff',
      extendedProps: {
        taskType: 'overdue',
        priority: 'high'
      }
    },
    {
      id: '2',
      title: 'Complete Risk Assessment',
      date: '2024-01-20',
      backgroundColor: '#f1c40f',
      borderColor: '#f1c40f',
      textColor: '#fff',
      extendedProps: {
        taskType: 'pending',
        priority: 'medium'
      }
    },
    {
      id: '3',
      title: 'Update Care Plan',
      date: '2024-01-25',
      backgroundColor: '#3498db',
      borderColor: '#3498db',
      textColor: '#fff',
      extendedProps: {
        taskType: 'in-progress',
        priority: 'low'
      }
    }
  ]);

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
  };

  const handleEventClick = (arg) => {
    console.log('Event clicked:', arg.event.title);
  };

  const handleEventDrop = (arg) => {
    console.log('Event dropped:', arg.event.title, 'to', arg.event.startStr);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`calendar-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="calendar-header">
        <h3>Upcoming Schedule</h3>
        <button 
          className="expand-button"
          onClick={toggleExpanded}
          title={isExpanded ? 'Collapse Calendar' : 'Expand Calendar'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      <div className="calendar-content">
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
          eventClick={isExpanded ? handleEventClick : undefined}
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
    </div>
  );
};

export default Calendar; 