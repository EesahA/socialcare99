import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { mockLocalStorage } from '../testUtils';
import CaseForm from '../../components/CaseForm';
import TaskForm from '../../components/TaskForm';
import MeetingScheduler from '../../components/MeetingScheduler';

// Mock axios
jest.mock('axios');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Case Management Integration', () => {
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
      role: 'socialworker'
    });



    axios.post.mockResolvedValue({
      data: {
        _id: 'case-123',
        caseId: 'CASE-202412-001',
        clientFullName: 'Test Client',
        caseStatus: 'Open',
        priorityLevel: 'Medium'
      }
    });
  });

  afterEach(() => {
    Object.keys(localStorageMock).forEach(key => {
      delete localStorageMock[key];
    });
    jest.restoreAllMocks();
  });

  describe('Case Creation and Management Flow', () => {
    test('creates case with basic information', async () => {
      // Render CaseForm
      render(
        <BrowserRouter>
          <CaseForm 
            isOpen={true} 
            onClose={() => {}} 
            onCaseCreated={() => {}}
          />
        </BrowserRouter>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/create new case/i)).toBeInTheDocument();
      });

      // Fill out basic case information
      await user.type(screen.getByLabelText(/client full name/i), 'Test Client');
      await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
      await user.type(screen.getByLabelText(/client reference number/i), 'REF123');
      
      // Select case type (radio button)
      const childProtectionRadio = screen.getByDisplayValue('Child Protection');
      await user.click(childProtectionRadio);
      
      // Select priority level (radio button)
      const highPriorityRadio = screen.getByDisplayValue('High');
      await user.click(highPriorityRadio);

      // Click Next button to proceed
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify form progresses to next page
      await waitFor(() => {
        expect(screen.getByText(/contact & safeguarding details/i)).toBeInTheDocument();
      });
    });

    test('creates task for a case', async () => {
      // Mock case data
      const mockCase = {
        caseId: 'CASE-202412-001',
        clientFullName: 'Test Client'
      };

          // Mock cases API for TaskForm
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/cases')) {
        return Promise.resolve({
          data: [
            {
              caseId: 'CASE-202412-001',
              clientFullName: 'Test Client',
              caseStatus: 'Open'
            }
          ]
        });
      }
      if (url.includes('/api/users')) {
        return Promise.resolve({
          data: [
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
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

      // Render TaskForm with case pre-fill
      render(
        <BrowserRouter>
          <TaskForm 
            isOpen={true} 
            onClose={() => {}} 
            onTaskCreated={() => {}}
            prefillCaseId="CASE-202412-001"
            prefillStatus="In Progress"
          />
        </BrowserRouter>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText(/create new task/i)).toBeInTheDocument();
      });

      // Wait for users to load and verify status is pre-filled
      await waitFor(() => {
        expect(screen.getByDisplayValue(/in progress/i)).toBeInTheDocument();
      });
      
      // Wait for users to load in the dropdown
      await waitFor(() => {
        const assignedToSelect = screen.getByLabelText(/assigned to/i);
        expect(assignedToSelect).not.toBeDisabled();
      });

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
            caseId: 'CASE-202412-001',
            caseName: 'Test Client',
            dueDate: '2024-12-31T00:00',
            priority: 'Medium',
            status: 'In Progress'
          }),
          expect.any(Object)
        );
      });
    });

    test('schedules meeting for a case', async () => {
      // Mock case data
      const mockCase = {
        caseId: 'CASE-202412-001',
        clientFullName: 'Test Client'
      };

      // Render MeetingScheduler
      render(
        <BrowserRouter>
          <MeetingScheduler
            isOpen={true}
            onClose={() => {}}
            onMeetingScheduled={() => {}}
            caseData={mockCase}
          />
        </BrowserRouter>
      );

      // Wait for form to load and verify heading
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /schedule meeting/i })).toBeInTheDocument();
      });

      // Fill out meeting form
      await user.type(screen.getByLabelText(/meeting title/i), 'Client Review Meeting');
      await user.type(screen.getByLabelText(/date/i), '2024-12-20');
      await user.type(screen.getByLabelText(/time/i), '14:00');
      await user.selectOptions(screen.getByLabelText(/duration/i), '1 hour');
      await user.type(screen.getByLabelText(/attendees/i), 'John Doe, Test Client');
      await user.type(screen.getByLabelText(/location/i), 'Office');

      // Submit meeting
      const submitButton = screen.getByRole('button', { name: /schedule meeting/i });
      await user.click(submitButton);

      // Verify meeting API call
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/meetings',
          expect.objectContaining({
            title: 'Client Review Meeting',
            attendees: 'John Doe, Test Client',
            location: 'Office'
          }),
          expect.any(Object)
        );
      });
    });
  });
}); 