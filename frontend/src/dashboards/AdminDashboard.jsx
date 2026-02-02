import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { adminAPI, feeAPI, resultAPI, classAPI } from '../utils/api';
import AdminNotificationPanel from '../components/AdminNotificationPanel';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [feeDetails, setFeeDetails] = useState([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [showAddFeeForm, setShowAddFeeForm] = useState(false);
  const [feeFormData, setFeeFormData] = useState({
    studentId: '',
    grade: 'IX',
    fatherName: '',
    dateOfJoining: '',
    feeToBeDeposited: '',
    feeSubmitted: '',
    giftVoucherUsed: '',
    referenceIncentive: ''
  });
  const [savingFee, setSavingFee] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, usersData, classesData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllUsers(),
        classAPI.getAll()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setClasses(classesData);
      // fetch pending approvals
      const pendingData = await adminAPI.getPendingUsers();
      setPending(pendingData || []);
      setSelectedIds([]);
      setSelectAll(false);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoadingResults(true);
      const data = await resultAPI.getAll();
      setAllResults(data);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to load results');
    } finally {
      setLoadingResults(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        fetchData();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleToggleActive = async (userId, current) => {
    try {
      await adminAPI.toggleUserActive(userId, !current);
      fetchData();
    } catch (e) {
      console.error('Failed to toggle active', e);
    }
  };

  const handleToggle = (id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
      setSelectAll(false);
    } else {
      const ids = filteredPending.map(u => u._id);
      setSelectedIds(ids);
      setSelectAll(true);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return alert('No users selected');
    if (!window.confirm(`Approve ${selectedIds.length} users?`)) return;
    try {
      await adminAPI.approveUsers(selectedIds);
      fetchData();
    } catch (error) {
      console.error('Error bulk approving users:', error);
    }
  };

  const handleViewGradeFees = async (grade) => {
    setSelectedGrade(grade);
    setLoadingFees(true);
    try {
      const data = await feeAPI.getByGrade(grade);
      setFeeDetails(data);
    } catch (error) {
      console.error('Error fetching fee details:', error);
      alert('Failed to load fee details');
    } finally {
      setLoadingFees(false);
    }
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setFeeDetails([]);
  };

  const openAddFeeForm = async () => {
    // Fetch all students to populate the dropdown
    try {
      const allUsers = await adminAPI.getAllUsers();
      const students = allUsers.filter(u => u.role === 'student');
      setStudentsList(students);
      setShowAddFeeForm(true);
      setFeeFormData({
        studentId: '',
        grade: selectedGrade || 'IX',
        fatherName: '',
        dateOfJoining: '',
        feeToBeDeposited: '',
        feeSubmitted: '',
        giftVoucherUsed: '',
        referenceIncentive: ''
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to load students');
    }
  };

  const handleFeeFormChange = (e) => {
    const { name, value } = e.target;
    setFeeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveFeeRecord = async (e) => {
    e.preventDefault();
    
    if (!feeFormData.studentId) {
      alert('Please select a student');
      return;
    }

    setSavingFee(true);
    try {
      const payload = {
        studentId: feeFormData.studentId,
        grade: feeFormData.grade,
        fatherName: feeFormData.fatherName,
        dateOfJoining: feeFormData.dateOfJoining,
        feeToBeDeposited: parseFloat(feeFormData.feeToBeDeposited) || 0,
        feeSubmitted: parseFloat(feeFormData.feeSubmitted) || 0,
        giftVoucherUsed: parseFloat(feeFormData.giftVoucherUsed) || 0,
        referenceIncentive: parseFloat(feeFormData.referenceIncentive) || 0
      };

      await feeAPI.createOrUpdate(payload);
      alert('Fee record saved successfully!');
      setShowAddFeeForm(false);
      // Refresh the fee list
      if (selectedGrade) {
        handleViewGradeFees(selectedGrade);
      }
    } catch (error) {
      console.error('Error saving fee record:', error);
      alert('Failed to save fee record');
    } finally {
      setSavingFee(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // apply search + role filter for pending
  const filteredPending = pending.filter(u => {
    const matchesSearch = search.trim() === '' || `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="admin-dashboard">
      <header className="admin-welcome-header">
        <div className="welcome-content">
          <h1>Admin Dashboard 🔒</h1>
          <p>Welcome, {user?.name}</p>
        </div>
        <div className="admin-header-actions">
          <button
            className="btn-edit-profile"
            onClick={() => navigate('/admin-profile')}
            title="Edit Profile"
          >
            ✏️ Edit Profile
          </button>
          <div className="admin-profile-card">
            <div className="admin-photo">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name} />
              ) : (
                <div className="photo-placeholder">👨‍💼</div>
              )}
            </div>
            <div className="admin-info">
              {user?.phone && <p className="phone">📱 {user.phone}</p>}
              {user?.designation && <p className="designation">{user.designation}</p>}
              {!user?.designation && <p className="designation">Administrator</p>}
            </div>
          </div>
        </div>
      </header>

      <nav className="admin-tabs">
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={activeTab === 'approvals' ? 'active' : ''}
          onClick={() => setActiveTab('approvals')}
        >
          ✅ Approvals
        </button>
        <button
          className={activeTab === 'fees' ? 'active' : ''}
          onClick={() => setActiveTab('fees')}
        >
          💰 Fee Details
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          📢 Notifications
        </button>
        <button
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => {
            setActiveTab('results');
            if (allResults.length === 0) {
              fetchResults();
            }
          }}
        >
          📊 Results
        </button>
      </nav>

      <div className="admin-content">
        {activeTab === 'stats' && stats && (
          <section className="stats-section">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Teachers</h3>
              <p className="stat-number">{stats.totalTeachers}</p>
            </div>
            <div className="stat-card">
              <h3>Students</h3>
              <p className="stat-number">{stats.totalStudents}</p>
            </div>
            <div className="stat-card">
              <h3>Classes</h3>
              <p className="stat-number">{stats.totalClasses}</p>
            </div>
          </section>
        )}

        {activeTab === 'fees' && (
          <section className="fee-details-section">
            {!selectedGrade ? (
              <>
                <h2>Fee Details by Grade</h2>
                <div className="grade-tiles">
                  <div className="grade-tile" onClick={() => handleViewGradeFees('IX')}>
                    <div className="grade-icon">📚</div>
                    <h3>Grade IX</h3>
                    <p className="grade-info">View and manage fee details for Grade IX students</p>
                    <button className="btn-view-fees">View Details</button>
                  </div>
                  <div className="grade-tile" onClick={() => handleViewGradeFees('X')}>
                    <div className="grade-icon">📚</div>
                    <h3>Grade X</h3>
                    <p className="grade-info">View and manage fee details for Grade X students</p>
                    <button className="btn-view-fees">View Details</button>
                  </div>
                  <div className="grade-tile" onClick={() => handleViewGradeFees('XI')}>
                    <div className="grade-icon">📚</div>
                    <h3>Grade XI</h3>
                    <p className="grade-info">View and manage fee details for Grade XI students</p>
                    <button className="btn-view-fees">View Details</button>
                  </div>
                  <div className="grade-tile" onClick={() => handleViewGradeFees('XII')}>
                    <div className="grade-icon">📚</div>
                    <h3>Grade XII</h3>
                    <p className="grade-info">View and manage fee details for Grade XII students</p>
                    <button className="btn-view-fees">View Details</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="fee-header">
                  <button className="btn-back" onClick={handleBackToGrades}>← Back to Grades</button>
                  <h2>Grade {selectedGrade} - Fee Details</h2>
                  <button 
                    className="btn-add-fee"
                    onClick={openAddFeeForm}
                    title="Add new fee record"
                  >
                    ➕ Add Fee Record
                  </button>
                </div>
                
                {showAddFeeForm && (
                  <div className="fee-form-modal">
                    <div className="fee-form-container">
                      <div className="form-header">
                        <h3>Add New Fee Record - Grade {selectedGrade}</h3>
                        <button 
                          className="close-btn"
                          onClick={() => setShowAddFeeForm(false)}
                        >
                          ✕
                        </button>
                      </div>
                      
                      <form onSubmit={handleSaveFeeRecord} className="fee-form">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Select Student *</label>
                            <select
                              name="studentId"
                              value={feeFormData.studentId}
                              onChange={handleFeeFormChange}
                              required
                            >
                              <option value="">-- Choose a student --</option>
                              {studentsList.map(student => (
                                <option key={student._id} value={student._id}>
                                  {student.name} ({student.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="form-group">
                            <label>Grade *</label>
                            <select
                              name="grade"
                              value={feeFormData.grade}
                              onChange={handleFeeFormChange}
                              required
                            >
                              <option value="IX">Grade IX</option>
                              <option value="X">Grade X</option>
                              <option value="XI">Grade XI</option>
                              <option value="XII">Grade XII</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Father's Name</label>
                            <input
                              type="text"
                              name="fatherName"
                              value={feeFormData.fatherName}
                              onChange={handleFeeFormChange}
                              placeholder="Enter father's name"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Date of Joining</label>
                            <input
                              type="date"
                              name="dateOfJoining"
                              value={feeFormData.dateOfJoining}
                              onChange={handleFeeFormChange}
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Fee to be Deposited (₹)</label>
                            <input
                              type="number"
                              name="feeToBeDeposited"
                              value={feeFormData.feeToBeDeposited}
                              onChange={handleFeeFormChange}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Fee Submitted (₹)</label>
                            <input
                              type="number"
                              name="feeSubmitted"
                              value={feeFormData.feeSubmitted}
                              onChange={handleFeeFormChange}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label>Gift Voucher Used (₹)</label>
                            <input
                              type="number"
                              name="giftVoucherUsed"
                              value={feeFormData.giftVoucherUsed}
                              onChange={handleFeeFormChange}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Reference Incentive (₹)</label>
                            <input
                              type="number"
                              name="referenceIncentive"
                              value={feeFormData.referenceIncentive}
                              onChange={handleFeeFormChange}
                              placeholder="0"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => setShowAddFeeForm(false)}
                            disabled={savingFee}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn-save"
                            disabled={savingFee}
                          >
                            {savingFee ? 'Saving...' : 'Save Fee Record'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {loadingFees ? (
                  <div className="loading">Loading fee details...</div>
                ) : (
                  <div className="fee-table-container">
                    {feeDetails.length === 0 ? (
                      <p className="no-data">No fee records found for Grade {selectedGrade}</p>
                    ) : (
                      <table className="fee-table">
                        <thead>
                          <tr>
                            <th>Sl No</th>
                            <th>Name of Student</th>
                            <th>Father Name</th>
                            <th>Mobile Number</th>
                            <th>Email ID</th>
                            <th>Date of Joining</th>
                            <th>Fee to be Deposited</th>
                            <th>Fee Submitted</th>
                            <th>Gift Voucher Used</th>
                            <th>Reference Incentive</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feeDetails.map((fee, index) => (
                            <tr key={fee._id}>
                              <td>{index + 1}</td>
                              <td>{fee.student?.name || 'N/A'}</td>
                              <td>{fee.fatherName || 'N/A'}</td>
                              <td>{fee.student?.phone || 'N/A'}</td>
                              <td>{fee.student?.email || 'N/A'}</td>
                              <td>{new Date(fee.dateOfJoining).toLocaleDateString()}</td>
                              <td>₹{fee.feeToBeDeposited.toLocaleString()}</td>
                              <td>₹{fee.feeSubmitted.toLocaleString()}</td>
                              <td>₹{fee.giftVoucherUsed.toLocaleString()}</td>
                              <td>₹{fee.referenceIncentive.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section className="users-section">
            <h2>User Management</h2>

            {/* Admins Section */}
            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#faf9f7', borderRadius: '8px', border: '1px solid #e5e1db' }}>
              <h3 style={{ color: '#6d28d9', marginBottom: '12px' }}>👨‍💼 Admin Users ({users.filter(u => u.role === 'admin').length})</h3>
              {users.filter(u => u.role === 'admin').length === 0 ? (
                <p style={{ color: '#666', marginBottom: 0 }}>No admins yet.</p>
              ) : (
                <table className="users-table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'admin').map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <label style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                            <input type="checkbox" checked={u.isActive !== false} onChange={() => handleToggleActive(u._id, u.isActive !== false)} />
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </label>
                        </td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Teachers Section */}
            <div style={{ marginBottom: '32px', padding: '16px', backgroundColor: '#faf9f7', borderRadius: '8px', border: '1px solid #e5e1db' }}>
              <h3 style={{ color: '#6d28d9', marginBottom: '12px' }}>👨‍🏫 Teacher Users ({users.filter(u => u.role === 'teacher').length})</h3>
              {users.filter(u => u.role === 'teacher').length === 0 ? (
                <p style={{ color: '#666', marginBottom: 0 }}>No teachers yet.</p>
              ) : (
                <table className="users-table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'teacher').map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <label style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                            <input type="checkbox" checked={u.isActive !== false} onChange={() => handleToggleActive(u._id, u.isActive !== false)} />
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </label>
                        </td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Students Section */}
            <div style={{ padding: '16px', backgroundColor: '#faf9f7', borderRadius: '8px', border: '1px solid #e5e1db' }}>
              <h3 style={{ color: '#6d28d9', marginBottom: '12px' }}>👨‍🎓 Student Users ({users.filter(u => u.role === 'student').length})</h3>
              {users.filter(u => u.role === 'student').length === 0 ? (
                <p style={{ color: '#666', marginBottom: 0 }}>No students yet.</p>
              ) : (
                <table className="users-table" style={{ marginBottom: 0 }}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Active</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'student').map(u => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <select 
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <label style={{display:'inline-flex',alignItems:'center',gap:'8px'}}>
                            <input type="checkbox" checked={u.isActive !== false} onChange={() => handleToggleActive(u._id, u.isActive !== false)} />
                            {u.isActive !== false ? 'Active' : 'Disabled'}
                          </label>
                        </td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUser(u._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {activeTab === 'approvals' && (
          <section className="approvals-section">
            <h2>Pending Approvals</h2>
            {pending.length === 0 ? (
              <p>No users awaiting approval.</p>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'center' }}>
                  <input placeholder="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All roles</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button className="btn-approve" onClick={handleBulkApprove}>Approve Selected</button>
                </div>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" checked={selectAll} onChange={handleSelectAll} /></th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Requested</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPending.map(u => (
                      <tr key={u._id}>
                        <td><input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => handleToggle(u._id)} /></td>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.role}</td>
                        <td>{new Date(u.createdAt).toLocaleString()}</td>
                        <td>
                          <button className="btn-approve" onClick={() => handleApprove(u._id)}>Approve</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'results' && (
          <section className="results-section">
            <h2>📊 Student Results - Class Wise</h2>
            
            <div className="filter-bar">
              <label htmlFor="classFilter">Filter by Class:</label>
              <select 
                id="classFilter"
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                className="class-filter"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>{cls.title}</option>
                ))}
              </select>
            </div>

            {loadingResults ? (
              <div className="loading">Loading results...</div>
            ) : (
              <div className="results-by-class">
                {classes
                  .filter(cls => selectedClass === 'all' || cls._id === selectedClass)
                  .map(cls => {
                    const classResults = allResults.filter(r => r.class._id === cls._id || r.class === cls._id);
                    
                    if (classResults.length === 0) return null;

                    return (
                      <div key={cls._id} className="class-results-card">
                        <h3>📚 {cls.title}</h3>
                        <p className="class-description">{cls.description}</p>
                        <p className="teacher-info">👨‍🏫 Teacher: {cls.teacher?.name || 'N/A'}</p>
                        
                        <div className="results-table-container">
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
                              </tr>
                            </thead>
                            <tbody>
                              {classResults.map(result => (
                                <tr key={result._id}>
                                  <td>{result.student?.name || 'N/A'}</td>
                                  <td>{result.subject}</td>
                                  <td>{result.marksObtained} / {result.maxMarks}</td>
                                  <td>
                                    <span className="percentage-badge">
                                      {result.percentage?.toFixed(2)}%
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`grade-badge grade-${result.grade?.replace('+', 'plus')}`}>
                                      {result.grade}
                                    </span>
                                  </td>
                                  <td>{result.examType}</td>
                                  <td>{result.remarks || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="class-stats">
                          <p><strong>Total Results Published:</strong> {classResults.length}</p>
                          <p><strong>Average Score:</strong> {(classResults.reduce((sum, r) => sum + r.percentage, 0) / classResults.length).toFixed(2)}%</p>
                        </div>
                      </div>
                    );
                  })}
                
                {classes.filter(cls => selectedClass === 'all' || cls._id === selectedClass)
                  .every(cls => {
                    const classResults = allResults.filter(r => r.class._id === cls._id || r.class === cls._id);
                    return classResults.length === 0;
                  }) && (
                  <div className="no-results">
                    <p>No results published yet for {selectedClass === 'all' ? 'any class' : 'this class'}.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'notifications' && (
          <AdminNotificationPanel user={user} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
