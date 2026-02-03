// Jitsi Meeting Utilities

/**
 * Generate a unique Jitsi room name for a class
 * @param {Object} classData - The class object
 * @returns {String} - Unique room name
 */
const generateJitsiRoomName = (classData) => {
  // Create a clean, URL-safe room name
  const cleanTitle = classData.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);
  
  const classId = classData._id.toString().substring(0, 8);
  return `vidya-${cleanTitle}-${classId}`;
};

/**
 * Generate full Jitsi meeting link
 * @param {String} roomName - The Jitsi room name
 * @returns {String} - Full meeting link
 */
const generateJitsiMeetingLink = (roomName) => {
  return `https://meet.jit.si/${roomName}`;
};

/**
 * Create Jitsi meeting configuration for a class
 * @param {Object} classData - The class object
 * @returns {Object} - Jitsi configuration
 */
const createJitsiMeeting = (classData) => {
  const roomName = generateJitsiRoomName(classData);
  const meetingLink = generateJitsiMeetingLink(roomName);
  
  return {
    jitsiRoomName: roomName,
    meetingLink: meetingLink,
    isLive: false
  };
};

/**
 * Get Jitsi embed configuration
 * @param {String} roomName - The Jitsi room name
 * @param {Object} user - The user object
 * @returns {Object} - Configuration for Jitsi iframe
 */
const getJitsiEmbedConfig = (roomName, user) => {
  return {
    roomName: roomName,
    domain: 'meet.jit.si',
    configOverwrite: {
      startWithAudioMuted: true,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      enableClosePage: false
    },
    interfaceConfigOverwrite: {
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
        'fodeviceselection', 'hangup', 'chat', 'raisehand',
        'videoquality', 'tileview', 'settings'
      ],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DEFAULT_BACKGROUND: '#474747',
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true
    },
    userInfo: {
      displayName: user.name,
      email: user.email
    }
  };
};

module.exports = {
  generateJitsiRoomName,
  generateJitsiMeetingLink,
  createJitsiMeeting,
  getJitsiEmbedConfig
};
