import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth, useUser } from "@clerk/clerk-react";

function App(){
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setNotes([]); return; }
    (async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(await res.json());
    })();
  }, [isLoaded, isSignedIn, getToken]);

  const addNote = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const token = await getToken();
    const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ text })
    });
    const created = await res.json();
    setNotes(prev => [created, ...prev]);
    setText("");
  };

  const deleteNote = async (id) => {
    const token = await getToken();
    await fetch(`${import.meta.env.VITE_API_BASE}/api/notes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes(prev => prev.filter(n => n._id !== id));
  };

  return (
    <div style={{padding:20}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <h1>My Notes</h1>
        <div>
          <SignedOut><SignInButton/></SignedOut>
          <SignedIn><UserButton/></SignedIn>
        </div>
      </header>

      <SignedIn>
        <form onSubmit={addNote}>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a note" />
          <button>Add</button>
        </form>

        <ul>
          {notes.map(n => (
            <li key={n._id}>
              {n.text} <button onClick={() => deleteNote(n._id)}>Delete</button>
            </li>
          ))}
        </ul>
      </SignedIn>

      <SignedOut>
        <p>Please sign in to manage notes.</p>
      </SignedOut>
    </div>
  );
}

export default App;
