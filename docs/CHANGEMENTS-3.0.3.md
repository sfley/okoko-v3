# OKOKO 3.0.3 — comprendre le fonctionnement

Livraison du 4 novembre 2026, à partir des retours sur l’ECS et le contenu d’Analyse.

## Analyse : trois graphiques utiles

- Suppression des cartes « Changements observés », « Changements de pompe » et « Modes et états ».
- Frise des pompes HK1, HK2 et ECS : marche, arrêt et absence de relevé.
- Températures et modulation sur la même période, avec un repère commun au clic.
- Vue complète, zoom 6 h ou 1 h, utilisable au clavier et sur mobile.
- Périodes 24 h, 7 jours et 30 jours ; journal détaillé et filtres conservés.

Les trois tracés partagent le même axe temporel et la même position horizontale. Un passage à 0 % de modulation reste une mesure valable ; il ne devient pas une valeur absente. Une pompe peut continuer à faire circuler la chaleur quand la chaudière ne module plus.

Les bandes prolongent le dernier état déclaré entre deux relevés rapprochés. Elles ne donnent pas l’instant exact d’une commutation. Les interruptions de plus de trois cadences de lecture restent sans état attribué. Aucun total de durée de marche n’est déduit de ces bandes.

## Relevés réels, sans solliciter davantage la chaudière

Les lectures JSON déjà prévues enregistrent désormais les températures, la modulation et les trois états de pompe dans une nouvelle table SQLite `operation_samples`. Aucun appel supplémentaire à la chaudière n’est ajouté. Aucun JSON brut ni paramètre de connexion n’est copié dans cette table.

Les archives CSV disponibles sont utilisées avant le premier relevé JSON enregistré. Après ce premier relevé, les coupures du suivi restent visibles : elles ne sont pas remplies arbitrairement avec un état ancien. Une nouvelle installation construit donc son suivi au fil des lectures, sans reconstituer le passé. La durée de conservation configurée s’applique aussi à ces observations.

L’API renvoie une série échantillonnée pour les courbes, en préservant les extrema de modulation et les ruptures de données, et une liste distincte de segments de pompe calculée avant cet échantillonnage. Les commutations courtes ne disparaissent pas avec l’échantillonnage des températures. Une période trop dense demande une période plus courte.

Les tables et les fonctions utilisées pour les calculs de pellets et l’import CSV restent inchangées. Les sept fonctions de référence ont été comparées aux sources archivées.

## ECS : correction d’un mauvais libellé

« Sonde haute » et « Sonde basse » étaient des déductions non justifiées. Les champs `L_ontemp_act` et `L_offtemp_act` ne décrivent pas une position physique. L’affichage principal devient **Température du ballon**.

Une seconde valeur est affichée sous le libellé neutre **Autre mesure ECS** uniquement si la régulation fournit explicitement des sélections `sensor_on` et `sensor_off` distinctes et une valeur disponible. Avec les sélections toutes deux à 0 du JSON fourni, aucune seconde sonde n’est affichée, même si les valeurs numériques venaient à différer.

L’API expose les noms neutres `temperature_on` et `temperature_off`. `temperature_low` reste un alias déprécié pour les clients 3.0.2 ; il ne prouve pas la présence d’une sonde basse.

## Rendement

La modulation est un niveau de puissance, pas un rendement. Il faudrait l’énergie thermique produite et l’énergie consommée sur une même période pour calculer un rendement. Le JSON fourni ne contient pas ces mesures : aucun pourcentage de rendement n’est inventé.

## Installation et retour arrière

Le lanceur Windows unique est conservé, avec déblocage, arrêt sur erreur, fenêtre ouverte et reprise. La version `v3.0.2` reste disponible. Le déploiement sauvegarde la base et le binaire ; la nouvelle table ne remplace aucune table existante.
