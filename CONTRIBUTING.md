# Contribuer à OKOKO

Ouvrez une issue pour décrire un problème ou une évolution, puis une pull request sur `main`. Joignez les étapes de reproduction et des captures sans adresse privée ni identifiant.

## Développement

Les commandes de démarrage figurent dans le README. L’interface est dans `frontend/`, le moteur dans `backend/`. `npm run build` dans `frontend/` régénère les fichiers embarqués Go ; `npm run build:demo` génère séparément `demo-dist/`.

Contrôles à exécuter selon les fichiers modifiés :

```sh
npm test --prefix frontend
npm run build:demo --prefix frontend
npm run test:demo --prefix frontend
npm run build --prefix frontend
python3 scripts/check-production.py
go -C backend test ./...
go -C backend vet ./...
```

La suite navigateur de production demande un backend sur le port 8888. Voir `frontend/tests/application.spec.js` et le workflow GitHub pour les deux scénarios Go facultatifs.

## Points à préserver

- Ne commettez ni mot de passe, URL privée, base SQLite, fichier `.env` ou sauvegarde d’installation.
- Ne changez pas les calculs de consommation sans justification et validation explicite du propriétaire. Préservez recharges et corrections historiques.
- N’inventez pas de mesure réelle, de prévision ou de commande ÖkoFEN. Les exemples fictifs restent dans la démo et les tests.
- Conservez un lanceur Windows unique, compatible `RemoteSigned`, qui s’arrête sur erreur, reste ouvert et sait reprendre.
- Documentez la portée exacte des essais. Une compilation ARM64 ne prouve pas un fonctionnement sur le routeur.

Les contributions sont distribuées sous la licence MIT du projet.
