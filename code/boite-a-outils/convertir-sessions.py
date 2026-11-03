#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convertir-sessions.py — Convertit les historiques de Claude Code et Gemini CLI
vers le format JSON importable par OpenCode (`opencode session import`).

Sources prises en charge :
  * Claude Code : ~/.claude/projects/<projet-encodé>/*.jsonl
  * Gemini CLI  :
      - héritage : ~/.gemini/history-*.jsonl
      - récent   : ~/.gemini/tmp/<hash>/chats/*.jsonl (+ checkpoint-*.json)

Usage :
  python3 convertir-sessions.py [--source claude|gemini|both] [--claude-dir DIR]
                                [--gemini-dir DIR] [--out DIR] [--dry-run]
                                [--min-turns N] [--skip-tool-results]

Sortie : un fichier JSON par session dans le dossier de sortie (défaut ~/opencode-imports).
"""

import argparse
import hashlib
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Petites aides
# ---------------------------------------------------------------------------

def now_ms() -> int:
    return int(datetime.now(timezone.utc).timestamp() * 1000)

def _ts_ms(value) -> int:
    """Convertit timestamp ISO-8601, secondes, millisecondes ou None -> ms."""
    if value in (None, ""):
        return 0
    if isinstance(value, (int, float)):
        v = float(value)
        # années ~1970 en secondes… on normalise vers ms
        return int(v * 1000) if v < 10_000_000_000 else int(v)
    if isinstance(value, str):
        try:
            dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return int(dt.timestamp() * 1000)
        except ValueError:
            return 0
    return 0

def truncate(text: str, limit: int = 3000) -> str:
    if text is None:
        return ""
    text = str(text)
    if len(text) <= limit:
        return text
    return text[:limit] + "\n… [tronqué]"

def make_session_id() -> str:
    return "ses_" + uuid.uuid4().hex[:16]

def make_msg_id() -> str:
    return "msg_" + uuid.uuid4().hex[:16]

def slugify(text: str, maxlen: int = 48) -> str:
    s = re.sub(r"[^A-Za-z0-9]+", "-", text).strip("-").lower()
    return (s or "session")[:maxlen]

def tokens_zero() -> dict:
    return {"input": 0, "output": 0, "reasoning": 0, "cache": {"read": 0, "write": 0}}

def model_ref(provider_id: str, model_id: str) -> dict:
    return {"id": model_id or f"{provider_id}-inconnu", "providerID": provider_id}

# ---------------------------------------------------------------------------
# Construction d'une session OpenCode
# ---------------------------------------------------------------------------

class OpenCodeSession:
    """Agrège les messages d'une session et produit le JSON d'import OpenCode."""

    def __init__(self, source: str, directory: str, title: str,
                 model_id: str = "", provider_id: str = "", created_ms: int = 0):
        self.source = source
        self.directory = directory or os.path.expanduser("~")
        self.title = title or f"{source} session"
        self.model_id = model_id
        self.provider_id = provider_id or ("anthropic" if source == "claude" else "google")
        self.created_ms = created_ms or now_ms()
        self.messages: list[dict] = []
        self._last_tool_use = None  # pour rattacher le résultat de l'outil

    def add_user(self, text: str, created_ms: int = 0) -> None:
        text = (text or "").strip()
        if not text:
            return
        self.messages.append({
            "id": make_msg_id(),
            "time": {"created": created_ms or self.created_ms},
            "text": text,
            "type": "user",
        })

    def add_tool_result(self, text: str, created_ms: int = 0) -> None:
        text = (text or "").strip()
        if not text:
            return
        self.messages.append({
            "id": make_msg_id(),
            "time": {"created": created_ms or self.created_ms},
            "text": text,
            "type": "user",
        })

    def add_assistant(self, parts: list[dict], created_ms: int = 0) -> None:
        """parts : liste de blocs texte pour `content`."""
        content = []
        for p in parts:
            text = truncate(p.get("text", "")).strip()
            if text:
                content.append({"type": "text", "text": text})
        if not content:
            return
        msg = {
            "id": make_msg_id(),
            "time": {"created": created_ms or self.created_ms},
            "type": "assistant",
            "agent": self.source,
            "model": model_ref(self.provider_id, self.model_id),
            "content": content,
        }
        self.messages.append(msg)

    def add_system(self, text: str, created_ms: int = 0) -> None:
        text = (text or "").strip()
        if not text:
            return
        self.messages.append({
            "id": make_msg_id(),
            "time": {"created": created_ms or self.created_ms},
            "text": text,
            "type": "system",
        })

    def to_json(self) -> dict:
        updated = getattr(self, "updated_ms", 0) or self.created_ms
        for m in self.messages:
            c = m.get("time", {}).get("created") or 0
            if c:
                updated = max(updated, c)
        # Le dossier/la machine ne doivent pas sauter entre sessions : on dérive l'ID
        # de façon stable depuis la source pour éviter les doublons à la ré-importation.
        session_id = "ses_" + hashlib.sha1(
            (self.source + "|" + self.directory + "|" + self.title).encode()
        ).hexdigest()[:16]
        return {
            "info": {
                "id": session_id,
                "projectID": self.source,
                "title": self.title,
                "agent": self.source,
                "model": model_ref(self.provider_id, self.model_id),
                "cost": 0,
                "tokens": tokens_zero(),
                "time": {"created": self.created_ms, "updated": updated},
                "location": {"directory": os.path.abspath(os.path.expanduser(self.directory))},
            },
            "messages": self.messages,
        }


def render_parts(parts, skip_tool_results: bool, is_model: bool) -> tuple[list[dict], list[dict]]:
    """Convertit des blocs de contenu (Claude ou Gemini) en:
       - [contenu texte]  pour add_assistant  (liste de {text})
       - [rapports d'outils] pour add_tool_result / add_user
    Retourne (text_parts, tool_messages, user_texts)."""
    text_parts: list[dict] = []
    out_messages: list[str] = []
    user_texts: list[str] = []
    for block in parts or []:
        if not isinstance(block, dict):
            continue
        btype = block.get("type") or ""

        # ---------- texte pur ----------
        if btype in ("text",):
            text = block.get("text")
            if isinstance(text, list):  # certains blocs Gemini : {"type":"text","text":[{...}]}
                text = " ".join(str(t.get("text", t)) for t in text if isinstance(t, dict))
            if text:
                if is_model:
                    text_parts.append({"text": str(text)})
                else:
                    user_texts.append(str(text))

        # ---------- réflexion ----------
        elif btype in ("thinking", "thought"):
            thinking = block.get("thinking") or block.get("text")
            # on ne garde pas la réflexion : trop verbeuse, et OpenCode l'ignore
            _ = thinking

        # ---------- appel d'outil ----------
        elif btype == "tool_use":
            name = block.get("name", "outil")
            inp = block.get("input")
            try:
                inp_text = json.dumps(inp, ensure_ascii=False) if inp is not None else ""
            except (TypeError, ValueError):
                inp_text = str(inp)
            text_parts.append({
                "text": f"[Outil: {name}] " + truncate(inp_text, 800),
            })

        # ---------- résultat d'outil ----------
        elif btype == "tool_result":
            content = block.get("content", "")
            if isinstance(content, list):
                content = "\n".join(
                    str(c.get("text", c)) if isinstance(c, dict) else str(c)
                    for c in content
                )
            is_err = block.get("is_error")
            prefix = "[Erreur d'outil] " if is_err else "[Résultat de l'outil] "
            if not skip_tool_results and str(content).strip():
                out_messages.append(prefix + truncate(str(content), 2000))

        # ---------- commande terminal / exécutable (Gemini) ----------
        elif btype in ("executable", "tool_invocation"):
            name = block.get("name") or block.get("toolName") or "commande"
            payload = block.get("input") or block.get("args") or block.get("command")
            try:
                payload_text = json.dumps(payload, ensure_ascii=False) if payload is not None else ""
            except (TypeError, ValueError):
                payload_text = str(payload)
            text_parts.append({"text": f"[Exécution: {name}] " + truncate(payload_text, 800)})

        # ---------- image / fichier (remplacé par un marqueur) ----------
        elif btype in ("image", "file"):
            text_parts.append({"text": f"[Pièce jointe ignorée: {btype}]"})

        else:
            # Bloc sans type : essaye de récupérer une clé texte ordinaire
            for k in ("text", "content", "value"):
                if isinstance(block.get(k), str) and block[k].strip():
                    if is_model:
                        text_parts.append({"text": block[k]})
                    else:
                        user_texts.append(block[k])
                    break
    return text_parts, out_messages, user_texts


def merge_parts(parts_by_role: dict[str, list[dict]], skip_tool_results: bool) -> list[dict]:
    """Assemble une liste de messages OpenCode depuis un dict role -> blocs de contenu."""
    out: list[dict] = []
    text_parts, tool_messages, user_texts = render_parts(
        parts_by_role.get("model") or parts_by_role.get("assistant"), skip_tool_results, True
    )
    ut, tm, uu = render_parts(
        parts_by_role.get("user"), skip_tool_results, False
    )
    user_texts.extend(uu)
    text_parts.extend(ut)
    tool_messages.extend(tm)
    if user_texts:
        out.append({"text": "\n".join(user_texts), "role": "user"})
    if text_parts:
        out.append({"text_parts": text_parts, "role": "assistant"})
    for tm_ in tool_messages:
        out.append({"text": tm_, "role": "result"})
    return out


# ---------------------------------------------------------------------------
# Claude Code
# ---------------------------------------------------------------------------

def decode_claude_project_dir(project_dir: str) -> str:
    """Essaie de décoder le nom du dossier Claude (~/.claude/projects/<name>)."""
    name = os.path.basename(project_dir)
    if name.startswith("~"):
        return os.path.expanduser(name.replace("~", "~", 1).replace("-", "/"))
    if name.startswith("-"):
        return "/" + name[1:].replace("-", "/")
    return project_dir


def parse_claude_file(path: str, skip_tool_results: bool):
    """Parse un transcript Claude Code (un *.jsonl) en une session OpenCode."""
    session = None
    cwd = None
    title = None
    first_ts = 0
    records = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                print(f"  ⚠️  {path}:{lineno} — ligne JSON invalide ignorée")
                continue
            if not isinstance(rec, dict):
                continue
            records.append(rec)
            cwd = rec.get("cwd") or cwd
            ts = _ts_ms(rec.get("timestamp"))

    if not records:
        return None

    session = OpenCodeSession(
        source="claude",
        directory=cwd or decode_claude_project_dir(os.path.dirname(path)),
        title=title or "claude session",
        model_id="",
        created_ms=_ts_ms(records[0].get("timestamp")),
    )

    for rec in records:
        rtype = rec.get("type")
        ts = _ts_ms(rec.get("timestamp"))
        msg = rec.get("message") or {}
        content = msg.get("content") if isinstance(msg, dict) else None

        if rtype == "user":
            text_parts, tool_messages, user_texts = render_parts(content, skip_tool_results, False)
            for t in user_texts:
                if title is None and t.strip():
                    title = t.strip().splitlines()[0][:80]
                session.add_user(t, ts)
            for tm in tool_messages:
                session.add_tool_result(tm, ts)

        elif rtype == "assistant":
            if msg and isinstance(msg, dict) and msg.get("model"):
                session.model_id = msg["model"]
            text_parts, tool_messages, user_texts = render_parts(content, skip_tool_results, True)
            session.add_assistant(text_parts, ts)

        elif rtype == "summary":
            summary = rec.get("summary")
            if summary:
                session.add_system(f"[Résumé de la session Claude] {summary}", ts)

        # type "system" : on l'ignore (définitions d'outils, MCP… trop verbeux)

    if title:
        session.title = title
    return session


def scan_claude(claude_dir: str, skip_tool_results: bool, min_turns: int):
    sessions = []
    if not os.path.isdir(claude_dir):
        print(f"⚠️  Dossier Claude introuvable : {claude_dir}")
        return sessions
    for root, _dirs, files in os.walk(claude_dir):
        for fn in sorted(files):
            if not fn.endswith(".jsonl"):
                continue
            path = os.path.join(root, fn)
            print(f"→ Claude : {os.path.relpath(path, os.path.expanduser('~'))}")
            try:
                sess = parse_claude_file(path, skip_tool_results)
            except Exception as exc:  # ne jamais bloquer toute la conversion
                print(f"  ⚠️  erreur d'analyse : {exc}")
                continue
            if sess and len(sess.messages) >= max(min_turns, 1):
                sessions.append(sess)
    return sessions


# ---------------------------------------------------------------------------
# Export Claude (conversations.json — export depuis Claude.ai / application)
# ---------------------------------------------------------------------------

def parse_claude_export(path: str, location_dir: str, min_turns: int, skip_tool_results: bool):
    """Convertit un export Claude (fichier conversations.json) en sessions OpenCode."""
    with open(path, encoding="utf-8", errors="replace") as fh:
        data = json.load(fh)
    if isinstance(data, dict):
        data = data.get("conversations", [])
    sessions = []
    print(f"→ Export Claude : {path} ({len(data)} conversations)")
    for conv in data or []:
        if not isinstance(conv, dict):
            continue
        cid = conv.get("uuid") or ""
        name = (conv.get("name") or "").strip() or "claude sans titre"
        summary = (conv.get("summary") or "").strip()
        created = _ts_ms(conv.get("created_at"))
        updated = _ts_ms(conv.get("updated_at"))
        sess = OpenCodeSession(
            source="claude",
            directory=location_dir,
            title=name,
            provider_id="anthropic",
            created_ms=created or now_ms(),
        )
        sess.updated_ms = updated or created

        last_assistant_texts = []  # accumulate les blocs d'une même réponse
        for m in conv.get("chat_messages") or []:
            if not isinstance(m, dict):
                continue
            ts = _ts_ms(m.get("created_at"))
            sender = (m.get("sender") or "").lower()
            content = m.get("content") or []
            if not isinstance(content, list):
                content = [{"type": "text", "text": str(content)}]
            blocks = []
            for b in content:
                if not isinstance(b, dict):
                    continue
                if b.get("type") in (None, "text"):
                    t = b.get("text") or b.get("content")
                    if isinstance(t, list):
                        t = " ".join(str(x.get("text", x)) if isinstance(x, dict) else str(x) for x in t)
                    if t:
                        blocks.append({"type": "text", "text": str(t)})
                elif b.get("type") in ("tool_use", "tool_result", "executable", "tool_invocation"):
                    blocks.append(b)

            if sender in ("human", "user"):
                text_parts, tool_msgs, user_texts = render_parts(blocks, skip_tool_results, False)
                for t in user_texts:
                    sess.add_user(t, ts)
                for te in tool_msgs:
                    sess.add_tool_result(te, ts)
            elif sender in ("assistant", "model", "ai"):
                # grouper les blocs d'une même réponse assistant consécutive
                text_parts, tool_msgs, _uu = render_parts(blocks, skip_tool_results, True)
                sess.add_assistant(text_parts, ts)
                for te in tool_msgs:
                    sess.add_tool_result(te, ts)
            else:
                # message système / prompt système
                t = (blocks[0].get("text") if blocks else "") or m.get("text") or ""
                if t:
                    sess.add_system(t, ts)

        if summary and not sess.messages:
            sess.add_system(summary, updated or created)
        if len(sess.messages) >= max(min_turns, 1):
            sessions.append(sess)
    return sessions


# ---------------------------------------------------------------------------
# Gemini CLI
# ---------------------------------------------------------------------------

def _find_parts_list(obj, depth=0):
    """Recherche récursive de listes de blocs à clé 'parts' (checkpoints Gemini)."""
    found = []
    if depth > 6 or not isinstance(obj, (dict, list)):
        return found
    if isinstance(obj, list):
        for item in obj:
            found.extend(_find_parts_list(item, depth + 1))
        return found
    for key, value in obj.items():
        if key == "parts" and isinstance(value, list):
            found.append({"parts": value, "role": obj.get("role")})
        else:
            found.extend(_find_parts_list(value, depth + 1))
    return found


def extract_gemini_sessions(gemini_dir: str, skip_tool_results: bool, min_turns: int):
    """Découvre et parse les sessions Gemini CLI (formats historique + récents)."""
    sessions = []
    candidates = []  # (chemin, priorité)

    # 1) history-*.jsonl (héritage) — un objet JSON par ligne, chacun une session
    if os.path.isdir(gemini_dir):
        for fn in sorted(os.listdir(gemini_dir)):
            if fn.startswith("history-") and fn.endswith(".jsonl"):
                candidates.append((os.path.join(gemini_dir, fn), 1))

    # 2) tmp/**/chats/*.jsonl (récent) et checkpoint-*.json
    tmp_dir = os.path.join(gemini_dir, "tmp")
    if os.path.isdir(tmp_dir):
        for root, _dirs, files in os.walk(tmp_dir):
            for fn in sorted(files):
                p = os.path.join(root, fn)
                if fn.endswith(".jsonl") and "chats" in root:
                    candidates.append((p, 0))
                elif fn.startswith("checkpoint-") and fn.endswith(".json"):
                    candidates.append((p, 0))

    for path, prio in sorted(candidates, key=lambda c: (c[1], c[0])):
        print(f"→ Gemini : {os.path.relpath(path, os.path.expanduser('~'))}")
        try:
            found = parse_gemini_file(path, skip_tool_results)
        except Exception as exc:
            print(f"  ⚠️  erreur d'analyse : {exc}")
            continue
        for sess in found:
            if sess and len(sess.messages) >= max(min_turns, 1):
                sessions.append(sess)
    return sessions


def parse_gemini_file(path: str, skip_tool_results: bool) -> list[OpenCodeSession]:
    hand = OpenCodeSession(
        source="gemini",
        directory=os.getcwd(),
        title="gemini session",
        provider_id="google",
    )
    sessions = []
    pending: dict[object, OpenCodeSession] = {}
    is_jsonl = path.endswith(".jsonl")

    def store(sess):
        if sess is not None:
            sessions.append(sess)

    if is_jsonl:
        with open(path, encoding="utf-8", errors="replace") as fh:
            for lineno, line in enumerate(fh, 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    rec = json.loads(line)
                except json.JSONDecodeError:
                    print(f"  ⚠️  {os.path.basename(path)}:{lineno} — ligne JSON invalide ignorée")
                    continue
                if not isinstance(rec, dict):
                    continue

                # Ligne n°1 : métadonnées de session (`sessionId`, `projectHash`, `startTime`…)
                if lineno == 1 and rec.get("sessionId") and "turns" not in rec and "messages" not in rec \
                        and "type" not in rec:
                    sid = rec.get("sessionId")
                    sess = OpenCodeSession(
                        source="gemini",
                        directory=rec.get("directories") or os.getcwd(),
                        title=rec.get("sessionName") or rec.get("title") or "gemini session",
                        model_id=rec.get("modelId", ""),
                        provider_id=rec.get("providerId", "google"),
                        created_ms=_ts_ms(rec.get("startTime")),
                    )
                    pending[sid] = sess
                    continue

                # Métadonnée de mise à jour MongoDB ($set) — enrichit la métadonnée
                if "$set" in rec and isinstance(rec["$set"], dict):
                    updates = rec["$set"]
                    for sess in pending.values():
                        if "modelId" in updates and not sess.model_id:
                            sess.model_id = updates["modelId"]
                        if "providerId" in updates:
                            sess.provider_id = updates["providerId"]
                        if "sessionName" in updates:
                            sess.title = updates["sessionName"]
                        if "directories" in updates:
                            sess.directory = updates["directories"]
                    continue

                ts = _ts_ms(rec.get("timestamp") or rec.get("time"))
                sess = pending.get(rec.get("sessionId")) if rec.get("sessionId") else None
                if sess is None:
                    sess = hand

                # Enregistrement de message {type, content} ou {role, parts}
                if "turns" in rec:
                    # Session complète sur une ligne (history héritage)
                    legacy = OpenCodeSession(
                        source="gemini",
                        directory=rec.get("cwd") or os.getcwd(),
                        title=rec.get("sessionName") or "gemini session",
                        model_id=rec.get("modelId", ""),
                        provider_id=rec.get("providerId", "google"),
                        created_ms=_ts_ms((rec.get("time") or {}).get("startedAt") or rec.get("time") or 0),
                    )
                    for turn in rec["turns"]:
                        if not isinstance(turn, dict):
                            continue
                        role = turn.get("role", "user")
                        parts = turn.get("parts") or turn.get("content") or []
                        ts2 = _ts_ms(turn.get("timestamp"))
                        if role in ("model", "assistant"):
                            tp, tm, _uu = render_parts(parts, skip_tool_results, True)
                            legacy.add_assistant(tp, ts2)
                            for msg_ in tm:
                                legacy.add_tool_result(msg_, ts2)
                        else:
                            tp, tm, ut = render_parts(parts, skip_tool_results, False)
                            for t in ut:
                                legacy.add_user(t, ts2)
                            for msg_ in tm:
                                legacy.add_tool_result(msg_, ts2)
                    if not legacy.title or legacy.title == "gemini session":
                        for m in legacy.messages:
                            if m["type"] == "user" and m["text"].strip():
                                legacy.title = m["text"].strip().splitlines()[0][:80]
                                break
                    store(legacy)
                    continue

                content = rec.get("content")
                role = rec.get("role") or rec.get("type")
                if isinstance(content, dict):
                    role = content.get("role") or role
                    content = content.get("parts") or content.get("content") or []
                if isinstance(content, list):
                    is_model = role in ("model", "assistant", "assistant-message")
                    tp, tm, ut = render_parts(content, skip_tool_results, is_model)
                    if is_model:
                        sess.add_assistant(tp, ts)
                    else:
                        for t in ut:
                            sess.add_user(t, ts)
                    for msg_ in tm:
                        sess.add_tool_result(msg_, ts)
        # Boucle sur les sessions pendantes encore ouvertes
        for sid, sess in pending.items():
            if len(sess.messages) >= 1:
                store(sess)
            pending[sid] = None
    else:
        # Fichier checkpoint JSON : chercher des listes {role, parts} n'importe où
        with open(path, encoding="utf-8", errors="replace") as fh:
            data = json.load(fh)
        found = _find_parts_list(data)
        sess = OpenCodeSession(source="gemini", directory=os.getcwd(), title="gemini checkpoint",
                               provider_id="google")
        for group in found:
            role = group.get("role") or data.get("role") or "user"
            is_model = role in ("model", "assistant")
            tp, tm, ut = render_parts(group.get("parts"), skip_tool_results, is_model)
            if is_model:
                sess.add_assistant(tp)
            else:
                for t in ut:
                    sess.add_user(t)
            for msg_ in tm:
                sess.add_tool_result(msg_)
        if sess.messages and any(m["type"] == "assistant" for m in sess.messages):
            store(sess)
    return sessions


# ---------------------------------------------------------------------------
# Sortie
# ---------------------------------------------------------------------------

def write_outputs(sessions, out_dir: str, dry_run: bool) -> None:
    os.makedirs(out_dir, exist_ok=True)
    written = []
    counts = {}
    for sess in sessions:
        data = sess.to_json()
        slug = slugify(sess.title)
        fname = f"{sess.source}-{slug}-{data['info']['id'][4:12]}.json"
        fpath = os.path.join(out_dir, fname)
        counts[sess.source] = counts.get(sess.source, 0) + 1
        if not dry_run:
            with open(fpath, "w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False, indent=2)
        written.append(fpath)
    return written, counts


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", choices=["claude", "gemini", "both"], default="both")
    ap.add_argument("--claude-dir", default=os.path.expanduser("~/.claude/projects"),
                    help="dossier des transcripts Claude Code (défaut: ~/.claude/projects)")
    ap.add_argument("--claude-export", default=None, metavar="FICHIER",
                    help="export Claude (fichier conversations.json) issu de la demande d'export de données")
    ap.add_argument("--location-dir", default=os.path.expanduser("~/Documents"),
                    help="dossier de projet OpenCode utilisé pour les sessions issues de l'export "
                         "(défaut: ~/Documents, où vit l'export)")
    ap.add_argument("--gemini-dir", default=os.path.expanduser("~/.gemini"),
                    help="dossier des données Gemini CLI (défaut: ~/.gemini)")
    ap.add_argument("--out", default=os.path.expanduser("~/opencode-imports"),
                    help="dossier de sortie (défaut: ~/opencode-imports)")
    ap.add_argument("--dry-run", action="store_true", help="affiche le résumé sans écrire")
    ap.add_argument("--min-turns", type=int, default=1, help="ignorer les sessions de moins de N tours")
    ap.add_argument("--skip-tool-results", action="store_true",
                    help="ne pas convertir les sorties d'outils (fichiers plus légers)")
    args = ap.parse_args()
    if args.claude_export and args.source == "both":
        args.source = "claude"  # un export explicite prime sur la recherche Gemini par défaut

    print("═" * 64)
    print("Conversion des historiques Claude Code / Gemini CLI → OpenCode")
    print("═" * 64)

    sessions = []
    if args.source in ("claude", "both"):
        print("\n[Claude Code]")
        sessions += scan_claude(args.claude_dir, args.skip_tool_results, args.min_turns)
    if args.claude_export:
        print("\n[Export Claude]")
        sessions += parse_claude_export(args.claude_export, args.location_dir,
                                        args.min_turns, args.skip_tool_results)
    if args.source in ("gemini", "both"):
        print("\n[Gemini CLI]")
        sessions += extract_gemini_sessions(args.gemini_dir, args.skip_tool_results, args.min_turns)

    print("\n" + "═" * 64)
    if not sessions:
        print("Aucune session trouvée. Vérifie les dossiers sources :")
        print(f"  --claude-dir    {args.claude_dir}")
        print(f"  --claude-export <conversations.json>")
        print(f"  --gemini-dir    {args.gemini_dir}")
        sys.exit(1)

    written, counts = write_outputs(sessions, args.out, args.dry_run)
    total_msgs = sum(len(s.messages) for s in sessions)
    for src, n in counts.items():
        print(f"• {src}: {n} session(s)")
    print(f"• total: {len(sessions)} session(s), {total_msgs} message(s)")

    if args.dry_run:
        print("\n(–dry-run : rien n'a été écrit)")
    else:
        print(f"\nFichiers écrits dans : {args.out}")
        print("\nImporte-les avec, par exemple :")
        for fpath in written[:3]:
            print(f"  opencode session import {fpath}")
        if len(written) > 3:
            print(f"  … et {len(written) - 3} autre(s).")
        print("\nOu en boucle :")
        print("  for f in " + args.out + "/*.json; do opencode session import \"$f\"; done")


if __name__ == "__main__":
    main()