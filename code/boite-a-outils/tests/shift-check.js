/* Test : décalage d'un mois — le dispo vient du dépôt réel, les heures de ce mois arrivent le mois prochain. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);
const curKey = mkNow(), prevKey = mkAdd(curKey, -1), nextKey = mkAdd(curKey, 1);
set("ws-date", prevKey + "-15"); set("ws-minutes","5"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", curKey + "-15"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);

App.go("epargne");
set("ep-date", todayStr()); set("ep-type","depot"); set("ep-montant","300"); set("ep-account","courant"); App.addOp(ev);
renderEpargne();

const sh = $("ep-shift").innerHTML;
ok("panneau « d'où vient l'argent » présent", sh.includes("D'où vient l'argent de ce mois"), true);
ok("heures de ce mois = " + fmt(100), sh.includes("Heures de " + mkLabel(curKey)) && sh.includes(fmt(100)), true);
ok("heures de ce mois → dépôts de " + mkLabel(nextKey), sh.includes(mkLabel(nextKey)), true);
ok("dispo ce mois = le dépôt réel " + fmt(300), sh.includes("Dispo ce mois") && sh.includes(fmt(300)) && !sh.includes(fmt(50)), true);
ok("solde compte courant = " + fmt(300), $("ep-cards").innerHTML.includes(fmt(300)), true);

const oldMk = D.ui.month;
D.ui.month = "2026-01"; renderEpargne();
ok("janvier mentionne décembre 2025 (année précédente)", $("ep-shift").innerHTML.includes(mkLabel("2025-12")), true);
D.ui.month = oldMk; renderEpargne();

App.go("accueil");
ok("Accueil : rappel sur les dépôts saisis + heures du mois", $("dash-epargne").innerHTML.includes("dépôts saisis") && $("dash-epargne").innerHTML.includes(mkLabel(curKey)), true);
console.log("=== TEST DÉCALAGE D'UN MOIS TERMINÉS ===");