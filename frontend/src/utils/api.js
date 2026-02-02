const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const authAPI = {
  signup: (data) => fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Signup failed');
    return data;
  })),

  login: (data) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Login failed');
    return data;
  })),

  logout: () => localStorage.removeItem('token')
};

export const userAPI = {
  getProfile: () => fetch(`${API_BASE_URL}/users/profile`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch profile');
      return data;
    })),
  
  updateProfile: (data) => fetch(`${API_BASE_URL}/users/profile`, {
    ...authHeaders(),
    method: 'PUT',
    body: JSON.stringify(data)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
  })),

  enrollClass: (classId) => fetch(`${API_BASE_URL}/users/enroll/${classId}`, {
    ...authHeaders(),
    method: 'POST'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to enroll in class');
    return data;
  })),

  getAllStudents: () => fetch(`${API_BASE_URL}/users/students`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch students');
      return data;
    }))
};

export const classAPI = {
  getAll: () => fetch(`${API_BASE_URL}/classes`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch classes');
      return data;
    })),

  getById: (id) => fetch(`${API_BASE_URL}/classes/${id}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Class not found');
      return data;
    })),

  create: (data) => fetch(`${API_BASE_URL}/classes`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to create class');
    return data;
  })),

  update: (id, data) => fetch(`${API_BASE_URL}/classes/${id}`, {
    ...authHeaders(),
    method: 'PUT',
    body: JSON.stringify(data)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to update class');
    return data;
  })),

  delete: (id) => fetch(`${API_BASE_URL}/classes/${id}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to delete class');
    return data;
  })),

  enrollClass: (classId) => fetch(`${API_BASE_URL}/users/enroll/${classId}`, {
    ...authHeaders(),
    method: 'POST'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to enroll in class');
    return data;
  }))
};

export const materialAPI = {
  upload: (classId, formData) => fetch(`${API_BASE_URL}/materials/upload/${classId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    method: 'POST',
    body: formData
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to upload material');
    return data;
  })),

  getByClass: (classId) => fetch(`${API_BASE_URL}/materials/class/${classId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch materials');
      return data;
    })),

  delete: (id) => fetch(`${API_BASE_URL}/materials/${id}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to delete material');
    return data;
  }))
};

export const zoomAPI = {
  createMeeting: (classId) => fetch(`${API_BASE_URL}/zoom/create-meeting/${classId}`, {
    ...authHeaders(),
    method: 'POST'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to create meeting');
    return data;
  })),

  getMeetingDetails: (meetingId) => fetch(`${API_BASE_URL}/zoom/meeting/${meetingId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch meeting details');
      return data;
    }))
};

export const adminAPI = {
  getStats: () => fetch(`${API_BASE_URL}/admin/stats`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch stats');
      return data;
    })),

  getAllUsers: () => fetch(`${API_BASE_URL}/admin/users`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch users');
      return data;
    })),

  getPendingUsers: () => fetch(`${API_BASE_URL}/admin/users/pending`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch pending users');
      return data;
    })),

  updateUserRole: (userId, role) => fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    ...authHeaders(),
    method: 'PUT',
    body: JSON.stringify({ role })
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to update user role');
    return data;
  })),

  deleteUser: (userId) => fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to delete user');
    return data;
  })),

  approveUser: (userId) => fetch(`${API_BASE_URL}/admin/users/${userId}/approve`, {
    ...authHeaders(),
    method: 'PUT'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to approve user');
    return data;
  })),

  approveUsers: (ids) => fetch(`${API_BASE_URL}/admin/users/approve-batch`, {
    ...authHeaders(),
    method: 'PUT',
    body: JSON.stringify({ ids })
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to approve users');
    return data;
  })),

  getNotifications: () => fetch(`${API_BASE_URL}/admin/notifications`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch notifications');
      return data;
    })),

  markNotificationRead: (id) => fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
    ...authHeaders(),
    method: 'PUT'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to mark notification as read');
    return data;
  })),

  toggleUserActive: (userId, active) => fetch(`${API_BASE_URL}/admin/users/${userId}/active`, {
    ...authHeaders(),
    method: 'PUT',
    body: JSON.stringify({ active })
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to toggle user active status');
    return data;
  }))
};

export const feeAPI = {
  getByGrade: (grade) => fetch(`${API_BASE_URL}/fees/grade/${grade}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch fee details');
      return data;
    })),

  getByStudent: (studentId) => fetch(`${API_BASE_URL}/fees/student/${studentId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch student fee details');
      return data;
    })),

  createOrUpdate: (feeData) => fetch(`${API_BASE_URL}/fees`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify(feeData)
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to save fee details');
    return data;
  })),

  delete: (id) => fetch(`${API_BASE_URL}/fees/${id}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to delete fee record');
    return data;
  }))
};
export const attendanceAPI = {
  markAttendance: (classId, joinTime) => fetch(`${API_BASE_URL}/attendance/mark/${classId}`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify({ joinTime })
  }).then(r => r.json().then(data => {
    if (!r.ok) throw new Error(data.error || 'Failed to mark attendance');
    return data;
  })),

  getClassAttendance: (classId) => fetch(`${API_BASE_URL}/attendance/class/${classId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch attendance');
      return data;
    })),

  getAttendanceSummary: (classId) => fetch(`${API_BASE_URL}/attendance/summary/${classId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch attendance summary');
      return data;
    })),

  getStudentAttendance: (classId, studentId) => fetch(`${API_BASE_URL}/attendance/student/${classId}/${studentId}`, authHeaders())
    .then(r => r.json().then(data => {
      if (!r.ok) throw new Error(data.error || 'Failed to fetch student attendance');
      return data;
    }))
};

export const notificationAPI = {
  create: (data) => fetch(`${API_BASE_URL}/notifications/create`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify(data)
  }).then(async r => {
    const contentType = r.headers.get('content-type');
    let responseData;
    try {
      responseData = contentType && contentType.includes('application/json') 
        ? await r.json() 
        : await r.text();
    } catch (e) {
      throw new Error('Server error: Unable to parse response');
    }
    if (!r.ok) {
      const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to create notification');
      throw new Error(errorMsg);
    }
    return responseData;
  }),

  getClassNotifications: (classId) => fetch(`${API_BASE_URL}/notifications/class/${classId}/latest`, authHeaders())
    .then(async r => {
      const contentType = r.headers.get('content-type');
      let responseData;
      try {
        responseData = contentType && contentType.includes('application/json') 
          ? await r.json() 
          : await r.text();
      } catch (e) {
        throw new Error('Server error: Unable to parse response');
      }
      if (!r.ok) {
        const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to fetch notifications');
        throw new Error(errorMsg);
      }
      return responseData;
    }),

  getAllClassNotifications: (classId) => fetch(`${API_BASE_URL}/notifications/class/${classId}`, authHeaders())
    .then(async r => {
      const contentType = r.headers.get('content-type');
      let responseData;
      try {
        responseData = contentType && contentType.includes('application/json') 
          ? await r.json() 
          : await r.text();
      } catch (e) {
        throw new Error('Server error: Unable to parse response');
      }
      if (!r.ok) {
        const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to fetch notifications');
        throw new Error(errorMsg);
      }
      return responseData;
    }),

  markAsRead: (notificationId) => fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    ...authHeaders(),
    method: 'PUT'
  }).then(async r => {
    const contentType = r.headers.get('content-type');
    let responseData;
    try {
      responseData = contentType && contentType.includes('application/json') 
        ? await r.json() 
        : await r.text();
    } catch (e) {
      throw new Error('Server error: Unable to parse response');
    }
    if (!r.ok) {
      const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to mark as read');
      throw new Error(errorMsg);
    }
    return responseData;
  }),

  delete: (notificationId) => fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(async r => {
    const contentType = r.headers.get('content-type');
    let responseData;
    try {
      responseData = contentType && contentType.includes('application/json') 
        ? await r.json() 
        : await r.text();
    } catch (e) {
      throw new Error('Server error: Unable to parse response');
    }
    if (!r.ok) {
      const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to delete notification');
      throw new Error(errorMsg);
    }
    return responseData;
  }),

  getDashboardNotifications: () => fetch(`${API_BASE_URL}/notifications/dashboard/all`, authHeaders())
    .then(async r => {
      const contentType = r.headers.get('content-type');
      let responseData;
      try {
        responseData = contentType && contentType.includes('application/json') 
          ? await r.json() 
          : await r.text();
      } catch (e) {
        throw new Error('Server error: Unable to parse response');
      }
      if (!r.ok) {
        const errorMsg = typeof responseData === 'string' ? 'Server error' : (responseData.error || 'Failed to fetch dashboard notifications');
        throw new Error(errorMsg);
      }
      return responseData;
    })
};

export const topperAPI = {
  getByClass: (classId) => fetch(`${API_BASE_URL}/toppers/class/${classId}`, authHeaders())
    .then(r => r.json()),

  getAll: () => fetch(`${API_BASE_URL}/toppers/all`, authHeaders())
    .then(r => r.json()),

  createOrUpdate: (data) => fetch(`${API_BASE_URL}/toppers`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json())
};

export const resultAPI = {
  create: (data) => fetch(`${API_BASE_URL}/results`, {
    ...authHeaders(),
    method: 'POST',
    body: JSON.stringify(data)
  }).then(r => r.json()),

  getByClass: (classId) => fetch(`${API_BASE_URL}/results/class/${classId}`, authHeaders())
    .then(r => r.json()),

  getByStudent: (studentId) => fetch(`${API_BASE_URL}/results/student/${studentId}`, authHeaders())
    .then(r => r.json()),

  getMyResults: () => fetch(`${API_BASE_URL}/results/my-results`, authHeaders())
    .then(r => r.json()),

  getAll: () => fetch(`${API_BASE_URL}/results/all`, authHeaders())
    .then(r => r.json()),

  delete: (resultId) => fetch(`${API_BASE_URL}/results/${resultId}`, {
    ...authHeaders(),
    method: 'DELETE'
  }).then(r => r.json())
};