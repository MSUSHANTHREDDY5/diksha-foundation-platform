import React from 'react';
import { AssessmentManager } from './components/assessment/AssessmentManager';
import { ProgramManager } from './components/program/ProgramManager';

export default function App(): React.JSX.Element {
  return (
    <div
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1>Diksha Foundation Platform</h1>

      <p style={{ color: '#666' }}>
        Student Progress, Assessment, Programs & Task Management System
      </p>

      <div style={{ marginTop: '2rem' }}>
        <AssessmentManager
          token="demo_jwt_token"
          studentId="demo_student_id"
        />
      </div>

      <div style={{ marginTop: '2rem' }}>
        <ProgramManager />
      </div>
    </div>
  );
}