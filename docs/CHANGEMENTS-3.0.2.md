# OKOKO 3.0.2 — un cockpit plus utile

Livraison du 1er novembre 2026, à partir des retours d’utilisation de la version 3.0.1.

## Tableau de bord

- Retrait des mini-courbes HK1/HK2 et de leur unité °C isolée. Les cartes montrent les températures instantanées, consignes, pompes et départs réellement fournis.
- Météo sur quatre jours dans le module, avec un lien vers la page détaillée ; un jour absent reste absent.
- Journal de l’installation sur toute la largeur dans la disposition initiale : cinq événements, état précédent et nouvel état, pompe lisible et accès direct à Analyse.
- Modules techniques Modulation et Système retirés de la bibliothèque. La modulation instantanée reste dans la carte chaudière : 0 % est une mesure normale à l’arrêt, pas une valeur à remplacer.
- Graphique global des températures facultatif dans la bibliothèque ; aucune requête d’historique lorsqu’il n’est pas affiché.
- Ancienne disposition initiale reconnue et remplacée par la nouvelle. Les autres dispositions personnalisées sont conservées, sauf les modules retirés. La configuration d’origine est sauvegardée localement sous la clé terminant par `.before-3.0.2` lors d’une migration.

## Chauffage

Suppression des mini-courbes et de la requête d’historique de cette page. Les départs HK1/HK2 et leur consigne sont affichés si fournis. L’ECS montre les sondes haute/basse du ballon lorsqu’elles existent. Une température de départ ECS absente du JSON n’est pas inventée ; la ligne vide disparaît. Le JSON fourni à l’origine expose `L_ontemp_act` et `L_offtemp_act`, pas un départ ECS.

## Analyse

Le journal devient la vue principale : filtres par circuit, pompe/mode, période, recherche dans les états et pagination de dix événements. Les compteurs portent sur tous les événements correspondant aux filtres, pas uniquement la page visible. Les archives au-delà des 100 premières observations restent accessibles.

Les pompes se lisent « En marche » et « À l’arrêt » plutôt que 1/0 ; un code inconnu reste visible. Le tri utilise l’instant réel, y compris pendant le changement d’heure. Les heures restent des observations, sans calcul de durée ou de cycle supposé entre deux lectures.

Les cartes Évolution du silo et Modulation disparaissent de cette page. L’historique des températures CSV reste accessible dans un volet replié. Les valeurs importées, y compris les zéros, ne sont pas réinterprétées ni corrigées arbitrairement.

## Système

Cinq imports visibles par page, avec accès à toutes les pages anciennes. Paramètres de collecte repliés par défaut et relecture de l’état système toutes les 60 secondes au lieu de dix. La cadence réelle de collecte de la chaudière et des imports n’est pas modifiée ; la navigation ne génère aucun appel chaudière supplémentaire.

## Conservation et livraison

Aucun changement des calculs de pellets, du mapping CSV, des données SQLite ou des recharges. Les sept fonctions de référence restent identiques aux sources archivées de la version 2. Le lanceur Windows unique reste compatible RemoteSigned, sans Bypass ; arrêt sur erreur, fenêtre ouverte et reprise conservés. La version GitHub `v3.0.1` reste disponible pour le retour arrière.

Le problème Windows signalé concernant un sélecteur d’application pour un fichier `.disabled` reste à identifier sur le poste : aucun fichier de ce type ni entrée de démarrage Windows n’est créé par le lanceur actuel.
