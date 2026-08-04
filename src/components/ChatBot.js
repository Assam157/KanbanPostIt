import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';

const ChatBot = () => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I’m your Kanban assistant. Ask me anything or type "suggest" for a new task idea.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { sender: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const endpoint = trimmed.toLowerCase().includes('suggest')
        ? '/api/ai/tasks/suggest'
        : '/api/ai/chat';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(
          endpoint.includes('suggest') ? {} : { message: trimmed }
        ),
      });
      const data = await res.json();
      const reply = data.reply || data.suggestion || 'Sorry, I didn’t understand.';
      setMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={styles.floatingBtn}
        title="Chat with AI assistant"
      >
        💬
      </button>
    );
  }

  return (
    <div style={styles.chatWindow}>
      <div style={styles.header}>
        <span>🤖 Kanban Assistant</span>
        <button onClick={() => setOpen(false)} style={styles.closeBtn}>✕</button>
      </div>
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.msgBubble,
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#f4d03f' : '#f0f0f0',
              color: msg.sender === 'user' ? '#4a2c17' : '#333',
            }}
          >
            {msg.text}
          </div>
        ))}
        {loading && <div style={{ ...styles.msgBubble, background: '#f0f0f0' }}>Thinking...</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something..."
          disabled={loading}
        />
        <button onClick={sendMessage} style={styles.sendBtn} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  floatingBtn: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#6c5ce7',
    color: '#fff',
    fontSize: '28px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatWindow: {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '320px',
    maxHeight: '450px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    overflow: 'hidden',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    background: '#6c5ce7',
    color: '#fff',
    padding: '12px 16px',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    cursor: 'pointer',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  msgBubble: {
    maxWidth: '80%',
    padding: '8px 12px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  inputArea: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #eee',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #ddd',
    outline: 'none',
    fontSize: '14px',
  },
  sendBtn: {
    marginLeft: '8px',
    padding: '8px 16px',
    borderRadius: '20px',
    background: '#6c5ce7',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default ChatBot;