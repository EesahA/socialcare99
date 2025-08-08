import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import './KanbanBoard.css';

const KanbanBoard = ({ showCreateButtons = false, onTaskCreated }) => {
  const [kanbanData, setKanbanData] = useState({
    'Backlog': [],
    'In Progress': [],
    'Blocked': [],
    'Complete': []
  });
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [prefillStatus, setPrefillStatus] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const tasks = response.data;
      const grouped = {
        'Backlog': tasks.filter(task => task.status === 'Backlog'),
        'In Progress': tasks.filter(task => task.status === 'In Progress'),
        'Blocked': tasks.filter(task => task.status === 'Blocked'),
        'Complete': tasks.filter(task => task.status === 'Complete')
      };
      
      setKanbanData(grouped);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (onTaskCreated) {
      fetchTasks();
    }
  }, [onTaskCreated]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getDueDateColor = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return '#e74c3c'; // Overdue
    if (diffDays <= 3) return '#f39c12'; // Due soon
    return '#27ae60'; // On time
  };

  const handleAddTask = (status) => {
    setPrefillStatus(status);
    setShowTaskForm(true);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  const handleTaskCreated = (task) => {
    fetchTasks();
    setShowTaskForm(false);
    setPrefillStatus(null);
  };

  const handleTaskUpdated = (updatedTask) => {
    fetchTasks();
    setSelectedTask(updatedTask);
  };

  const handleTaskDeleted = (taskId) => {
    // Remove the task from the local state
    setKanbanData(prev => {
      const newData = { ...prev };
      Object.keys(newData).forEach(status => {
        newData[status] = newData[status].filter(task => task._id !== taskId);
      });
      return newData;
    });
    
    // Close the detail modal
    setShowTaskDetail(false);
    setSelectedTask(null);
    
    // Also refresh from server to ensure consistency
    fetchTasks();
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnName) => {
    e.preventDefault();
    setDragOverColumn(columnName);
  };

  const handleDragLeave = (e) => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, targetColumn) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.status === targetColumn) {
      setDraggedTask(null);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/api/tasks/${draggedTask._id}`,
        { status: targetColumn },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Update local state
      setKanbanData(prev => {
        const newData = { ...prev };
        // Remove from old column
        newData[draggedTask.status] = newData[draggedTask.status].filter(task => task._id !== draggedTask._id);
        // Add to new column
        newData[targetColumn] = [...newData[targetColumn], response.data];
        return newData;
      });

      setDraggedTask(null);
    } catch (error) {
      console.error('Error updating task status:', error);
      setDraggedTask(null);
    }
  };

  if (loading) return <div className="kanban-loading">Loading tasks...</div>;

  return (
    <>
      <div className="kanban-board">
        {Object.keys(kanbanData).map((column) => (
          <div 
            key={column} 
            className={`kanban-column ${dragOverColumn === column ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, column)} 
            onDragLeave={handleDragLeave} 
            onDrop={(e) => handleDrop(e, column)}
          >
            <div className="kanban-column-header">
              <h3>{column}</h3>
              <span className="task-count">{kanbanData[column].length}</span>
            </div>
            <div className="kanban-column-content">
              {kanbanData[column].map((task) => (
                <div 
                  key={task._id} 
                  className={`kanban-task ${draggedTask?._id === task._id ? 'dragging' : ''}`}
                  onClick={() => handleTaskClick(task)} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, task)}
                >
                  <div className="task-header">
                    <div className="task-title-section">
                      <h4 className="task-title">{task.title}</h4>
                      <div className="drag-handle">⋮⋮</div>
                    </div>
                    <div 
                      className="priority-indicator" 
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    ></div>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-meta">
                    <span className="task-case">Case: {task.caseName}</span>
                    {task.assignedTo && (
                      <span className="task-assignee">Assigned: {task.assignedTo}</span>
                    )}
                    <span 
                      className="task-due" 
                      style={{ color: getDueDateColor(task.dueDate) }}
                    >
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {showCreateButtons && (
                <button 
                  className="add-task-button" 
                  onClick={() => handleAddTask(column)}
                >
                  + Add Task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <TaskForm 
        isOpen={showTaskForm} 
        onClose={() => { 
          setShowTaskForm(false); 
          setPrefillStatus(null); 
        }} 
        onTaskCreated={handleTaskCreated} 
        prefillStatus={prefillStatus} 
      />
      
      {selectedTask && (
        <TaskDetail 
          task={selectedTask} 
          isOpen={showTaskDetail} 
          onClose={() => { 
            setShowTaskDetail(false); 
            setSelectedTask(null); 
          }} 
          onTaskUpdated={handleTaskUpdated} 
          onTaskDeleted={handleTaskDeleted} 
        />
      )}
    </>
  );
};

export default KanbanBoard; 