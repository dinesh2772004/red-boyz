import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Schemas
const memberSchema = new mongoose.Schema({
  name: String,
  phone: String,
  instagram: String,
  imageUrl: String,
});

const eventSchema = new mongoose.Schema({
  name: String,
  date: String,
  description: String,
  venue: String,
  status: { type: String, enum: ["UPCOMING", "COMPLETED"] },
});

const budgetSchema = new mongoose.Schema({
  eventId: String,
  income: [
    {
      contributor: String,
      amount: Number,
      date: String,
    },
  ],
  expenses: [
    {
      description: String,
      amount: Number,
      date: String,
    },
  ],
});

const Member = mongoose.model("Member", memberSchema);
const Event = mongoose.model("Event", eventSchema);
const Budget = mongoose.model("Budget", budgetSchema);

// API Routes

// Members
app.get("/api/members", async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/members", async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(member);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/members/:id", async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    await Budget.findOneAndDelete({ eventId: req.params.id });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Budgets
app.get("/api/budgets", async (req, res) => {
  try {
    const budgets = await Budget.find();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/budgets/:eventId", async (req, res) => {
  try {
    let budget = await Budget.findOne({ eventId: req.params.eventId });
    if (!budget) {
      budget = new Budget({ eventId: req.params.eventId, income: [], expenses: [] });
      await budget.save();
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/budgets/:eventId", async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { eventId: req.params.eventId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Serve static files from React "dist" folder
app.use(express.static(path.join(__dirname, "dist")));

// Catch-all route (React frontend routing)
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
