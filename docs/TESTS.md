# Rapport de validation — OKOKO 3.0.2

Contrôles exécutés le **1er novembre 2026**, dans le cloud Linux amd64, avec Go 1.27.3, Node.js 24, Playwright 1.56.1, Chromium et PowerShell 7.5.4.

| Contrôle réellement exécuté | Résultat et portée |
|---|---|
| `go mod verify`, `go vet ./...` | Réussis |
| `go test -json -count=1 ./...` | 23 tests réussis ; serveur de fixture navigateur facultatif exclu puis exécuté séparément |
| `go test -race -count=1 ./...` | Réussi, aucune course détectée |
| Conservation du moteur | Les 7 fonctions de référence (calculs pellets et CSV) sont identiques après normalisation Go ; empreintes dans `source-preservation.json` |
| `npm test` | 11 tests réussis : météo, valeurs manquantes, dates, migration et sauvegarde des dispositions, conservation des personnalisations, libellés des pompes |
| Build de démo et de production | Réussis, fichiers séparés ; données fictives absentes des bundles de production |
| Playwright — démo statique sous `/okoko-v3/` | 9 scénarios réussis, aucun saut ; six pages à trois tailles, cockpit, navigation, recharges locales, imports, CSV, partage et journal filtrable |
| Playwright — application Go | 13 scénarios réussis, aucun saut ; six pages aux trois tailles, cockpit, absence de valeurs inventées, consigne technique 8 °C, NAS facultatif, noms des circuits, absence de mini-courbes/requêtes inutiles, journal d’imports et heures été/hiver |
| Serveurs Go pour navigateur | Instance réelle sans chaudière sur 127.0.0.1:8892, base temporaire ; serveur de test JSON sur 8889, parsing Go réel ; contrôle mobile supplémentaire du binaire final sur 8893 après amélioration de la présentation |
| Journal d’installation côté Go | Accès paginé à 137 événements, filtres, recherche littérale, compteurs et compatibilité de la réponse historique ; tri correct à travers le passage à l’heure d’hiver |
| Imports | 25 entrées parcourues sur 5 pages de 5, sans perte ni doublon |
| ECS | Sonde basse absente conservée comme absente, valeur fournie correctement normalisée, aucun départ inventé |
| Linux ARM64 | Application et outil d’import compilés sans CGO ; format ELF aarch64 statique contrôlé |
| Lanceur Windows | 12 contrôles réussis sous PowerShell/Linux : syntaxe, déblocage, reprise, validation des résultats et arrêt sur erreur |

Les captures de `docs/screenshots/` proviennent de la démo effectivement ouverte dans Chromium à 1440×1050, 1024×900 et 390×844. Les courbes de température de la page Analyse sont repliées par défaut et ont aussi été ouvertes pendant les scénarios.

## Limites restantes

- Aucun déploiement ni démarrage sur le routeur OpenWrt réel ; la compilation ARM64 ne constitue pas un essai matériel.
- Aucun accès à la chaudière, au NAS ou à la base du propriétaire. Les CSV signalés comme constants à zéro n’ont pas été fournis pour diagnostic ; aucun mapping ni historique n’a été modifié pour deviner une valeur.
- La console Windows 11 et ses stratégies de groupe n’ont pas été testées. Les contrôles du lanceur s’exécutent sous PowerShell/Linux.
- Le sélecteur Windows pour un fichier `.disabled` ne peut pas être corrigé sans identifier le fichier ou l’entrée de démarrage concernés. Aucun fichier Windows n’a été supprimé ou exécuté.
- La démo utilise uniquement des données fictives explicites. Son domaine public `github.io` est inaccessible depuis cet environnement ; les essais utilisent la même compilation statique servie localement sous le même sous-répertoire.
- L’interface réelle reste destinée au réseau domestique de confiance, sans authentification intégrée. Dispositions propres au navigateur, sans synchronisation entre appareils.

Les exécutions GitHub Actions et les archives publiées se vérifient séparément dans le dépôt. Une commande configurée dans le workflow n’est pas présentée ici comme exécutée avant son résultat.
