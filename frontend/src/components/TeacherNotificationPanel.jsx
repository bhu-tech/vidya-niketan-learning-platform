import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import '../styles/NotificationPanel.css';

const TeacherNotificationPanel = ({ myClasses }) => {
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    classId: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getDashboardNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim() || !formData.classId) {
      alert('Please fill all fields');
      return;
    }

    try {
      await notificationAPI.create(formData);
      alert('Notification sent to all students in the class!');
      setFormData({ title: '', message: '', classId: '', priority: 'medium' });
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      alert('Error sending notification: ' + error.message);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationAPI.delete(notificationId);
        fetchNotifications();
      } catch (error) {
        alert('Error deleting notification: ' + error.message);
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#27ae60';
      default:
        return '#3498db';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notification-panel">
      <div className="notification-header">
        <h3>📢 Class Notifications</h3>
        <button
          className="btn-send-notification"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '✉️ Send Notification'}
        </button>
      </div>

      {showForm && (
        <div className="notification-form">
          <form onSubmit={handleSendNotification}>
            <div className="form-group">
              <label>Select Your Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                required
              >
                <option value="">-- Choose a class --</option>
                {myClasses?.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.title} ({cls.students?.length || 0} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notification Title *</label>
              <input
                type="text"
                placeholder="e.g., Assignment Due, Class Update, Important Notice"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength="100"
                required
              />
              <small>{formData.title.length}/100</small>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                placeholder="Write your message here... Make it clear and concise."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength="500"
                rows="4"
                required
              ></textarea>
              <small>{formData.message.length}/500</small>
            </div>

            <div className="form-group">
              <label>Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">🟢 Low - Informational</option>
                <option value="medium">🟡 Medium - Important</option>
                <option value="high">🔴 High - Urgent</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Send to All Students
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="notifications-list">
        {loading ? (
          <p className="loading">Loading notifications...</p>
        ) : notifications.length === 0 ? (
          <p className="no-notifications">No notifications sent yet</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className="notification-item"
              style={{ borderLeftColor: getPriorityColor(notification.priority) }}
            >
              <div className="notification-content">
                <div className="notification-title">
                  <h4>{notification.title}</h4>
                  <span className="priority-badge" style={{ backgroundColor: getPriorityColor(notification.priority) }}>
                    {notification.priority.toUpperCase()}
                  </span>
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-meta">
                  <span className="class-name">
                    📚 {notification.class?.title || 'Unknown Class'}
                  </span>
                  <span className="timestamp">
                    {formatDate(notification.createdAt)}
                  </span>
                </div>

                <div className="notification-recipients">
                  <span className="recipient-count">
                    👥 {notification.recipients?.length || 0} students
                  </span>
                  <span className="read-count">
                    ✓ {notification.readBy?.length || 0} have read
                  </span>
                </div>
              </div>

              <button
                className="btn-delete"
                onClick={() => handleDeleteNotification(notification._id)}
                title="Delete notification"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherNotificationPanel;
