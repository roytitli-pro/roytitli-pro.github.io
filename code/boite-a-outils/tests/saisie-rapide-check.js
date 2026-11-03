/* Test : saisie rapide « une ligne par journée » dans l'onglet Travail.
   Pré-remplissage août 2026, pauses auto, anti-doublon, formatsacceptés. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);
D.ui.month = "2026-08";

/* la zone existe dans le détail du travail et est pré-remplie pour août 2026 */
renderTravail();
const ta = $("ws3-lignes");
ok("zone de saisie rapide présente", !!ta && $("work-detail").innerHTML.includes("Saisie rapide"), true);
ok("pré-remplie avec tes 15 journées d'août", ta.value.split(/\r?\n/).filter(Boolean).length === 15 && ta.value.includes("04/08 11h-21h") && ta.value.includes("31/08 17h-21h"), true);

/* ajout */
App.addJoursTexte();
const ses = D.sessions.filter(s => s.jobId === j.id);
ok("15 séances ajoutées", ses.length === 15, true);
ok("total = 110,5 h (6 630 min)", ses.reduce((s,x)=>s+x.minutes,0) === 6630, true);
const se = d => ses.find(s => s.date === "2026-08-" + d);
ok("04/08 : 11:00→21:00, pause 1 h, 540 min", se("04").start === "11:00" && se("04").end === "21:00" && se("04").pause === 60 && se("04").minutes === 540, true);
ok("11/08 : 11:00→18:00, pause 30 min, 390 min", se("11").pause === 30 && se("11").minutes === 390, true);
ok("21/08 : 11:00→20:00, 510 min", se("21").minutes === 510, true);
ok("24/08 : 16:00→21:00, 300 min", se("24").minutes === 300, true);
ok("31/08 : 17:00→21:00, 240 min", se("31").minutes === 240, true);
ok("non majorées", ses.every(s => s.mult === 1), true);

/* plus de pré-remplissage après usage */
renderTravail();
ok("zone vidée après l'ajout", !$("ws3-lignes").value, true);

/* anti-doublon : on relance les mêmes lignes */
set("ws3-lignes", AOUT_2026.join("\n"));
App.addJoursTexte();
ok("relance = aucun doublon", D.sessions.filter(s => s.jobId === j.id).length === 15, true);

/* autres formats acceptés */
set("ws3-lignes", ["4/9 11h-18h", "05 09h30-12h30", "6/09 11:00 à 18:00", "ligne illisible"].join("\n"));
D.ui.month = "2026-09";
App.addJoursTexte();
const sep = D.sessions.filter(s => s.jobId === j.id && s.date.slice(0,7) === "2026-09");
ok("3 lignes septembre ajoutées (4/9, 5, 6)", sep.length === 3, true);
ok("« 11h à 18h » et minutes comprises", sep.find(s => s.date === "2026-09-05").minutes === 180 && sep.find(s => s.date === "2026-09-06").pause === 30, true);
ok("ligne illisible ignorée sans casser", D.sessions.length === 18, true);

/* la liste par mois reflète l'ajout */
renderTravail();
D.ui.workPeriod = "toutes";
renderTravail();
ok("statistiques : août 110,5 h", $("work-sessions").innerHTML.includes("110,5 h"), true);
console.log("=== TEST SAISIE RAPIDE TERMINÉS ===");