import { useState, useEffect } from 'react';
import '../styles/JitsiMeeting.css';

// v2.1 - Embedded Jitsi, no popup window
const JitsiMeeting = ({ classId, onClose, onJoined }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [iframeKey, setIframeKey] = useState(0); // for force reload

  useEffect(() => {
    let mounted = true;

    const requestJoinToken = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/request-join-token`, {
          method: 'POST',
          headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to request join token');
        }
        const data = await response.json();
        return data.token;
      } catch (err) {
        throw err;
      }
    };

    const loadJitsiMeeting = async () => {
      try {
        // Get user info to check if teacher
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isTeacher = user?.role === 'teacher';

        // Fetch Jitsi configuration from backend (teachers don't need tokens)
        const authToken = localStorage.getItem('token');
        let token = null;
        let configUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/classes/${classId}/jitsi-config`;
        if (!isTeacher) {
          try {
            token = await requestJoinToken();
            configUrl = `${configUrl}?token=${token}`;
          } catch (tokenError) {
            setError(tokenError.message);
            setLoading(false);
            return;
          }
        }
        const response = await fetch(configUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to load meeting configuration');
          setLoading(false);
          return;
        }
        const config = await response.json();
        if (!config.isLive) {
          setError('This class is not currently live. Please wait for the teacher to start the class.');
          setLoading(false);
          return;
        }
        // Build Jitsi meeting URL (no password/link shown)
        const domain = config.domain || 'meet.jit.si';
        const roomName = config.roomName;
        const password = config.password || '';
        const displayName = encodeURIComponent(config.userInfo?.displayName || 'User');
        // Lobby enabled for students, teacher bypasses
        const url = `https://${domain}/${roomName}#userInfo.displayName="${displayName}"&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.prejoinPageEnabled=false&config.lobbyEnabled=true&roomPassword="${password}"`;
        if (mounted) {
          setMeetingUrl(url);
          setLoading(false);
          if (onJoined) onJoined();
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadJitsiMeeting();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, iframeKey]);

  // End session on close
  const handleClose = () => {
    setMeetingUrl(null);
    setIframeKey((k) => k + 1); // force iframe reload if needed
    if (onClose) onClose();
  };

  const handleOpenMeeting = () => {
    if (meetingUrl) {
      window.open(meetingUrl, '_blank', 'noopener,noreferrer,width=1200,height=800');
      if (onJoined) onJoined();
    }
  };

  // Determine user role for button label
  let userRole = null;
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user?.role;
    } catch {}
  }
  const meetingBtnLabel = userRole === 'teacher' ? 'Start Live Class' : 'Join Live Class';

  return (
    <div className="jitsi-modal">
      {loading && <div className="jitsi-loading">Loading meeting...</div>}
      {error && <div className="jitsi-error">{error}</div>}
      {meetingUrl && !loading && !error && (
        <button className="jitsi-open-btn" onClick={handleOpenMeeting}>
          {meetingBtnLabel}
        </button>
      )}
      <button className="jitsi-close" onClick={handleClose}>Close</button>
    </div>
  );
};

export default JitsiMeeting;
