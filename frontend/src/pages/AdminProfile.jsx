import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';
import '../styles/TeacherProfile.css';

const compressImage = (base64String, maxWidth = 300, maxHeight = 300, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64String;
  });
};

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designation: '',
    profilePicture: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        designation: user.designation || '',
        profilePicture: user.profilePicture || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Image size must be less than 5MB. Please choose a smaller image.');
        setMessageType('error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setMessage('Please select a valid image file (PNG, JPG, JPEG, GIF)');
        setMessageType('error');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const compressedImage = await compressImage(reader.result);
          setFormData({
            ...formData,
            profilePicture: compressedImage
          });
          setMessage('');
        } catch (error) {
          setMessage('Error processing image. Please try another one.');
          setMessageType('error');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        designation: formData.designation,
        bio: formData.bio
      };

      if (formData.profilePicture && formData.profilePicture.startsWith('data:image')) {
        updateData.profilePicture = formData.profilePicture;
      }

      const response = await userAPI.updateProfile(updateData);

      if (setUser) {
        setUser(response);
      }

      setMessageType('success');
      setMessage('Profile updated successfully!');

      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Profile update error:', error);
      setMessageType('error');
      setMessage(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin-dashboard');
  };

  return (
    <div className="teacher-profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>📝 Edit Admin Profile</h1>
          <p>Update your administrative information</p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Profile Picture</h2>
            <div className="profile-picture-section">
              <div className="picture-preview">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" />
                ) : (
                  <div className="placeholder">👨‍💼</div>
                )}
              </div>
              <div className="picture-upload">
                <label htmlFor="profilePicture" className="upload-label">
                  Choose Photo
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="file-input"
                />
                <p className="help-text">Recommended: Square image, 500x500px or larger</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Personal Information</h2>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="form-group">
              <label htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., System Administrator, Principal"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows="4"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
