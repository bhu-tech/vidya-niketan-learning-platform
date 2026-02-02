import { useEffect, useRef } from 'react';
import { attendanceAPI } from '../utils/api';
import { useAuth } from './useAuth';

/**
 * Hook to automatically mark student attendance when viewing a live class
 * Marks attendance if 5+ minutes have passed since class start
 */
export const useAttendance = (classId, classStartTime) => {
  const { user } = useAuth();
  const attendanceMarkedRef = useRef(false);

  useEffect(() => {
    if (!classId || !classStartTime || user?.role !== 'student') {
      return;
    }

    // Only mark attendance once per session
    if (attendanceMarkedRef.current) {
      return;
    }

    const markAttendance = async () => {
      try {
        const now = new Date();
        const classStart = new Date(classStartTime);
        const minutesElapsed = (now - classStart) / (1000 * 60);

        // Only mark if 5+ minutes have passed since class start
        if (minutesElapsed >= 5) {
          const result = await attendanceAPI.markAttendance(classId, now.toISOString());
          attendanceMarkedRef.current = true;
          console.log('Attendance marked:', result);
        } else {
          // Try again in a few seconds
          setTimeout(markAttendance, 30000); // Check every 30 seconds
        }
      } catch (error) {
        console.log('Attendance marking error:', error.message);
        // Don't keep retrying on errors
        attendanceMarkedRef.current = true;
      }
    };

    markAttendance();
  }, [classId, classStartTime, user]);
};
