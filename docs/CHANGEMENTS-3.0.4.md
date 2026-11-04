# OKOKO 3.0.4 — suivre la circulation de chaleur

Livraison du 4 novembre 2026.

## Ordre de la page Analyse

1. Températures globales : Chambres, Plancher, ballon ECS et extérieur.
2. Pompe ECS, avec la température du ballon.
3. Pompe Chambres, avec la température de départ du circuit HK1.
4. Pompe Plancher, avec la température de départ du circuit HK2.
5. Modulation de la chaudière.
6. Journal détaillé, avec ses filtres et sa pagination.

Les noms des circuits proviennent toujours de la régulation ; Chambres et Plancher sont les noms de l’installation fournie et de la démo.

## Lecture des pompes

Une courbe fine suit la température réellement mesurée. Pendant les périodes déclarées en marche, l’aire sous la courbe est colorée : sa hauteur augmente avec la température. Une bande en bas du tracé indique indépendamment l’état de la pompe. Les hachures indiquent l’absence de relevé ; une température manquante reste absente, même si l’état de pompe est connu.

Les tracés HK utilisent les températures de départ, jamais les températures ambiantes. Pour l’ECS, le JSON ne fournit pas de température de départ identifiée : la mesure du ballon est explicitement nommée. La hauteur colorée ne représente ni un débit, ni une énergie, ni un rendement.

Les segments de pompe restent calculés à partir des états avant l’échantillonnage graphique. Ils suivent le dernier état déclaré entre deux relevés rapprochés, pas une mesure continue des commutations. Les interruptions ne sont pas comblées, et aucun état n’est prolongé au-delà du dernier relevé.

## Axes et zoom

Les cinq tracés ont le même axe temporel et la même position horizontale. Les graduations s’adaptent à la période, au zoom et à la largeur d’écran : heures/minutes pour les vues courtes, dates pour plusieurs jours. Les heures répétées au passage à l’heure d’hiver sont différenciées par leur décalage UTC.

Un clic ou un toucher place un repère vertical commun, avec sa date et son heure affichées dans chaque graphique. Les bandes de pompe sont aussi sélectionnables au clavier. Le zoom 1 h ou 6 h relit les relevés de cette fenêtre dans SQLite, sans requête supplémentaire à la chaudière : les détails ne sont pas limités par l’échantillonnage préalable d’un mois.

## Données et mise à jour

Deux colonnes nullables sont ajoutées dans la table séparée `operation_samples`. Les nouveaux relevés JSON enregistrent `hk1.L_flowtemp_act` et `hk2.L_flowtemp_act`. Les anciens relevés ne sont pas réécrits et ne reçoivent aucune température inventée. Les archives CSV utilisent les températures de départ qu’elles possèdent déjà, avant le début du suivi JSON.

Les sept fonctions de référence pour les calculs de pellets et l’import CSV sont inchangées. Aucun mot de passe ni paramètre de connexion privé n’est ajouté aux sources. La version précédente reste accessible et le lanceur Windows unique conserve ses sauvegardes, l’arrêt sur erreur et la reprise des étapes validées.

Les contrôles réellement exécutés et les limites matérielles sont documentés dans [TESTS.md](TESTS.md).
