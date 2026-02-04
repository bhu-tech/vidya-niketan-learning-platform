import { useState, useEffect } from 'react';
import '../styles/JitsiMeeting.css';

const JitsiMeeting = ({ classId, onClose, onJoined }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingWindow, setMeetingWindow] = useState(null);

  useEffect(() => {
    let windowCheckInterval = null;
    let mounted = true;

    const openJitsiMeeting = async () => {
      try {
        // Fetch Jitsi configuration from backend
        const token = localStorage.getItem('token');
        console.log('Fetching Jitsi config for class:', classId);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/jitsi-config`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to load meeting configuration');
        }

        const config = await response.json();
        console.log('Jitsi config received:', config);

        // Check if class is live
        if (!config.isLive) {
          if (mounted) {
            setError('This class is not currently live. Please wait for the teacher to start the class.');
            setLoading(false);
          }
          return;
        }

        // Construct Jitsi meeting URL with config
        const domain = config.domain || 'meet.jit.si';
        const roomName = config.roomName;
        const password = config.password || '';
        const displayName = encodeURIComponent(config.userInfo?.displayName || 'User');
        
        // Include password in URL so it auto-fills
        const meetingUrl = `https://${domain}/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&roomPassword="${password}"`;
        
        console.log('Opening Jitsi meeting in new window (password protected)');

        // Open in new window
        const newWindow = window.open(
          meetingUrl,
          'JitsiMeeting',
          'width=1200,height=800,toolbar=no,menubar=no,scrollbars=no,resizable=yes,location=no,status=no'
        );

        if (!newWindow) {
          throw new Error('Failed to open meeting window. Please allow popups for this site.');
        }

        if (mounted) {
          setMeetingWindow(newWindow);
          setLoading(false);
          
          // Trigger attendance marking after 5 minutes
          setTimeout(async () => {
            try {
              await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/attendance/mark/${classId}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('Attendance marked');
            } catch (err) {
              console.error('Failed to mark attendance:', err);
            }
          }, 5 * 60 * 1000);

          if (onJoined) onJoined();

          // Check if window is closed
          windowCheckInterval = setInterval(() => {
            if (newWindow.closed) {
              console.log('Meeting window closed');
              if (onClose) onClose();
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Error loading Jitsi:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    openJitsiMeeting();

    // Cleanup
    return () => {
      mounted = false;
      if (windowCheckInterval) clearInterval(windowCheckInterval);
      if (meetingWindow && !meetingWindow.closed) {
        meetingWindow.close();
      }
    };
  }, [classId, onClose, onJoined]);

  const handleClose = () => {
    if (meetingWindow && !meetingWindow.closed) {
      meetingWindow.close();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="jitsi-meeting-overlay">
      <div className="jitsi-meeting-container jitsi-window-mode">
        <div className="jitsi-header">
          <h3>Live Class - Meeting Opened in New Window</h3>
          <button className="jitsi-close-btn" onClick={handleClose}>
            ✕ Close & End Meeting
          </button>
        </div>

        {loading && (
          <div className="jitsi-loading">
            <div className="spinner"></div>
            <p>Opening meeting in new window...</p>
            <p style={{ fontSize: '14px', opacity: 0.8, marginTop: '10px' }}>
              If the window didn't open, please allow popups for this site.
            </p>
          </div>
        )}

        {error && (
          <div className="jitsi-error">
            <p>{error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}

        {!loading && !error && (
          <div className="jitsi-window-info">
            <p>✅ Meeting window is open</p>
            <p>You can minimize this and continue using the dashboard.</p>
            <p>Click "Close & End Meeting" when you're done.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JitsiMeeting;
