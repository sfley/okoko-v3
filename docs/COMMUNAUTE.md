# Faire découvrir OKOKO aux utilisateurs ÖkoFEN

Lien à partager en premier : **https://sfley.github.io/okoko-v3/**. Il permet de découvrir l’application sans installation ni accès à une chaudière. Le code, la documentation et les téléchargements sont sur **https://github.com/sfley/okoko-v3**.

## Où commencer

| Communauté | Public recherché | Présentation adaptée |
|---|---|---|
| [Econologie — forums](https://www.econologie.com/forums/) | Propriétaires de chaudières à granulés et retours d’exploitation | Suivi des pellets, confort et historiques. Rechercher les discussions ÖkoFEN avant de créer un sujet. |
| [Futura — habitat, isolation et chauffage](https://forums.futura-sciences.com/habitat-bioclimatique-isolation-chauffage/) | Utilisateurs de chauffage aux granulés | Présentation technique courte, captures et demande de retours d’expérience. |
| [HACF](https://forum.hacf.fr/) | Communauté francophone de domotique Home Assistant | Hébergement local, interface responsive, Go/SQLite. Préciser qu’OKOKO fonctionne séparément de Home Assistant. |
| [Jeedom](https://community.jeedom.com/) | Utilisateurs de domotique, dont des installations ÖkoFEN | Supervision autonome et comparaison des besoins ; aucune intégration Jeedom n’est annoncée. |
| Groupes Facebook consacrés à ÖkoFEN | Propriétaires recherchant une présentation simple | Chercher « ÖkoFEN », « Okofen utilisateurs » ou « chaudière granulés » dans les groupes ; choisir un groupe avec des échanges récents. |

Cette liste donne des points de départ. Le 23 octobre 2026, l’environnement cloud ne permettait pas d’ouvrir ces forums ni les moteurs de recherche : aucun sujet précis, groupe Facebook, niveau d’activité ou accord de modération n’a été vérifié. Aucune publication, inscription, prise de contact ou message privé n’a été effectué.

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
