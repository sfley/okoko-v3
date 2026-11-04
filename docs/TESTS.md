# Validation — OKOKO 3.0.3

Contrôles exécutés le **4 novembre 2026**, dans l’environnement cloud Linux amd64, avec Go 1.27.3, Node.js 24, Chromium, Playwright 1.56.1 et PowerShell 7.5.4.

| Contrôle exécuté | Résultat et portée |
|---|---|
| Modules Go, `go vet`, tests et race detector | Réussis ; 29 tests Go, serveur de fixture facultatif exécuté séparément |
| Conservation du moteur | Les 7 fonctions de référence pour les pellets et le CSV sont identiques après normalisation Go |
| Tests Node | 13 réussis, dont les sélections ECS égales/distinctes, les dispositions et les formats météo |
| Build démo et production | Réussis ; isolation des données fictives vérifiée |
| Navigateur — démo statique sous `/okoko-v3/` | 10 scénarios réussis sans saut ; six pages aux trois tailles, cockpit, données locales, journal et graphiques liés |
| Navigateur — application Go | 15 scénarios réussis sans saut ; dont le parsing Go du JSON fourni, la frise issue de SQLite, le zoom 1 h, le repère commun et les libellés ECS |
| Serveur de fixture Go | Exécuté sur 8889, terminé avec PASS après les essais ; données synthétiques dans le binaire de test uniquement |
| Frise | Commutations conservées indépendamment de l’échantillonnage des courbes ; interruptions et états inconnus non comblés, dernier état non prolongé après le dernier relevé |
| Courbes | Pic bref de modulation conservé, 0 % préservé, valeurs manquantes et interruptions visibles |
| Réponse sur 30 jours | Cas local de 43 200 relevés : réponse inférieure à 1 Mio, moins de 6 000 points, plus de 700 changements de pompe conservés ; aucune insertion dans la table de calcul des pellets |
| ECS | Même sélection 0/0 : pas de seconde sonde ; sélection distincte : libellé neutre ; sélection absente : aucune position inventée |
| Linux ARM64 | Application et outil d’import compilés sans CGO ; format ELF aarch64 statique contrôlé |
| Lanceur Windows | 12 contrôles réussis sous PowerShell/Linux, sans essai de console Windows réelle |
| Confidentialité | Recherche de l’URL et de l’identifiant privés d’origine sans les afficher ; exemple de configuration vide et fichiers privés exclus |

Les captures dans `docs/screenshots/` proviennent du navigateur à 1440×1050, 1024×900 et 390×844. Le dernier parcours de production utilisait un serveur normal sans chaudière sur 8895 et le serveur de test isolé sur 8889. Les tests d’interface généraux utilisent des réponses API simulées ; les deux scénarios marqués « real Go » utilisent le backend réel.

Un problème de sélection des bandes très courtes a été identifié lors du premier essai avec Go. Les bandes respectent désormais leur largeur temporelle ; le zoom 1 h permet la sélection. La suite complète a ensuite réussi. Le test de repère commun vérifie aussi l’alignement horizontal des trois graphiques.

## Limites restantes

- Aucun essai sur la chaudière, le NAS ou le routeur OpenWrt du propriétaire. La compilation ARM64 ne prouve pas le fonctionnement matériel.
- Le suivi JSON commence après l’installation de cette version. Son historique antérieur n’est pas reconstruit ; seules les archives existantes peuvent compléter le début de la période.
- Les frises montrent les états déclarés entre relevés rapprochés, pas une mesure continue des débits ni des temps de marche exacts.
- Aucun rendement calculé, faute de mesures d’énergie thermique produite et d’énergie consommée.
- Aucun essai de la console Windows 11. Le diagnostic du fichier `.disabled` nécessite toujours son identification sur le poste.
- Le domaine public `github.io` est bloqué depuis l’environnement ; la même compilation statique a été testée localement sous le même sous-répertoire. Les résultats GitHub Actions et les téléchargements se vérifient séparément.
