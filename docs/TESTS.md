# Validation — OKOKO 3.0.6

Contrôles exécutés le **4 novembre 2026**, dans l’environnement cloud Linux amd64, avec Go 1.27.3, Node.js 24, Chromium, Playwright 1.56.1 et PowerShell 7.5.4.

| Contrôle exécuté | Résultat et portée |
|---|---|
| Modules Go, `go vet`, tests et race detector | Réussis ; 32 tests Go, serveur de fixture facultatif exécuté séparément |
| Conservation du moteur | Les 7 fonctions de référence pour les pellets et le CSV sont identiques après normalisation Go |
| Installation frontend propre | `npm ci` exécuté avant les builds et les essais ; versions et empreintes des bibliothèques comparées au verrouillage validé en 3.0.4 |
| Tests Node | 15 réussis, dont les graduations selon période/largeur, les heures répétées au changement d’heure, les sélections ECS et les formats météo |
| Build démo et production | Réussis ; absence des données/adaptateurs de démo dans la production vérifiée |
| Navigateur — démo statique sous `/okoko-v3/` | 11 scénarios réussis sans saut : six pages aux trois tailles, cockpit, journal, ordre des cinq graphiques, masques thermiques, axes et repères alignés |
| Mobile tactile | Zoom 1 h, sélection d’une pompe, cinq repères datés, graduations sans chevauchement et effacement vérifiés dans un contexte Chromium tactile à 390×844 |
| Navigateur — application Go | 17 scénarios réussis sans saut : dont le parsing réel du JSON fourni, les températures de départ SQLite, les pompes, le zoom et l’absence explicite d’anciens relevés de départ |
| Serveur de fixture Go | Exécuté sur 8889 ; terminé avec PASS après les essais, données synthétiques dans le binaire de test uniquement |
| Migration depuis 3.0.3 | Ancien schéma recréé dans une base de test ; ajout répété des deux colonnes, anciennes lignes conservées, anciennes températures de départ NULL, nouvelles mesures JSON 27,7 / 29 °C normalisées correctement |
| Échantillonnage | Pic thermique bref et lectures avant/pendant/après une commutation conservés ; ruptures de mesure et interruptions non comblées |
| Zoom côté SQLite | Sur un historique d’essai de deux heures, `hours=1` restitue les relevés à la minute de la dernière heure ; paramètres invalides rejetés ; températures de départ CSV contrôlées |
| Réponse sur 30 jours | Cas local de 43 200 relevés : réponse inférieure à 1 Mio, au plus 6 000 points, plus de 700 changements de pompe conservés ; aucune insertion dans la table de calcul des pellets |
| Courbes d’ambiance | Deux courbes historiques distinctes, HK1/HK2 ; masquage indépendant et tactile, coupure aux valeurs manquantes, absence explicite sans copie des valeurs live ; température 19,6 °C vérifiée dans l’infobulle issue du backend Go |
| ECS | Température du ballon explicitement distinguée d’une température de départ ; sélections 0/0 sans seconde sonde ; aucune position haute/basse inventée |
| Linux ARM64 | Application et outil d’import compilés sans CGO ; format ELF aarch64 statique contrôlé |
| Lanceur Windows | 12 contrôles réussis sous PowerShell/Linux, sans essai de console Windows réelle |
| Confidentialité | Recherche de l’URL et de l’identifiant privés d’origine sans les afficher ; exemple de configuration vide et fichiers privés exclus |

Les captures de `docs/screenshots/` proviennent du navigateur à 1440×1050, 1024×900 et 390×844. Les vues Analyse de bureau et sur mobile ont été inspectées visuellement ; les six pages ont été parcourues par les tests de navigateur aux trois tailles. Le parcours de production utilisait un serveur normal sans chaudière sur 8898 et le serveur de test isolé sur 8889. Les tests d’interface généraux utilisent des réponses API simulées ; les scénarios « real backend » et « real Go » utilisent le backend réel.

Le contrôle des graphiques vérifie l’ordre températures → ECS → Chambres → Plancher → modulation, la présence des masques qui limitent la couleur aux périodes de marche, l’alignement horizontal des cinq repères à moins de deux pixels et le changement des graduations au zoom. Le parcours vérifie aussi la navigation au clavier entre les segments, la sélection avec Entrée, les deux courbes d’ambiance, le maintien de l’ambiance quand l’eau manque et l’absence de courbe ambiante ECS.

## Limites restantes

- Aucun essai sur la chaudière, le NAS ou le routeur OpenWrt du propriétaire. La compilation ARM64 ne prouve pas le fonctionnement matériel.
- La version 3.0.6 réutilise les ambiances déjà historisées et n’ajoute aucune collecte. Sans sonde ambiante ou sans relevé enregistré, aucune courbe de pièce n’est reconstituée.
- Les températures de départ JSON commencent à être enregistrées après la mise à jour 3.0.4. Les anciens relevés ne sont pas réécrits ; seules les archives CSV disponibles avant le début du suivi JSON peuvent déjà contenir ces températures.
- Les bandes représentent les états déclarés entre relevés rapprochés ; elles ne mesurent ni un débit ni l’instant exact des commutations. La hauteur colorée représente une température, pas une puissance thermique.
- Les interruptions de plus de trois cadences, états inconnus et températures absentes restent visibles. Le dernier état n’est pas prolongé au-delà du dernier relevé.
- Aucun rendement calculé, faute de mesures d’énergie thermique produite et d’énergie consommée.
- Aucun essai de console Windows 11. Le diagnostic ancien du fichier `.disabled` nécessite toujours son identification sur le poste.
- Le domaine public `github.io` est bloqué depuis cet environnement ; la compilation statique a été testée localement sous le même sous-répertoire. Les résultats GitHub Actions et les téléchargements sont vérifiés séparément après publication.
