# Olympic Globe

Site web sur l'histoire des Jeux Olympiques, réalisé dans le cadre du module développement web en L2 Informatique.

Le site couvre 4 éditions : Paris 2024, Tokyo 2020, Rio 2016 et Londres 2012.

> Une connexion internet est nécessaire au premier chargement pour Three.js et les polices!!!

---

## Structure des fichiers

```
TST_dev/OlympicProject/
├── index.html
├── css/
│   ├── style.css
│   ├── login.css
│   ├── register.css
│   ├── paris-2024.css
│   ├── tokyo-2020.css
│   ├── rio-2016.css
│   └── london-2012.css
├── js/
│   ├── main.js        (globe 3D + transitions)
│   ├── index.js       (accueil : newsletter, déconnexion, scroll)
│   ├── paris.js       (slider de la page Paris)
│   ├── login.js       (connexion)
│   └── register.js    (inscription)
├── pages/
│   ├── login.html
│   ├── register.html
│   ├── paris-2024.html
│   ├── tokyo-2020.html
│   ├── rio-2016.html
│   └── london-2012.html
└── Images/
    ├── ph_paris/
    ├── ph_tokyo/
    ├── ph_rio/
    └── ph_london/
```

---

## Lancer le site

C'est un site statique, pas besoin d'installer quoi que ce soit.

Il suffit d'ouvrir `index.html` dans un navigateur. Le site va automatiquement rediriger vers la page de connexion si vous n'êtes pas connecté.

Si vous avez des problèmes avec les chemins de fichiers, vous pouvez aussi lancer un petit serveur local :

```bash
python -m http.server 8000
# puis aller sur http://localhost:8000
```

---

## Utilisation

### Créer un compte
Aller sur la page d'inscription (lien depuis la page de connexion). Remplir tous les champs — le mot de passe doit faire au moins 8 caractères. Il y a une jauge qui indique la force du mot de passe en temps réel. Une fois inscrit, le site redirige directement vers l'accueil.

### Se connecter
Entrer l'email et le mot de passe utilisés lors de l'inscription. Les erreurs s'affichent sous les champs si les identifiants sont incorrects.

### Explorer le globe
Sur la page d'accueil il y a un globe 3D (fait avec Three.js). On peut le faire tourner en cliquant-glissant. Les 4 villes olympiques sont marquées par des points lumineux — en survolant un point on voit la ville, et en cliquant dessus on arrive sur la page de cette édition avec une animation de transition.

### Pages des éditions
Chaque édition a sa propre page avec des photos, des chiffres clés et des infos sur les Jeux. Un bouton "Retour au globe" est disponible en haut à gauche.

### Se déconnecter
Bouton "Déconnexion" dans la barre de navigation en haut.

---

## Fonctionnement de la connexion

Il n'y a pas de base de données. Les comptes sont sauvegardés dans le `localStorage` du navigateur (sous la clé `comptes_utilisateurs`). La session est gérée avec `sessionStorage` : si la clé `connecte` est présente, l'utilisateur est considéré comme connecté.

> Note : les mots de passe sont stockés en clair, c'est suffisant pour un projet pédagogique mais à ne pas faire en vrai.

---

## Technologies

- HTML / CSS / JavaScript (sans framework)
- Three.js r160 (chargé via CDN) pour le globe 3D
- Google Fonts (Rajdhani, Cormorant Garamond)

> Une connexion internet est nécessaire au premier chargement pour Three.js et les polices.

---


