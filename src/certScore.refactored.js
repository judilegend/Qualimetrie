/**
 * ÉTAPE 4 — VERSION REFACTORISÉE (Code Propre)
 * ==============================================
 * Ce fichier est la version refactorisée de certScore.js.
 * Techniques de refactoring appliquées :
 *   1. Early Returns   — élimination des else inutiles après return
 *   2. Sous-fonctions  — chaque règle métier est une fonction indépendante
 *   3. Nommage clair   — variables et fonctions autodocumentées
 *
 * Complexité Cyclomatique V(G) cible : < 5 par fonction
 */

const MAX_SCORE = 1000;
const VALIDATION_THRESHOLD = 700;
const MODULE_A_MIN = 200;
const SPEED_BONUS = 50;
const SPEED_THRESHOLD_MINUTES = 30;

// ─── Sous-fonctions indépendantes ────────────────────────────────────────────

/**
 * Valide les types des paramètres d'entrée.
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateInputTypes(moduleAScore, totalScore, examDurationMinutes, webcamVerified) {
  if (typeof moduleAScore !== 'number') {
    return { valid: false, reason: 'moduleAScore doit être un nombre' };
  }
  if (typeof totalScore !== 'number') {
    return { valid: false, reason: 'totalScore doit être un nombre' };
  }
  if (typeof examDurationMinutes !== 'number') {
    return { valid: false, reason: 'examDurationMinutes doit être un nombre' };
  }
  if (typeof webcamVerified !== 'boolean') {
    return { valid: false, reason: 'webcamVerified doit être un booléen' };
  }
  if (totalScore < 0) {
    return { valid: false, reason: 'totalScore ne peut pas être négatif' };
  }
  return { valid: true };
}

/**
 * Applique le bonus de rapidité si l'examen est terminé en moins de 30 min.
 * @returns {{ score: number, reason: string }}
 */
function applySpeedBonus(score, examDurationMinutes) {
  if (examDurationMinutes >= SPEED_THRESHOLD_MINUTES) {
    return { score, reason: 'Pas de bonus de rapidité' };
  }

  const boostedScore = Math.min(score + SPEED_BONUS, MAX_SCORE);
  const reason = boostedScore === MAX_SCORE
    ? `Bonus de rapidité plafonné au score maximum de ${MAX_SCORE}`
    : `Bonus de rapidité de ${SPEED_BONUS} points accordé (durée: ${examDurationMinutes} min)`;

  return { score: boostedScore, reason };
}

/**
 * Détermine le statut de certification selon le score final.
 * @returns {{ status: string, passed: boolean }}
 */
function determineCertificationStatus(finalScore) {
  if (finalScore < VALIDATION_THRESHOLD) {
    if (finalScore >= 600) return { status: 'Échec — Proche du seuil', passed: false };
    if (finalScore >= 400) return { status: 'Échec', passed: false };
    return { status: 'Échec critique', passed: false };
  }

  if (finalScore === MAX_SCORE) return { status: 'Certifié avec mention', passed: true };
  if (finalScore >= 900) return { status: 'Certifié avec distinction', passed: true };
  return { status: 'Certifié', passed: true };
}

// ─── Fonction principale refactorisée ────────────────────────────────────────

/**
 * calculateCertScore (version refactorisée) — Calcul du score de certification.
 *
 * @param {number}  moduleAScore          - Score du module A (0–300)
 * @param {number}  totalScore            - Score total brut (0–1000)
 * @param {number}  examDurationMinutes   - Durée de l'examen en minutes
 * @param {boolean} webcamVerified        - Identité webcam vérifiée ?
 * @returns {{ finalScore: number, status: string, passed: boolean, reason: string }}
 */
function calculateCertScore(moduleAScore, totalScore, examDurationMinutes, webcamVerified) {
  // 1. Validation des entrées
  const validation = validateInputTypes(moduleAScore, totalScore, examDurationMinutes, webcamVerified);
  if (!validation.valid) {
    return { finalScore: 0, status: 'Erreur', passed: false, reason: validation.reason };
  }

  const clampedScore = Math.min(totalScore, MAX_SCORE);

  // 2. Règle du Module A — échec direct si < 200
  if (moduleAScore < MODULE_A_MIN) {
    const status = webcamVerified ? 'Échec' : 'Attente de validation';
    return {
      finalScore: clampedScore,
      status,
      passed: false,
      reason: `Score du Module A insuffisant (${moduleAScore} < ${MODULE_A_MIN})`
    };
  }

  // 3. Bonus de rapidité
  const { score: finalScore, reason: bonusReason } = applySpeedBonus(clampedScore, examDurationMinutes);

  // 4. Webcam non vérifiée — mise en attente
  if (!webcamVerified) {
    const webcamNote = finalScore >= VALIDATION_THRESHOLD
      ? 'Score suffisant mais identité non vérifiée'
      : 'Score insuffisant et identité non vérifiée';
    return {
      finalScore,
      status: 'Attente de validation',
      passed: false,
      reason: `${bonusReason} | ${webcamNote}`
    };
  }

  // 5. Détermination du statut final
  const { status, passed } = determineCertificationStatus(finalScore);
  const scoreNote = !passed
    ? ` | Score final: ${finalScore}, il manque ${Math.max(0, VALIDATION_THRESHOLD - finalScore)} points`
    : '';

  return {
    finalScore,
    status,
    passed,
    reason: `${bonusReason}${scoreNote}`
  };
}

module.exports = {
  calculateCertScore,
  validateInputTypes,
  applySpeedBonus,
  determineCertificationStatus
};
