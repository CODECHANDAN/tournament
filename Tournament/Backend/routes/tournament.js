const express = require('express');
const router = express.Router();

const Tournament = require('../models/tournament');

// Middleware function to get a tournament by ID
async function getTournament(req, res, next) {
  let tournament;

  try {
    tournament = await Tournament.findById(req.params.id).populate('players');
    if (tournament == null) {
      return res.status(404).json({ message: 'Cannot find tournament' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.tournament = tournament;
  next();
}

// Get all tournaments
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('players');
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new tournament
router.post('/', async (req, res) => {
  const tournament = new Tournament({
    name: req.body.name,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  });

  try {
    const newTournament = await tournament.save();
    res.status(201).json(newTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get a tournament by ID
router.get('/:id', getTournament, (req, res) => {
  res.json(res.tournament);
});

// Update a tournament by ID
router.patch('/:id', getTournament, async (req, res) => {
  if (req.body.name != null) {
    res.tournament.name = req.body.name;
  }
  if (req.body.startDate != null) {
    res.tournament.startDate = req.body.startDate;
  }
  if (req.body.endDate != null) {
    res.tournament.endDate = req.body.endDate;
  }
  try {
    const updatedTournament = await res.tournament.save();
    res.json(updatedTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a tournament by ID
router.delete('/:id', getTournament, async (req, res) => {
  try {
    await res.tournament.remove();
    res.json({ message: 'Tournament deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a player to a tournament
router.post('/:id/players', getTournament, async (req, res) => {
  res.tournament.players.push(req.body.playerId);
  try {
    const updatedTournament = await res.tournament.save();
    res.json(updatedTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a player from a tournament
router.delete('/:id/players/:playerId', getTournament, async (req, res) => {
  res.tournament.players = res.tournament.players.filter(
    (playerId) => playerId.toString() !== req.params.playerId
  );
  try {
    const updatedTournament = await res.tournament.save();
    res.json(updatedTournament);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
