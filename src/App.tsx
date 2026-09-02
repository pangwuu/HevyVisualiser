import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import { WorkoutDataProvider } from './hooks/useWorkoutData';
import { AppLayout } from './components/Layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutsPage } from './pages/WorkoutsPage';
import { MusclesPage } from './pages/MusclesPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { MeasurementsPage } from './pages/MeasurementsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorPrimary: '#1890ff',
          colorBgBase: '#0f0f0f',
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
          colorBorder: '#303030',
          borderRadius: 8,
        },
      }}
    >
      <WorkoutDataProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/workouts" element={<WorkoutsPage />} />
              <Route path="/muscles" element={<MusclesPage />} />
              <Route path="/exercises" element={<ExercisesPage />} />
              <Route path="/measurements" element={<MeasurementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </WorkoutDataProvider>
    </ConfigProvider>
  );
};

export default App;
