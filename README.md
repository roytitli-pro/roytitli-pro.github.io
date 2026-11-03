# Portfolio — Roy Titli

Site statique de présentation : parcours, projets, compétences et CV.

**En ligne : https://roytitli-pro.github.io/**

## Ce que contient le site

| Section | Contenu |
|---|---|
| À propos | présentation et méthode de travail |
| Compétences | développement, bases de données, systèmes et réseaux |
| Projets | Fair'repair (PHP/MySQL), Ma Vie Admin (JavaScript), outillage Python, réseau Cisco, veille technologique, projets BTS |
| Parcours | formation, alternance et expériences professionnelles |
| Contact | email, GitHub, LinkedIn et CV en PDF |

## Stack

HTML5, CSS3 et JavaScript natif. **Aucune dépendance, aucun build, aucun framework** :
le site est servi tel quel par GitHub Pages. Le CSS utilise des variables pour les thèmes
clair et sombre, les animations passent par `IntersectionObserver`.

## Structure

```
index.html                  page unique
assets/styles.css           styles et thèmes
assets/script.js            thème, filtres, navigation, mode édition local
assets/CV-Roy-Titli.pdf     CV public (sans numéro de téléphone)
apps/ma-vie-admin/          Ma Vie Admin, application de démonstration
code/boite-a-outils/        scripts Python et suites de tests
code/veille/                veille technologique (passkeys, agents IA)
```

## Lancer en local

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Ou ouvrez simplement `index.html` dans un navigateur : tout fonctionne sans serveur.

## Mode édition

Le bouton « ✎ Éditer » apparaît **uniquement en local** (`file://`, `localhost`,
`127.0.0.1`). Il rend les textes modifiables en direct et permet de copier le HTML
résultant. Sur le site publié, il est masqué.

## Mettre à jour le site

Le site source vit dans le dépôt privé `Ma vie`. Pour publier :

```bash
cd ~/Documents/Ma\ vie && ./deployer-portfolio.sh
```

Le script commite, extrait le dossier `portfolio/` seul et pousse vers ce dépôt.

## CV

Le CV publié ici est la version **sans numéro de téléphone**. La version destinée aux
candidatures — avec téléphone — est générée par `cv/generer-cv.sh`, qui produit les deux
variantes à partir d'une source unique.

---

© Roy Titli — site conçu et développé à la main.
