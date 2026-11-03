/* Test : Accueil en logique trésorerie — 5 cartes + reste = dispo − dépenses − épargne. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("accueil");
const c0 = $("dash-cards").innerHTML;
ok("5 cartes présentes (heures, dispo, dépenses, épargne, reste)", c0.includes("Heures de") && c0.includes("Dispo ce mois") && c0.includes("Dépenses") && c0.includes("Épargne") && c0.includes("Reste"), true);

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);
const curKey = mkNow(), prevKey = mkAdd(curKey, -1);
set("ws-date", prevKey + "-10"); set("ws-minutes","5"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", curKey + "-10"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);

set("exp-date", curKey + "-05"); set("exp-cat","nourriture"); set("exp-montant","20"); App.addExpense(ev);
App.go("epargne");
set("ep-date", curKey + "-06"); set("ep-type","depot"); set("ep-montant","10"); set("ep-account","epargne"); App.addOp(ev);

App.go("accueil");
const c = $("dash-cards").innerHTML;
ok("carte Heures de ce mois = " + fmt(100), c.includes("Heures de " + mkLabel(curKey)) && c.includes(fmt(100)), true);
ok("carte Dispo ce mois = " + fmt(50) + " (heures du mois dernier)", c.includes("Dispo ce mois") && c.includes(fmt(50)) && c.includes(mkLabel(prevKey)), true);
ok("carte Dépenses = " + fmt(20), c.includes("Dépenses") && c.includes(fmt(20)), true);
ok("carte Épargne = " + fmt(10), c.includes("Épargne") && c.includes(fmt(10)), true);
ok("Reste = 50 − 20 − 10 = " + fmt(20), c.includes("Reste du mois") && c.includes("dispo − dépenses − épargne") && c.includes(fmt(20)), true);
ok("pas de carte « Retraits » sur l'Accueil", !$("dash-epargne").innerHTML.includes("Retraits épargne"), true);
ok("carte Compte courant (solde réel) présente", $("dash-epargne").innerHTML.includes("Compte courant (solde réel)"), true);
console.log("=== TEST RESTE DU MOIS TERMINÉS ===");