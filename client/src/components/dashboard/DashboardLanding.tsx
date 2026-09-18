import React, { useEffect, useState } from 'react';
import { fetchAdminDashboard } from '../../services/admin.api';
import { DashboardData } from '../../types/admin.types';
import { NavItem } from '../layout/Sidebar';

interface DashboardLandingProps {
  token: string;
  onNavigate: (nav: NavItem) => void;
}

export const DashboardLanding: React.FC<DashboardLandingProps> = ({ token, onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token && token.trim()) {
      setIsLoading(true);
      setError(null);
      fetchAdminDashboard(token)
        .then((res) => {
          if (res.success && res.data) {
            setDashboardData(res.data);
          } else {
            setError(res.message || 'Failed to fetch live admin metrics');
          }
        })
        .catch((err) => {
          setError(err.message || 'Could not connect to backend admin API');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setDashboardData(null);
    }
  }, [token]);

  const cards: Array<{
    id: NavItem;
    title: string;
    description: string;
    tag: string;
    actionText: string;
  }> = [
    {
      id: 'STUDENTS',
      title: 'Student Management & Progress',
      description: 'Centralized repository of student information, learning levels, health metrics, and progress logs.',
      tag: 'Member 1 Module',
      actionText: 'Manage Students'
    },
    {
      id: 'ASSESSMENTS',
      title: 'Assessments & Student Evaluation',
      description: 'Record academic evaluations, learning level transitions, self-evaluations, and peer reviews.',
      tag: 'Member 2 Module',
      actionText: 'Open Assessments'
    },
    {
      id: 'PROGRAMS',
      title: 'Programs, Activities & Tasks',
      description: 'Organize educational programs, schedule curriculum activities, assign tasks, and track outcomes.',
      tag: 'Member 3 Module',
      actionText: 'Open Programs'
    },
    {
      id: 'ADMIN_ANALYTICS',
      title: 'Admin Dashboard & Analytics',
      description: 'Multi-domain analytics covering academic scores, physical health metrics, and social-emotional growth.',
      tag: 'Member 4 Module',
      actionText: 'View Analytics'
    },
    {
      id: 'REPORTS',
      title: 'Administrative Reports',
      description: 'Derived summary reports for student outcomes, program participation, and activity completion.',
      tag: 'Member 4 Module',
      actionText: 'View Reports'
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
          Welcome to the Diksha Foundation Platform
        </h2>
        <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Supporting student tracking, program management, educational activities, assessments, and decision-support reporting. Select a feature module from the sidebar or click any card below to begin.
        </p>
      </div>

      {/* Live Backend Overview (Only displayed when real backend data is fetched) */}
      {isLoading && (
        <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Fetching real-time backend overview metrics...
        </div>
      )}

      {error && token && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          Live API Note: {error}
        </div>
      )}

      {dashboardData && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>
            Live Platform Overview (Real Backend Data)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Students</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                {dashboardData.overview.totalStudents}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>
                Active: {dashboardData.overview.activeStudents}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Total Programs</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                {dashboardData.overview.totalPrograms}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                Active: {dashboardData.overview.activePrograms}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Completed Assessments</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '4px 0' }}>
                {dashboardData.overview.completedAssessments}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Total: {dashboardData.overview.totalAssessments}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Overdue Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: dashboardData.overview.overdueTasks > 0 ? '#dc2626' : '#16a34a', margin: '4px 0' }}>
                {dashboardData.overview.overdueTasks}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Total Tasks: {dashboardData.overview.totalTasks}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module Action Cards */}
      <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: 600 }}>
        Platform Feature Modules
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 8px', borderRadius: '4px' }}>
                  {card.tag}
                </span>
              </div>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: 600 }}>
                {card.title}
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {card.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate(card.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; }}
            >
              {card.actionText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
