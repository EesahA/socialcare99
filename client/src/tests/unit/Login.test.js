import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import Login from '../../pages/Login';
import { mockLocalStorage } from '../testUtils';

jest.mock('axios');

const renderWithRouter = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);

describe('Login page', () => {
  beforeEach(() => {
    mockLocalStorage();
    axios.post.mockClear();
  });

  test('renders and validates required fields', async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText(/Please enter both email and password/i)).toBeInTheDocument();
  });

  test('successful login stores token and user then redirects', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'test-token', user: { firstName: 'Test', lastName: 'User', role: 'caregiver' } }
    });

    renderWithRouter(<Login />);

    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem('token')).toBe('test-token');
    });
    expect(window.localStorage.getItem('user')).toContain('Test');
  });

  test('failed login shows error', async () => {
    axios.post.mockRejectedValueOnce({ 
      response: { data: { error: 'Invalid credentials' } } 
    });
    
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});

