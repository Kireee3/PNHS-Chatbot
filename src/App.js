import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { sendMessage } from './geminiService';
import './index.css';

const SUGGESTIONS = [
  'Tell me about PNHS-Main',
  'How do I enroll?',
  'What SHS strands are offered?',
  'What clubs can I join?',
  'Where is the school located?',
  'Who is the principal?',
];

const WELCOME = `Mabuhay! 👋 I'm the **PNHS-Main Assistant**, here to help you with questions about **Parañaque National High School – Main**.

You can ask me about enrollment, programs, facilities, clubs, contact info, and more!`;

function Avatar({ role }) {
  if (role === 'bot') {
    return (
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'white',
        border: '1.5px solid var(--green-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(34,166,72,0.25)',
      }}>
        <img src="/logo.png" alt="PNHS" style={{ width: 28, height: 28, objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      background: 'var(--gray-200)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="var(--gray-600)" />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, padding: '4px 2px', alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--green)',
          animation: 'bounce 1.2s infinite',
          animationDelay: `${i * 0.2}s`,
          opacity: 0.7,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// Auto-converts plain URLs in text to clickable <a> tags
function linkifyText(text, linkStyle, key) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const parts = text.split(urlRegex);
  if (parts.length === 1) return text;
  return (
    <span key={key}>
      {parts.map((part, i) =>
        urlRegex.test(part)
          ? <a key={i} href={part} target="_blank" rel="noreferrer" style={linkStyle}>{part}</a>
          : part
      )}
    </span>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10,
      alignItems: 'flex-end',
      animation: 'fadeUp 0.25s ease',
    }}>
      <Avatar role={msg.role} />
      <div style={{
        maxWidth: '72%',
        padding: msg.typing ? '10px 16px' : '11px 16px',
        borderRadius: isUser ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
        background: isUser
          ? 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)'
          : 'var(--white)',
        color: isUser ? 'var(--white)' : 'var(--gray-800)',
        fontSize: 14,
        lineHeight: 1.6,
        boxShadow: isUser ? '0 2px 12px rgba(34,166,72,0.3)' : 'var(--shadow-sm)',
        border: isUser ? 'none' : '1px solid var(--gray-100)',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>
        {msg.typing ? <TypingIndicator /> : (
          <div className="markdown-body" style={{ color: isUser ? 'var(--white)' : 'inherit' }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => {
                  // Auto-linkify plain URLs inside paragraphs
                  const linkStyle = { color: isUser ? '#a8e6b8' : 'var(--green)', textDecoration: 'underline', wordBreak: 'break-all' };
                  const processed = typeof children === 'string'
                    ? linkifyText(children, linkStyle)
                    : Array.isArray(children)
                      ? children.map((child, i) =>
                          typeof child === 'string' ? linkifyText(child, linkStyle, i) : child
                        )
                      : children;
                  return <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>{processed}</p>;
                },
                ul: ({ children }) => <ul style={{ margin: '6px 0 8px', paddingLeft: 18 }}>{children}</ul>,
                li: ({ children }) => {
                  const linkStyle = { color: isUser ? '#a8e6b8' : 'var(--green)', textDecoration: 'underline', wordBreak: 'break-all' };
                  const processed = Array.isArray(children)
                    ? children.map((child, i) =>
                        typeof child === 'string' ? linkifyText(child, linkStyle, i) : child
                      )
                    : children;
                  return <li style={{ marginBottom: 4 }}>{processed}</li>;
                },
                strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noreferrer"
                    style={{ color: isUser ? '#a8e6b8' : 'var(--green)', textDecoration: 'underline', wordBreak: 'break-all' }}>
                    {children}
                  </a>
                ),
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

export default function App() {
  const savedKey = localStorage.getItem('gemini_api_key') || '';
  const [messages, setMessages] = useState([{ role: 'bot', text: WELCOME }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(savedKey);
  const [showApiInput, setShowApiInput] = useState(!savedKey);
  const [tempKey, setTempKey] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const historyForApi = messages
    .filter(m => !m.typing)
    .slice(1)
    .map(m => ({ role: m.role, text: m.text }));

  async function handleSend(text) {
    const query = text || input.trim();
    if (!query || loading) return;
    setInput('');

    const userMsg = { role: 'user', text: query };
    const typingMsg = { role: 'bot', typing: true, text: '' };
    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);

    try {
      const reply = await sendMessage(historyForApi, query, apiKey);
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'bot', text: reply },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => !m.typing),
        { role: 'bot', text: `⚠️ Error: ${err.message}\n\nPlease check your API key or try again.` },
      ]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function saveApiKey() {
    if (tempKey.trim()) {
      const key = tempKey.trim();
      localStorage.setItem('gemini_api_key', key);
      setApiKey(key);
      setTempKey('');
      setShowApiInput(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0d4a20 0%, #145e2a 40%, #1a7d38 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    }}>
      {/* Decorative bg circles */}
      <div style={{ position:'fixed', top:-80, right:-80, width:320, height:320, borderRadius:'50%', background:'rgba(44,201,90,0.1)', pointerEvents:'none' }} />
      <div style={{ position:'fixed', bottom:-100, left:-60, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        height: '90vh',
        maxHeight: 760,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        background: 'var(--white)',
      }}>

        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green-mid) 100%)',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)',
            border: '2px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, overflow: 'hidden',
          }}>
            <img src="/logo.png" alt="PNHS Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'var(--white)', fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, letterSpacing: 0.3 }}>
              PNHS-Main Assistant
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>
              Parañaque National High School – Main
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.1)', borderRadius: 20,
              padding: '4px 10px',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: apiKey ? '#4ade80' : '#f87171', flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>{apiKey ? 'Online' : 'No API Key'}</span>
            </div>
            {apiKey && (
              <button onClick={() => { setShowApiInput(true); setTempKey(''); }} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)',
                fontSize: 10, cursor: 'pointer', padding: 0, textDecoration: 'underline',
              }}>change key</button>
            )}
          </div>
        </div>

        {/* API KEY BANNER */}
        {showApiInput && (
          <div style={{
            background: '#fffbeb', borderBottom: '1px solid #fde68a',
            padding: '12px 16px', flexShrink: 0,
          }}>
            <p style={{ fontSize: 12, color: '#92400e', marginBottom: 4, fontWeight: 500 }}>
              🔑 Enter your Gemini API key to activate the chatbot
            </p>
            <p style={{ fontSize: 11, color: '#b45309', marginBottom: 8 }}>
              Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#b45309' }}>aistudio.google.com/app/apikey</a>
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="password"
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveApiKey()}
                placeholder="Paste your API key here (AIza...)"
                style={{
                  flex: 1, padding: '7px 12px', fontSize: 13,
                  border: '1px solid #fcd34d', borderRadius: 8,
                  background: 'white', outline: 'none', color: '#1c1917',
                }}
              />
              <button onClick={saveApiKey} style={{
                padding: '7px 14px', fontSize: 13, fontWeight: 500,
                background: 'var(--green)', color: 'white',
                border: 'none', borderRadius: 8, cursor: 'pointer',
              }}>Save</button>
              {apiKey && (
                <button onClick={() => setShowApiInput(false)} style={{
                  padding: '7px 14px', fontSize: 13,
                  background: 'transparent', color: '#92400e',
                  border: '1px solid #fcd34d', borderRadius: 8, cursor: 'pointer',
                }}>Cancel</button>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          background: 'var(--gray-50)',
        }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTIONS */}
        {messages.length <= 2 && (
          <div style={{
            padding: '10px 16px',
            display: 'flex', flexWrap: 'wrap', gap: 6,
            background: 'var(--white)',
            borderTop: '1px solid var(--gray-100)',
            flexShrink: 0,
          }}>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSend(s)}
                disabled={loading}
                style={{
                  fontSize: 12, padding: '5px 12px',
                  border: '1px solid var(--green)',
                  color: 'var(--green)',
                  borderRadius: 20, cursor: 'pointer',
                  background: 'transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-body)',
                }}
                onMouseEnter={e => { e.target.style.background = 'var(--green)'; e.target.style.color = 'white'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--green)'; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div style={{
          padding: '12px 14px',
          background: 'var(--white)',
          borderTop: '1px solid var(--gray-100)',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about PNHS-Main..."
            rows={1}
            disabled={loading}
            style={{
              flex: 1, padding: '10px 14px',
              border: '1.5px solid var(--gray-200)',
              borderRadius: 16,
              fontSize: 14, fontFamily: 'var(--font-body)',
              resize: 'none', outline: 'none',
              background: 'var(--gray-50)',
              color: 'var(--gray-800)',
              transition: 'border-color 0.2s',
              lineHeight: 1.5,
              maxHeight: 100,
              overflow: 'auto',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--green)'}
            onBlur={e => e.target.style.borderColor = 'var(--gray-200)'}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              width: 42, height: 42,
              borderRadius: '50%',
              background: loading || !input.trim()
                ? 'var(--gray-200)'
                : 'linear-gradient(135deg, var(--green-dark) 0%, var(--green) 100%)',
              border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
              boxShadow: loading || !input.trim() ? 'none' : '0 2px 12px rgba(34,166,72,0.4)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                fill={loading || !input.trim() ? 'var(--gray-400)' : 'white'} />
            </svg>
          </button>
        </div>

        {/* FOOTER */}
        <div style={{
          padding: '6px 14px 10px',
          background: 'var(--white)',
          textAlign: 'center',
          fontSize: 11,
          color: 'var(--gray-400)',
          flexShrink: 0,
        }}>
          Powered by Gemini 2.5 Flash · PNHS-Main © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}