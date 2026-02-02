import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { classAPI, materialAPI, zoomAPI, attendanceAPI, topperAPI, userAPI, resultAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import PDFViewer from '../components/PDFViewer';
import StudentNotifications from '../components/StudentNotifications';
import '../styles/ClassDetail.css';

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classData, setClassData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [viewingPDF, setViewingPDF] = useState(null);
  const [activeTab, setActiveTab] = useState('materials');
  const [attendanceData, setAttendanceData] = useState([]);
  const [studentAttendanceData, setStudentAttendanceData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [toppers, setToppers] = useState(null);
  const [students, setStudents] = useState([]);
  const [topperFormData, setTopperFormData] = useState({
    firstTopper: '',
    secondTopper: '',
    thirdTopper: '',
    announcement: 'Congratulations to our toppers of the month!'
  });
  const [results, setResults] = useState([]);
  const [resultFormData, setResultFormData] = useState({
    student: '',
    subject: '',
    marksObtained: '',
    maxMarks: '',
    examType: 'Other',
    remarks: ''
  });
  const [showResultForm, setShowResultForm] = useState(false);

  useEffect(() => {
    fetchClassData();
    fetchToppers();
    if (user && ['teacher', 'admin'].includes(user.role)) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, user]);

  const fetchStudents = async () => {
    try {
      const data = await userAPI.getAllStudents();
      // Filter students enrolled in this class
      if (classData) {
        const enrolledIds = classData.students.map(s => s._id || s);
        setStudents(data.filter(student => enrolledIds.includes(student._id)));
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchToppers = async () => {
    try {
      const data = await topperAPI.getByClass(classId);
      setToppers(data);
      if (data) {
        setTopperFormData({
          firstTopper: data.firstTopper?._id || '',
          secondTopper: data.secondTopper?._id || '',
          thirdTopper: data.thirdTopper?._id || '',
          announcement: data.announcement || 'Congratulations to our toppers of the month!'
        });
      }
    } catch (error) {
      console.error('Error fetching toppers:', error);
    }
  };

  const fetchResults = async () => {
    try {
      const data = await resultAPI.getByClass(classId);
      setResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleAnnounceToppers = async (e) => {
    e.preventDefault();
    try {
      await topperAPI.createOrUpdate({
        classId,
        ...topperFormData
      });
      alert('Toppers announced successfully!');
      fetchToppers();
    } catch (error) {
      console.error('Error announcing toppers:', error);
      alert('Failed to announce toppers');
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      if (!resultFormData.student || !resultFormData.subject || 
          !resultFormData.marksObtained || !resultFormData.maxMarks) {
        alert('Please fill all required fields');
        return;
      }

      const marksObtained = parseFloat(resultFormData.marksObtained);
      const maxMarks = parseFloat(resultFormData.maxMarks);

      if (marksObtained < 0 || marksObtained > maxMarks) {
        alert('Invalid marks. Marks obtained cannot exceed max marks or be negative');
        return;
      }

      await resultAPI.create({
        student: resultFormData.student,
        classId,
        subject: resultFormData.subject,
        marksObtained,
        maxMarks,
        examType: resultFormData.examType,
        remarks: resultFormData.remarks
      });

      alert('Result published successfully!');
      setResultFormData({
        student: '',
        subject: '',
        marksObtained: '',
        maxMarks: '',
        examType: 'Other',
        remarks: ''
      });
      setShowResultForm(false);
      fetchResults();
    } catch (error) {
      console.error('Error submitting result:', error);
      alert('Failed to publish result');
    }
  };

  const handleDeleteResult = async (resultId) => {
    if (!window.confirm('Are you sure you want to delete this result?')) {
      return;
    }

    try {
      await resultAPI.delete(resultId);
      alert('Result deleted successfully');
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Failed to delete result');
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      const data = await attendanceAPI.getAttendanceSummary(classId);
      setAttendanceData(data.attendance || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchStudentAttendanceData = async () => {
    try {
      setAttendanceLoading(true);
      const userId = user._id || user.id;
      const data = await attendanceAPI.getStudentAttendance(classId, userId);
      setStudentAttendanceData(data.attendance || {});
    } catch (error) {
      console.error('Error fetching student attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchClassData = async () => {
    try {
      const classInfo = await classAPI.getById(classId);
      setClassData(classInfo);
      
      // Fetch materials - authorization is checked on backend
      const materialsData = await materialAPI.getByClass(classId);
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPDF = (materialId, fileName) => {
    setViewingPDF({ materialId, fileName });
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    
    const pdfInput = document.querySelector('input[name="pdfFile"]');
    const thumbnailInput = document.querySelector('input[name="thumbnail"]');
    
    if (!pdfInput.files[0]) {
      alert('Please select a PDF file');
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('file', pdfInput.files[0]);
    if (thumbnailInput.files[0]) {
      formDataObj.append('thumbnail', thumbnailInput.files[0]);
    }

    try {
      await materialAPI.upload(classId, formDataObj);
      fetchClassData();
      setShowMaterialForm(false);
      setFormData({ title: '', description: '' });
    } catch (error) {
      console.error('Error uploading material:', error);
    }
  };

  const handleCreateZoomMeeting = async () => {
    try {
      const meetingData = await zoomAPI.createMeeting(classId);
      alert('Zoom meeting created! Join URL: ' + meetingData.joinUrl);
    } catch (error) {
      console.error('Error creating Zoom meeting:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!classData) return <div className="error">Class not found</div>;

  // Check authorization - allow teachers (who teach this class) and enrolled students
  if (user && user.role === 'student') {
    // Get the correct user ID (MongoDB uses _id)
    const userId = user.id || user._id;
    
    // Check if user is the teacher of this class
    const classTeacherId = classData.teacher._id || classData.teacher;
    const isTeacher = classTeacherId.toString() === userId || classTeacherId === userId;
    
    // Check if student is enrolled in the class
    const isEnrolled = classData.students.some(student => {
      const studentId = student._id || student;
      const sid = studentId.toString ? studentId.toString() : studentId;
      return sid === userId || sid === userId?.toString();
    });

    console.log('Auth Debug:', {
      userRole: user.role,
      userId,
      classTeacher: classTeacherId,
      isTeacher,
      studentsList: classData.students.map(s => s._id || s),
      isEnrolled
    });

    if (!isTeacher && !isEnrolled) {
      return (
        <div className="class-detail">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="error" style={{ marginTop: '20px', padding: '20px', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You must be enrolled in this class to view its materials and details.</p>
            <button className="btn-primary" onClick={() => navigate(-1)} style={{ marginTop: '10px' }}>Go Back to Dashboard</button>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="class-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      
      <header className="class-header">
        <div className="class-header-info">
          <h1>{classData.title}</h1>
          <p>{classData.description}</p>
          <p><strong>Students Enrolled:</strong> {classData.students.length}</p>
        </div>
        <div className="teacher-card">
          <div className="teacher-photo">
            {classData.teacher?.profilePicture ? (
              <img src={classData.teacher.profilePicture} alt={classData.teacher?.name} />
            ) : (
              <div className="teacher-photo-placeholder">👨‍🏫</div>
            )}
          </div>
          <div className="teacher-meta">
            <p className="teacher-label">Teacher</p>
            <p className="teacher-name">{classData.teacher?.name || 'Teacher'}</p>
          </div>
        </div>
      </header>

      <nav className="class-tabs">
        <button 
          className={activeTab === 'materials' ? 'active' : ''}
          onClick={() => setActiveTab('materials')}
        >
          📄 Study Materials
        </button>
        {user && ['teacher', 'admin'].includes(user.role) && (
          <button 
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            👥 Student List
          </button>
        )}
        <button 
          className={activeTab === 'zoom' ? 'active' : ''}
          onClick={() => setActiveTab('zoom')}
        >
          🎥 Zoom Meeting
        </button>
        {user && user.role === 'student' && (
          <button 
            className={activeTab === 'myAttendance' ? 'active' : ''}
            onClick={() => {
              setActiveTab('myAttendance');
              if (!studentAttendanceData) {
                fetchStudentAttendanceData();
              }
            }}
          >
            📊 My Attendance
          </button>
        )}
        {user && ['teacher', 'admin'].includes(user.role) && (
          <button 
            className={activeTab === 'attendance' ? 'active' : ''}
            onClick={() => {
              setActiveTab('attendance');
              if (attendanceData.length === 0) {
                fetchAttendanceData();
              }
            }}
          >
            📊 Attendance
          </button>
        )}
        <button 
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          📢 Notifications
        </button>
        {user && ['teacher', 'admin'].includes(user.role) && (
          <button 
            className={activeTab === 'toppers' ? 'active' : ''}
            onClick={() => setActiveTab('toppers')}
          >
            🏆 Announce Toppers
          </button>
        )}
        {user && ['teacher', 'admin'].includes(user.role) && (
          <button 
            className={activeTab === 'results' ? 'active' : ''}
            onClick={() => {
              setActiveTab('results');
              if (results.length === 0) {
                fetchResults();
              }
            }}
          >
            📊 Results
          </button>
        )}
      </nav>

      <div className="class-content">
        {activeTab === 'myAttendance' && (
          <section className="student-attendance-section">
            <h2>📊 My Attendance</h2>
            {attendanceLoading ? (
              <div className="loading">Loading attendance data...</div>
            ) : studentAttendanceData ? (
              <div className="attendance-card">
                <h3>{classData.title}</h3>
                <div className="attendance-stats">
                  <p><strong>Attendance Percentage:</strong> <span className="percentage-badge">{studentAttendanceData.percentage?.toFixed(2) || 0}%</span></p>
                  <p><strong>Days Present:</strong> {studentAttendanceData.presentCount || 0}</p>
                  <p><strong>Total Sessions:</strong> {studentAttendanceData.totalSessions || 0}</p>
                </div>
                <div className="attendance-dates">
                  <strong>Attendance Dates:</strong>
                  {studentAttendanceData.dates && studentAttendanceData.dates.length > 0 ? (
                    <div className="date-list">
                      {studentAttendanceData.dates.map((date, i) => (
                        <span key={i} className="date-badge">
                          ✅ {new Date(date).toLocaleDateString()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>No attendance records yet</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No attendance records yet.</p>
            )}
          </section>
        )}

        {activeTab === 'attendance' && (
          <section className="attendance-section">
            <h2>📊 Class Attendance</h2>
            {attendanceLoading ? (
              <div className="loading">Loading attendance data...</div>
            ) : attendanceData.length > 0 ? (
              <div className="attendance-table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Present Days</th>
                      <th>Total Sessions</th>
                      <th>Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((record, index) => (
                      <tr key={record.student._id || index}>
                        <td>{index + 1}</td>
                        <td>{record.student.name}</td>
                        <td>{record.student.email}</td>
                        <td>{record.student.phone || 'N/A'}</td>
                        <td className="text-center">{record.presentCount || 0}</td>
                        <td className="text-center">{record.totalSessions || 0}</td>
                        <td>
                          <div className="attendance-percentage">
                            <span className={`percentage ${
                              record.attendancePercentage >= 90 ? 'high' :
                              record.attendancePercentage >= 75 ? 'medium' :
                              'low'
                            }`}>
                              {record.attendancePercentage?.toFixed(2) || 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No attendance records yet.</p>
            )}
          </section>
        )}

        {activeTab === 'zoom' && (
          <section className="zoom-section">
            <h2>🎥 Zoom Meeting</h2>
            {classData.zoomJoinUrl ? (
              <>
                <p>Meeting Link Available</p>
                <a href={classData.zoomJoinUrl} target="_blank" rel="noopener noreferrer" className="btn-zoom">
                  Join Zoom Meeting
                </a>
              </>
            ) : user && user.role === 'teacher' ? (
              <button className="btn-primary" onClick={handleCreateZoomMeeting}>
                Create Zoom Meeting
              </button>
            ) : (
              <p>No meeting scheduled yet. Check back later!</p>
            )}
          </section>
        )}

        {activeTab === 'students' && (
          <section className="students-section">
            <h2>👥 Enrolled Students ({classData.students.length})</h2>
            {classData.students.length > 0 ? (
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Sl No</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classData.students.map((student, index) => (
                      <tr key={student._id || index}>
                        <td>{index + 1}</td>
                        <td>{student.name || 'N/A'}</td>
                        <td>{student.email || 'N/A'}</td>
                        <td>{student.phone || 'Not provided'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data">No students enrolled yet.</p>
            )}
          </section>
        )}

        {activeTab === 'materials' && (
          <section className="materials-section">
            <h2>📄 Study Materials</h2>
            
            {user && user.role === 'teacher' && (
              <button 
                className="btn-primary"
                onClick={() => setShowMaterialForm(!showMaterialForm)}
              >
                {showMaterialForm ? 'Cancel' : '+ Upload Material'}
              </button>
            )}

            {showMaterialForm && (
              <form className="material-form" onSubmit={handleUploadMaterial}>
                <input
                  type="text"
                  placeholder="Material Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <textarea
                  placeholder="Material Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                <label>PDF File:</label>
                <input type="file" name="pdfFile" accept="application/pdf" required />
                <label>Thumbnail Image (optional):</label>
                <input type="file" name="thumbnail" accept="image/*" />
                <button type="submit" className="btn-submit">Upload</button>
              </form>
            )}

            {materials.length > 0 ? (
              <div className="materials-list">
                {materials.map(material => (
                  <div key={material._id} className="material-item">
                    {material.thumbnailUrl ? (
                      <div 
                        className="material-thumbnail"
                        onClick={() => handleViewPDF(material._id, material.fileName)}
                      >
                        <img 
                          src={`${API_BASE_URL}${material.thumbnailUrl}`} 
                          alt={material.title}
                        />
                        <div className="thumbnail-overlay">
                          <span className="view-icon">👁️</span>
                        </div>
                      </div>
                    ) : (
                      <div className="material-no-thumbnail">
                        <button 
                          onClick={() => handleViewPDF(material._id, material.fileName)}
                          className="btn"
                        >
                          👁️ View PDF
                        </button>
                      </div>
                    )}
                    <div className="material-info">
                      <h4>{material.title}</h4>
                      <p>{material.description}</p>
                      <p><small>Uploaded by {material.uploadedBy.name}</small></p>
                      {user && ['teacher', 'admin'].includes(user.role) && (
                        <a href={`${API_BASE_URL}/api/materials/download/${material._id}`} className="btn btn-download">
                          📥 Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No materials uploaded yet.</p>
            )}
          </section>
        )}

        {activeTab === 'notifications' && (
          <>
            {/* Topper of the Month Card */}
            {toppers && (
              <section className="toppers-section-notification">
                <h2>🏆 Toppers of the Month</h2>
                <div className="toppers-card">
                  <div className="toppers-announcement">
                    <p>{toppers.announcement}</p>
                    <small>Announced by {toppers.announcedBy?.name}</small>
                  </div>
                  <div className="toppers-podium">
                    {/* First Topper (Center/Highest) */}
                    {toppers.firstTopper && (
                      <div className="topper-item first-place">
                        <div className="medal">🥇</div>
                        <div className="topper-photo">
                          {toppers.firstTopper.profilePicture ? (
                            <img src={toppers.firstTopper.profilePicture} alt={toppers.firstTopper.name} />
                          ) : (
                            <div className="photo-placeholder">👤</div>
                          )}
                        </div>
                        <h3>{toppers.firstTopper.name}</h3>
                        <p className="position">I Topper</p>
                      </div>
                    )}

                    {/* Second Topper */}
                    {toppers.secondTopper && (
                      <div className="topper-item second-place">
                        <div className="medal">🥈</div>
                        <div className="topper-photo">
                          {toppers.secondTopper.profilePicture ? (
                            <img src={toppers.secondTopper.profilePicture} alt={toppers.secondTopper.name} />
                          ) : (
                            <div className="photo-placeholder">👤</div>
                          )}
                        </div>
                        <h3>{toppers.secondTopper.name}</h3>
                        <p className="position">II Topper</p>
                      </div>
                    )}

                    {/* Third Topper */}
                    {toppers.thirdTopper && (
                      <div className="topper-item third-place">
                        <div className="medal">🥉</div>
                        <div className="topper-photo">
                          {toppers.thirdTopper.profilePicture ? (
                            <img src={toppers.thirdTopper.profilePicture} alt={toppers.thirdTopper.name} />
                          ) : (
                            <div className="photo-placeholder">👤</div>
                          )}
                        </div>
                        <h3>{toppers.thirdTopper.name}</h3>
                        <p className="position">III Topper</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
            
            <StudentNotifications classId={classId} className={classData.title} />
          </>
        )}

        {activeTab === 'toppers' && (
          <section className="toppers-management-section">
            <h2>🏆 Announce Toppers of the Month</h2>
            
            <form className="toppers-form" onSubmit={handleAnnounceToppers}>
              <div className="form-group">
                <label htmlFor="firstTopper">🥇 Topper (1st Position)</label>
                <select
                  id="firstTopper"
                  value={topperFormData.firstTopper}
                  onChange={(e) => setTopperFormData({...topperFormData, firstTopper: e.target.value})}
                  required
                >
                  <option value="">Select First Topper</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.name} ({student.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="secondTopper">🥈 Second Topper (2nd Position)</label>
                <select
                  id="secondTopper"
                  value={topperFormData.secondTopper}
                  onChange={(e) => setTopperFormData({...topperFormData, secondTopper: e.target.value})}
                >
                  <option value="">Select Second Topper (Optional)</option>
                  {students
                    .filter(s => s._id !== topperFormData.firstTopper)
                    .map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="thirdTopper">🥉 Third Topper (3rd Position)</label>
                <select
                  id="thirdTopper"
                  value={topperFormData.thirdTopper}
                  onChange={(e) => setTopperFormData({...topperFormData, thirdTopper: e.target.value})}
                >
                  <option value="">Select Third Topper (Optional)</option>
                  {students
                    .filter(s => s._id !== topperFormData.firstTopper && s._id !== topperFormData.secondTopper)
                    .map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="announcement">📢 Announcement Message</label>
                <textarea
                  id="announcement"
                  value={topperFormData.announcement}
                  onChange={(e) => setTopperFormData({...topperFormData, announcement: e.target.value})}
                  rows="3"
                  placeholder="Enter a congratulatory message..."
                />
              </div>

              <button type="submit" className="btn-primary">
                🎉 Announce Toppers
              </button>
            </form>

            {toppers && (
              <div className="current-toppers-preview">
                <h3>📋 Current Month's Toppers</h3>
                <div className="toppers-preview-list">
                  {toppers.firstTopper && (
                    <div className="topper-preview-item">
                      <span className="medal">🥇</span>
                      <span className="topper-name">{toppers.firstTopper.name}</span>
                    </div>
                  )}
                  {toppers.secondTopper && (
                    <div className="topper-preview-item">
                      <span className="medal">🥈</span>
                      <span className="topper-name">{toppers.secondTopper.name}</span>
                    </div>
                  )}
                  {toppers.thirdTopper && (
                    <div className="topper-preview-item">
                      <span className="medal">🥉</span>
                      <span className="topper-name">{toppers.thirdTopper.name}</span>
                    </div>
                  )}
                </div>
                <p className="announcement-preview">"{toppers.announcement}"</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'results' && (
          <section className="results-management-section">
            <h2>📊 Student Results</h2>
            
            <button 
              className="btn-primary"
              onClick={() => setShowResultForm(!showResultForm)}
            >
              {showResultForm ? 'Cancel' : '+ Publish Result'}
            </button>

            {showResultForm && (
              <form className="result-form" onSubmit={handleSubmitResult}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="student">Student *</label>
                    <select
                      id="student"
                      value={resultFormData.student}
                      onChange={(e) => setResultFormData({...resultFormData, student: e.target.value})}
                      required
                    >
                      <option value="">Select Student</option>
                      {students.map(student => (
                        <option key={student._id} value={student._id}>
                          {student.name} ({student.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      value={resultFormData.subject}
                      onChange={(e) => setResultFormData({...resultFormData, subject: e.target.value})}
                      placeholder="e.g., Physics, Mathematics"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="marksObtained">Marks Obtained *</label>
                    <input
                      type="number"
                      id="marksObtained"
                      value={resultFormData.marksObtained}
                      onChange={(e) => setResultFormData({...resultFormData, marksObtained: e.target.value})}
                      min="0"
                      step="0.01"
                      placeholder="Enter marks obtained"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="maxMarks">Maximum Marks *</label>
                    <input
                      type="number"
                      id="maxMarks"
                      value={resultFormData.maxMarks}
                      onChange={(e) => setResultFormData({...resultFormData, maxMarks: e.target.value})}
                      min="1"
                      step="0.01"
                      placeholder="Enter maximum marks"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="examType">Exam Type</label>
                    <select
                      id="examType"
                      value={resultFormData.examType}
                      onChange={(e) => setResultFormData({...resultFormData, examType: e.target.value})}
                    >
                      <option value="Other">Other</option>
                      <option value="Mid-term">Mid-term</option>
                      <option value="Final">Final</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="remarks">Remarks (Optional)</label>
                  <textarea
                    id="remarks"
                    value={resultFormData.remarks}
                    onChange={(e) => setResultFormData({...resultFormData, remarks: e.target.value})}
                    rows="2"
                    placeholder="Add any comments or feedback..."
                  />
                </div>

                <button type="submit" className="btn-submit">
                  📤 Publish Result
                </button>
              </form>
            )}

            <div className="results-table-container">
              {results.length > 0 ? (
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                      <th>Exam Type</th>
                      <th>Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(result => (
                      <tr key={result._id}>
                        <td>{result.student?.name}</td>
                        <td className="subject-cell">{result.subject}</td>
                        <td className="marks-cell">
                          {result.marksObtained}/{result.maxMarks}
                        </td>
                        <td className="percentage-cell">
                          <span className="percentage-badge">{result.percentage}%</span>
                        </td>
                        <td>
                          <span className={`grade-badge grade-${result.grade.replace('+', 'plus')}`}>
                            {result.grade}
                          </span>
                        </td>
                        <td>{result.examType}</td>
                        <td className="remarks-cell">{result.remarks || '-'}</td>
                        <td>
                          <button 
                            onClick={() => handleDeleteResult(result._id)}
                            className="btn-delete-small"
                            title="Delete Result"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-results">No results published yet for this class.</p>
              )}
            </div>
          </section>
        )}
      </div>

      {viewingPDF && (
        <PDFViewer 
          materialId={viewingPDF.materialId}
          fileName={viewingPDF.fileName}
          onClose={() => setViewingPDF(null)}
        />
      )}
    </div>
  );
};

export default ClassDetail;
