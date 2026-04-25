const express = require('express');
const { calculateCertScore } = require('./src/certScore');

const app = express();
app.use(express.json());

// POST /api/cert-score - Calcul du score de certification
app.post('/api/cert-score', (req, res) => {
  const { moduleAScore, totalScore, examDurationMinutes, webcamVerified } = req.body;

  // Validation basique des entrées
  if (moduleAScore === undefined || totalScore === undefined || examDurationMinutes === undefined || webcamVerified === undefined) {
    return res.status(400).json({ error: 'Paramètres manquants: moduleAScore, totalScore, examDurationMinutes, webcamVerified' });
  }

  const result = calculateCertScore(moduleAScore, totalScore, examDurationMinutes, webcamVerified);
  return res.json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

module.exports = app;
