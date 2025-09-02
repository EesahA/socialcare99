import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { mockLocalStorage } from '../testUtils';
import TaskForm from '../../components/TaskForm';
import KanbanBoard from '../../components/KanbanBoard';
import TaskDetail from '../../components/TaskDetail';

// Mock axios
jest.mock('axios');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Task Management Workflow Integration', () => {
  let localStorageMock;
  let user;

  beforeEach(() => {
    localStorageMock = mockLocalStorage();
    user = userEvent.setup();
    
    // Set up authenticated user
    localStorageMock.token = 'mock-jwt-token';
    localStorageMock.user = JSON.stringify({
      id: 'user-123',
      email: 'test@example.gov.uk',
      firstName: 'John',
      lastName: 'Doe',
      role: 'caregiver'
    });

    // Mock successful API responses for users
    const mockUsers = [
      {
        _id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.gov.uk'
      },
      {
        _id: 'user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.gov.uk'
      }
    ];

    axios.post.mockResolvedValue({
      data: {
        _id: 'task-123',
        title: 'Test Task',
        description: 'Test Description',
        assignedTo: 'John Doe',
        dueDate: '2024-12-31',
        priority: 'Medium',
        status: 'Backlog',
        caseId: null,
        caseName: null
      }
    });

    axios.put.mockResolvedValue({
      data: {
        _id: 'task-123',
        title: 'Updated Task',
        description: 'Updated Description',
        assignedTo: 'John Doe',
        dueDate: '2024-12-31',
        priority: 'High',
        status: 'In Progress',
        caseId: null,
        caseName: null
      }
    });

    // Mock tasks API
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          data: [
            {
              _id: 'task-123',
              title: 'Test Task',
              description: 'Test Description',
              assignedTo: 'John Doe',
              dueDate: '2024-12-31',
              priority: 'Medium',
              status: 'Backlog',
              caseId: null,
              caseName: null
            }
          ]
        });
      }
      if (url.includes('/api/cases')) {
        return Promise.resolve({
          data: [
            {
              caseId: 'case-123',
              clientFullName: 'Test Case',
              caseStatus: 'Open'
            }
          ]
        });
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({
          data: mockUsers
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  afterEach(() => {
    Object.keys(localStorageMock).forEach(key => {
      delete localStorageMock[key];
    });
    jest.restoreAllMocks();
  });

  describe('Task Creation Flow', () => {


    test('creates case-specific task with pre-filled case information', async () => {
      // Render TaskForm with case pre-fill
      render(
        <BrowserRouter>
          <TaskForm 
            isOpen={true} 
            onClose={() => {}} 
            onTaskCreated={() => {}}
            prefillCaseId="case-123"
            prefillStatus="In Progress"
          />
        </BrowserRouter>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });

      // Verify case and status are pre-filled
      expect(screen.getByDisplayValue(/test case/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/in progress/i)).toBeInTheDocument();

      // Fill out remaining form fields
      await user.type(screen.getByLabelText(/task title/i), 'Case-Specific Task');
      await user.type(screen.getByLabelText(/description/i), 'Task related to specific case');
      await user.selectOptions(screen.getByLabelText(/assigned to/i), 'John Doe');
      await user.type(screen.getByLabelText(/due date/i), '2024-12-31T00:00');
      await user.selectOptions(screen.getByLabelText(/priority/i), 'Medium');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify API call includes case information
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks',
          expect.objectContaining({
            title: 'Case-Specific Task',
            description: 'Task related to specific case',
            assignedTo: 'John Doe',
            caseId: 'case-123',
            caseName: 'Test Case',
            dueDate: '2024-12-31T00:00',
            priority: 'Medium',
            status: 'In Progress'
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Task Viewing and Editing', () => {
    test('displays task in Kanban board and opens detail view', async () => {
      // Render KanbanBoard
      render(
        <BrowserRouter>
          <KanbanBoard />
        </BrowserRouter>
      );

      // Wait for board to load (check if task appears)
      await waitFor(() => {
        expect(screen.getByText(/test task/i)).toBeInTheDocument();
      });

      // Verify task appears in Backlog column
      expect(screen.getByText(/test task/i)).toBeInTheDocument();
      expect(screen.getByText(/test description/i)).toBeInTheDocument();

      // Click on task to open detail view
      const taskElement = screen.getByText(/test task/i);
      await user.click(taskElement);

      // Verify TaskDetail opens
      await waitFor(() => {
        expect(screen.getByText(/task details/i)).toBeInTheDocument();
      });

      // Verify task information is displayed
      expect(screen.getByDisplayValue(/test task/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/test description/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/john doe/i)).toBeInTheDocument();
    });

    test('edits task details and updates in Kanban board', async () => {
      // Render KanbanBoard
      render(
        <BrowserRouter>
          <KanbanBoard />
        </BrowserRouter>
      );

      // Wait for board to load and click on task
      await waitFor(() => {
        expect(screen.getByText(/test task/i)).toBeInTheDocument();
      });

      const taskElement = screen.getByText(/test task/i);
      await user.click(taskElement);

      // Wait for detail view to open
      await waitFor(() => {
        expect(screen.getByText(/task details/i)).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit task/i });
      await user.click(editButton);

      // Modify task details
      const titleInput = screen.getByDisplayValue(/test task/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task Title');

      const descriptionInput = screen.getByDisplayValue(/test description/i);
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Updated task description');

      const prioritySelect = screen.getByDisplayValue(/medium/i);
      await user.selectOptions(prioritySelect, 'High');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      // Verify API call
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks/task-123',
          expect.objectContaining({
            title: 'Updated Task Title',
            description: 'Updated task description',
            assignedTo: 'John Doe',
            dueDate: '2024-12-31',
            priority: 'High',
            status: 'Backlog'
          }),
          expect.any(Object)
        );
      });

      // Verify edit mode is disabled
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Drag and Drop Status Updates', () => {
    test('moves task between columns using drag and drop', async () => {
      // Render KanbanBoard
      render(
        <BrowserRouter>
          <KanbanBoard />
        </BrowserRouter>
      );

      // Wait for board to load (check if task appears)
      await waitFor(() => {
        expect(screen.getByText(/test task/i)).toBeInTheDocument();
      });

      // Verify task starts in Backlog column
      const backlogColumn = screen.getByText(/backlog/i).closest('.kanban-column');
      expect(backlogColumn).toContainElement(screen.getByText(/test task/i));

      // Find the task element and start drag
      const taskElement = screen.getByText(/test task/i).closest('.kanban-task');
      expect(taskElement).toHaveAttribute('draggable', 'true');

      // Simulate drag start
      fireEvent.dragStart(taskElement, {
        dataTransfer: {
          effectAllowed: 'move'
        }
      });

      // Find In Progress column and simulate drop
      const inProgressColumn = screen.getByText(/in progress/i).closest('.kanban-column');
      
      // Simulate drag over
      fireEvent.dragOver(inProgressColumn);
      
      // Simulate drop
      fireEvent.drop(inProgressColumn);

      // Verify API call for status update
      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks/task-123',
          { status: 'In Progress' },
          expect.any(Object)
        );
      });

      // Verify task appears in In Progress column
      await waitFor(() => {
        expect(inProgressColumn).toContainElement(screen.getByText(/updated task/i));
      });
    });

    test('prevents dropping task in same column', async () => {
      // Render KanbanBoard
      render(
        <BrowserRouter>
          <KanbanBoard />
        </BrowserRouter>
      );

      // Wait for board to load (check if task appears)
      await waitFor(() => {
        expect(screen.getByText(/test task/i)).toBeInTheDocument();
      });

      // Find task in Backlog column
      const taskElement = screen.getByText(/test task/i).closest('.kanban-task');
      const backlogColumn = screen.getByText(/backlog/i).closest('.kanban-column');

      // Simulate drag start
      fireEvent.dragStart(taskElement, {
        dataTransfer: {
          effectAllowed: 'move'
        }
      });

      // Simulate drop in same column
      fireEvent.drop(backlogColumn);

      // Verify no API call is made
      expect(axios.put).not.toHaveBeenCalled();
    });
  });

  describe('Task Context Integration', () => {
    test('creates task from different column contexts', async () => {
      // Render KanbanBoard with create buttons
      render(
        <BrowserRouter>
          <KanbanBoard showCreateButtons={true} />
        </BrowserRouter>
      );

      // Wait for board to load (check if task appears)
      await waitFor(() => {
        expect(screen.getByText(/test task/i)).toBeInTheDocument();
      });

      // Test creating task from In Progress column
      const inProgressColumn = screen.getByText(/in progress/i).closest('.kanban-column');
      const addTaskButton = inProgressColumn.querySelector('.add-task-button');
      await user.click(addTaskButton);

      // Verify form opens with pre-filled status
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });

      // Verify status is pre-filled
      expect(screen.getByDisplayValue(/in progress/i)).toBeInTheDocument();

      // Close form and test another column
      const closeButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(closeButton);

      // Test creating task from Complete column
      const completeColumn = screen.getByText(/complete/i).closest('.kanban-column');
      const addCompleteButton = completeColumn.querySelector('.add-task-button');
      await user.click(addCompleteButton);

      // Verify form opens with Complete status pre-filled
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });
      expect(screen.getByDisplayValue(/complete/i)).toBeInTheDocument();
    });


  });

  describe('Error Handling and Validation', () => {
    test('handles API errors gracefully', async () => {
      // Mock API error
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      // Render TaskForm
      render(
        <BrowserRouter>
          <TaskForm 
            isOpen={true} 
            onClose={() => {}} 
            onTaskCreated={() => {}}
          />
        </BrowserRouter>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });

      // Fill out form completely to avoid validation errors
      await user.type(screen.getByLabelText(/task title/i), 'Error Test Task');
      await user.selectOptions(screen.getByLabelText(/assigned to/i), 'John Doe');
      await user.type(screen.getByLabelText(/due date/i), '2024-12-31T00:00');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
      });
    });

    test('validates required fields before submission', async () => {
      // Render TaskForm
      render(
        <BrowserRouter>
          <TaskForm 
            isOpen={true} 
            onClose={() => {}} 
            onTaskCreated={() => {}}
          />
        </BrowserRouter>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });

      // Try to submit without required fields
      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      // Verify validation errors (form only shows first error)
      expect(screen.getByText(/task title is required/i)).toBeInTheDocument();

      // Verify no API call is made
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
}); 