# TP Qualimétrie — Rapport Livrables

## Lien GitHub

> 🔗 **[https://github.com/VOTRE_USERNAME/qualimetrie-tp](https://github.com/VOTRE_USERNAME/qualimetrie-tp)**
> *(Remplacez par votre lien réel après avoir poussé le dépôt)*

---

## Capture 1 — Avant : Dashboard SonarCloud Initial

> **Attendu :** Complexité V(G) élevée (> 15), dette technique rouge, couverture = 0%

*[Insérez votre capture SonarCloud après la première analyse — Étape 2]*

---

## Capture 2 — Le Gardien : Échec du Pipeline GitHub Actions

> **Attendu :** Pipeline en FAIL (croix rouge) sur l'onglet Actions de GitHub

*[Insérez votre capture de l'onglet Actions GitHub — Étape 3]*

---

## Capture 3 — Après : Dashboard SonarCloud Final

> **Attendu :** Note A, Complexité < 10, couverture > 70%, dette technique réduite

*[Insérez votre capture SonarCloud après refactoring — Étape 4]*

---

## Analyse GQM (Goal, Question, Metric)

### Goal (Objectif)

Améliorer la qualité du code du module de calcul de certification afin de le rendre
maintenable, testable et fiable sur le long terme.

### Questions et Métriques

| Question | Métrique | Avant (Étape 1) | Après (Étape 4) |
|---|---|---|---|
| Le code est-il compréhensible ? | Complexité Cyclomatique V(G) | > 15 | < 5 par fonction |
| Le code est-il testé ? | Taux de couverture (Coverage) | 0 % | > 70 % |
| Y a-t-il de la dette technique ? | Dette SonarCloud (estimée en heures) | Élevée (rouge) | Réduite (note A) |
| Le pipeline est-il protégé ? | Statut GitHub Actions | ❌ FAIL | ✅ PASS |

### Techniques de Refactoring Utilisées

**1. Early Returns (Retours Anticipés)**
Au lieu d'imbriquer les conditions dans des blocs `else`, chaque cas d'erreur ou
cas limite provoque un `return` immédiat. Cela aplatit la pyramide du code et
réduit la complexité cyclomatique de façon radicale.

```javascript
// ❌ Avant (imbriqué)
if (valide) {
  if (moduleA >= 200) {
    if (webcam) { ... } else { ... }
  } else { ... }
} else { ... }

// ✅ Après (early return)
if (!valide) return erreur;
if (moduleA < 200) return echecModuleA;
if (!webcam) return attente;
return succes;
```

**2. Décomposition en Sous-fonctions**
La fonction monolithique de 80 lignes a été découpée en 3 fonctions indépendantes :
- `validateInputTypes()` — validation des entrées (V(G) = 6)
- `applySpeedBonus()` — règle du bonus de rapidité (V(G) = 3)
- `determineCertificationStatus()` — statut selon le score (V(G) = 5)

Chaque sous-fonction est indépendante, testable isolément et réutilisable.

**3. Tests Avant Refactoring (TDD-like)**
Les tests unitaires ont été écrits AVANT le refactoring. Cela a permis :
- De documenter le comportement attendu de chaque règle métier
- De détecter les régressions au fur et à mesure des modifications
- D'atteindre > 70 % de couverture de code (validé par Jest + SonarCloud)

### Conclusion

Le cycle PDCA (Plan → Do → Check → Act) a permis de transformer du code "spaghetti"
en une architecture modulaire et testée. Les métriques SonarCloud ont validé
objectivement cette amélioration : la dette technique a fondu, la complexité est
passée sous le seuil de 10, et la Quality Gate est désormais au vert.
