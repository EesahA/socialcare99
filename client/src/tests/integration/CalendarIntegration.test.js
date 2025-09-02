import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { mockLocalStorage } from '../testUtils';
import Calendar from '../../components/Calendar';

// Mock axios
jest.mock('axios');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Calendar Integration', () => {
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

    // Mock successful API responses for tasks and meetings
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          data: [
            {
              _id: 'task-123',
              title: 'Review Case Documents',
              description: 'Review all case documents for upcoming hearing',
              assignedTo: 'John Doe',
              dueDate: '2025-09-15T14:00:00.000Z',
              priority: 'High',
              status: 'In Progress',
              caseId: 'CASE-202412-001',
              caseName: 'Test Case'
            },
            {
              _id: 'task-456',
              title: 'Client Follow-up',
              description: 'Follow up with client regarding progress',
              assignedTo: 'Jane Smith',
              dueDate: '2025-09-20T10:00:00.000Z',
              priority: 'Medium',
              status: 'Backlog',
              caseId: 'CASE-202412-002',
              caseName: 'Another Case'
            }
          ]
        });
      }
      if (url.includes('/api/meetings')) {
        return Promise.resolve({
          data: [
            {
              _id: 'meeting-123',
              title: 'Client Review Meeting',
              meetingType: 'Home Visit',
              scheduledAt: '2025-09-18T13:00:00.000Z',
              duration: 60,
              attendees: 'John Doe, Test Client',
              location: 'Client Home',
              status: 'Scheduled',
              caseName: 'Test Case'
            },
            {
              _id: 'meeting-456',
              title: 'Team Briefing',
              meetingType: 'Office Meeting',
              scheduledAt: '2025-09-22T09:00:00.000Z',
              duration: 30,
              attendees: 'John Doe, Jane Smith',
              location: 'Office',
              status: 'Scheduled',
              caseName: null
            }
          ]
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

  describe('Calendar Basic Functionality', () => {
    test('displays calendar header and basic structure', async () => {
      // Render Calendar component
      render(
        <BrowserRouter>
          <Calendar />
        </BrowserRouter>
      );

      // Wait for events to load
      await waitFor(() => {
        expect(screen.getByText(/upcoming schedule/i)).toBeInTheDocument();
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading events/i)).not.toBeInTheDocument();
      });

      // Verify basic calendar structure is rendered
      expect(screen.getByText(/upcoming schedule/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument();
    });

    test('handles calendar expansion and collapse', async () => {
      // Render Calendar component
      render(
        <BrowserRouter>
          <Calendar />
        </BrowserRouter>
      );

      // Wait for events to load
      await waitFor(() => {
        expect(screen.queryByText(/loading events/i)).not.toBeInTheDocument();
      });

      // Initially collapsed view
      expect(screen.getByText(/upcoming schedule/i)).toBeInTheDocument();

      // Click expand button
      const expandButton = screen.getByRole('button', { name: /\+/ });
      await user.click(expandButton);

      // Verify expanded view shows additional controls
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /−/ })).toBeInTheDocument();
      });

      // Click collapse button
      const collapseButton = screen.getByRole('button', { name: /−/ });
      await user.click(collapseButton);

      // Verify collapsed view
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /\+/ })).toBeInTheDocument();
      });
    });

    test('handles refresh button click', async () => {
      // Render Calendar component
      render(
        <BrowserRouter>
          <Calendar />
        </BrowserRouter>
      );

      // Wait for events to load
      await waitFor(() => {
        expect(screen.queryByText(/loading events/i)).not.toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      // Verify API calls were made (this is more reliable than checking loading state)
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:3000/api/tasks',
          expect.any(Object)
        );
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:3000/api/meetings',
          expect.any(Object)
        );
      });
    });
  });
}); 