import React, { useState } from 'react';
import { AssessmentCategory, AssessmentStatus, LearningLevel } from '../../types/assessment.types';
import { createAssessmentApi, createSelfEvaluationApi, createPeerReviewApi } from '../../services/assessment.api';

interface AssessmentManagerProps {
  token: string;
  studentId: string;
  initialTab?: 'ASSESSMENT' | 'SELF_EVAL' | 'PEER_REVIEW';
}

export const AssessmentManager: React.FC<AssessmentManagerProps> = ({ token, studentId, initialTab = 'ASSESSMENT' }) => {
  const [activeTab, setActiveTab] = useState<'ASSESSMENT' | 'SELF_EVAL' | 'PEER_REVIEW'>(initialTab);

  // Assessment Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AssessmentCategory>('ACADEMIC');
  const [score, setScore] = useState(80);
  const [evaluatedLevel, setEvaluatedLevel] = useState<LearningLevel>('LEVEL_1');
  const [status, setStatus] = useState<AssessmentStatus>('COMPLETED');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Self Evaluation State
  const [confidenceRating, setConfidenceRating] = useState(4);
  const [learningGoals, setLearningGoals] = useState('');

  // Peer Review State
  const [collaborationScore, setCollaborationScore] = useState(5);
  const [helpfulnessScore, setHelpfulnessScore] = useState(4);
  const [positiveFeedback, setPositiveFeedback] = useState('');

  // UI Feedback State
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createAssessmentApi(
        studentId,
        {
          title,
          category,
          score,
          evaluatedLevel: status === 'COMPLETED' ? evaluatedLevel : undefined,
          status,
          feedback
        },
        token
      );

      if (response.success) {
        setMessage({
          type: 'success',
          text: `Assessment created successfully! ${response.data?.levelUpdated ? 'Student learning level updated!' : ''}`
        });
        setTitle('');
        setFeedback('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to create assessment' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelfEvalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createSelfEvaluationApi(
        studentId,
        { confidenceRating, learningGoals },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: 'Self evaluation submitted successfully!' });
        setLearningGoals('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to submit self evaluation' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePeerReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await createPeerReviewApi(
        studentId,
        { collaborationScore, helpfulnessScore, positiveFeedback },
        token
      );

      if (response.success) {
        setMessage({ type: 'success', text: 'Peer review submitted successfully!' });
        setPositiveFeedback('');
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to submit peer review' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem' }}>
      <h2>Student Evaluation & Assessment Manager</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('ASSESSMENT'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'ASSESSMENT' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Teacher Assessment
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('SELF_EVAL'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'SELF_EVAL' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Self Evaluation
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('PEER_REVIEW'); setMessage(null); }}
          style={{ fontWeight: activeTab === 'PEER_REVIEW' ? 'bold' : 'normal', padding: '6px 12px' }}
        >
          Peer Review
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

      {/* Tab 1: Teacher Assessment */}
      {activeTab === 'ASSESSMENT' && (
        <form onSubmit={handleAssessmentSubmit}>
          <h3>Conduct Student Assessment</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Assessment Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Mathematics Assessment"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as AssessmentCategory)} style={{ width: '100%', padding: '8px' }}>
              <option value="ACADEMIC">Academic</option>
              <option value="VOCATIONAL">Vocational</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="COMPREHENSIVE">Comprehensive</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Score (0-100):</label>
            <input
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as AssessmentStatus)} style={{ width: '100%', padding: '8px' }}>
              <option value="COMPLETED">COMPLETED (Evaluates Level)</option>
              <option value="DRAFT">DRAFT (Save Draft Only)</option>
            </select>
          </div>

          {status === 'COMPLETED' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block' }}>Evaluated Learning Level:</label>
              <select value={evaluatedLevel} onChange={(e) => setEvaluatedLevel(e.target.value as LearningLevel)} style={{ width: '100%', padding: '8px' }}>
                <option value="LEVEL_1">Level 1 (Beginner)</option>
                <option value="LEVEL_2">Level 2 (Intermediate)</option>
                <option value="LEVEL_3">Level 3 (Advanced)</option>
                <option value="ADVANCED">Advanced Mastery</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Feedback / Notes:</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback..."
              style={{ width: '100%', padding: '8px', minHeight: '60px' }}
            />
          </div>

          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Submitting...' : 'Save Assessment'}
          </button>
        </form>
      )}

      {/* Tab 2: Self Evaluation */}
      {activeTab === 'SELF_EVAL' && (
        <form onSubmit={handleSelfEvalSubmit}>
          <h3>Student Self Evaluation</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Confidence Rating (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={confidenceRating}
              onChange={(e) => setConfidenceRating(Number(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Learning Goals:</label>
            <textarea
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              placeholder="What do you want to achieve next?"
              style={{ width: '100%', padding: '8px', minHeight: '60px' }}
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#008000', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Self Evaluation'}
          </button>
        </form>
      )}

      {/* Tab 3: Peer Review */}
      {activeTab === 'PEER_REVIEW' && (
        <form onSubmit={handlePeerReviewSubmit}>
          <h3>Submit Peer Review</h3>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Collaboration Score (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={collaborationScore}
              onChange={(e) => setCollaborationScore(Number(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Helpfulness Score (1-5):</label>
            <input
              type="number"
              min="1"
              max="5"
              value={helpfulnessScore}
              onChange={(e) => setHelpfulnessScore(Number(e.target.value))}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Positive Feedback:</label>
            <textarea
              required
              value={positiveFeedback}
              onChange={(e) => setPositiveFeedback(e.target.value)}
              placeholder="What did your peer do well?"
              style={{ width: '100%', padding: '8px', minHeight: '60px' }}
            />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 16px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px' }}>
            {isSubmitting ? 'Submitting...' : 'Submit Peer Review'}
          </button>
        </form>
      )}
    </div>
  );
};
