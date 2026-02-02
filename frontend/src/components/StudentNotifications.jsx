import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../utils/api';
import '../styles/StudentNotifications.css';

const StudentNotifications = ({ classId, className }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedNotifications, setExpandedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const fetchNotifications = async () => {
    if (!classId) return;
    try {
      setLoading(true);
      const data = await notificationAPI.getClassNotifications(classId);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const toggleExpand = (notificationId) => {
    setExpandedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId]
    );
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

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="student-notifications-container">
        <p className="loading">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="student-notifications-container">
      {/* Teacher Notifications Section */}
      <div className="notification-section">
        <div className="notifications-header">
          <h3>👨‍🏫 Teacher Notifications</h3>
          <span className="notification-count">
            {notifications.filter(n => n.type === 'teacher').length} notification{notifications.filter(n => n.type === 'teacher').length !== 1 ? 's' : ''}
          </span>
        </div>

        {notifications.filter(n => n.type === 'teacher').length === 0 ? (
          <div className="no-notifications">
            <p>No teacher notifications yet</p>
          </div>
        ) : (
          <div className="notifications-stack">
            {notifications.filter(n => n.type === 'teacher').map((notification, index) => (
              <div
                key={notification._id}
                className="notification-card"
                style={{
                  '--priority-color': getPriorityColor(notification.priority),
                  '--card-index': index
                }}
              >
                <div
                  className="notification-card-header"
                  onClick={() => toggleExpand(notification._id)}
                >
                  <div className="notification-header-content">
                    <div className="notification-title-section">
                      <span className="priority-icon">
                        {getPriorityIcon(notification.priority)}
                      </span>
                      <h4>{notification.title}</h4>
                    </div>
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <div className="notification-header-meta">
                    <button
                      className={`expand-button ${expandedNotifications.includes(notification._id) ? 'expanded' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(notification._id);
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {expandedNotifications.includes(notification._id) && (
                  <div className="notification-card-body">
                    <p className="notification-full-message">{notification.message}</p>

                    <div className="notification-footer">
                      <button
                        className="btn-mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        ✓ Mark as Read
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Notifications Section */}
      <div className="notification-section">
        <div className="notifications-header">
          <h3>👨‍💼 Admin Notifications</h3>
          <span className="notification-count">
            {notifications.filter(n => n.type === 'admin').length} notification{notifications.filter(n => n.type === 'admin').length !== 1 ? 's' : ''}
          </span>
        </div>

        {notifications.filter(n => n.type === 'admin').length === 0 ? (
          <div className="no-notifications">
            <p>No admin notifications yet</p>
          </div>
        ) : (
          <div className="notifications-stack">
            {notifications.filter(n => n.type === 'admin').map((notification, index) => (
              <div
                key={notification._id}
                className="notification-card"
                style={{
                  '--priority-color': getPriorityColor(notification.priority),
                  '--card-index': index
                }}
              >
                <div
                  className="notification-card-header"
                  onClick={() => toggleExpand(notification._id)}
                >
                  <div className="notification-header-content">
                    <div className="notification-title-section">
                      <span className="priority-icon">
                        {getPriorityIcon(notification.priority)}
                      </span>
                      <h4>{notification.title}</h4>
                    </div>
                    <span className="notification-time">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>

                  <div className="notification-header-meta">
                    <button
                      className={`expand-button ${expandedNotifications.includes(notification._id) ? 'expanded' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(notification._id);
                      }}
                    >
                      ▼
                    </button>
                  </div>
                </div>

                {expandedNotifications.includes(notification._id) && (
                  <div className="notification-card-body">
                    <p className="notification-full-message">{notification.message}</p>

                    <div className="notification-footer">
                      <button
                        className="btn-mark-read"
                        onClick={() => handleMarkAsRead(notification._id)}
                      >
                        ✓ Mark as Read
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;
