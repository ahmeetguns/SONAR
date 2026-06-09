import { useState } from "react";

export default function PasswordGate({ onSuccess }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const correct = import.meta.env.VITE_APP_PASSWORD;

  // If no password is set (local dev), skip gate
  if (!correct) {
    onSuccess();
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === correct) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "360px",
        textAlign: "center",
        animation: shake ? "shake 0.4s ease" : "none",
      }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎬</div>
        <h1 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
          SONAR
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginBottom: "32px" }}>
          Enter password to continue
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.08)",
              border: error ? "1px solid #e74c3c" : "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "12px",
            }}
          />
          {error && (
            <p style={{ color: "#e74c3c", fontSize: "13px", marginBottom: "12px" }}>
              Incorrect password
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #6c5ce7, #a855f7)",
              border: "none",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Enter
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
