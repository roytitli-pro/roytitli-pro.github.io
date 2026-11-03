# 📁 Portfolio — dossier de travail

Site portfolio **statique** : 3 fichiers, aucune installation, aucune dépendance, aucun build.
Il s'ouvre en double-cliquant sur `index.html`.

```
portfolio/
├── index.html          ← tout le contenu (le seul fichier que vous éditez)
├── assets/
│   ├── styles.css      ← le design (couleurs, mise en page, thème sombre)
│   ├── script.js       ← menu, filtres, thème, mode édition
│   └── (votre photo, vos captures d'écran)
└── README.md           ← ce fichier
```

**Pour ouvrir sans rien installer :** double-cliquez sur `index.html`.

**Pour un vrai lien (utile pour tester sur mobile) :**

```bash
cd portfolio
python3 -m http.server 8000
```

puis ouvrez `http://localhost:8000` — et regardez la page depuis votre téléphone
sur `http://<adresse-ip-de-l-ordinateur>:8000`.

---

## ✏️ Étape 1 — Remplir les blancs

Le portfolio est un **brouillon volontaire** : les informations personnelles sont des
emplacements, pas des inventions. Tout ce que vous devez remplacer est visible
et signalé.

### La méthode la plus rapide : le mode édition

1. Ouvrez `index.html` dans votre navigateur.
2. Cliquez sur le bouton **✎ Éditer** en haut à droite.
3. Une barre orange apparaît. Cliquez directement sur un texte : il devient modifiable.
4. Quand vous avez fini, cliquez sur **Copier le HTML modifié**.
5. Ouvrez `index.html` dans un éditeur de texte, effacez tout, collez, enregistré.

> ⚠️ **Rien n'est enregistré tout seul.** Si vous fermez l'onglet sans copier,
> vos modifications sont perdues. Copiez souvent.

### La liste complète de ce qui reste à faire

| Où | Quoi | Priorité |
|---|---|---|
| `<title>` et `<meta description>` de `index.html` | votre nom, votre description | 🔴 |
| Héros | `[Prénom]`, `[Prénom NOM]`, votre âge et votre ville | 🔴 |
| **La photo** | pas de portrait — le bloc a été retiré du héros | ✅ |
| Contact | `prenom.nom@email.com`, GitHub, LinkedIn, lien du CV | 🔴 |
| Section « À propos » | relisez et raccourcissez : c'est la partie la plus lue | 🔴 |
| Parcours | ajoutez vos **stages et emplois** (le bloc « À venir ») | 🔴 |
| Links de chaque carte projet | GitHub, démo en ligne, captures | 🟡 |
| Blocs ⚠️ `À personnaliser` / `À compléter` | lisez-les, ils signalent un texte trop générique | 🟡 |
| Image de partage `assets/og-image.jpg` | 1200×630 px, pour que le lien soit joli sur LinkedIn | 🟢 |
| Bloc « Expériences professionnelles » | une ligne par poste : poste + ce que vous avez fait + ce que vous avez appris | 🟡 |

**Cherchez les crochets `[...]`** dans le fichier — il n'y en a plus que dans les
endroits vraiment à compléter.

---

## 📸 Étape 2 — Les captures d'écran

### Votre portrait

Pas de photo sur ce site : le bloc `div.avatar` a été retiré de la section héros et
les styles associés supprimés de `styles.css`. La carte du héros commence directement
par le nom et les informations clés, ce qui reste crédible et évite un cadre vide.

Si vous changez d'avis, il suffit d'ajouter dans `<aside class="hero-card">` :

```html
<div class="avatar"><img src="assets/photo.jpg" alt="Portrait de Roy Titli"></div>
```

…et de rétablir les règles `.hero-card .avatar` dans `assets/styles.css`.

### Les captures d'écran de vos projets

C'est **le levier le plus fort** du portfolio. Un recruteur qui ne connaît pas
Fair'repair juge le projet en 5 secondes sur la capture d'écran, pas sur le texte.

1. Faites une capture de votre application **en fonctionnement**.
2. Réduisez-la à environ 1200 px de large (`xdg-open` → GIMP, ou un outil en ligne).
3. Enregistrez-la dans `assets/` : `assets/fairepair-1.jpg`, `assets/fairepair-2.jpg`…
4. Dans la carte du projet, remplacez l'emoji du bloc `.thumb` :

```html
<!-- AVANT -->
<div class="thumb">
  <span class="cat">Projet BTS · PHP / MySQL</span>
  <span class="badge">Projet principal</span>
  <span aria-hidden="true">🚲</span>
</div>

<!-- APRÈS -->
<div class="thumb">
  <span class="cat">Projet BTS · PHP / MySQL</span>
  <span class="badge">Projet principal</span>
  <img class="thumb-img" src="assets/fairepair-1.jpg" alt="Capture d'écran de Fair'repair">
</div>
```

Pour mettre **plusieurs** captures dans une fiche, ajoutez-les dans le
`<div class="deep-body">` du projet concerné :

```html
<img src="assets/fairepair-2.jpg" alt="Page de réservation"
     style="width:100%;border-radius:12px;margin:10px 0;border:1px solid var(--line)">
```

**À capturer en priorité, selon le projet :**

| Projet | Captures utiles |
|---|---|
| Fair'repair | l'accueil avec la liste de réparateurs · la carte Leaflet · le back-office modérateur |
| Ma Vie Admin | l'onglet Accueil avec le graphique 6 mois · l'onglet Impôts · l'onglet Documents |
| Gestion des Étudiants | le formulaire + la liste d'élèves après ajout |
| Labo réseau | la topologie Packet Tracer · la table de routage (`show ip route`) |
| Arduino | le schéma + une photo du montage allumé |
| Veille | la ligne de temps des sources (transformez le tableau en image) |

---

## 📨 Étape 3 — Activer le formulaire de contact

En l'état, le formulaire **valide les champs mais n'envoie rien** (il affiche un
message qui vous dit quoi copier-coller à qui). C'est volontaire : sans adresse
réceptrice, un formulaire ne peut pas fonctionner.

Quand vous aurez votre adresse, choisissez une méthode — **toutes sont gratuites**,
aucune carte bancaire demandée :

### Option A — Formspree (5 minutes, le plus simple)

1. Créez un compte sur [formspree.io](https://formspree.io).
2. Créez un formulaire, copiez l'identifiant du type `xpwzgkdl`.
3. Dans `index.html`, dans la balise `<form id="contact-form">`, ajoutez :

```html
action="https://formspree.io/f/xpwzgkdl" method="POST"
```

4. Dans `assets/script.js`, **supprimez** le bloc `/* ---------- 9. Formulaire de
   contact ---------- */` (environ 25 lignes) : c'est lui qui bloque l'envoi.
5. Ajoutez dans le `<form>` deux champs cachés pour identifier l'expéditeur :

```html
<input type="hidden" name="_subject" value="Nouveau message depuis le portfolio">
```

### Option B — Netlify Forms (si vous publiez chez Netlify)

1. Dans `index.html`, ajoutez `netlify` et `name` à la balise form :

```html
<form class="form" id="contact-form" name="contact" netlify>
```

2. Supprimez le bloc 9 de `script.js` comme ci-dessus.
3. C'est tout. Netlify affiche les messages dans son tableau de bord.

### Option C — Web3Forms (sans compte)

```html
action="https://api.web3forms.com/submit" method="POST"
<input type="hidden" name="access_key" value="VOTRE_CLE">
```

---

## 🌐 Étape 4 — Mettre en ligne (gratuit)

### GitHub Pages — recommandé si vous voulez aussi montrer votre code

```bash
cd portfolio
git init
git add .
git commit -m "Portfolio"
```

Créez un dépôt sur [github.com](https://github.com) **sans** README, puis :

```bash
git branch -M main
git remote add origin https://github.com/VOTRE-PSEUDO/VOTRE-PSEUDO.github.io.git
git push -u origin main
```

Votre portfolio est en ligne sur `https://VOTRE-PSEUDO.github.io` en 1 à 2 minutes.

### Netlify Drop — le plus rapide, sans compte Git

1. Allez sur [app.netlify.com/drop](https://app.netlify.com/drop).
2. Glissez le dossier `portfolio/` entier.
3. Vous obtenez une URL immédiate (`https://xyz123.netlify.app`).

Vous pouvez ensuite la personnaliser en `https://votre-nom.netlify.app` dans
**Site settings → Domain management**.

### Vercel

```bash
npx vercel --prod
```

---

## 🎨 Changer les couleurs

Tout est dans le haut de `assets/styles.css`. Ces six lignes changent l'ambiance
du site entier :

```css
:root{
  --acc:#c2417a;      /* couleur principale (boutons, liens, titres) */
  --acc-2:#8b5cf6;    /* couleur secondaire (dégradés)      */
  --acc-soft:#fdeef4; /* fond très clair de la couleur principale */
  --acc-soft-2:#f0ebfe;
  --ink:#2b2028;      /* couleur du texte                   */
  --bg:#fbf7f9;       /* couleur de fond                    */
  --radius:16px;      /* arrondi des coins                  */
}
```

Le thème sombre (`html[data-theme="dark"]`) reprend ces mêmes variables, donc
changer `--acc` le change aussi en sombre.

---

## 📚 D'où vient le contenu

Chaque projet du portfolio vient d'un fichier réellement présent sur votre disque.
Rien n'a été inventé, et les chiffres cités sont des chiffres mesurés.

| Projet du portfolio | Source |
|---|---|
| Fair'repair | `~/Documents/Fair'repair/` — 82 fichiers PHP, `GUIDE-CODE.md`, `CONTEXTE-PROJET.md` |
| Ma Vie Admin | `Ma vie/mes-finances/` — `index.html` (2 273 l.) + `README.md` |
| Boîte à outils OpenCode | `Ma vie/outils/` — `convertir-sessions.py` (739 l.), `generer-contexte.py`, 13 tests |
| Veille passkeys & IA | `Ma vie/veille-passkeys-ia-2025-09_2026-09.md` (213 l., 25 sources) |
| Gestion des Étudiants | `OS/Cours BTS SIO/telecharger/Roy Titli tp.php` (256 l.) |
| Base de données cinéma | `OS/Cours BTS SIO/telecharger/cinema.sql` (13 tables) |
| Jeu d'esquive | `OS/TITLI ROY/1G1/NSI/Graphique.1.py` (109 l.) |
| Simulateur d'historique | `OS/Administrative/Mini projet.txt` (91 l.) |
| Arduino (2 montages) | `OS/TITLI ROY/1G1/SI/SI.ino`, `OS/TITLI ROY/1G1/Arduino/Essaie/Essaie.ino` |
| Labo réseau | `Data/Documents/{RTR,DHCP1,DHCP2,CLIENT}/*.vmx` + `Data/Documents/Config system.txt` + `OS/Cours BTS SIO/telecharger/exo.txt` |
| Aide-mémoire Cisco | `OS/Cours BTS SIO/telecharger/message.txt` + `CISCO.txt` (148 l.) |
| Analyse UML | `Data/Documents/TP UML.mdj` + `TP UML BIBLIO.mdj` |
| Exercices JS | `Data/Documents/BTS/Dev/TP boucle/exo.js` (178 l.) et autres TP |

Le profil (BTS SIO SLAM, alternance, autodidacte, langues) vient de
`~/Documents/OpenCode-Contexte/profil-court.md`.

**Ce qui a été volontairement laissé de côté :**

- L'ancien portfolio `dev/Portfolio/index.html` : c'est un template générique avec
  des chiffres inventés (« 120+ projets », « 10+ ans d'expérience »). **Ces chiffres
  sont faux et incohérents avec une 1<sup>re</sup> année de BTS** — ne les réutilisez pas.
- Les fichiers qui ne compilent pas ou ne s'exécutent pas (brouillons de cours).
- Les sujets de TP jamais terminés (fichiers uniquement composés de `pass`).
- Tout le contenu personnel et familial.
- Les bibliothèques téléchargées (Bootstrap, jQuery) et les installateurs.

---

## ⚠️ À faire avant de publier

1. **Ne publiez jamais `flag-code.py`.** Ce fichier contient une clé AES-256
   en clair (c'est un challenge CTF). Il est sur
   `OS/TITLI ROY/1G1/flag-code.py`. S'il traîne dans un dépôt, cette clé est
   compromise — supprimez-la ou changez-la.
2. **Mettez de vraies captures d'écran.** En l'état, le portfolio fait beaucoup
   de descriptions et zéro preuve visuelle. C'est le point faible principal.
3. **Mettez à jour les chiffres que vous ne figez pas.** Le portfolio dit
   « 6 565 lignes » et « 2 273 lignes » : ce sont les valeurs vraies de vos
   fichiers au jour de la rédaction. Si vous continuez à coder, mettez à jour.
4. **Relisez la partie « À propos ».** C'est le texte le plus lu et le plus
   personnel : il doit sonner comme vous, pas comme un modèle de texte.
5. **Ajoutez vos expériences professionnelles.** Un recruteur cherche ce que vous
   avez *fait*, pas seulement ce que vous avez construit tout seul.

---

## 🔧 Techniques du site (pour la soutenance)

Le site est lui-même un petit projet. Ce qu'il démontre :

| Technique | Où |
|---|---|
| Variables CSS, thème clair/sombre | `styles.css` §1–2 |
| Typographie fluide avec `clamp()` | `.hero h1`, `h2` |
| `grid` + `flexbox` pour toute la mise en page | `.projects`, `.header` |
| Mobile-first avec `minmax()` et media queries | `.projects`, `.hero-inner` |
| Accessibilité : `aria-*`, focus visible, skip-link, contrastes | `index.html` + `:focus-visible` |
| `prefers-reduced-motion` respecté | `.reveal`, `html` |
| Apparition au défilement avec `IntersectionObserver` | `script.js` §6 |
| Menu mobile, thème mémorisé en `localStorage` | `script.js` §1–2 |
| Mode édition avec export du HTML modifié | `script.js` §12 |
| Aucune dépendance, aucune police externe, aucun CDN | tout le projet |
| Feuille d'impression dédiée | `styles.css` §18 |

Le dernier point vaut d'être avancé en soutenance : **le site fait 0 requête réseau
externe et 0 dépendance.** Il se charge instantanément, fonctionne hors ligne
et ne peut pas casser parce qu'une bibliothèque a changé de version.
