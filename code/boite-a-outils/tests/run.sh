#!/usr/bin/env bash
# Lance les tests de mes-finances (gjs headless).
#   ./run.sh              → toutes les suites
#   ./run.sh depot-check  → une seule suite
set -u
ICI="$(cd "$(dirname "$0")" && pwd)"
APP="$(cd "$ICI/../../mes-finances" 2>/dev/null && pwd)"
[ -d "$APP" ] || APP="/home/roy-titli/Documents/Ma vie/mes-finances"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# 1) extrait le <script> de l'appli
python3 - "$APP/index.html" "$TMP/app.js" <<'PY'
import re, sys
src = open(sys.argv[1], encoding="utf-8").read()
m = re.search(r"<script>(.*?)</script>", src, flags=re.S)
open(sys.argv[2], "w", encoding="utf-8").write(m.group(1))
PY

# 2) suites
SUITES=("$@")
if [ ${#SUITES[@]} -eq 0 ]; then
  SUITES=($(cd "$ICI" && ls *-check.js 2>/dev/null | sed 's/\.js$//'))
fi

total=0
for s in "${SUITES[@]}"; do
  f="$ICI/$s.js"
  [ -f "$f" ] || { echo "$s : fichier manquant"; total=$((total+1)); continue; }
  cat "$ICI/harness.js" > "$TMP/run.js"
  cat "$TMP/app.js" >> "$TMP/run.js"
  cat "$f" >> "$TMP/run.js"
  gjs "$TMP/run.js" > "$TMP/out.txt" 2>&1
  n=$(grep -c "FAIL" "$TMP/out.txt")
  e=$(grep -c "JS ERROR\|threw an exception\|not defined" "$TMP/out.txt")
  # chaque suite doit afficher sa ligne de fin
  grep -q "TERMIN" "$TMP/out.txt" || e=$((e+1))
  total=$((total + n + e))
  printf "%-24s FAIL = %s   erreurs = %s\n" "$s" "$n" "$e"
  if [ "${VERBOSE:-0}" = "1" ]; then sed 's/^.*Gjs-Console-Message: [0-9:.]* //' "$TMP/out.txt" | sed 's/^/    /'; fi
  if [ "$e" -gt 0 ]; then sed 's/^/    /' "$TMP/out.txt" | head -6; fi
done
echo "-----------------------------"
echo "TOTAL (FAIL + erreurs) = $total"
[ "$total" -eq 0 ]
