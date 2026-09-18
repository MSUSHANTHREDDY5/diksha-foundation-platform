import React, { useState } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardLanding } from './components/dashboard/DashboardLanding';
import { PlaceholderView } from './components/common/PlaceholderView';
import { AssessmentManager } from './components/assessment/AssessmentManager';
import { ProgramManager } from './components/program/ProgramManager';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App(): React.JSX.Element {
  const [currentNav, setCurrentNav] = useState<NavItem>('DASHBOARD');
  const [token, setToken] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');

  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a'
    }}>
      {/* Sidebar Navigation */}
      <Sidebar currentNav={currentNav} onNavigate={setCurrentNav} />

      {/* Main Content Workspace */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minWidth: 0,
        height: '100vh',
        overflow: 'hidden'
      }}>
        {/* Top Header & Dev Controls */}
        <Header
          currentNav={currentNav}
          token={token}
          studentId={studentId}
          onTokenChange={setToken}
          onStudentIdChange={setStudentId}
        />

        {/* Scrollable View Area */}
        <main style={{
          flex: 1,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          {currentNav === 'DASHBOARD' && (
            <DashboardLanding token={token} onNavigate={setCurrentNav} />
          )}

          {currentNav === 'STUDENTS' && (
            <PlaceholderView
              moduleName="Student Management & Progress Tracking"
              description="Member 1 owns Student & Progress management. Full backend capabilities for student registration, profile management, learning level progression, physical health metrics, and social-emotional tracking are live on the server API."
              backendRoutes={[
                'POST /api/students — Create new student',
                'GET /api/students — List students with filters',
                'GET /api/students/:id — Fetch student profile',
                'PUT /api/students/:id — Update student record',
                'DELETE /api/students/:id — Soft-delete student',
                'POST /api/students/:id/progress — Log progress entry (updates learning level)',
                'GET /api/students/:id/progress — Fetch student progress history',
                'GET /api/students/:id/progress/latest — Fetch latest student progress'
              ]}
            />
          )}

          {currentNav === 'ASSESSMENTS' && (
            <AssessmentManager
              key={`assessments-${token}-${studentId}`}
              token={token}
              studentId={studentId}
              initialTab="ASSESSMENT"
            />
          )}

          {currentNav === 'EVALUATIONS' && (
            <AssessmentManager
              key={`evaluations-${token}-${studentId}`}
              token={token}
              studentId={studentId}
              initialTab="SELF_EVAL"
            />
          )}

          {currentNav === 'PROGRAMS' && (
            <ProgramManager
              key={`programs-${token}-${studentId}`}
              token={token}
              studentId={studentId}
              initialTab="PROGRAMS"
            />
          )}

          {currentNav === 'ACTIVITIES' && (
            <ProgramManager
              key={`activities-${token}-${studentId}`}
              token={token}
              studentId={studentId}
              initialTab="ACTIVITIES"
            />
          )}

          {currentNav === 'TASKS' && (
            <ProgramManager
              key={`tasks-${token}-${studentId}`}
              token={token}
              studentId={studentId}
              initialTab="TASKS"
            />
          )}

          {currentNav === 'ADMIN_ANALYTICS' && (
            <AdminDashboard
              key={`admin-analytics-${token}`}
              token={token}
              initialTab="STUDENT_ANALYTICS"
            />
          )}

          {currentNav === 'REPORTS' && (
            <AdminDashboard
              key={`admin-reports-${token}`}
              token={token}
              initialTab="REPORTS"
            />
          )}
        </main>
      </div>
    </div>
  );
}