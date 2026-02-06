import React, { useState } from 'react';
import './LobbyChat.css';

const LobbyChat = ({ messages, onSend, userName, disabled }) => {
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="lobby-chat">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty">No messages yet.</div>
        ) : messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.sender === userName ? 'own' : ''}`}>
            <span className="sender">{msg.sender}:</span> <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={disabled}
        />
        <button type="submit" disabled={disabled || !input.trim()}>Send</button>
      </form>
    </div>
  );
};

export default LobbyChat;
