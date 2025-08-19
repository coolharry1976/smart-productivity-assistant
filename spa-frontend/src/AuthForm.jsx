import React, { useState } from "react";
import { api } from "./api";

export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api(`/auth/${mode}`, {
        method: "POST",
        json: { email, password }
      });
      if (res.token) {
        onAuth(res.token);
      } else {
        setError("No token returned");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container">
      <h2>Smart Productivity Assistant</h2>
      <p className="muted">Sign up or log in to manage tasks.</p>

      <form onSubmit={submit} className="card">
        {error && <div className="error">{error}</div>}
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <div className="row space-between">
          <button type="submit">
            {mode === "login" ? "Log In" : "Register"}
          </button>
          <button
            type="button"
            className="link"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Need an account? Register" : "Have an account? Log in"}
          </button>
        </div>
      </form>
    </div>
  );
}
