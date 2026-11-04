# OKOKO 3.0.5 — rapprocher l’eau et le confort

Préparation du 4 novembre 2026, remplacée par la [3.0.6](CHANGEMENTS-3.0.6.md) avant livraison. La validation GitHub a détecté un fichier de dépendances incohérent à l’installation ; aucune archive 3.0.5 n’a été publiée.

- Ajout de la température réelle de la pièce, en pointillés clairs, dans les graphiques de pompe Chambres/HK1 et Plancher/HK2.
- Courbe d’ambiance visible pendant les marches et les arrêts de pompe ; l’eau reste colorée seulement pendant la marche.
- Légende permettant de masquer et de réafficher la pièce seule, y compris au toucher.
- Infobulle commune : état de pompe, température de l’eau et température de la pièce au même relevé.
- Même échelle en °C, même zoom et mêmes repères temporels ; les interruptions restent visibles.
- Ambiance absente signalée explicitement. Une température instantanée ne remplace jamais un relevé historique manquant. Si l’eau manque mais que l’ambiance existe, cette dernière reste affichée sans être utilisée à la place de l’eau.
- ECS conservée avec le ballon seul : aucune température de pièce dédiée n’est fournie dans le JSON.

Les ambiances étaient déjà enregistrées dans l’historique de fonctionnement. Cette évolution d’affichage ne nécessite ni nouvelle collecte, ni nouvelle colonne SQLite. Les calculs de pellets et les imports sont inchangés. Le lanceur Windows unique et les sauvegardes de déploiement sont conservés. [La version 3.0.4 reste disponible](https://github.com/sfley/okoko-v3/releases/tag/v3.0.4).

Les contrôles réellement exécutés et les limites sont décrits dans [TESTS.md](TESTS.md).
