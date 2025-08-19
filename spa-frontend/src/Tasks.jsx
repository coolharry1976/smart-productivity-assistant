import { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const TABS = ["all", "open", "done"];
const SORTS = [
  { value: "createdDesc", label: "Newest" },
  { value: "createdAsc", label: "Oldest" },
  { value: "dueAsc", label: "Due soon" },
  { value: "dueDesc", label: "Due last" },
];

export default function Tasks({ token, onSignOut }) {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("dueAsc");
  const [toast, setToast] = useState("");

  async function refresh() {
    const res = await api("/tasks", { token });
    setItems(res.items || []);
  }

  useEffect(() => { refresh(); }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function createTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const dueISO = date ? new Date(date).toISOString() : undefined;
    await api("/tasks", { method: "POST", token, json: { title, dueDate: dueISO } });
    setTitle(""); setDate("");
    showToast("Task added");
    refresh();
  }

  async function toggle(t) {
    const next = t.status === "done" ? "open" : "done";
    await api(`/tasks/${t.taskId}`, { method: "PUT", token, json: { status: next } });
    showToast(next === "done" ? "Marked done" : "Reopened");
    refresh();
  }

  async function remove(t) {
    await api(`/tasks/${t.taskId}`, { method: "DELETE", token });
    showToast("Task deleted");
    refresh();
  }

  const view = useMemo(() => {
    let list = [...items];
    if (tab !== "all") list = list.filter(t => t.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(t => (t.title || "").toLowerCase().includes(s));
    }
    const getTime = d => (d ? new Date(d).getTime() : Number.POSITIVE_INFINITY);
    switch (sort) {
      case "createdAsc": list.sort((a,b)=> new Date(a.createdAt)-new Date(b.createdAt)); break;
      case "createdDesc": list.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt)); break;
      case "dueAsc": list.sort((a,b)=> getTime(a.dueDate)-getTime(b.dueDate)); break;
      case "dueDesc": list.sort((a,b)=> getTime(b.dueDate)-getTime(a.dueDate)); break;
    }
    return list;
  }, [items, tab, q, sort]);

  return (
    <div className="container">
      {/* App bar */}
      <div className="row space-between appbar">
        <div className="title">
          <h2>Smart Productivity Assistant</h2>
          <div className="muted">Stay on top of your tasks</div>
        </div>
        {onSignOut && <button className="secondary" onClick={onSignOut}>Sign out</button>}
      </div>

      {/* Create */}
      <div className="card create-row row">
        <input
          type="text"
          placeholder="Add a task…"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          title="Optional due date"
        />
        <button onClick={createTask}>Add</button>
      </div>

      {/* Filters */}
      <div className="filters card">
        <div className="row space-between">
          <div className="tabs">
            {TABS.map(t => (
              <button
                key={t}
                className={`tab ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
          </div>
          <div className="row">
            <input
              className="search"
              placeholder="Search title…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <select value={sort} onChange={e=>setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {view.length === 0 ? (
        <div className="empty card">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 7h8M6 11h12M10 15h8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div>No tasks match your view.</div>
          <div className="muted">Try switching tabs, clearing search, or adding a task.</div>
        </div>
      ) : (
        <ul className="list">
          {view.map(t => (
            <li key={t.taskId} className="item">
              <div className="left">
                <div
                  className={`checkbox ${t.status === "done" ? "checked" : ""}`}
                  onClick={() => toggle(t)}
                  role="checkbox"
                  aria-checked={t.status === "done"}
                >
                  <span>✓</span>
                </div>
                <div className={`title ${t.status === "done" ? "done" : ""}`}>
                  {t.title}
                  {t.dueDate && (
                    <span className="badge" style={{marginLeft:8}}>
                      due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="row">
                {t.status !== "done" ? (
                  <button onClick={() => toggle(t)}>Done</button>
                ) : (
                  <button className="secondary" onClick={() => toggle(t)}>Reopen</button>
                )}
                <button className="danger" onClick={() => remove(t)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
