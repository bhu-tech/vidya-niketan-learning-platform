import { useState, useEffect, useRef } from 'react';
import '../styles/JitsiMeeting.css';

const JitsiMeeting = ({ classId, onClose, onJoined }) => {
  const jitsiContainer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);

  useEffect(() => {
    let api = null;
    let mounted = true;

    const loadJitsiMeet = async () => {
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

        // Load Jitsi Meet External API
        if (!window.JitsiMeetExternalAPI) {
          console.log('Loading Jitsi external API script...');
          const script = document.createElement('script');
          script.src = 'https://meet.jit.si/external_api.js';
          script.async = true;
          script.onload = () => {
            console.log('Jitsi script loaded successfully');
            if (mounted) initializeJitsi(config);
          };
          script.onerror = () => {
            console.error('Failed to load Jitsi script');
            if (mounted) {
              setError('Failed to load video conferencing. Please check your internet connection.');
              setLoading(false);
            }
          };
          document.body.appendChild(script);
        } else {
          console.log('Jitsi API already loaded');
          if (mounted) initializeJitsi(config);
        }

        function initializeJitsi(config) {
          console.log('Initializing Jitsi with config:', config);
          
          if (!jitsiContainer.current) {
            console.error('Jitsi container not found');
            if (mounted) {
              setError('Failed to initialize meeting container');
              setLoading(false);
            }
            return;
          }

          const domain = config.domain || 'meet.jit.si';
          const options = {
            roomName: config.roomName,
            width: '100%',
            height: '100%',
            parentNode: jitsiContainer.current,
            configOverwrite: {
              prejoinPageEnabled: false,
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              disableDeepLinking: true
            },
            interfaceConfigOverwrite: {
              TOOLBAR_BUTTONS: [
                'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                'fodeviceselection', 'hangup', 'chat', 'raisehand',
                'videoquality', 'tileview'
              ],
              SHOW_JITSI_WATERMARK: false,
              SHOW_WATERMARK_FOR_GUESTS: false
            },
            userInfo: {
              displayName: config.userInfo?.displayName || 'User',
              email: config.userInfo?.email || ''
            }
          };

          console.log('Creating Jitsi API instance');

          try {
            api = new window.JitsiMeetExternalAPI(domain, options);
            console.log('Jitsi API instance created');

            // Hide loading screen after 2 seconds regardless
            setTimeout(() => {
              if (mounted && loading) {
                console.log('Auto-hiding loading screen after 2 seconds');
                setLoading(false);
              }
            }, 2000);
          } catch (err) {
            console.error('Error creating Jitsi instance:', err);
            if (mounted) {
              setError('Failed to initialize video meeting: ' + err.message);
              setLoading(false);
            }
            return;
          }

          // Event listeners
          api.addEventListener('videoConferenceJoined', () => {
            console.log('Successfully joined Jitsi meeting');
            if (mounted) setLoading(false);
            
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
            }, 5 * 60 * 1000);

            if (onJoined) onJoined();
          });

          api.addEventListener('videoConferenceLeft', () => {
            console.log('Left Jitsi meeting');
            if (onClose) onClose();
          });

          api.addEventListener('readyToClose', () => {
            console.log('Jitsi ready to close');
            if (onClose) onClose();
          });

          api.addEventListener('errorOccurred', (e) => {
            console.error('Jitsi error:', e);
          });

          if (mounted) setJitsiApi(api);
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
      mounted = false;
      if (api) {
        console.log('Disposing Jitsi API');
        try {
          api.dispose();
        } catch (err) {
          console.error('Error disposing Jitsi:', err);
        }
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
