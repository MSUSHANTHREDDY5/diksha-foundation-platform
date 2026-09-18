import React from 'react';
import { NavItem } from './Sidebar';

interface HeaderProps {
  currentNav: NavItem;
  token: string;
  studentId: string;
  onTokenChange: (token: string) => void;
  onStudentIdChange: (studentId: string) => void;
}

const navTitleMap: Record<NavItem, { title: string; subtitle: string }> = {
  DASHBOARD: { title: 'Platform Dashboard', subtitle: 'Centralized overview of foundation metrics and quick actions' },
  STUDENTS: { title: 'Student Management & Progress', subtitle: 'Track student profiles, health metrics, and learning levels' },
  ASSESSMENTS: { title: 'Assessments & Evaluations', subtitle: 'Record student academic evaluations and learning level outcomes' },
  EVALUATIONS: { title: 'Self & Peer Evaluations', subtitle: 'Manage student self-reflections and peer reviews' },
  PROGRAMS: { title: 'Programs & Learning Tracks', subtitle: 'Manage educational programs and curriculum categories' },
  ACTIVITIES: { title: 'Program Activities', subtitle: 'Schedule and track individual lessons, workshops, and events' },
  TASKS: { title: 'Task & Action Items', subtitle: 'Assign, track, and record outcomes for student tasks' },
  ADMIN_ANALYTICS: { title: 'Admin Analytics & Insights', subtitle: 'Holistic multi-module data analytics and distributions' },
  REPORTS: { title: 'Administrative Reports', subtitle: 'Exportable derived reports for students and programs' }
};

export const Header: React.FC<HeaderProps> = ({
  currentNav,
  token,
  studentId,
  onTokenChange,
  onStudentIdChange
}) => {
  const meta = navTitleMap[currentNav] || { title: 'Diksha Foundation', subtitle: 'Platform Management' };

  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      flexWrap: 'wrap',
      gap: '1rem'
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>
          {meta.title}
        </h1>
        <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          {meta.subtitle}
        </p>
      </div>

      {/* Dev/Demo Session Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        backgroundColor: '#f8fafc',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '2px' }}>
            JWT Bearer Token:
          </label>
          <input
            type="text"
            placeholder="Paste JWT token..."
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              width: '170px',
              backgroundColor: '#ffffff',
              color: '#1e293b'
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '2px' }}>
            Student ID Context:
          </label>
          <input
            type="text"
            placeholder="Student Mongo ID..."
            value={studentId}
            onChange={(e) => onStudentIdChange(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              width: '150px',
              backgroundColor: '#ffffff',
              color: '#1e293b'
            }}
          />
        </div>
      </div>
    </header>
  );
};
