import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Settings from '../../pages/Settings';
import { mockLocalStorage } from '../testUtils';

jest.mock('axios');

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Settings page', () => {
  beforeEach(() => {
    const store = mockLocalStorage();
    store.token = 'test-token';
    store.user = JSON.stringify({ firstName: 'John', lastName: 'Doe', role: 'caregiver', email: 'j@d.com' });
    
    // Reset axios mocks
    axios.get.mockClear();
    axios.put.mockClear();
  });

  test('fetches and displays profile data', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'caregiver' } 
    });
    
    renderWithRouter(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('j@d.com')).toBeInTheDocument();
  });

  test('updates name/email and reflects changes in localStorage', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'caregiver' } 
    });
    axios.put.mockResolvedValueOnce({ 
      data: { firstName: 'Jane', lastName: 'Smith', email: 'jane@smith.com', role: 'caregiver' } 
    });
    
    renderWithRouter(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@smith.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    await waitFor(() => {
      expect(window.localStorage.getItem('user')).toContain('Jane');
    });
  });

  test('role dropdown can switch between caregiver and manager', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'caregiver' } 
    });
    axios.put.mockResolvedValueOnce({ 
      data: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'manager' } 
    });
    
    renderWithRouter(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    
    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'manager' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }));
    
    await waitFor(() => {
      expect(window.localStorage.getItem('user')).toContain('manager');
    });
  });

  test('password change validations and error states', async () => {
    axios.get.mockResolvedValueOnce({ 
      data: { firstName: 'John', lastName: 'Doe', email: 'j@d.com', role: 'caregiver' } 
    });
    
    renderWithRouter(<Settings />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/Current Password/i), { target: { value: 'old' } });
    fireEvent.change(screen.getByLabelText(/^New Password/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'mismatch' } });
    fireEvent.click(screen.getByRole('button', { name: /Change Password/i }));
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match|at least/i)).toBeInTheDocument();
    });
  });
});

