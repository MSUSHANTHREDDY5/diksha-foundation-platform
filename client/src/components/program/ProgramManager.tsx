import React, { useState } from 'react';
import {
  ProgramCategory,
  ProgramTargetLevel,
  ActivityType,
  TaskPriority,
  TaskStatus
} from '../../types/program.types';
import {
  createProgramApi,
  enrollStudentApi,
  createActivityApi,
  createTaskApi,
  patchTaskApi,
  addTaskCommentApi
} from '../../services/program.api';

interface ProgramManagerProps {
  token?: string;
  studentId?: string;
  initialTab?: 'PROGRAMS' | 'ENROLLMENT' | 'ACTIVITIES' | 'TASKS';
}

export const ProgramManager: React.FC<ProgramManagerProps> = ({ token = '', studentId = '', initialTab = 'PROGRAMS' }) => {
  const [activeTab, setActiveTab] = useState<'PROGRAMS' | 'ENROLLMENT' | 'ACTIVITIES' | 'TASKS'>(initialTab);

  // Program Form State
  const [programTitle, setProgramTitle] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [programCategory, setProgramCategory] = useState<ProgramCategory>('ACADEMIC');
  const [targetLevel, setTargetLevel] = useState<ProgramTargetLevel>('ALL');

  // Enrollment Form State
  const [enrollProgramId, setEnrollProgramId] = useState('');
  const [enrollStudentId, setEnrollStudentId] = useState(studentId);

  // Activity Form State
  const [activityProgramId, setActivityProgramId] = useState('');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('LESSON');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().substring(0, 10));

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStudentId, setTaskStudentId] = useState(studentId);
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');

  // Task Update / Comment State
  const [targetTaskId, setTargetTaskId] = useState('');
  const [taskStatusUpdate, setTaskStatusUpdate] = useState<TaskStatus>('COMPLETED');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  // UI Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createProgramApi(
        {
          title: programTitle,
          description: programDescription,
          category: programCategory,
          targetLevel
        },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: `Program "${response.data?.program.title}" created successfully!` });
        setProgramTitle('');
        setProgramDescription('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create program' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await enrollStudentApi(enrollProgramId, enrollStudentId, token);

      if (response.success) {
        setMessage({ type: 'success', text: 'Student enrolled in program successfully!' });
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to enroll student' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createActivityApi(
        activityProgramId,
        {
          title: activityTitle,
          activityType,
          scheduledDate
        },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: `Activity "${response.data?.activity.title}" scheduled successfully!` });
        setActivityTitle('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create activity' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createTaskApi(
        {
          title: taskTitle,
          description: taskDescription,
          studentId: taskStudentId,
          priority: taskPriority
        },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: `Task "${response.data?.task.title}" assigned successfully!` });
        setTaskTitle('');
        setTaskDescription('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create task' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await patchTaskApi(
        targetTaskId,
        {
          status: taskStatusUpdate,
          outcomeNotes
        },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: 'Task status updated successfully!' });
        setOutcomeNotes('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update task' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTaskComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await addTaskCommentApi(targetTaskId, commentMessage, token);

      if (response.success) {
        setMessage({ type: 'success', text: 'Task comment posted successfully!' });
        setCommentMessage('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to post comment' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'left', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem' }}>
      <h2>Program, Activity & Task Manager</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('PROGRAMS'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'PROGRAMS' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Programs
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('ENROLLMENT'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'ENROLLMENT' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Enrollment
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('ACTIVITIES'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'ACTIVITIES' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Activities
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('TASKS'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'TASKS' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Tasks & Communication
        </button>
      </div>

      {/* Alert Banner */}
      {message && (
        <div style={{
          padding: '10px',
          marginBottom: '1rem',
          borderRadius: '4px',
          backgroundColor: message.type === 'success' ? '#e6fffa' : '#ffebe9',
          color: message.type === 'success' ? '#0d7d6c' : '#cf222e',
          border: `1px solid ${message.type === 'success' ? '#87e8de' : '#ffc0c0'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Tab 1: Programs */}
      {activeTab === 'PROGRAMS' && (
        <form onSubmit={handleCreateProgram}>
          <h3>Create Learning Program</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Program Title:</label>
            <input
              type="text"
              required
              value={programTitle}
              onChange={(e) => setProgramTitle(e.target.value)}
              placeholder="e.g. Foundational Literacy Track"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Category:</label>
            <select value={programCategory} onChange={(e) => setProgramCategory(e.target.value as ProgramCategory)} style={{ width: '100%', padding: '8px' }}>
              <option value="ACADEMIC">Academic</option>
              <option value="VOCATIONAL">Vocational</option>
              <option value="LIFE_SKILLS">Life Skills</option>
              <option value="HOLISTIC">Holistic</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Target Level:</label>
            <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value as ProgramTargetLevel)} style={{ width: '100%', padding: '8px' }}>
              <option value="ALL">All Levels</option>
              <option value="LEVEL_1">Level 1</option>
              <option value="LEVEL_2">Level 2</option>
              <option value="LEVEL_3">Level 3</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Description:</label>
            <textarea
              value={programDescription}
              onChange={(e) => setProgramDescription(e.target.value)}
              placeholder="Enter program description..."
              style={{ width: '100%', padding: '8px', minHeight: '60px' }}
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Submitting...' : 'Create Program'}
          </button>
        </form>
      )}

      {/* Tab 2: Enrollment */}
      {activeTab === 'ENROLLMENT' && (
        <form onSubmit={handleEnrollStudent}>
          <h3>Enroll Student in Program</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Program ID:</label>
            <input
              type="text"
              required
              value={enrollProgramId}
              onChange={(e) => setEnrollProgramId(e.target.value)}
              placeholder="Enter Program ObjectId"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Student ID:</label>
            <input
              type="text"
              required
              value={enrollStudentId}
              onChange={(e) => setEnrollStudentId(e.target.value)}
              placeholder="Enter Student ObjectId"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#008000', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
          </button>
        </form>
      )}

      {/* Tab 3: Activities */}
      {activeTab === 'ACTIVITIES' && (
        <form onSubmit={handleCreateActivity}>
          <h3>Schedule Program Activity</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Program ID:</label>
            <input
              type="text"
              required
              value={activityProgramId}
              onChange={(e) => setActivityProgramId(e.target.value)}
              placeholder="Enter Program ObjectId"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Activity Title:</label>
            <input
              type="text"
              required
              value={activityTitle}
              onChange={(e) => setActivityTitle(e.target.value)}
              placeholder="e.g. Session 1: Phonics Intro"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Activity Type:</label>
            <select value={activityType} onChange={(e) => setActivityType(e.target.value as ActivityType)} style={{ width: '100%', padding: '8px' }}>
              <option value="LESSON">Lesson</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="PROJECT">Project</option>
              <option value="ASSESSMENT_PREP">Assessment Prep</option>
              <option value="COMMUNITY">Community</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Scheduled Date:</label>
            <input
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Activity'}
          </button>
        </form>
      )}

      {/* Tab 4: Tasks & Communication */}
      {activeTab === 'TASKS' && (
        <div>
          <form onSubmit={handleCreateTask} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Assign Task to Student</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Task Title:</label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Complete Worksheet 3"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Student ID:</label>
              <input
                type="text"
                required
                value={taskStudentId}
                onChange={(e) => setTaskStudentId(e.target.value)}
                placeholder="Enter Student ObjectId"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Priority:</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)} style={{ width: '100%', padding: '8px' }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Description / Instructions:</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task instructions..."
                style={{ width: '100%', padding: '8px', minHeight: '60px' }}
              />
            </div>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {isSubmitting ? 'Assigning...' : 'Assign Task'}
            </button>
          </form>

          <form onSubmit={handleUpdateTaskStatus} style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Update Task Status / Log Outcome</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Task ID:</label>
              <input
                type="text"
                required
                value={targetTaskId}
                onChange={(e) => setTargetTaskId(e.target.value)}
                placeholder="Enter Task ObjectId"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>New Status:</label>
              <select value={taskStatusUpdate} onChange={(e) => setTaskStatusUpdate(e.target.value as TaskStatus)} style={{ width: '100%', padding: '8px' }}>
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Outcome Notes:</label>
              <textarea
                value={outcomeNotes}
                onChange={(e) => setOutcomeNotes(e.target.value)}
                placeholder="Notes on task completion outcome..."
                style={{ width: '100%', padding: '8px', minHeight: '50px' }}
              />
            </div>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
          </form>

          <form onSubmit={handleAddTaskComment}>
            <h3>Post Task Comment</h3>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Task ID:</label>
              <input
                type="text"
                required
                value={targetTaskId}
                onChange={(e) => setTargetTaskId(e.target.value)}
                placeholder="Enter Task ObjectId"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Message:</label>
              <textarea
                required
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                placeholder="Type your comment or question..."
                style={{ width: '100%', padding: '8px', minHeight: '50px' }}
              />
            </div>
            <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px' }}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
