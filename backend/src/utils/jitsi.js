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
 * Generate a secure meeting password
 * @param {Object} classData - The class object
 * @returns {String} - Meeting password
 */
const generateMeetingPassword = (classData) => {
  // Generate a password based on class ID (consistent for same class)
  const classId = classData._id.toString();
  const hash = require('crypto').createHash('sha256').update(classId).digest('hex');
  return hash.substring(0, 12); // 12 character password
};

/**
 * Create Jitsi meeting configuration for a class
 * @param {Object} classData - The class object
 * @returns {Object} - Jitsi configuration
 */
const createJitsiMeeting = (classData) => {
  const roomName = generateJitsiRoomName(classData);
  const meetingLink = generateJitsiMeetingLink(roomName);
  const password = generateMeetingPassword(classData);
  
  return {
    jitsiRoomName: roomName,
    meetingLink: meetingLink,
    meetingPassword: password,
    isLive: false
  };
};

/**
 * Get Jitsi embed configuration
 * @param {String} roomName - The Jitsi room name
 * @param {Object} user - The user object
 * @param {String} password - The meeting password
 * @param {Boolean} isModerator - Whether user is moderator (teacher)
 * @returns {Object} - Configuration for Jitsi iframe
 */
const getJitsiEmbedConfig = (roomName, user, password, isModerator = false) => {
  return {
    roomName: roomName,
    password: password,
    domain: 'meet.jit.si',
    isModerator: isModerator,
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      enableClosePage: false,
      disableModeratorIndicator: false,
      startScreenSharing: false,
      enableEmailInStats: false,
      // Enable lobby - students wait for teacher approval
      enableLobbyChat: true,
      lobbyEnabled: true,
      requireDisplayName: true,
      enableNoAudioDetection: true,
      enableNoisyMicDetection: true,
      resolution: 720,
      constraints: {
        video: {
          height: { ideal: 720, max: 1080, min: 240 }
        }
      }
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
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      DISABLE_VIDEO_BACKGROUND: false,
      VIDEO_QUALITY_LABEL_DISABLED: false
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
  generateMeetingPassword,
  createJitsiMeeting,
  getJitsiEmbedConfig
};
