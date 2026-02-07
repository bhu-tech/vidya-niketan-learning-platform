
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { classAPI, userAPI, feeAPI, resultAPI } from '../utils/api';
import '../components/JitsiMeeting';
import '../styles/StudentDashboard.css';

// Leave Meeting handler for students
const handleLeaveMeeting = async (classId) => {
  const authToken = localStorage.getItem('token');
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/end-session`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    if (response.ok) {
      alert('You have left the meeting.');
      // Optionally refresh state or UI here
    } else {
      alert(data.error || 'Failed to leave meeting');
    }
  } catch (err) {
    alert('Failed to leave meeting');
  }
};

const StudentDashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [feeDetails, setFeeDetails] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [myResults, setMyResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [liveClasses, setLiveClasses] = useState([]);
  // const [activeJitsiClass, setActiveJitsiClass] = useState(null);

  useEffect(() => {
    fetchClasses();
    checkLiveClasses();
    // Poll for live classes every 30 seconds
    const interval = setInterval(checkLiveClasses, 30000);
    // Poll for meeting end every 10 seconds
    const meetingPoll = setInterval(() => {
      liveClasses.forEach(lc => {
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${lc.classId}/session-status`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(res => res.json())
        .then(data => {
          setMeetingActive(prev => ({ ...prev, [lc.classId]: data.active }));
          if (!data.active) {
            alert('Meeting has ended by teacher.');
            // Optionally redirect or close meeting window
          }
        })
        .catch(() => {});
      });
    }, 10000);
    return () => {
      clearInterval(interval);
      clearInterval(meetingPoll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, liveClasses]);

  const fetchFeeDetails = async () => {
    try {
      setFeeLoading(true);
      const data = await feeAPI.getByStudent(user._id || user.id);
      setFeeDetails(data);
    } catch (error) {
      console.error('Error fetching fee details:', error);
    } finally {
      setFeeLoading(false);
    }
  };

  const fetchMyResults = async () => {
    try {
      setResultsLoading(true);
      const data = await resultAPI.getMyResults();
      setMyResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setResultsLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await classAPI.getAll();
      setClasses(data);
      setEnrolledClasses(user?.enrolledClasses?.map(c => typeof c === 'object' ? c._id : c) || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLiveClasses = async () => {
    try {
      const enrolledClassIds = user?.enrolledClasses?.map(c => typeof c === 'object' ? c._id : c) || [];
      
      const liveChecks = await Promise.all(
        enrolledClassIds.map(async (classId) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/live-status`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              return { classId, ...data };
            }
          } catch (err) {
            console.error('Error checking live status:', err);
          }
          return null;
        })
      );

      const live = liveChecks.filter(c => c && c.isLive);
      setLiveClasses(live);
    } catch (error) {
      console.error('Error checking live classes:', error);
    }
  };

  const isClassLive = (classData) => {
    if (!classData || !classData.schedule || !classData.zoomJoinUrl) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check frequency
    if (classData.schedule.frequency === 'once') {
      const classDate = new Date(classData.schedule.date);
      const isSameDay = classDate.toDateString() === now.toDateString();
      return isSameDay && currentTime >= classData.schedule.startTime && currentTime <= classData.schedule.endTime;
    }

    if (classData.schedule.frequency === 'daily') {
      return currentTime >= classData.schedule.startTime && currentTime <= classData.schedule.endTime;
    }

    if (classData.schedule.frequency === 'custom' && classData.schedule.customDays?.includes(currentDay)) {
      return currentTime >= classData.schedule.startTime && currentTime <= classData.schedule.endTime;
    }

    return false;
  };

  const handleJoinLiveClass = async (classId) => {
    const liveClass = liveClasses.find(lc => lc.classId === classId);
    if (liveClass) {
      try {
        const authToken = localStorage.getItem('token');
        // Get user info to check if teacher
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isTeacher = user?.role === 'teacher';
        let joinToken = null;
        let configUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/jitsi-config`;
        if (!isTeacher) {
          // Request join token for student
          const tokenResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/request-join-token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) {
            throw new Error(tokenData.error || 'Failed to request join token');
          }
          joinToken = tokenData.token;
          configUrl = `${configUrl}?token=${joinToken}`;
        }
        // Now fetch Jitsi config
        const response = await fetch(configUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        const config = await response.json();
        if (!response.ok) {
          throw new Error(config.error || 'Failed to load meeting configuration');
        }
        if (!config.isLive) {
          alert('This class is not currently live. Please wait for the teacher to start the class.');
          return;
        }
        const domain = config.domain || 'meet.jit.si';
        const roomName = config.roomName;
        const password = config.password || '';
        const displayName = encodeURIComponent(config.userInfo?.displayName || 'User');
        const url = `https://${domain}/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.lobbyEnabled=true&roomPassword="${password}"`;
        window.open(url, '_blank', 'noopener,noreferrer,width=1200,height=800');
      } catch (err) {
        alert(err.message || 'Failed to open meeting');
      }
    }
  };

  const handleEnroll = async (classId) => {
    try {
      setEnrolling(classId);
      await classAPI.enrollClass(classId);
      
      // Refresh user profile to get updated enrolledClasses
      const updatedUser = await userAPI.getProfile();
      if (setUser) {
        setUser(updatedUser);
      }
      
      // Update local state immediately
      const newEnrolledClasses = updatedUser.enrolledClasses?.map(c => typeof c === 'object' ? c._id : c) || [];
      setEnrolledClasses(newEnrolledClasses);
      
      alert('Successfully enrolled in class!');
    } catch (error) {
      console.error('Error enrolling in class:', error);
      const errorMsg = error.message || 'Failed to enroll in class. Please try again.';
      alert(errorMsg);
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const enrolledClassNames = classes
    .filter(c => enrolledClasses.includes(c._id))
    .map(c => c.title);
  const primaryClass = enrolledClassNames[0] || 'No Class Enrolled';
  const extraClassCount = enrolledClassNames.length > 1 ? enrolledClassNames.length - 1 : 0;

  return (
    <div className="student-dashboard">
      <header className="student-welcome-header">
        <div className="welcome-content">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Your Student Dashboard</p>
        </div>
        <div className="student-header-actions">
          <button
            className="btn-edit-profile"
            onClick={() => navigate('/student-profile')}
            title="Edit Profile"
          >
            ✏️ Edit Profile
          </button>
          <div className="student-profile-card">
          <div className="student-photo">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user?.name} />
            ) : (
              <div className="photo-placeholder">🎓</div>
            )}
          </div>
          <div className="student-info">
              {user?.phone && <p className="phone">📱 {user.phone}</p>}
            <p className="class-badge">
              {primaryClass}
              {extraClassCount > 0 && <span className="class-count"> +{extraClassCount} more</span>}
            </p>
          </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'classes' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setActiveTab('classes')}
          >
            📚 My Classes
          </button>
          <button 
            className={activeTab === 'fees' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => {
              setActiveTab('fees');
              if (feeDetails.length === 0) {
                fetchFeeDetails();
              }
            }}
          >
            💰 My Fee
          </button>
          <button 
            className={activeTab === 'results' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => {
              setActiveTab('results');
              if (myResults.length === 0) {
                fetchMyResults();
              }
            }}
          >
            📊 My Results
          </button>
        </div>

        {activeTab === 'classes' && (
          <>
            <section className="enrolled-section">
              <h2>📚 My Classes</h2>
              
              {liveClasses.length > 0 && (
                <div className="live-class-alert">
                  <h3>🔴 {liveClasses.length} Class{liveClasses.length > 1 ? 'es' : ''} Live Now!</h3>
                  <div className="live-classes-buttons">
                    {liveClasses.map(lc => {
                      const cls = classes.find(c => c._id === lc.classId);
                      return cls ? (
                        <div key={lc.classId} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            className="btn-join-live"
                            onClick={() => handleJoinLiveClass(lc.classId)}
                          >
                            🎥 Join {cls.title}
                          </button>
                          <button
                            className="btn-leave-meeting"
                            style={{ background: '#e57373', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}
                            onClick={() => handleLeaveMeeting(lc.classId)}
                          >
                            🚪 Leave Meeting
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {enrolledClasses.length > 0 ? (
            <div className="classes-grid">
              {classes.filter(c => enrolledClasses.includes(c._id)).map(cls => {
                const isLive = isClassLive(cls);
                return (
                  <div key={cls._id} className={`class-card ${isLive ? 'live-class' : ''}`}>
                    {isLive && <div className="live-badge">🔴 LIVE NOW</div>}
                    <h3>{cls.title}</h3>
                    <p>{cls.description}</p>
                    <p><strong>Teacher:</strong> {cls.teacher.name}</p>
                    <p><strong>Students:</strong> {cls.students.length}</p>
                    {cls.schedule && (
                      <div className="schedule-info">
                        <p><strong>Time:</strong> {cls.schedule.startTime} - {cls.schedule.endTime}</p>
                        {cls.schedule.frequency === 'daily' && <p className="frequency-tag">📅 Daily</p>}
                        {cls.schedule.frequency === 'custom' && cls.schedule.customDays?.length > 0 && (
                          <p className="frequency-tag">📅 {cls.schedule.customDays.join(', ')}</p>
                        )}
                      </div>
                    )}
                    <div className="class-actions">
                      {isLive ? (
                        <button 
                          className="btn btn-live"
                          onClick={() => handleJoinLiveClass(cls._id)}
                        >
                          🎥 Join Live Class
                        </button>
                      ) : (
                        <a href={`/class/${cls._id}`} className="btn">View Class</a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
              ) : (
                <p>You haven't enrolled in any classes yet.</p>
              )}
            </section>

            <section className="available-section">
              <h2>🎓 Available Classes</h2>
              <div className="classes-grid">
                {classes.filter(c => !enrolledClasses.includes(c._id)).map(cls => (
              <div key={cls._id} className="class-card">
                <h3>{cls.title}</h3>
                <p>{cls.description}</p>
                <p><strong>Teacher:</strong> {cls.teacher.name}</p>
                <p><strong>Students:</strong> {cls.students.length}</p>
                <button 
                  className="btn-enroll"
                  onClick={() => handleEnroll(cls._id)}
                  disabled={enrolling === cls._id}
                >
                  {enrolling === cls._id ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            ))}
          </div>
        </section>
          </>
        )}

        {activeTab === 'fees' && (
          <section className="fees-section">
            <h2>💰 My Fee Details</h2>
            {feeLoading ? (
              <div className="loading">Loading fee details...</div>
            ) : feeDetails.length > 0 ? (
              <div className="fees-list">
                {feeDetails.map((fee, idx) => {
                  const remaining = (fee.feeToBeDeposited || 0) - (fee.feeSubmitted || 0);
                  return (
                    <div key={idx} className="fee-card">
                      <h3>{fee.student?.name || 'Student'}</h3>
                      <div className="fee-details-grid">
                        <div className="fee-item">
                          <label>Total Course Fee:</label>
                          <p className="amount">₹ {fee.feeToBeDeposited || 0}</p>
                        </div>
                        <div className="fee-item">
                          <label>Fee Paid:</label>
                          <p className="amount paid">₹ {fee.feeSubmitted || 0}</p>
                        </div>
                        <div className="fee-item">
                          <label>Fee Remaining:</label>
                          <p className="amount remaining">₹ {Math.max(0, remaining)}</p>
                        </div>
                        <div className="fee-item">
                          <label>Gift Voucher Used:</label>
                          <p className="amount">₹ {fee.giftVoucherUsed || 0}</p>
                        </div>
                        <div className="fee-item">
                          <label>Reference Incentive Gained:</label>
                          <p className="amount">₹ {fee.referenceIncentive || 0}</p>
                        </div>
                        <div className="fee-item">
                          <label>Grade:</label>
                          <p className="grade">{fee.grade || 'N/A'}</p>
                        </div>
                      </div>
                      {fee.fatherName && (
                        <p className="additional-info"><strong>Father's Name:</strong> {fee.fatherName}</p>
                      )}
                      {fee.dateOfJoining && (
                        <p className="additional-info"><strong>Date of Joining:</strong> {new Date(fee.dateOfJoining).toLocaleDateString()}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No fee records found.</p>
            )}
          </section>
        )}

        {activeTab === 'results' && (
          <section className="results-section">
            <h2>📊 My Academic Results</h2>
            {resultsLoading ? (
              <div className="loading">Loading results...</div>
            ) : myResults.length > 0 ? (
              <>
                <div className="results-summary">
                  <div className="summary-card">
                    <div className="summary-icon">📚</div>
                    <div className="summary-content">
                      <h3>Total Subjects</h3>
                      <p className="summary-value">{new Set(myResults.map(r => r.subject)).size}</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">📈</div>
                    <div className="summary-content">
                      <h3>Average Percentage</h3>
                      <p className="summary-value">
                        {(myResults.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / myResults.length).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <div className="summary-icon">🏆</div>
                    <div className="summary-content">
                      <h3>Total Assessments</h3>
                      <p className="summary-value">{myResults.length}</p>
                    </div>
                  </div>
                </div>

                <div className="results-cards-grid">
                  {myResults.map(result => (
                    <div key={result._id} className="result-card">
                      <div className="result-header">
                        <h3>{result.subject}</h3>
                        <span className={`grade-badge-large grade-${result.grade.replace('+', 'plus')}`}>
                          {result.grade}
                        </span>
                      </div>
                      <div className="result-body">
                        <div className="result-info-row">
                          <span className="label">Class:</span>
                          <span className="value">{result.class?.title}</span>
                        </div>
                        <div className="result-info-row">
                          <span className="label">Exam Type:</span>
                          <span className="value exam-type">{result.examType}</span>
                        </div>
                        <div className="result-info-row">
                          <span className="label">Marks:</span>
                          <span className="value marks">{result.marksObtained}/{result.maxMarks}</span>
                        </div>
                        <div className="result-percentage-bar">
                          <div className="percentage-label">
                            <span>Percentage</span>
                            <span className="percentage-value">{result.percentage}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{width: `${result.percentage}%`}}
                            ></div>
                          </div>
                        </div>
                        {result.remarks && (
                          <div className="result-remarks">
                            <strong>Remarks:</strong> {result.remarks}
                          </div>
                        )}
                        <div className="result-footer">
                          <span className="published-by">
                            📝 Published by {result.publishedBy?.name}
                          </span>
                          <span className="published-date">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results-message">
                <p>📋 No results published yet. Check back later!</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Jitsi Meeting Modal */}
      {/* JitsiMeeting modal removed, meeting opens directly in new window */}
    </div>
  );
};

export default StudentDashboard;
