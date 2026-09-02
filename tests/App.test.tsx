import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from '../src/App';

describe('App Root Integration', () => {
  it('renders the application layout and brand title', () => {
    render(<App />);
    expect(screen.getAllByText(/HEVY/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/STATS/i)).toBeInTheDocument();
    expect(screen.getByText(/Hevy Data Dashboard/i)).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<App />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Workouts & Volume')).toBeInTheDocument();
    expect(screen.getByText('Muscle Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Exercise Library')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
    expect(screen.getByText('Settings & Import')).toBeInTheDocument();
  });
});
