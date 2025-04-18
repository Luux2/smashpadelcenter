// routes/matches.js
const express = require("express");
const router = express.Router();
const padelMatchService = require("../Services/padelMatchService");

// GET /api/v1/matches - Get all matches
router.get("/", async (req, res) => {
  try {
    const matches = await padelMatchService.getAllMatches();
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/v1/matches - Create a new match
router.post("/", async (req, res) => {
  try {
    const newMatch = await padelMatchService.createMatch(req.body);
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/join", async (req, res) => {
  try {
    const { username } = req.body;
    const match = await padelMatchService.joinMatch(req.params.id, username);
    const io = req.app.get("socketio");
    console.log("Emitting matchUpdated for match:", match.id);
    io.to(req.params.id).emit("matchUpdated", match);
    res.json(match);
  } catch (error) {
    console.error("joinMatch error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.post("/:id/confirm", async (req, res) => {
  try {
    const { username } = req.body;
    const match = await padelMatchService.confirmJoin(req.params.id, username);
    const io = req.app.get("socketio");
    console.log("Emitting matchUpdated for match:", match.id);
    io.to(req.params.id).emit("matchUpdated", match);
    res.json(match);
  } catch (error) {
    console.error("confirmJoin error:", error);
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/v1/matches/:id/reserve - Reserve or unreserve a spot
router.patch("/:id/reserve", async (req, res) => {
  try {
    const { spotIndex, reserve } = req.body;
    const matches = await padelMatchService.reserveSpots(
      req.params.id,
      spotIndex,
      reserve
    );
    res.json(matches);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/v1/matches/:id - Delete a match
router.delete("/:id", async (req, res) => {
  try {
    const matches = await padelMatchService.deleteMatch(req.params.id);
    res.json(matches);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// GET /api/v1/matches/:id - Get a single match by ID
router.get("/:id", async (req, res) => {
  try {
    const match = await padelMatchService.getMatchById(req.params.id);
    res.json(match);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// GET /api/v1/matches/:username - Get matches for a player by username
router.get("/player/:username", async (req, res) => {
  try {
    const matches = await padelMatchService.getMatchesByPlayer(
      req.params.username
    );
    res.json(matches);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
