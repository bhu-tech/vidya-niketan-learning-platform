import React from 'react';
import './TeacherLobbyPanel.css';

const TeacherLobbyPanel = ({ waitingStudents, onAdmit, onDeny, onAdmitAll, onMessageAll, onLockLobby, lobbyLocked }) => {
  return (
    <div className="teacher-lobby-panel">
      <h3>Lobby - Waiting Students</h3>
      <div className="lobby-controls">
        <button onClick={onAdmitAll} disabled={waitingStudents.length === 0}>Admit All</button>
        <button onClick={onMessageAll}>Message All</button>
        <button onClick={onLockLobby}>{lobbyLocked ? 'Unlock Lobby' : 'Lock Lobby'}</button>
      </div>
      <ul className="lobby-student-list">
        {waitingStudents.length === 0 ? (
          <li className="empty">No students waiting</li>
        ) : waitingStudents.map((student, i) => (
          <li key={student.id || i} className="lobby-student">
            <img src={student.avatar || '/images/default-avatar.png'} alt="avatar" className="avatar" />
            <span className="name">{student.name}</span>
            <span className="join-time">{student.joinTime}</span>
            <button className="admit" onClick={() => onAdmit(student.id)}>Admit</button>
            <button className="deny" onClick={() => onDeny(student.id)}>Deny</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherLobbyPanel;
