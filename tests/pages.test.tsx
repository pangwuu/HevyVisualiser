import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { WorkoutDataProvider } from '../src/hooks/useWorkoutData';
import { DashboardPage } from '../src/pages/DashboardPage';
import { WorkoutsPage } from '../src/pages/WorkoutsPage';
import { MusclesPage } from '../src/pages/MusclesPage';
import { ExercisesPage } from '../src/pages/ExercisesPage';
import { MeasurementsPage } from '../src/pages/MeasurementsPage';
import { SettingsPage } from '../src/pages/SettingsPage';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <WorkoutDataProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </WorkoutDataProvider>
  );
};

describe('Page Components Rendering', () => {
  it('renders DashboardPage with statistics and headings', () => {
    renderWithProviders(<DashboardPage />);
    expect(screen.getByText(/Training Overview/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Workouts/i)).toBeInTheDocument();
    expect(screen.getByText(/Time in Gym/i)).toBeInTheDocument();
    expect(screen.getByText(/Volume Lifted/i)).toBeInTheDocument();
  });

  it('renders WorkoutsPage with search and sessions table', () => {
    renderWithProviders(<WorkoutsPage />);
    expect(screen.getByText(/Workouts & Training Volume/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by title, exercise, or date/i)).toBeInTheDocument();
  });

  it('renders MusclesPage with radar and bar charts', () => {
    renderWithProviders(<MusclesPage />);
    expect(screen.getByText(/Muscle Group Breakdown & Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Compound Exercise Volume Attribution/i)).toBeInTheDocument();
  });

  it('renders ExercisesPage with 1RM progress section', () => {
    renderWithProviders(<ExercisesPage />);
    expect(screen.getByText(/Exercise Library & Strength Progress/i)).toBeInTheDocument();
    expect(screen.getByText(/Trendline/i)).toBeInTheDocument();
    expect(screen.getByText(/Confidence Band/i)).toBeInTheDocument();
    expect(screen.getByText(/Detailed Stats/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search exercise/i)).toBeInTheDocument();
  });

  it('renders MeasurementsPage with body weight trends', () => {
    renderWithProviders(<MeasurementsPage />);
    expect(screen.getByText(/Body Measurements & Weight Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Starting Weight/i)).toBeInTheDocument();
  });

  it('renders SettingsPage with export instructions and uploaders', () => {
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText(/Data Settings & CSV Import/i)).toBeInTheDocument();
    expect(screen.getByText(/How to Export Data from the Hevy App/i)).toBeInTheDocument();
    expect(screen.getByText(/Click or drag workout_data.csv here/i)).toBeInTheDocument();
  });
});
