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

// Suppress console.error during tests to keep output clean
const originalError = console.error;
console.error = (...args) => {
  // Suppress expected error messages during tests
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Login error:') ||
     args[0].includes('Failed to sign in'))
  ) {
    return;
  }
  originalError.call(console, ...args);
};

