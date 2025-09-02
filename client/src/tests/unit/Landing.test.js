import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import Landing from '../../pages/Landing';

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Landing page', () => {
  test('renders app title and CTA buttons', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText(/Welcome to Social Care 365/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  test('shows updated key features', () => {
    renderWithRouter(<Landing />);
    expect(screen.getByText(/Task Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Case Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Meeting Scheduling/i)).toBeInTheDocument();
    expect(screen.getByText(/Calendar Integration/i)).toBeInTheDocument();
  });
});

