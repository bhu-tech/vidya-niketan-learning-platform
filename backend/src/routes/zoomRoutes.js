const express = require('express');
const axios = require('axios');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const Class = require('../models/Class');
const router = express.Router();

// Get Zoom access token
const getZoomAccessToken = async () => {
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: process.env.ZOOM_ACCOUNT_ID
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET
      }
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Zoom token:', error);
    throw error;
  }
};

// Create Zoom meeting for a class
router.post('/create-meeting/:classId', authMiddleware, roleMiddleware(['teacher']), async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const token = await getZoomAccessToken();
    
    const meetingData = {
      topic: classData.title,
      type: 2, // Scheduled meeting
      start_time: classData.schedule.date,
      duration: 60,
      timezone: 'UTC',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false
      }
    };

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Update class with Zoom meeting details
    classData.zoomMeetingId = response.data.id;
    classData.zoomJoinUrl = response.data.join_url;
    classData.zoomMeetingLink = response.data.start_url;
    await classData.save();

    res.json({
      meetingId: response.data.id,
      joinUrl: response.data.join_url,
      startUrl: response.data.start_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get meeting details
router.get('/meeting/:meetingId', authMiddleware, async (req, res) => {
  try {
    const token = await getZoomAccessToken();
    
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${req.params.meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
