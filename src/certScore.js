/**
 * ÉTAPE 1 — CODE VOLONTAIREMENT MAL ÉCRIT
 * =========================================
 * Ce fichier contient la "dette technique intentionnelle" du TP Qualimétrie.
 * La logique métier est regroupée dans une SEULE fonction monolithique
 * avec un maximum de conditions imbriquées (if/else).
 *
 * OBJECTIF : Générer une Complexité Cyclomatique V(G) > 15 pour
 * démontrer les problèmes de qualité mesurés par SonarCloud.
 *
 * NE PAS REFACTORISER CE FICHIER — utiliser certScore.refactored.js pour l'étape 4.
 */

const MAX_SCORE = 1000;
const VALIDATION_THRESHOLD = 700;
const MODULE_A_MIN = 200;
const SPEED_BONUS = 50;
const SPEED_THRESHOLD_MINUTES = 30;

/**
 * calculateCertScore — Fonction monolithique de calcul du score de certification.
 * Règles métier :
 *  - Score max : 1000 | Seuil de validation : 700
 *  - Si moduleAScore < 200 → échec direct (même si total > 700)
 *  - Si examDurationMinutes < 30 → +50 points bonus de rapidité
 *  - Si webcamVerified === false → statut "Attente de validation"
 *
 * @param {number} moduleAScore - Score du module A (0-300)
 * @param {number} totalScore   - Score total brut (0-1000)
 * @param {number} examDurationMinutes - Durée de l'examen en minutes
 * @param {boolean} webcamVerified - Identité webcam vérifiée ?
 * @returns {{ finalScore: number, status: string, passed: boolean, reason: string }}
 */
function calculateCertScore(moduleAScore, totalScore, examDurationMinutes, webcamVerified) {
  // Validation des types d'entrée
  if (typeof moduleAScore !== 'number' || typeof totalScore !== 'number' || typeof examDurationMinutes !== 'number' || typeof webcamVerified !== 'boolean') {
    if (typeof moduleAScore !== 'number') {
      return { finalScore: 0, status: 'Erreur', passed: false, reason: 'moduleAScore doit être un nombre' };
    } else {
      if (typeof totalScore !== 'number') {
        return { finalScore: 0, status: 'Erreur', passed: false, reason: 'totalScore doit être un nombre' };
      } else {
        if (typeof examDurationMinutes !== 'number') {
          return { finalScore: 0, status: 'Erreur', passed: false, reason: 'examDurationMinutes doit être un nombre' };
        } else {
          return { finalScore: 0, status: 'Erreur', passed: false, reason: 'webcamVerified doit être un booléen' };
        }
      }
    }
  } else {
    // Vérification des bornes
    if (totalScore < 0) {
      return { finalScore: 0, status: 'Erreur', passed: false, reason: 'totalScore ne peut pas être négatif' };
    } else {
      if (totalScore > MAX_SCORE) {
        totalScore = MAX_SCORE;
      }

      let finalScore = totalScore;
      let status = '';
      let passed = false;
      let reason = '';

      // Règle 1 : Vérification du Module A (échec direct si < 200)
      if (moduleAScore < MODULE_A_MIN) {
        passed = false;
        reason = `Score du Module A insuffisant (${moduleAScore} < ${MODULE_A_MIN})`;
        if (webcamVerified === false) {
          status = 'Attente de validation';
        } else {
          status = 'Échec';
        }
        return { finalScore: finalScore, status: status, passed: passed, reason: reason };
      } else {
        // Règle 2 : Bonus de rapidité si examen < 30 minutes
        if (examDurationMinutes < SPEED_THRESHOLD_MINUTES) {
          if ((finalScore + SPEED_BONUS) <= MAX_SCORE) {
            finalScore = finalScore + SPEED_BONUS;
            reason = `Bonus de rapidité de ${SPEED_BONUS} points accordé (durée: ${examDurationMinutes} min)`;
          } else {
            finalScore = MAX_SCORE;
            reason = `Bonus de rapidité plafonné au score maximum de ${MAX_SCORE}`;
          }
        } else {
          reason = 'Pas de bonus de rapidité';
        }

        // Règle 3 : Vérification webcam
        if (webcamVerified === false) {
          // Webcam non vérifiée → statut en attente, peu importe le score
          status = 'Attente de validation';
          passed = false;
          if (finalScore >= VALIDATION_THRESHOLD) {
            reason = reason + ' | Score suffisant mais identité non vérifiée';
          } else {
            reason = reason + ' | Score insuffisant et identité non vérifiée';
          }
        } else {
          // Webcam OK — vérification du score final
          if (finalScore >= VALIDATION_THRESHOLD) {
            if (finalScore === MAX_SCORE) {
              status = 'Certifié avec mention';
              passed = true;
            } else {
              if (finalScore >= 900) {
                status = 'Certifié avec distinction';
                passed = true;
              } else {
                status = 'Certifié';
                passed = true;
              }
            }
          } else {
            // Score insuffisant
            passed = false;
            if (finalScore >= 600) {
              status = 'Échec — Proche du seuil';
              reason = reason + ` | Score final: ${finalScore}, il manque ${VALIDATION_THRESHOLD - finalScore} points`;
            } else {
              if (finalScore >= 400) {
                status = 'Échec';
                reason = reason + ` | Score insuffisant: ${finalScore}/${MAX_SCORE}`;
              } else {
                status = 'Échec critique';
                reason = reason + ` | Score très insuffisant: ${finalScore}/${MAX_SCORE}`;
              }
            }
          }
        }

        return {
          finalScore: finalScore,
          status: status,
          passed: passed,
          reason: reason
        };
      }
    }
  }
}

module.exports = { calculateCertScore };
