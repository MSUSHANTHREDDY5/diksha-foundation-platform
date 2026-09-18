import React, { useState } from 'react';
import {
  DashboardData,
  StudentAnalyticsData,
  ProgramAnalyticsData,
  AssessmentAnalyticsData,
  StudentReportItem,
  ProgramReportItem
} from '../../types/admin.types';
import {
  fetchAdminDashboard,
  fetchStudentAnalytics,
  fetchProgramAnalytics,
  fetchAssessmentAnalytics,
  fetchStudentReports,
  fetchProgramReports
} from '../../services/admin.api';

interface AdminDashboardProps {
  token?: string;
  initialTab?: 'DASHBOARD' | 'STUDENT_ANALYTICS' | 'PROGRAM_ANALYTICS' | 'REPORTS';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token = '', initialTab = 'DASHBOARD' }) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'STUDENT_ANALYTICS' | 'PROGRAM_ANALYTICS' | 'REPORTS'>(initialTab);

  // Filters
  const [centreFilter, setCentreFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [programAnalytics, setProgramAnalytics] = useState<ProgramAnalyticsData | null>(null);
  const [assessmentAnalytics, setAssessmentAnalytics] = useState<AssessmentAnalyticsData | null>(null);
  const [studentReports, setStudentReports] = useState<StudentReportItem[]>([]);
  const [programReports, setProgramReports] = useState<ProgramReportItem[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminDashboard(token, centreFilter);
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchStudentAnalytics(token, {
        centre: centreFilter || undefined,
        learningLevel: levelFilter || undefined,
        status: statusFilter || undefined
      });
      if (res.success && res.data) {
        setStudentAnalytics(res.data);
      } else {
        setError(res.message || 'Failed to fetch student analytics');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProgramAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pRes, aRes] = await Promise.all([
        fetchProgramAnalytics(token, { category: categoryFilter || undefined, status: statusFilter || undefined }),
        fetchAssessmentAnalytics(token, { category: categoryFilter || undefined })
      ]);
      if (pRes.success && pRes.data) {
        setProgramAnalytics(pRes.data);
      }
      if (aRes.success && aRes.data) {
        setAssessmentAnalytics(aRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sRes, pRes] = await Promise.all([
        fetchStudentReports(token, { centre: centreFilter || undefined, learningLevel: levelFilter || undefined }),
        fetchProgramReports(token, { category: categoryFilter || undefined })
      ]);
      if (sRes.success && sRes.data) {
        setStudentReports(sRes.data.reports);
      }
      if (pRes.success && pRes.data) {
        setProgramReports(pRes.data.reports);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'left', border: '1px solid #ccc', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fafafa' }}>
      <h2>Admin Dashboard & Analytics Platform</h2>

      {/* Nav Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('DASHBOARD'); setError(null); loadDashboard(); }}
          style={{ fontWeight: activeTab === 'DASHBOARD' ? 'bold' : 'normal', padding: '8px 14px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Overview Dashboard
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('STUDENT_ANALYTICS'); setError(null); loadStudentAnalytics(); }}
          style={{ fontWeight: activeTab === 'STUDENT_ANALYTICS' ? 'bold' : 'normal', padding: '8px 14px', background: '#008000', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Student Analytics
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('PROGRAM_ANALYTICS'); setError(null); loadProgramAnalytics(); }}
          style={{ fontWeight: activeTab === 'PROGRAM_ANALYTICS' ? 'bold' : 'normal', padding: '8px 14px', background: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Program & Assessment Analytics
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('REPORTS'); setError(null); loadReports(); }}
          style={{ fontWeight: activeTab === 'REPORTS' ? 'bold' : 'normal', padding: '8px 14px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          Reports & Insights
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{ padding: '10px', marginBottom: '1rem', borderRadius: '4px', backgroundColor: '#ffebe9', color: '#cf222e', border: '1px solid #ffc0c0' }}>
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && <div style={{ padding: '1rem', color: '#666' }}>Loading data from server...</div>}

      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'DASHBOARD' && (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label>Filter by Centre:</label>
            <input
              type="text"
              value={centreFilter}
              onChange={(e) => setCentreFilter(e.target.value)}
              placeholder="e.g. Delhi Centre"
              style={{ padding: '6px' }}
            />
            <button type="button" onClick={loadDashboard} style={{ padding: '6px 12px' }}>Apply Filter</button>
          </div>

          {dashboardData && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <h4>Total Students</h4>
                  <p style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: 'bold' }}>{dashboardData.overview.totalStudents}</p>
                  <small style={{ color: '#666' }}>Active: {dashboardData.overview.activeStudents}</small>
                </div>
                <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <h4>Total Programs</h4>
                  <p style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: 'bold' }}>{dashboardData.overview.totalPrograms}</p>
                  <small style={{ color: '#666' }}>Active: {dashboardData.overview.activePrograms}</small>
                </div>
                <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <h4>Completed Assessments</h4>
                  <p style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: 'bold' }}>{dashboardData.overview.completedAssessments}</p>
                  <small style={{ color: '#666' }}>Total: {dashboardData.overview.totalAssessments}</small>
                </div>
                <div style={{ padding: '1rem', background: '#fff', border: '1px solid #ddd', borderRadius: '6px' }}>
                  <h4>Overdue Tasks</h4>
                  <p style={{ fontSize: '1.8rem', margin: '4px 0', fontWeight: 'bold', color: '#cf222e' }}>{dashboardData.overview.overdueTasks}</p>
                  <small style={{ color: '#666' }}>Completed: {dashboardData.overview.completedTasks}</small>
                </div>
              </div>

              <h3>Learning Level Distribution</h3>
              <ul>
                {Object.entries(dashboardData.learningLevelDistribution).map(([lvl, count]) => (
                  <li key={lvl}><strong>{lvl}:</strong> {count} students</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Student Analytics */}
      {activeTab === 'STUDENT_ANALYTICS' && (
        <div>
          <h3>Holistic Student Analytics</h3>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block' }}>Centre Filter:</label>
              <input
                type="text"
                value={centreFilter}
                onChange={(e) => setCentreFilter(e.target.value)}
                placeholder="e.g. Delhi Centre"
                style={{ padding: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block' }}>Learning Level:</label>
              <input
                type="text"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                placeholder="e.g. L1_BASIC"
                style={{ padding: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block' }}>Student Status:</label>
              <input
                type="text"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="ACTIVE / INACTIVE"
                style={{ padding: '6px' }}
              />
            </div>
            <button type="button" onClick={loadStudentAnalytics} style={{ padding: '6px 12px', marginTop: '16px' }}>Apply Filters</button>
          </div>

          {studentAnalytics ? (
            <div>
              <p><strong>Total Students Analyzed:</strong> {studentAnalytics.totalStudents}</p>
              <p><strong>Average Assessment Score:</strong> {studentAnalytics.academicOverview.averageAssessmentScore}%</p>
              <p><strong>Average Progress Academic Score:</strong> {studentAnalytics.academicOverview.averageProgressAcademicScore}%</p>

              <h4>Health & Physical Metrics Overview</h4>
              <p>Average Height: {studentAnalytics.healthOverview.averageHeightCm} cm</p>
              <p>Average Weight: {studentAnalytics.healthOverview.averageWeightKg} kg</p>

              <h4>Social-Emotional Rating Overview (1-5 Scale)</h4>
              <p>Average Teamwork Rating: {studentAnalytics.socialEmotionalOverview.averageTeamworkRating}</p>
              <p>Average Communication Rating: {studentAnalytics.socialEmotionalOverview.averageCommunicationRating}</p>
            </div>
          ) : (
            <p>Click "Student Analytics" or "Apply Filters" to load dataset metrics.</p>
          )}
        </div>
      )}

      {/* Tab 3: Program & Assessment Analytics */}
      {activeTab === 'PROGRAM_ANALYTICS' && (
        <div>
          <h3>Program & Assessment Performance</h3>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block' }}>Program Category:</label>
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="ACADEMIC / SPORTS / ART"
                style={{ padding: '6px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', display: 'block' }}>Program Status:</label>
              <input
                type="text"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="ACTIVE / COMPLETED"
                style={{ padding: '6px' }}
              />
            </div>
            <button type="button" onClick={loadProgramAnalytics} style={{ padding: '6px 12px', marginTop: '16px' }}>Apply Filters</button>
          </div>

          {programAnalytics && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4>Program Enrollment & Task Completion</h4>
              <p>Completed Enrollments: {programAnalytics.enrollmentStatusSummary.COMPLETED || 0}</p>
              <p>Completed Tasks: {programAnalytics.taskStatusSummary.COMPLETED || 0}</p>
              <p>Overdue Tasks: {programAnalytics.taskStatusSummary.OVERDUE || 0}</p>
            </div>
          )}

          {assessmentAnalytics && (
            <div>
              <h4>Assessment Outcome Overview</h4>
              <p>Total Completed Assessments: {assessmentAnalytics.statusBreakdown.COMPLETED || 0}</p>
              <p>Average Completed Assessment Score: {assessmentAnalytics.averageScore}%</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Reports */}
      {activeTab === 'REPORTS' && (
        <div>
          <h3>Derived Administrative Reports</h3>

          <h4>Student Summary Reports</h4>
          {studentReports.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Code</th>
                  <th style={{ padding: '6px' }}>Name</th>
                  <th style={{ padding: '6px' }}>Centre</th>
                  <th style={{ padding: '6px' }}>Level</th>
                  <th style={{ padding: '6px' }}>Assessments</th>
                  <th style={{ padding: '6px' }}>Avg Score</th>
                  <th style={{ padding: '6px' }}>Programs</th>
                  <th style={{ padding: '6px' }}>Tasks Done</th>
                </tr>
              </thead>
              <tbody>
                {studentReports.map((item) => (
                  <tr key={item.studentId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '6px' }}>{item.studentCode}</td>
                    <td style={{ padding: '6px' }}>{item.name}</td>
                    <td style={{ padding: '6px' }}>{item.centre}</td>
                    <td style={{ padding: '6px' }}>{item.learningLevel}</td>
                    <td style={{ padding: '6px' }}>{item.assessmentCount}</td>
                    <td style={{ padding: '6px' }}>{item.averageAssessmentScore}%</td>
                    <td style={{ padding: '6px' }}>{item.enrolledProgramCount}</td>
                    <td style={{ padding: '6px' }}>{item.completedTaskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No student reports available.</p>
          )}

          <h4>Program Summary Reports</h4>
          {programReports.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '6px' }}>Title</th>
                  <th style={{ padding: '6px' }}>Category</th>
                  <th style={{ padding: '6px' }}>Target Level</th>
                  <th style={{ padding: '6px' }}>Status</th>
                  <th style={{ padding: '6px' }}>Enrolled</th>
                  <th style={{ padding: '6px' }}>Activities Done</th>
                </tr>
              </thead>
              <tbody>
                {programReports.map((item) => (
                  <tr key={item.programId} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '6px' }}>{item.title}</td>
                    <td style={{ padding: '6px' }}>{item.category}</td>
                    <td style={{ padding: '6px' }}>{item.targetLevel}</td>
                    <td style={{ padding: '6px' }}>{item.status}</td>
                    <td style={{ padding: '6px' }}>{item.totalEnrolled}</td>
                    <td style={{ padding: '6px' }}>{item.completedActivities} / {item.totalActivities}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No program reports available.</p>
          )}
        </div>
      )}
    </div>
  );
};
