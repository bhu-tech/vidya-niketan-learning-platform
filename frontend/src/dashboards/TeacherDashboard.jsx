import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { classAPI } from '../utils/api';
import TeacherNotificationPanel from '../components/TeacherNotificationPanel';
import JitsiMeeting from '../components/JitsiMeeting';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myClasses, setMyClasses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('classes');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule: {
      date: '',
      startTime: '',
      endTime: '',
      frequency: 'once',
      customDays: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [liveClasses, setLiveClasses] = useState([]);
  const [activeJitsiClass, setActiveJitsiClass] = useState(null);
  const [startingLive, setStartingLive] = useState(null);

  useEffect(() => {
    checkLiveClasses();
    // Poll for live status every 30 seconds
    const interval = setInterval(checkLiveClasses, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myClasses]);

  useEffect(() => {
    fetchMyClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const fetchMyClasses = async () => {
    try {
      const data = await classAPI.getAll();
      setMyClasses(data.filter(c => c.teacher._id === user?._id));
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLiveClasses = async () => {
    try {
      const liveChecks = await Promise.all(
        myClasses.map(async (cls) => {
          try {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${cls._id}/live-status`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              return { classId: cls._id, ...data };
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

  const handleStartLive = async (classId, className) => {
    try {
      setStartingLive(classId);
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/start-live`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start live class');
      }

      await checkLiveClasses();
      alert(`${className} is now LIVE! Students can join.`);
      
      // Auto-join the meeting as teacher
      setActiveJitsiClass(classId);
    } catch (error) {
      console.error('Error starting live:', error);
      alert(error.message || 'Failed to start live class');
    } finally {
      setStartingLive(null);
    }
  };

  const handleEndLive = async (classId, className) => {
    const confirmed = window.confirm(`End live class "${className}"?\n\nStudents will no longer be able to join.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/end-live`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to end live class');
      }

      await checkLiveClasses();
      alert(`${className} has ended.`);
    } catch (error) {
      console.error('Error ending live:', error);
      alert(error.message || 'Failed to end live class');
    }
  };

  const isClassLive = (classId) => {
    return liveClasses.some(lc => lc.classId === classId);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await classAPI.create(formData);
      fetchMyClasses();
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        schedule: { date: '', startTime: '', endTime: '', frequency: 'once', customDays: [] }
      });
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleDeleteClass = async (classId, className) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${className}"?\n\nThis will permanently remove:\n- All class materials\n- Student enrollments\n- Zoom meeting links\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await classAPI.delete(classId);
      alert('Class deleted successfully!');
      fetchMyClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Failed to delete class. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="teacher-dashboard">
      <header className="teacher-welcome-header">
        <div className="welcome-content">
          <h1>Welcome, {user?.name}!</h1>
          <p>Teacher Dashboard</p>
        </div>
        <div className="teacher-header-actions">
          <button 
            className="btn-edit-profile"
            onClick={() => navigate('/teacher-profile')}
            title="Edit Profile"
          >
            ✏️ Edit Profile
          </button>
          <div className="teacher-profile-card">
            <div className="teacher-photo">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name} />
              ) : (
                <div className="photo-placeholder">👨‍🏫</div>
              )}
            </div>
            <div className="teacher-info">
              {user?.phone && <p className="phone">📱 {user.phone}</p>}
              {user?.designation && <p className="designation">{user.designation}</p>}
              {!user?.designation && <p className="designation">Teacher</p>}
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="teacher-tabs-nav">
          <button 
            className={activeTab === 'classes' ? 'active' : ''}
            onClick={() => setActiveTab('classes')}
          >
            📚 My Classes
          </button>

          <button 
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            📢 Notifications
          </button>
        </div>

        {activeTab === 'classes' && (
          <>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : '+ Create New Class'}
            </button>

            {showCreateForm && (
              <form className="create-form" onSubmit={handleCreateClass}>
                <input
                  type="text"
                  placeholder="Class Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Class Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <input
                  type="date"
                  value={formData.schedule.date}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: {...formData.schedule, date: e.target.value}
                  })}
                  required
                />
                <input
                  type="time"
                  placeholder="Start Time"
                  value={formData.schedule.startTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: {...formData.schedule, startTime: e.target.value}
                  })}
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={formData.schedule.endTime}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: {...formData.schedule, endTime: e.target.value}
                  })}
                />
                
                <label className="form-label">Class Frequency:</label>
                <select
                  value={formData.schedule.frequency}
                  onChange={(e) => setFormData({
                    ...formData,
                    schedule: {...formData.schedule, frequency: e.target.value, customDays: []}
                  })}
                  className="frequency-select"
                >
                  <option value="once">One-time Class</option>
                  <option value="daily">Daily</option>
                  <option value="custom">Custom Days</option>
                </select>

                {formData.schedule.frequency === 'custom' && (
                  <div className="custom-days-selector">
                    <label className="form-label">Select Days:</label>
                    <div className="days-checkboxes">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="day-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.schedule.customDays.includes(day)}
                            onChange={(e) => {
                              const days = e.target.checked
                                ? [...formData.schedule.customDays, day]
                                : formData.schedule.customDays.filter(d => d !== day);
                              setFormData({
                                ...formData,
                                schedule: {...formData.schedule, customDays: days}
                              });
                            }}
                          />
                          <span>{day.substring(0, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button type="submit" className="btn-submit">Create Class</button>
              </form>
            )}

            <section className="my-classes-section">
              <h2>📚 My Classes</h2>
              {myClasses.length > 0 ? (
                <div className="classes-grid">
                  {myClasses.map(cls => {
                    const isLive = isClassLive(cls._id);
                    return (
                    <div key={cls._id} className={`class-card ${isLive ? 'live-class' : ''}`}>
                      {isLive && <div className="live-badge">🔴 LIVE NOW</div>}
                      <h3>{cls.title}</h3>
                      <p>{cls.description}</p>
                      <p><strong>Students Enrolled:</strong> {cls.students.length}</p>
                      <p><strong>Start Date:</strong> {new Date(cls.schedule.date).toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {cls.schedule.startTime} - {cls.schedule.endTime}</p>
                      {cls.jitsiRoomName && (
                        <p className="meeting-info">🎥 Meeting Room: {cls.jitsiRoomName}</p>
                      )}
                      {cls.schedule.frequency === 'daily' && (
                        <p className="frequency-badge daily">📅 Daily</p>
                      )}
                      {cls.schedule.frequency === 'custom' && cls.schedule.customDays?.length > 0 && (
                        <p className="frequency-badge custom">
                          📅 {cls.schedule.customDays.join(', ')}
                        </p>
                      )}
                      {cls.schedule.frequency === 'once' && (
                        <p className="frequency-badge once">📅 One-time</p>
                      )}
                      
                      <div className="class-card-actions">
                        {isLive ? (
                          <>
                            <button
                              onClick={() => setActiveJitsiClass(cls._id)}
                              className="btn btn-live-join"
                            >
                              🎥 Join Live Class
                            </button>
                            <button
                              onClick={() => handleEndLive(cls._id, cls.title)}
                              className="btn btn-end-live"
                            >
                              ⏹️ End Live
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleStartLive(cls._id, cls.title)}
                            className="btn btn-start-live"
                            disabled={startingLive === cls._id}
                          >
                            {startingLive === cls._id ? '⏳ Starting...' : '▶️ Start Live'}
                          </button>
                        )}
                        <a href={`/class/${cls._id}`} className="btn btn-manage">Manage Class</a>
                        <button 
                          onClick={() => handleDeleteClass(cls._id, cls.title)}
                          className="btn btn-delete"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <p>You haven't created any classes yet.</p>
              )}
            </section>
          </>
        )}

        {activeTab === 'notifications' && (
          <TeacherNotificationPanel myClasses={myClasses} />
        )}
      </div>

      {/* Jitsi Meeting Modal */}
      {activeJitsiClass && (
        <JitsiMeeting
          classId={activeJitsiClass}
          onClose={() => {
            setActiveJitsiClass(null);
            checkLiveClasses(); // Refresh live status
          }}
          onJoined={() => {
            console.log('Joined live class as teacher');
          }}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
