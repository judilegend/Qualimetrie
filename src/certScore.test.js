/**
 * ÉTAPE 4 — Tests Unitaires (Jest)
 * ==================================
 * Couverture cible : > 70%
 * Ces tests couvrent toutes les règles métier de la logique de certification.
 */

const {
  calculateCertScore,
  validateInputTypes,
  applySpeedBonus,
  determineCertificationStatus
} = require('./certScore.refactored');

// ─── validateInputTypes ───────────────────────────────────────────────────────

describe('validateInputTypes', () => {
  test('retourne valid:true pour des entrées correctes', () => {
    expect(validateInputTypes(200, 750, 40, true)).toEqual({ valid: true });
  });

  test('retourne erreur si moduleAScore n\'est pas un nombre', () => {
    const result = validateInputTypes('abc', 750, 40, true);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/moduleAScore/);
  });

  test('retourne erreur si totalScore n\'est pas un nombre', () => {
    const result = validateInputTypes(200, '750', 40, true);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/totalScore/);
  });

  test('retourne erreur si examDurationMinutes n\'est pas un nombre', () => {
    const result = validateInputTypes(200, 750, '40', true);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/examDurationMinutes/);
  });

  test('retourne erreur si webcamVerified n\'est pas un booléen', () => {
    const result = validateInputTypes(200, 750, 40, 'yes');
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/webcamVerified/);
  });

  test('retourne erreur si totalScore est négatif', () => {
    const result = validateInputTypes(200, -10, 40, true);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/négatif/);
  });
});

// ─── applySpeedBonus ──────────────────────────────────────────────────────────

describe('applySpeedBonus', () => {
  test('accorde +50 points si durée < 30 minutes', () => {
    const { score, reason } = applySpeedBonus(700, 25);
    expect(score).toBe(750);
    expect(reason).toContain('50');
  });

  test('ne dépasse pas 1000 points (plafond)', () => {
    const { score, reason } = applySpeedBonus(980, 20);
    expect(score).toBe(1000);
    expect(reason).toContain('plafonné');
  });

  test('n\'accorde pas de bonus si durée >= 30 minutes', () => {
    const { score, reason } = applySpeedBonus(700, 30);
    expect(score).toBe(700);
    expect(reason).toContain('Pas de bonus');
  });

  test('n\'accorde pas de bonus si durée exactement 30 minutes', () => {
    const { score } = applySpeedBonus(700, 30);
    expect(score).toBe(700);
  });

  test('accorde le bonus si durée = 29 minutes', () => {
    const { score } = applySpeedBonus(700, 29);
    expect(score).toBe(750);
  });
});

// ─── determineCertificationStatus ────────────────────────────────────────────

describe('determineCertificationStatus', () => {
  test('retourne "Certifié" pour un score entre 700 et 899', () => {
    const { status, passed } = determineCertificationStatus(750);
    expect(status).toBe('Certifié');
    expect(passed).toBe(true);
  });

  test('retourne "Certifié avec distinction" pour un score entre 900 et 999', () => {
    const { status, passed } = determineCertificationStatus(950);
    expect(status).toBe('Certifié avec distinction');
    expect(passed).toBe(true);
  });

  test('retourne "Certifié avec mention" pour un score de 1000', () => {
    const { status, passed } = determineCertificationStatus(1000);
    expect(status).toBe('Certifié avec mention');
    expect(passed).toBe(true);
  });

  test('retourne "Échec — Proche du seuil" pour un score entre 600 et 699', () => {
    const { status, passed } = determineCertificationStatus(650);
    expect(status).toBe('Échec — Proche du seuil');
    expect(passed).toBe(false);
  });

  test('retourne "Échec" pour un score entre 400 et 599', () => {
    const { status, passed } = determineCertificationStatus(500);
    expect(status).toBe('Échec');
    expect(passed).toBe(false);
  });

  test('retourne "Échec critique" pour un score < 400', () => {
    const { status, passed } = determineCertificationStatus(300);
    expect(status).toBe('Échec critique');
    expect(passed).toBe(false);
  });
});

// ─── calculateCertScore — Tests d'intégration complets ───────────────────────

describe('calculateCertScore — Règles Métier', () => {

  // ── Règle : Entrées invalides ──────────────────────────────────────────────
  describe('Validation des entrées', () => {
    test('retourne Erreur si moduleAScore n\'est pas un nombre', () => {
      const result = calculateCertScore('abc', 750, 40, true);
      expect(result.status).toBe('Erreur');
      expect(result.passed).toBe(false);
      expect(result.finalScore).toBe(0);
    });

    test('retourne Erreur si totalScore est négatif', () => {
      const result = calculateCertScore(250, -100, 40, true);
      expect(result.status).toBe('Erreur');
      expect(result.passed).toBe(false);
    });
  });

  // ── Règle 1 : Module A < 200 → Échec direct ───────────────────────────────
  describe('Règle : Module A insuffisant', () => {
    test('Échec direct si moduleAScore < 200 (même si total > 700)', () => {
      const result = calculateCertScore(150, 800, 40, true);
      expect(result.passed).toBe(false);
      expect(result.status).toBe('Échec');
      expect(result.reason).toContain('Module A');
    });

    test('Échec avec moduleAScore = 0', () => {
      const result = calculateCertScore(0, 900, 25, true);
      expect(result.passed).toBe(false);
    });

    test('Pas d\'échec si moduleAScore = 200 exactement', () => {
      const result = calculateCertScore(200, 750, 40, true);
      expect(result.passed).toBe(true);
    });

    test('Statut "Attente de validation" si module A < 200 ET webcam non vérifiée', () => {
      const result = calculateCertScore(150, 800, 40, false);
      expect(result.status).toBe('Attente de validation');
      expect(result.passed).toBe(false);
    });
  });

  // ── Règle 2 : Bonus de rapidité ───────────────────────────────────────────
  describe('Règle : Bonus de rapidité', () => {
    test('+50 points si durée < 30 min', () => {
      const result = calculateCertScore(200, 700, 25, true);
      expect(result.finalScore).toBe(750);
    });

    test('Pas de bonus si durée = 30 min', () => {
      const result = calculateCertScore(200, 700, 30, true);
      expect(result.finalScore).toBe(700);
    });

    test('Score plafonné à 1000 avec bonus', () => {
      const result = calculateCertScore(200, 980, 20, true);
      expect(result.finalScore).toBe(1000);
    });
  });

  // ── Règle 3 : Webcam non vérifiée ─────────────────────────────────────────
  describe('Règle : Webcam non vérifiée', () => {
    test('Statut "Attente de validation" si webcam non vérifiée', () => {
      const result = calculateCertScore(250, 750, 40, false);
      expect(result.status).toBe('Attente de validation');
      expect(result.passed).toBe(false);
    });

    test('"Attente de validation" même si score suffisant et module A OK', () => {
      const result = calculateCertScore(250, 800, 25, false);
      expect(result.status).toBe('Attente de validation');
      expect(result.passed).toBe(false);
    });

    test('"Attente de validation" si score insuffisant et webcam non vérifiée', () => {
      const result = calculateCertScore(250, 500, 40, false);
      expect(result.status).toBe('Attente de validation');
      expect(result.passed).toBe(false);
    });
  });

  // ── Cas nominaux ──────────────────────────────────────────────────────────
  describe('Cas nominaux de certification', () => {
    test('Certifié avec mention pour un score de 1000', () => {
      const result = calculateCertScore(250, 1000, 40, true);
      expect(result.status).toBe('Certifié avec mention');
      expect(result.passed).toBe(true);
    });

    test('Score > 1000 est plafonné à 1000', () => {
      const result = calculateCertScore(250, 1200, 40, true);
      expect(result.finalScore).toBe(1000);
    });

    test('Certifié avec distinction pour un score de 950', () => {
      const result = calculateCertScore(250, 950, 40, true);
      expect(result.status).toBe('Certifié avec distinction');
    });

    test('Certifié pour un score de 700 (seuil exact)', () => {
      const result = calculateCertScore(250, 700, 40, true);
      expect(result.status).toBe('Certifié');
      expect(result.passed).toBe(true);
    });

    test('Échec — Proche du seuil pour un score de 680', () => {
      const result = calculateCertScore(250, 680, 40, true);
      expect(result.status).toBe('Échec — Proche du seuil');
      expect(result.passed).toBe(false);
    });

    test('Échec critique pour un score de 200', () => {
      const result = calculateCertScore(250, 200, 40, true);
      expect(result.status).toBe('Échec critique');
      expect(result.passed).toBe(false);
    });
  });
});
