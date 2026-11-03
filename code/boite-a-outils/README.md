# Importer l'historique de Claude Code et Gemini CLI vers OpenCode

OpenCode **ne sait pas lire nativement** les formats de Claude Code (`~/.claude/projects/.../*.jsonl`)
ni ceux de Gemini CLI (`~/.gemini/...`). Sa commande d'import n'accepte que **son propre format JSON**
(celui produit par `opencode session export`).

Ce script convertit tes historiques Claude Code et Gemini CLI en fichiers JSON au format OpenCode,
que tu importes ensuite avec `opencode session import`.

---

## Important : rappel sur le « code » de tes projets

**Le code de tes projets n'a pas besoin d'être importé.** Il vit déjà sur ton disque.
OpenCode travaille directement dans le dossier du projet :

```bash
cd ~/mes-projets/mon-projet
opencode
```

Seul l'**historique de conversations** fait l'objet de cette conversion.

---

## Prérequis

- Python 3 (installé par défaut sur Linux/macOS).
- OpenCode installé (`opencode` accessible dans le terminal).
- Lancer le script **sur la machine où se trouvent tes fichiers** `~/.claude` et `~/.gemini`
  (pas forcément la même machine que celle où tu liras ce fichier).

## Utilisation

```bash
# 1. Conversion (crée des fichiers *.json dans ~/opencode-imports/)
python3 convertir-sessions.py

# Voir d'abord ce qui sera converti, sans écrire de fichier :
python3 convertir-sessions.py --dry-run

# Options utiles
python3 convertir-sessions.py --source claude       # seulement Claude Code
python3 convertir-sessions.py --source gemini       # seulement Gemini CLI
python3 convertir-sessions.py --source both         # les deux (défaut)
python3 convertir-sessions.py --out ~/mes-imports   # autre dossier de sortie
python3 convertir-sessions.py --min-turns 2         # ignorer les sessions < 2 tours
python3 convertir-sessions.py --skip-tool-results   # plus court (sans les sorties d'outils)
```

## Import dans OpenCode

```bash
# Un fichier à la fois
opencode session import ~/opencode-imports/claude-mon-projet-abc123.json --directory ~/mes-projets/mon-projet

# Ou en boucle sur tous les fichiers générés
for f in ~/opencode-imports/*.json; do
  opencode session import "$f"
done
```

Tu vois ensuite les sessions importées avec `opencode session list`.

---

## Ce qui est conservé / simplifié

| Donnée | Statut |
|---|---|
| Messages utilisateur / assistant (texte) | ✅ conservés, dans l'ordre |
| Titre de session | ✅ déduit (première demande ou `sessionName` Gemini) |
| Projet (dossier de travail) | ✅ déduit du `cwd` / du nom du projet Claude, ou via `--directory` à l'import |
| Dates (created / updated) | ✅ si présentes dans la source |
| Appels d'outils + résultats | ⚠️ transformés en texte (`[Outil: Bash] <commande>` / `[Résultat] <sortie>`) |
| Réflexion intermédiaire (thought/thinking) | ⚠️ généralement ignorée |
| Coût / tokens | ❌ mis à 0 (OpenCode recalcule ensuite) |
| Images / pièces jointes | ❌ ignorées (remplacées par un marqueur) |

## Limites connues

- **Formats propriétaires et évolutifs** : surtout côté Gemini CLI (structure différente selon la version).
  Si un fichier n'est pas parsé, le script l'affiche en avertissement — les nouvelles versions
  utilisent `~/.gemini/tmp/<hash>/chats/*.jsonl` et `checkpoint-*.json`, les anciennes `history-*.jsonl`.
- **Fidélité** : une session importée est une conversation lisible, pas une copie binaire
  de l'état Claude/Gemini (pas de restauration d'outils, de checkpoints, etc.).
- `opencode session import` correspond au format exporté par OpenCode lui-même ;
  si une future version d'OpenCode change le schéma, régénère simplement les fichiers avec ce script.