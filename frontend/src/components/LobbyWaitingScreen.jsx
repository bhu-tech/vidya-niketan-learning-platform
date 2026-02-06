import React from 'react';
import './LobbyWaitingScreen.css';

const LobbyWaitingScreen = ({ className, teacherName, startTime, rules, funFact, onTestMic, onTestCam }) => {
  return (
    <div className="lobby-waiting-screen">
      <h2>Waiting for Teacher to Admit You…</h2>
      <div className="lobby-info">
        <p><strong>Class:</strong> {className}</p>
        <p><strong>Teacher:</strong> {teacherName}</p>
        <p><strong>Start Time:</strong> {startTime}</p>
      </div>
      <div className="lobby-loader" />
      <div className="lobby-actions">
        <button onClick={onTestMic}>Test Microphone</button>
        <button onClick={onTestCam}>Test Camera</button>
      </div>
      <div className="lobby-fun-fact">
        <em>{funFact || 'Did you know? The Eiffel Tower can be 15 cm taller during hot days.'}</em>
      </div>
      <div className="lobby-rules">
        <h4>Class Rules</h4>
        <ul>
          {rules && rules.length > 0 ? rules.map((r, i) => <li key={i}>{r}</li>) : <li>Keep your mic muted until called.</li>}
        </ul>
      </div>
    </div>
  );
};

export default LobbyWaitingScreen;
