// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import { MongoClient, ObjectId } from "mongodb";
// import { clerkMiddleware, getAuth } from "@clerk/express";

// dotenv.config();
// const PORT = process.env.PORT || 4000;
// const MONGO_URI = process.env.MONGODB_URI;
// const DB_NAME = process.env.DB_NAME || "notesdb";

// const app = express();
// app.use(cors()); // dev: allows all. In prod lock origin.
// app.use(express.json());
// app.use(clerkMiddleware());

// let db;
// const client = new MongoClient(MONGO_URI);
// await client.connect();
// db = client.db(DB_NAME);
// const notesColl = db.collection("notes");

// app.get("/api/notes", async (req, res) => {
//   console.log("GET /api/notes headers:", req.headers);
//   const auth = getAuth(req);
//   console.log("getAuth(req) =>", auth);
//   if (!auth.isSignedIn)
//     return res.status(401).json({ error: "Unauthenticated" });

//   try {
//     const docs = await notesColl
//       .find({ owner: auth.userId })
//       .sort({ createdAt: -1 })
//       .toArray();
//     // convert ObjectId to string
//     const out = docs.map((d) => ({ ...d, _id: d._id.toString() }));
//     res.json(out);
//   } catch (err) {
//     console.error("GET notes error", err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

// app.post("/api/notes", async (req, res) => {
//   console.log("POST /api/notes headers:", req.headers);
//   console.log("POST body:", req.body);
//   const auth = getAuth(req);
//   console.log("getAuth(req) =>", auth);
//   if (!auth.isSignedIn)
//     return res.status(401).json({ error: "Unauthenticated" });

//   const { text } = req.body;
//   if (!text) return res.status(400).json({ error: "Missing text" });

//   try {
//     const doc = { owner: auth.userId, text, createdAt: new Date() };
//     const result = await notesColl.insertOne(doc);
//     doc._id = result.insertedId.toString(); // return string id
//     res.status(201).json(doc);
//   } catch (err) {
//     console.error("POST notes error", err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

// app.delete("/api/notes/:id", async (req, res) => {
//   console.log("DELETE /api/notes/:id headers:", req.headers);
//   const auth = getAuth(req);
//   console.log("getAuth(req) =>", auth);

//   if (!auth.isSignedIn)
//     return res.status(401).json({ error: "Unauthenticated" });
//   const id = req.params.id;
//   try {
//     const found = await notesColl.findOne({ _id: new ObjectId(id) });
//     if (!found) return res.status(404).json({ error: "Not found" });
//     if (found.owner !== auth.userId)
//       return res.status(403).json({ error: "Forbidden" });

//     await notesColl.deleteOne({ _id: new ObjectId(id) });
//     res.json({ success: true });
//   } catch (err) {
//     console.error("DELETE error", err);
//     res.status(500).json({ error: "DB error" });
//   }
// });

// app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));


import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import { clerkMiddleware, getAuth } from "@clerk/express";

dotenv.config();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "notesdb";

const app = express();
app.use(cors());
app.use(express.json());
// clerk middleware attaches auth state to the request
app.use(clerkMiddleware()); // overview docs show it attaches auth to req [web:3]

let db;
const client = new MongoClient(MONGO_URI);
await client.connect();
db = client.db(DB_NAME);
const notesColl = db.collection("notes");

app.get("/api/notes", async (req, res) => {
  const auth = getAuth(req); // returns Auth object with userId, sessionId, etc. [web:31]
  if (!auth.userId) return res.status(401).json({ error: "Unauthenticated" }); // not isSignedIn [web:31]

  try {
    const docs = await notesColl.find({ owner: auth.userId }).sort({ createdAt: -1 }).toArray();
    const out = docs.map(d => ({ ...d, _id: d._id.toString() }));
    res.json(out);
  } catch (err) {
    console.error("GET notes error", err);
    res.status(500).json({ error: "DB error" });
  }
});

app.post("/api/notes", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Unauthenticated" }); // not isSignedIn [web:31]

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  try {
    const doc = { owner: auth.userId, text, createdAt: new Date() };
    const result = await notesColl.insertOne(doc);
    doc._id = result.insertedId.toString();
    res.status(201).json(doc);
  } catch (err) {
    console.error("POST notes error", err);
    res.status(500).json({ error: "DB error" });
  }
});

app.delete("/api/notes/:id", async (req, res) => {
  const auth = getAuth(req);
  if (!auth.userId) return res.status(401).json({ error: "Unauthenticated" }); // not isSignedIn [web:31]

  const id = req.params.id;
  try {
    const found = await notesColl.findOne({ _id: new ObjectId(id) });
    if (!found) return res.status(404).json({ error: "Not found" });
    if (found.owner !== auth.userId) return res.status(403).json({ error: "Forbidden" });

    await notesColl.deleteOne({ _id: new ObjectId(id) });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE error", err);
    res.status(500).json({ error: "DB error" });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
