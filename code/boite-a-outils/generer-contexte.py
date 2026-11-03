#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Génère profil-et-historique.md — synthèse de l'export Claude pour OpenCode."""

import json
import os
import re
import unicodedata
from collections import defaultdict

SRC = "/home/roy-titli/Documents/Claude/conversations-000/conversations.json"
OUT_DIR = "/home/roy-titli/Documents/OpenCode-Contexte"
OUT = os.path.join(OUT_DIR, "profil-et-historique.md")

def norm(s):
    s = unicodedata.normalize("NFD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c)).lower()

THEMES = [
    ("🛠️ FAIR'REPAIR / projets de développement",
     ["fairepair", "fairepaire", "fair repair", "php", "phpmyadmin", "mysql", "bdd", "sql",
      "cahier des charges", "mcd", "application web", "site web", "projet de sio", "projet slam",
      "wamp", "apache", "github", "developper", "programmation", "veille informatique"]),
    ("🎓 BTS SIO / études / alternance",
     ["bts", "slam", "sio", "revision", "fiche de revision", "examen", "epreuve", "qcm",
      "veille", "semestre", "alternance", "alternante", "alternant", "stage", "apprentissage",
      "salaire", "smic", "bulletin", "prorata", "notion", "emploi du temps", "cours", "devoir",
      "projet de bts", "concours", "entretien"]),
    ("📄 Démarches administratives / papiers",
     ["titre de sejour", "passeport", "naturalisation", "visa", "prefecture", "dcem", "auto-ecole",
      "permis", "nationalite", "refere", "tribunal", "infraction", "carte nationale", "vanaigs",
      "mineur", "certificat"]),
    ("💻 PC / matériel / configuration",
     ["ordinateur", "portable", "ssd", "ram", "lenovo", "samsung book", "dell", "hp", "thinkpad",
      "vivobook", "linux", "ubuntu", "trottinette", "samsung a50", "buds", "yeep", "nintendo",
      "telephone", "carte mere", "slood", "reconditionne", "clavier", "micro"]),
    ("🎨 Beauté / santé / perso",
     ["cheveux", "peau", "lotion", "tonic", "serum", "maquillage", "fondation", "makeup",
      "regime", "poids", "sport", "magnesium", "menopause", "depression", "fievre", "klorane",
      "yves rocher", "barriere cream", "nutella", "cupcake", "quiche", "pizza", "fromage",
      "sauce", "mosquito", "moustique", "bingo", "monopoly", "sketchbook", "film", "serie",
      "korean", "manga", "voiture", "ethanol", "freinage", "appartement", "naissance",
      "postpartum", "cadeau", "massage", "trot"]),
    ("💰 Banque / argent / assurance",
     ["paypal", "iban", "etsy", "etf", "banque", "assurance", "alliatys", "tva", "compte",
      "virement", "epargne", "carte cadeau"]),
]

def classify(name, first_prompt):
    text = norm(f"{name} {first_prompt}")
    for label, kws in THEMES:
        for kw in kws:
            pat = r"(?<![a-z0-9])" + re.escape(norm(kw)) + r"(?![a-z0-9])"
            if re.search(pat, text):
                return label
    return "🗂️ Divers"

def main():
    with open(SRC, encoding="utf-8") as fh:
        convs = json.load(fh)

    groups = defaultdict(list)
    for c in convs:
        msgs = c.get("chat_messages") or []
        first_prompt = ""
        for m in msgs:
            if (m.get("sender") or "").lower() in ("human", "user"):
                txt = (m.get("text") or "").strip()
                if txt:
                    first_prompt = txt
                    break
        theme = classify(c.get("name") or "", first_prompt)
        groups[theme].append({
            "title": (c.get("name") or "").strip(),
            "created": (c.get("created_at") or "")[:10],
            "updated": (c.get("updated_at") or "")[:10],
            "summary": (c.get("summary") or "").strip(),
            "first": first_prompt[:400],
            "n_msgs": len(msgs),
        })

    os.makedirs(OUT_DIR, exist_ok=True)
    lines = []
    lines.append("# Profil & historique — Rose (contexte OpenCode)")
    lines.append("")
    lines.append("> Document généré automatiquement depuis l'export Claude "
                 "(`~/Documents/Claude/conversations-000/conversations.json`) le 22/09/2026.")
    lines.append("> Source de contexte pour les sessions OpenCode : l'IA sait qui tu es et ce "
                 "que tu as cherché/fait. Complète ce fichier si ta situation évolue.")
    lines.append("")
    total = sum(len(v) for v in groups.values())
    lines.append(f"**{total} conversations au total (2026).**")
    lines.append("")

    for theme in [t[0] for t in THEMES] + ["🗂️ Divers"]:
        items = groups.get(theme, [])
        if not items:
            continue
        items.sort(key=lambda x: x["created"])
        lines.append(f"## {theme} ({len(items)})")
        lines.append("")
        for it in items:
            title = it["title"] or "(sans titre)"
            lines.append(f"### {title}")
            lines.append(f"- *Quand :* {it['created']} → {it['updated']} · {it['n_msgs']} messages")
            fp = it["first"].replace("\n", " ")
            if fp:
                lines.append(f"- *Première demande :* {fp[:300]}")
            if it["summary"]:
                lines.append(f"- *Résumé Claude :* {it['summary'][:900]}")
            lines.append("")

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))
    print(f"✅ {OUT}")
    print(f"   {total} conversations classées dans {len(groups)} thèmes")
    for theme in groups:
        print(f"   - {theme}: {len(groups[theme])}")

if __name__ == "__main__":
    main()