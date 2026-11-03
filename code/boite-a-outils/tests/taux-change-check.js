/* Test : le taux horaire peut changer à partir d'un mois donné (ex : 51 % du SMIC depuis septembre 2026).
   Les heures d'août gardent l'ancien taux, celles de septembre et après utilisent le nouveau. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));
const cur = mkNow(), aout = mkAdd(cur, -2), sept = mkAdd(cur, -1);

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);

/* 10 h en août (ancien taux) · 10 h en septembre (nouveau taux) · 10 h ce mois */
set("ws-date", aout + "-10"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", sept + "-10"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", cur + "-10"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);
const sAout = D.sessions.find(s => s.date === aout + "-10");
const sSept = D.sessions.find(s => s.date === sept + "-10");
ok("avant : 10 h × 10 € = 100 € en août", sessionBrut(sAout) === 100, true);

/* 💶 changement : 6,28 €/h à partir de septembre */
renderTravail();
ok("zone « Taux horaire » présente", $("work-detail").innerHTML.includes("Taux horaire (il peut changer dans le temps)"), true);
set("jr-mois", sept); set("jr-taux", "6,28");
App.setJobRate(ev);
ok("historique enregistré (ancien taux gardé + nouveau)", j.rateHist.length === 2 && j.rateHist[1].rate === 6.28 && j.rateHist[1].from === sept && j.rateHist[0].rate === 10, true);
ok("taux actuel = 6,28", j.rate === 6.28, true);

/* les calculs */
ok("août garde l'ancien taux : 100 €", sessionBrut(sAout) === 100, true);
ok("septembre : 10 h × 6,28 = 62,80 €", Math.abs(sessionBrut(sSept) - 62.8) < 0.001, true);
ok("mois courant : 62,80 €", Math.abs(sessionBrut(D.sessions.find(s => s.date === cur + "-10")) - 62.8) < 0.001, true);
ok("net : août 100 € · septembre 62,80 € (coef 1)", Math.abs(sessionNet(sSept) - 62.8) < 0.001, true);
ok("rateAt : avant = 10, après = 6,28", rateAt(j, aout) === 10 && rateAt(j, sept) === 6.28 && rateAt(j, cur) === 6.28, true);

/* totaux mensuels */
ok("net d'août = 100 €", Math.abs(monthRevNet(aout) - 100) < 0.001, true);
ok("net de septembre = 62,80 €", Math.abs(monthRevNet(sept) - 62.8) < 0.001, true);
ok("brut d'août = 100 €", Math.abs(monthRevBrut(aout) - 100) < 0.001, true);
ok("brut de septembre = 62,80 €", Math.abs(monthRevBrut(sept) - 62.8) < 0.001, true);

/* affichages */
renderTravail();
const d = $("work-detail").innerHTML;
ok("détail : taux actuel 6,28 €/h", d.includes("Taux actuel") && d.includes("6,28"), true);
ok("détail : « avant : 10,00 €/h »", d.includes("avant :") && d.includes(fmt(10) + "/h"), true);
ok("détail : valable depuis septembre", d.includes("valable depuis <b>" + mkLabel(sept)), true);
ok("carte du travail : taux 6,28 €/h + depuis septembre", $("work-jobs").innerHTML.includes("6,28") && $("work-jobs").innerHTML.includes("depuis " + mkLabel(sept)), true);

/* un 2e changement plus tard (retour à 10 €/h) */
set("jr-mois", cur); set("jr-taux", "10");
App.setJobRate(ev);
ok("2e changement enregistré (3 taux au total)", j.rateHist.length === 3, true);
ok("août 10 · septembre 6,28 · ce mois 10", rateAt(j, aout) === 10 && rateAt(j, sept) === 6.28 && rateAt(j, cur) === 10, true);

/* garde-fous */
set("jr-mois", sept); set("jr-taux", "0");
App.setJobRate(ev);
ok("taux ≤ 0 refusé", j.rateHist.length === 3, true);
set("jr-mois", sept); set("jr-taux", "6,28");
App.setJobRate(ev);
ok("changer un mois déjà modifié remplace la valeur", j.rateHist.filter(h => h.from === sept).length === 1 && j.rateHist.length === 3, true);
console.log("=== TEST CHANGEMENT DE TAUX HORAIRE TERMINÉS ===");