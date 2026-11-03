/* Test : « Dispo ce mois » = ce que tu as VRAIMENT reçu (dépôts en compte courant), pas seulement tes heures.
   Scénario : heures de juillet = 341,21 €, mais le dépôt reçu en août = 412,50 € (salaire + autres bénéfices). */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev); App.selectJob(D.jobs[0].id);
const curY = yyOf(todayStr());
set("ws-date", curY + "-07-15"); set("ws-minutes","24"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", curY + "-07-20"); set("ws-minutes","10,121"); set("ws-mult","1"); App.addSession(ev);

D.ui.month = curY + "-08";
App.go("epargne");
set("ep-date", curY + "-08-03"); set("ep-type","depot"); set("ep-montant","412,50"); set("ep-account","courant"); App.addOp(ev);

renderAccueil();
const cards = $("dash-cards").innerHTML;
ok("dispo ce mois (août) = " + fmt(412.5) + " (le dépôt saisi)", cards.includes("🏦 Dispo ce mois") && cards.includes(fmt(412.5)), true);
ok("les heures seules ne pilotent plus le dispo", !cards.includes(fmt(341.21)), true);
ok("sous-titre : l'argent réellement reçu", cards.includes("l'argent réellement reçu ce mois") && cards.includes("dépôts en compte courant"), true);
ok("reste du mois = dispo 412,50 (aucune dépense/épargne)", cards.includes("Reste du mois") && cards.includes(fmt(412.5)), true);

App.go("epargne");
ok("panneau épargne : 🏦 Dispo ce mois = " + fmt(412.5), $("ep-shift").innerHTML.includes("🏦 Dispo ce mois") && $("ep-shift").innerHTML.includes(fmt(412.5)), true);

D.ops = [];
renderAccueil();
const attendu = fmt(monthRevNet(mkAdd(D.ui.month,-1)));
const cards2 = $("dash-cards").innerHTML;
ok("sans dépôt : dispo = heures du mois dernier (" + attendu + ")", cards2.includes(attendu) && !cards2.includes(fmt(412.5)), true);
console.log("=== TEST DISPO MOIS TERMINÉS ===");