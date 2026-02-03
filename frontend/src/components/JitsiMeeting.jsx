import { useState, useEffect, useRef } from 'react';
import '../styles/JitsiMeeting.css';

const JitsiMeeting = ({ classId, onClose, onJoined }) => {
  const jitsiContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);

  useEffect(() => {
    let api = null;

    const loadJitsiMeet = async () => {
      try {
        // Fetch Jitsi configuration from backend
        const token = localStorage.getItem('token');
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

        // Check if class is live
        if (!config.isLive) {
          setError('This class is not currently live. Please wait for the teacher to start the class.');
          setLoading(false);
          return;
        }

        // Load Jitsi Meet External API
        if (!window.JitsiMeetExternalAPI) {
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = () => initializeJitsi(config);
          script.onerror = () => {
            setError('Failed to load video conferencing. Please refresh and try again.');
            setLoading(false);
          };
          document.body.appendChild(script);
        } else {
          initializeJitsi(config);
        }

        function initializeJitsi(config) {
          const domain = config.domain || 'meet.jit.si';
          const options = {
            roomName: config.roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer.current,
            configOverwrite: config.configOverwrite,
            interfaceConfigOverwrite: config.interfaceConfigOverwrite,
            userInfo: config.userInfo
          };

          api = new window.JitsiMeetExternalAPI(domain, options);

          // Event listeners
          api.addEventListener('videoConferenceJoined', () => {
            setLoading(false);
            console.log('Joined Jitsi meeting');
            
            // Trigger attendance marking (after 5 minutes)
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
            }, 5 * 60 * 1000); // 5 minutes

            if (onJoined) {
              onJoined();
            }
          });

          api.addEventListener('videoConferenceLeft', () => {
            console.log('Left Jitsi meeting');
            if (onClose) {
              onClose();
            }
          });

          api.addEventListener('readyToClose', () => {
            if (onClose) {
              onClose();
            }
          });

          setJitsiApi(api);
        }
      } catch (err) {
        console.error('Error loading Jitsi:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadJitsiMeet();

    // Cleanup
    return () => {
      if (api) {
        api.dispose();
      }
    };
  }, [classId, onClose, onJoined]);

  const handleClose = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('hangup');
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="jitsi-meeting-overlay">
      <div className="jitsi-meeting-container">
        <div className="jitsi-header">
          <h3>Live Class</h3>
          <button className="jitsi-close-btn" onClick={handleClose}>
            ✕ Leave Class
          </button>
        </div>

        {loading && (
          <div className="jitsi-loading">
            <div className="spinner"></div>
            <p>Connecting to live class...</p>
          </div>
        )}

        {error && (
          <div className="jitsi-error">
            <p>{error}</p>
            <button onClick={onClose}>Close</button>
          </div>
        )}

        <div 
          ref={jitsiContainer} 
          className="jitsi-container"
          style={{ display: loading || error ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
};

export default JitsiMeeting;
