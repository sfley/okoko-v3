# Faire découvrir OKOKO aux utilisateurs ÖkoFEN

Lien à partager en premier : **https://sfley.github.io/okoko-v3/**. Il permet de découvrir l’application sans installation ni accès à une chaudière. Le code, la documentation et les téléchargements sont sur **https://github.com/sfley/okoko-v3**.

## Où commencer

| Communauté | Public recherché | Présentation adaptée |
|---|---|---|
| [Okovision 2023 — Show and tell](https://github.com/Domotrique/okovision_2023/discussions/categories/show-and-tell) | Utilisateurs d’une supervision ÖkoFEN proche du besoin d’OKOKO | Première piste ciblée : présenter le projet indépendant et demander des retours. Catégorie ouverte et vérifiée le 23 octobre 2026. |
| [Intégration ÖkoFEN Home Assistant — Show and tell](https://github.com/dominikamann/oekofen-pellematic-compact/discussions/categories/show-and-tell) | Utilisateurs techniques de l’interface JSON locale ÖkoFEN | Présentation courte en anglais, avec une démo et la précision qu’OKOKO fonctionne séparément de Home Assistant. Catégorie vérifiée le 23 octobre 2026. |
| [Econologie — forums](https://www.econologie.com/forums/) | Propriétaires de chaudières à granulés et retours d’exploitation | Suivi des pellets, confort et historiques. Rechercher les discussions ÖkoFEN avant de créer un sujet. |
| [Futura — habitat, isolation et chauffage](https://forums.futura-sciences.com/habitat-bioclimatique-isolation-chauffage/) | Utilisateurs de chauffage aux granulés | Présentation technique courte, captures et demande de retours d’expérience. |
| [HACF](https://forum.hacf.fr/) | Communauté francophone de domotique Home Assistant | Hébergement local, interface responsive, Go/SQLite. Préciser qu’OKOKO fonctionne séparément de Home Assistant. |
| [Jeedom](https://community.jeedom.com/) | Utilisateurs de domotique, dont des installations ÖkoFEN | Supervision autonome et comparaison des besoins ; aucune intégration Jeedom n’est annoncée. |
| Groupes Facebook consacrés à ÖkoFEN | Propriétaires recherchant une présentation simple | Chercher « ÖkoFEN », « Okofen utilisateurs » ou « chaudière granulés » dans les groupes ; choisir un groupe avec des échanges récents. |

Les deux espaces GitHub « Show and tell » ont été ouverts et vérifiés le 23 octobre 2026. Cela ne vaut pas accord de leurs responsables pour une présentation. Les autres adresses donnent des points de départ : l’environnement cloud ne permettait pas d’ouvrir ces forums ni les moteurs de recherche, donc aucun sujet de forum, groupe Facebook, niveau d’activité ou règlement correspondant n’a été vérifié. Aucune publication, inscription, prise de contact ou message privé n’a été effectué.

Pour un premier lancement, choisir une communauté chauffage et recueillir les premiers retours avant de publier ailleurs. Lire ses règles ; si la présentation d’un projet personnel demande l’accord d’un modérateur, lui envoyer d’abord la version courte. Présenter clairement son lien avec le projet et éviter de copier le même message dans plusieurs discussions.

## Message pour un forum

**Titre : OKOKO v3 — supervision locale ÖkoFEN, tableau de bord et suivi des pellets**

Bonjour à tous,

Je développe OKOKO, un logiciel libre pour suivre une chaudière ÖkoFEN depuis un ordinateur, une tablette ou un téléphone.

L’idée est de retrouver les informations utiles dans une interface claire : tableau de bord personnalisable, circuits HK1/HK2, eau chaude, courbes de température avec l’extérieur, suivi du stock et des recharges de pellets, météo fournie par la chaudière et journal des imports.

Vous pouvez l’essayer sans rien installer :
https://sfley.github.io/okoko-v3/

La démonstration utilise des données fictives et n’est reliée à aucune chaudière. Vous pouvez déplacer les modules et essayer une recharge ; les modifications restent dans votre navigateur.

Sur une installation réelle, l’application fonctionne localement avec Go et SQLite, collecte le JSON ÖkoFEN et peut importer les CSV d’un NAS. Le frontend est embarqué dans le binaire : aucun Node.js sur le routeur OpenWrt ARM64. Les réglages de chauffage restent effectués sur la régulation ÖkoFEN.

Code source, captures et installation :
https://github.com/sfley/okoko-v3

Le projet est gratuit, sous licence MIT et indépendant d’ÖkoFEN. Il a été développé autour d’une Pellematic PE CONDENS ; je suis intéressé par vos retours sur les informations qui vous seraient utiles et les différences de formats JSON selon les régulations.

Si vous regardez la démo, qu’est-ce qui vous manque le plus pour suivre votre installation au quotidien ?

Merci pour vos retours !

## Version courte pour un groupe

Bonjour ! Je développe **OKOKO**, une application libre pour suivre une chaudière **ÖkoFEN** : tableau de bord personnalisable, températures, chauffage et consommation de pellets, sur ordinateur et mobile.

👉 Démo à essayer sans installation : https://sfley.github.io/okoko-v3/

Les données de la démo sont fictives ; elle n’accède à aucune chaudière. L’application réelle fonctionne localement et conserve les données chez vous.

Code et captures : https://github.com/sfley/okoko-v3

Projet indépendant, gratuit, licence MIT. Je cherche des retours de propriétaires ÖkoFEN : quelles informations aimeriez-vous suivre plus facilement ?

## Pour demander l’accord d’un modérateur

Bonjour, je développe un logiciel libre indépendant pour la supervision locale des chaudières ÖkoFEN, avec une démonstration publique sans connexion à une installation réelle. Puis-je présenter le projet dans votre communauté et demander des retours d’utilisateurs ? Voici la démo : https://sfley.github.io/okoko-v3/ et le code : https://github.com/sfley/okoko-v3. Je peux adapter la présentation à vos règles.

## Repères pour la présentation

- Montrer une capture réelle de `docs/screenshots/`, avec le bandeau de démonstration visible.
- Présenter les réglages comme consultables ; aucune commande de chauffage n’est transmise.
- Ne pas annoncer d’intégration Home Assistant, Jeedom ou MQTT, ni une compatibilité avec toutes les régulations.
- Demander le modèle et la version de régulation pour comprendre un retour technique ; ne pas demander de mot de passe ni d’URL de connexion privée.
- Orienter les problèmes reproductibles vers les issues GitHub ; les échanges et réponses aux utilisateurs restent manuels.

## Visibilité du site

La compilation publique comprend un titre descriptif, une adresse canonique, des métadonnées Open Graph avec une vraie capture, ainsi que `robots.txt` et `sitemap.xml`. Ces éléments facilitent l’aperçu des liens et l’exploration par les moteurs ; ils ne garantissent ni indexation, ni classement, ni audience. Ils sont exclus de la compilation locale privée.

## Être trouvé dans la recherche GitHub « okofen »

Constat du 23 octobre 2026 : la recherche de dépôts `okofen repo:sfley/okoko-v3` renvoyait zéro résultat ; avec `in:readme`, elle trouvait bien le dépôt. La fiche publique ne comportait aucun topic. Le README seul ne suffit donc pas à cette recherche par défaut.

Sur la page du dépôt, ouvrir la roue dentée à côté de **About / À propos**. Proposition de champs à enregistrer :

**Description**

```text
Supervision locale des chaudières ÖkoFEN / Okofen : tableau de bord, chauffage et suivi des pellets. Go, SQLite et React.
```

**Website**

```text
https://sfley.github.io/okoko-v3/
```

**Topics** — ajouter chaque mot-clé séparément, puis enregistrer :

```text
okofen
oekofen
pellematic
pellet-boiler
heating
home-automation
monitoring
openwrt
golang
react
sqlite
```

L’accès GitHub de cette session permet d’envoyer du code mais pas de modifier ces métadonnées. Leur enregistrement doit se faire depuis le compte propriétaire. Le délai d’indexation et la position dans les résultats ne sont pas garantis.

## Message court pour la communauté Home Assistant

**Title: OKOKO — a standalone local dashboard for ÖkoFEN pellet heating**

Hi everyone,

I’m developing OKOKO, an independent open-source dashboard for monitoring an ÖkoFEN boiler. It brings together heating circuits, hot water, temperature history, pellet stock/refills and the weather data supplied by the boiler.

You can try it here without installing anything: https://sfley.github.io/okoko-v3/

The demo uses clearly labelled fictional data and has no connection to real hardware. The actual application runs locally with Go and SQLite, using the boiler’s local JSON interface and optional CSV imports. It runs separately from Home Assistant; heating settings remain on the ÖkoFEN controller.

Source, screenshots and installation notes: https://github.com/sfley/okoko-v3

It is free software under the MIT licence, developed around a Pellematic PE CONDENS. I’d welcome feedback from fellow ÖkoFEN users on useful views and differences between local JSON formats.
