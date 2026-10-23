# Validation d’OKOKO v3

Contrôles effectués le 23 octobre 2026 dans le cloud Linux amd64. La démo publique et l’application locale ont des compilations et des tests distincts.

## Projet et démonstration

| Contrôle exécuté | Résultat |
|---|---|
| Tests Node (`npm test --prefix frontend`) | 7 réussis : formats météo, valeurs absentes, dates invalides, créneaux, vent, calendrier et séries fictives de la démo |
| Build statique de démonstration | Réussi ; fichiers générés séparément dans `demo-dist/` |
| Playwright contre les fichiers statiques sous `/okoko-v3/` | 8 scénarios réussis ; aucun scénario sauté |
| Six pages, trois tailles | Ouvertes dans Chromium à 1440×1050, 1024×900 et 390×844 ; captures dans `docs/screenshots/` |
| Cockpit de démo | Déplacement réel à la souris, redimensionnement au coin, retrait, ajout, sauvegarde et rechargement vérifiés |
| Démo : navigation et isolation | Liens directs, actualisation, précédent/suivant, accès clavier au contenu, aucune requête API ou extérieure pendant la visite des six pages |
| Démo : recharges | Ajout local, persistance, refus du doublon et remise à zéro ; clé du cockpit de production conservée |
| Démo : imports et export | Pagination 10/10/5, ajout d’une ligne simulée, téléchargement CSV local ; sauvegarde SQLite désactivée |
| Partage public et exploration | Métadonnées Open Graph, adresse canonique, image PNG, robots.txt et sitemap.xml vérifiés dans le navigateur/serveur statique ; aucune indexation ni audience annoncée |
| Build frontend de production | Réussi ; fichiers statiques intégrés dans `backend/internal/web/dist/` |
| Isolation de production | Vérification de l’absence de l’adaptateur de requête et des marqueurs de données fictives dans les bundles embarqués |
| Lanceur Windows | 12 contrôles sous PowerShell 7.5.4/Linux : syntaxe, déblocage, reprise, invalidation d’un résultat modifié et arrêt sur erreur |
| Confidentialité | Recherche de l’URL/identifiant privé d’origine sans les afficher ; configurations d’exemple vides, aucune base ni configuration privée dans les sources publiables |

Les captures sont celles du navigateur, avec le bandeau « Données fictives » visible. Les anciens résultats de livraison ne sont pas présentés comme de nouveaux essais.

## Vérifications de l’application locale

`go mod verify`, `go vet`, `go test -json -count=1 ./...` et `go test -race -count=1 ./...` ont réussi : 20 tests Go réussis, le serveur facultatif de fixture étant réservé au scénario navigateur séparé. Les exécutables Linux ARM64 (application et outil d’import) et amd64 ont été compilés avec CGO désactivé ; leur format ELF statique a été contrôlé. La suite navigateur de production a réussi ses 13 scénarios, sans saut : six pages à trois tailles, cockpit complet, formats JSON réels fournis, noms HK1/HK2, température extérieure, journal paginé et conversion été/hiver. Deux scénarios utilisent effectivement Go : serveur normal sans chaudière sur le port 8890 et serveur de test isolé sur le port 8889. Le serveur de test a ensuite été arrêté et a terminé avec PASS. Les autres scénarios simulent uniquement les réponses API dans le navigateur.

Le workflow `.github/workflows/project.yml` reproduit ces étapes, publie la démo sur GitHub Pages et crée les archives lors d’un tag. L’existence du workflow ne signifie pas qu’une exécution GitHub a réussi : son statut est consultable dans l’onglet Actions.

L’archive `okoko30-pro.zip` a été générée puis rouverte : intégrité ZIP, SHA-256 de chaque fichier du manifeste, présence des binaires et conservation des fins de ligne CRLF du lanceur autonome vérifiées. Aucun déploiement matériel n’a été lancé.

## Limites à connaître

- Aucun démarrage ni déploiement sur le routeur OpenWrt réel dans cet environnement. Une compilation ARM64 ne constitue pas un essai matériel.
- Aucun accès à la chaudière ni au NAS du propriétaire pendant les essais cloud.
- Les contrôles PowerShell exécutés sous Linux ne valident pas l’affichage de la console Windows ou les stratégies de groupe d’un poste Windows réel.
- La démo n’est pas une installation réelle : elle ne collecte rien, n’effectue aucune sauvegarde SQLite et conserve les modifications dans ce navigateur uniquement.
- Les dispositions sont propres à chaque navigateur, sans synchronisation entre appareils. Le serveur local n’intègre pas d’authentification.
- L’activation initiale de GitHub Pages demande le réglage « Source : GitHub Actions » par le propriétaire du dépôt.

## Reproduire les contrôles

```sh
npm ci --prefix frontend
npm test --prefix frontend
npm run build:demo --prefix frontend
npm run test:demo --prefix frontend
npm run build --prefix frontend
python3 scripts/check-production.py
go -C backend mod verify
go -C backend vet ./...
go -C backend test -race -count=1 ./...
```

Pour les deux scénarios navigateur avec Go, suivre le lancement isolé documenté dans le workflow. Les fixtures sont réservées aux tests et ne contactent aucun équipement.

## Préparation du partage communautaire — 23 octobre 2026

Les huit scénarios de la démo ont été relancés avec succès après l’ajout des aperçus de partage et des fichiers d’exploration. Une recompilation de production a produit exactement les mêmes fichiers et empreintes qu’avant cette modification : la présentation publique reste limitée à la démonstration. Le code Go et ses calculs n’ont pas été modifiés ; ses tests ne sont pas présentés comme relancés pour ce changement.

Les forums et moteurs de recherche externes étaient bloqués par le réseau de l’environnement. Les communautés du kit sont des points de départ, sans vérification d’activité ou de règlement. Aucun message n’a été publié chez un tiers.
