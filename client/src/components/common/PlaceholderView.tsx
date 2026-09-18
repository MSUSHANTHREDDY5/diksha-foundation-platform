import React from 'react';

interface PlaceholderViewProps {
  moduleName: string;
  backendRoutes: string[];
  description: string;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  moduleName,
  backendRoutes,
  description
}) => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '2rem auto',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      padding: '2.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      textAlign: 'center'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        backgroundColor: '#eff6ff',
        color: '#2563eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        margin: '0 auto 1.5rem auto',
        border: '1px solid #bfdbfe'
      }}>
        API
      </div>

      <h2 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>
        {moduleName} Module Active
      </h2>

      <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
        {description}
      </p>

      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        textAlign: 'left',
        marginBottom: '1.5rem'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
          Available Backend Endpoints:
        </div>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.875rem' }}>
          {backendRoutes.map((route, idx) => (
            <li key={idx} style={{ marginBottom: '4px', fontFamily: 'monospace' }}>
              {route}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '6px' }}>
        Note: The dedicated standalone management UI for this module is scheduled for the next frontend release phase.
      </div>
    </div>
  );
};
