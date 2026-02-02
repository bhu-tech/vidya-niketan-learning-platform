import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { classAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/ClassList.css';

const ClassList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule: new Date().toISOString()
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await classAPI.getAll();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await classAPI.create(formData);
      fetchClasses();
      setShowCreateForm(false);
      setFormData({ title: '', description: '', schedule: new Date().toISOString() });
      alert('Class created successfully!');
    } catch (error) {
      alert('Error creating class: ' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading">Loading classes...</div>;

  return (
    <div className="class-list-page">
      <header className="page-header">
        <h1>📚 Classes</h1>
        {user?.role === 'teacher' && (
          <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : '+ Create Class'}
          </button>
        )}
      </header>

      {showCreateForm && user?.role === 'teacher' && (
        <div className="create-form">
          <h3>Create New Class</h3>
          <form onSubmit={handleCreateClass}>
            <input
              type="text"
              name="title"
              placeholder="Class Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <textarea
              name="description"
              placeholder="Class Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
            <input
              type="datetime-local"
              name="schedule"
              value={formData.schedule.slice(0, 16)}
              onChange={(e) => setFormData({...formData, schedule: e.target.value})}
              required
            />
            <button type="submit">Create</button>
          </form>
        </div>
      )}

      <div className="classes-grid">
        {classes.length === 0 ? (
          <p>No classes available</p>
        ) : (
          classes.map(cls => (
            <div key={cls._id} className="class-card">
              <div className="class-card-header">
                <h3>{cls.title}</h3>
                <p className="teacher-name">👨‍🏫 {cls.teacher?.name}</p>
              </div>
              <p className="class-description">{cls.description}</p>
              <div className="class-meta">
                <span>👥 {cls.students?.length || 0} students</span>
                <span>📄 {cls.materials?.length || 0} materials</span>
              </div>
              <button 
                className="btn-view" 
                onClick={() => navigate(`/class/${cls._id}`)}
              >
                View Class →
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassList;
