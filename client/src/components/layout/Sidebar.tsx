import React from 'react';

export type NavItem =
  | 'DASHBOARD'
  | 'STUDENTS'
  | 'ASSESSMENTS'
  | 'EVALUATIONS'
  | 'PROGRAMS'
  | 'ACTIVITIES'
  | 'TASKS'
  | 'ADMIN_ANALYTICS'
  | 'REPORTS';

interface SidebarProps {
  currentNav: NavItem;
  onNavigate: (nav: NavItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentNav, onNavigate }) => {
  const navItems: Array<{ id: NavItem; label: string; badge?: string }> = [
    { id: 'DASHBOARD', label: 'Dashboard Overview' },
    { id: 'STUDENTS', label: 'Student Management' },
    { id: 'ASSESSMENTS', label: 'Assessments' },
    { id: 'EVALUATIONS', label: 'Evaluations' },
    { id: 'PROGRAMS', label: 'Programs' },
    { id: 'ACTIVITIES', label: 'Activities' },
    { id: 'TASKS', label: 'Tasks' },
    { id: 'ADMIN_ANALYTICS', label: 'Admin Analytics' },
    { id: 'REPORTS', label: 'Reports & Insights' }
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid #1e293b',
      boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#020617'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            DF
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff', fontWeight: 700 }}>
              Diksha Foundation
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Management System
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', padding: '0 0.5rem 0.5rem 0.5rem', letterSpacing: '0.05em' }}>
          Navigation Menu
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map((item) => {
            const isActive = currentNav === item.id;
            return (
              <li key={item.id} style={{ marginBottom: '4px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#1e293b';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#334155',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      fontWeight: 500
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #1e293b',
        fontSize: '0.75rem',
        color: '#64748b',
        textAlign: 'center',
        backgroundColor: '#020617'
      }}>
        Diksha Foundation v1.0 • MERN Stack
      </div>
    </aside>
  );
};
