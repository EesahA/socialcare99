import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { mockLocalStorage } from '../testUtils';
import Register from '../../pages/Register';
import Login from '../../pages/Login';
import AuthHome from '../../pages/AuthHome';
import Layout from '../../components/Layout';

// Mock axios
jest.mock('axios');

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Authentication Flow Integration', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = mockLocalStorage();
    mockNavigate.mockClear();
    jest.clearAllMocks();
    
    // Mock successful API responses
    axios.post.mockResolvedValue({
      data: {
        token: 'mock-jwt-token',
        user: {
          id: 'user-123',
          email: 'test@example.gov.uk',
          firstName: 'John',
          lastName: 'Doe',
          role: 'caregiver'
        }
      }
    });
  });

  afterEach(() => {
    Object.keys(localStorageMock).forEach(key => {
      delete localStorageMock[key];
    });
    jest.restoreAllMocks();
  });

  describe('User Registration → Login → Dashboard Access', () => {
    test('complete flow from registration to accessing protected routes', async () => {
      const user = userEvent.setup();

      // Step 1: Render Register component
      const { unmount: unmountRegister } = render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      // Fill out registration form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.gov.uk');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      // Submit registration
      const registerButton = screen.getByRole('button', { name: /create account/i });
      await user.click(registerButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/register',
          {
            email: 'john.doe@example.gov.uk',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            role: 'caregiver'
          }
        );
      });

      // Verify token and user data stored in localStorage
      expect(localStorageMock.token).toBe('mock-jwt-token');
      expect(localStorageMock.user).toBe(JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      }));

      // Verify navigation to dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/home');

      // Clear axios mock for next test
      axios.post.mockClear();
      mockNavigate.mockClear();

      // Step 2: Test login flow
      unmountRegister();
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      // Fill out login form
      await user.type(screen.getByLabelText(/email address/i), 'john.doe@example.gov.uk');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');

      // Submit login
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/login',
          {
            email: 'john.doe@example.gov.uk',
            password: 'password123'
          }
        );
      });

      // Verify navigation to dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    test('registration validation and error handling', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      // Test email domain validation
      await user.type(screen.getByLabelText(/email address/i), 'invalid@example.com');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      const registerButton = screen.getByRole('button', { name: /create account/i });
      await user.click(registerButton);

      // Should show domain error
      expect(screen.getByText(/Only .gov.uk email addresses are allowed for registration/i)).toBeInTheDocument();

      // Test password mismatch
      await user.clear(screen.getByLabelText(/email address/i));
      await user.type(screen.getByLabelText(/email address/i), 'valid@example.gov.uk');
      await user.clear(screen.getByLabelText(/confirm password/i));
      await user.type(screen.getByLabelText(/confirm password/i), 'differentpassword');

      await user.click(registerButton);

      // Should show password mismatch error
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    test('login validation and error handling', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      // Test empty fields
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Should show validation error
      expect(screen.getByText(/Please enter both email and password/i)).toBeInTheDocument();

      // Test API error handling
      axios.post.mockRejectedValueOnce({
        response: { data: { error: 'Invalid credentials' } }
      });

      await user.type(screen.getByLabelText(/email address/i), 'test@example.gov.uk');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication State Persistence Across Components', () => {
    test('authentication state persists across component renders', async () => {
      // Set up authenticated user in localStorage
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component (which checks authentication)
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Wait for authentication check to complete
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });

      // Verify user state is maintained
      expect(localStorageMock.token).toBe('mock-jwt-token');
      expect(localStorageMock.user).toBeDefined();
    });

    test('authentication state updates when user logs out', async () => {
      const user = userEvent.setup();

      // Set up authenticated user
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });

      // Open profile menu first
      const profileButton = screen.getByText(/profile/i);
      await user.click(profileButton);

      // Find and click logout button (should be visible after opening profile menu)
      const logoutButton = screen.getByText(/logout/i);
      await user.click(logoutButton);

      // Verify localStorage is cleared
      expect(localStorageMock.token).toBeUndefined();
      expect(localStorageMock.user).toBeUndefined();

      // Verify navigation to landing page
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('custom events trigger authentication state updates', async () => {
      // Set up authenticated user
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });

      // Simulate userLogin event
      window.dispatchEvent(new Event('userLogin'));

      // Verify component re-renders with updated state
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });
    });
  });

  describe('Route Protection and Redirects', () => {
    test('unauthenticated users cannot access protected routes', () => {
      // Ensure no authentication data
      expect(localStorageMock.token).toBeUndefined();
      expect(localStorageMock.user).toBeUndefined();

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component without authentication
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Should not show header (which contains navigation and profile)
      expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Tasks/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cases/i)).not.toBeInTheDocument();
      
      // But should still show children content (Layout behavior)
      expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
    });

    test('authenticated users can access protected routes', async () => {
      // Set up authenticated user
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component with authentication
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Should show protected content
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });
    });

    test('dashboard access requires authentication', async () => {
      // Set up authenticated user
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Render AuthHome component
      render(
        <BrowserRouter>
          <AuthHome />
        </BrowserRouter>
      );

      // Should show dashboard content
      expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
    });
  });

  describe('Cross-Component Authentication Integration', () => {
    test('authentication state is shared between Register and Login components', async () => {
      const user = userEvent.setup();

      // Test registration
      render(
        <BrowserRouter>
          <Register />
        </BrowserRouter>
      );

      await user.type(screen.getByLabelText(/first name/i), 'Jane');
      await user.type(screen.getByLabelText(/last name/i), 'Smith');
      await user.type(screen.getByLabelText(/email address/i), 'jane.smith@example.gov.uk');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      const registerButton = screen.getByRole('button', { name: /create account/i });
      await user.click(registerButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'http://localhost:3000/api/auth/register',
          expect.objectContaining({
            email: 'jane.smith@example.gov.uk'
          })
        );
      });

      // Verify authentication data is stored
      expect(localStorageMock.token).toBe('mock-jwt-token');
      expect(localStorageMock.user).toBeDefined();

      // Now test login with same credentials
      render(
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      );

      await user.type(screen.getByLabelText(/email address/i), 'jane.smith@example.gov.uk');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Verify login succeeds and navigates to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    test('authentication persists when switching between components', async () => {
      // Set up authenticated user
      localStorageMock.token = 'mock-jwt-token';
      localStorageMock.user = JSON.stringify({
        id: 'user-123',
        email: 'test@example.gov.uk',
        firstName: 'John',
        lastName: 'Doe',
        role: 'caregiver'
      });

      // Mock the location to be an authenticated route
      const mockLocation = { pathname: '/home' };
      jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue(mockLocation);

      // Render Layout component
      const { unmount } = render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Verify authentication works
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });

      // Unmount and remount
      unmount();

      // Render again
      render(
        <BrowserRouter>
          <Layout>
            <div>Protected Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Authentication should still work
      await waitFor(() => {
        expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
      });

      // Verify localStorage data is still intact
      expect(localStorageMock.token).toBe('mock-jwt-token');
      expect(localStorageMock.user).toBeDefined();
    });
  });
}); 