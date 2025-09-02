import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../../components/Layout';
import { mockLocalStorage } from '../testUtils';

const App = ({ initialPath = '/home' }) => (
  <MemoryRouter initialEntries={[initialPath]}>
    <Routes>
      <Route path="/home" element={<Layout><div>Home Page</div></Layout>} />
      <Route path="/tasks" element={<Layout><div>Tasks Page</div></Layout>} />
      <Route path="/cases" element={<Layout><div>Cases Page</div></Layout>} />
      <Route path="/settings" element={<div>Settings Page</div>} />
      <Route path="/" element={<div>Landing</div>} />
    </Routes>
  </MemoryRouter>
);

describe('Layout header and menus', () => {
  beforeEach(() => {
    const store = mockLocalStorage();
    store.user = JSON.stringify({ firstName: 'A', lastName: 'B', role: 'caregiver' });
    store.token = 'test-token';
  });

  test('shows nav links when authenticated and highlights active link', () => {
    render(<App initialPath="/tasks" />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    
    const tasksNavLink = screen.getByRole('link', { name: /Tasks/i });
    expect(tasksNavLink).toHaveClass('active');
  });

  test('profile menu settings navigates and logout clears storage', () => {
    render(<App initialPath="/home" />);
    
    // Open profile menu
    fireEvent.click(screen.getByRole('button', { name: /Profile/i }));
    
    // Click settings - this should navigate to settings page
    fireEvent.click(screen.getByRole('button', { name: /Settings/i }));
    
    // Now we should be on the settings page
    expect(screen.getByText(/Settings Page/i)).toBeInTheDocument();
  });

  test('logout clears storage', () => {
    render(<App initialPath="/home" />);
    
    // Open profile menu
    fireEvent.click(screen.getByRole('button', { name: /Profile/i }));
    
    // Click logout
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    
    expect(window.localStorage.getItem('token')).toBe(null);
  });
});

