import { useEffect, useState } from "react";
import AuthForm from "./AuthForm";
import Tasks from "./Tasks";
import "./styles.css";

export default function App() {
  const [token, setToken] = useState(null);

  // Load saved session on first render
  useEffect(() => {
    const saved = localStorage.getItem("spa_token");
    if (saved) setToken(saved);
  }, []);

  // Called by AuthForm when login/register succeeds
  function onAuth(newToken) {
    setToken(newToken);
    localStorage.setItem("spa_token", newToken);
  }

  function signOut() {
    setToken(null);
    localStorage.removeItem("spa_token");
  }

  if (!token) {
    // Not logged in: show auth screen
    return <AuthForm onAuth={onAuth} />;
  }

  // Logged in: simple top bar + tasks UI
  return (
    <>
      <div className="container">
        <div className="row space-between" style={{ marginBottom: 14 }}>
          <h1>Smart Productivity Assistant</h1>
          <button className="secondary" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <Tasks token={token} onSignOut={signOut} />
    </>
  );
}
