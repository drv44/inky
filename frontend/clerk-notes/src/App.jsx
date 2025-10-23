import React, { useEffect, useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";

export default function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  // useEffect(() => {
  //   if (!isLoaded || !isSignedIn) return;
  //   (async () => {
  //     try {
  //       const token = await getToken();
  //       const res = await fetch(`${API_BASE}/api/notes`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (!res.ok) throw new Error("Failed to fetch");
  //       const data = await res.json();
  //       setNotes(data || []);
  //     } catch (err) {
  //       console.error("fetch notes error", err);
  //     }
  //   })();
  // }, [isLoaded, isSignedIn, getToken]);

//   useEffect(() => {
//   if (!isLoaded || !isSignedIn) return;
//   (async () => {
//     try {
//       const token = await getToken();
//       console.log("GET notes - token length:", token?.length);
//       const res = await fetch(`${API_BASE}/api/notes`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       console.log("GET /api/notes status:", res.status);
//       const data = await res.json();
//       setNotes(data);
//     } catch (err) {
//       console.error("fetch notes error", err);
//     }
//   })();
// }, [isLoaded, isSignedIn, getToken]);

useEffect(() => {
  if (!isLoaded || !isSignedIn) return;
  (async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("GET /api/notes status:", res.status);
      if (!res.ok) {
        // Avoid setting a non-array into notes
        const err = await res.json().catch(() => ({}));
        console.error("GET notes failed:", err);
        setNotes([]); // keep UI stable
        return;
      }
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch notes error", err);
      setNotes([]); // fail-safe
    }
  })();
}, [isLoaded, isSignedIn, getToken]);


  // const addNote = async (e) => {
  //   e?.preventDefault?.();
  //   if (!text.trim()) return;
  //   try {
  //     const token = await getToken();
  //     const res = await fetch(`${API_BASE}/api/notes`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  //       body: JSON.stringify({ text: text.trim() }),
  //     });
  //     const created = await res.json();
  //     setNotes((p) => [created, ...p]);
  //     setText("");
  //   } catch (err) {
  //     console.error("add note error", err);
  //   }
  // };

  const addNote = async (e) => {
  e?.preventDefault?.();
  if (!text.trim()) return;
  try {
    const token = await getToken();
    console.log("POST token length:", token?.length);
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text: text.trim() }),
    });
    console.log("POST /api/notes status", res.status);
    const json = await res.json();
    if (!res.ok) { console.error("server error:", json); return; }
    setNotes(p => [json, ...p]);
    setText("");
  } catch (err) {
    console.error("add note error", err);
  }
};

  const deleteNote = async (id) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes((p) => p.filter((n) => n._id !== id));
    } catch (err) {
      console.error("delete note", err);
    }
  };

  const dt = new Intl.DateTimeFormat(undefined, {dateStyle: "medium", timeStyle: "short"});

  return (
    <div className="app-shell">
      <div className="container">
        <header className="header">
          <div className="title">
            <h1>My Notes</h1>
            <div className="subtitle">Secure notes for an easy life</div>
          </div>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn btn-ghost">Sign in</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </header>

        <div className="panel">
          <SignedOut>
            <div className="empty">
              Please sign in to add and view your notes.
            </div>
          </SignedOut>

          <SignedIn>
            <form className="form-row" onSubmit={addNote}>
              <div className="input">
                <input
                  placeholder="Write a note"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-label="Note text"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </form>

            <div className="notes" aria-live="polite">
              {notes.length === 0 && <div className="empty">No notes yet — add one above.</div>}
              {notes.map((n) => (
                <div className="note" key={n._id || n.id}>
                  <div className="note-text">{n.text}</div>
                  <div className="note-meta">
                    {n.createdAt ? dt.format(new Date(n.createdAt)) : ""}
                  </div>
                  <div style={{marginLeft:12}}>
                    <button className="btn btn-ghost" onClick={() => deleteNote(n._id || n.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
