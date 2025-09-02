// Jest setup for React Testing Library
import '@testing-library/jest-dom';

// Suppress React Router deprecation warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React Router Future Flag Warning') ||
     args[0].includes('React Router will begin wrapping state updates') ||
     args[0].includes('Relative route resolution within Splat routes'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Login error:') ||
     args[0].includes('Failed to sign in') ||
     args[0].includes('Warning: An update to') ||
     args[0].includes('was not wrapped in act(...)') ||
     args[0].includes('Failed to fetch users:') ||
     args[0].includes('Error fetching tasks:') ||
     args[0].includes('Error fetching summary data:') ||
     args[0].includes('Failed to fetch events:') ||
     args[0].includes('Warning: Each child in a list should have a unique "key" prop'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

