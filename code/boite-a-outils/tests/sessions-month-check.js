/* Test : séances groupées PAR MOIS (plus visuel) — panneau statistiques + détail du travail. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);
const curKey = mkNow(), prevKey = mkAdd(curKey, -1);
set("ws-date", curKey + "-05"); set("ws-minutes","5"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", curKey + "-18"); set("ws-minutes","3"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", prevKey + "-20"); set("ws-minutes","7"); set("ws-mult","1"); App.addSession(ev);

D.ui.workPeriod = "toutes";
renderTravail();
const st = $("work-sessions").innerHTML;
ok("statistiques : titre « Séances par mois »", st.includes("🗓️ Séances par mois"), true);
ok("deux mois listés", st.includes(mkLabel(curKey)) && st.includes(mkLabel(prevKey)), true);
ok("ligne ce mois : 8 h / net " + fmt(80), st.includes("8 h") && st.includes(fmt(80)), true);
ok("ligne mois dernier : 7 h / net " + fmt(70), st.includes("7 h") && st.includes(fmt(70)), true);
ok("sous-titre « Par travail » + nom du job", st.includes("Par travail") && st.includes("Resto"), true);
ok("total " + fmtH(900) + " / net " + fmt(150), st.includes(fmtH(900)) && st.includes(fmt(150)), true);

renderTravail();
const dt = $("work-detail").innerHTML;
ok("détail travail : titre « Séances par mois »", dt.includes("Séances par mois"), true);
ok("blocs ws-month présents (au moins 2)", (dt.match(/ws-month/g) || []).length >= 2, true);
ok("en-tête du mois précédent présent", dt.includes(mkLabel(prevKey)), true);
ok("en-têtes avec totaux nets", dt.includes("net ≈ " + fmt(70)) && dt.includes("net ≈ " + fmt(80)), true);
ok("les 3 séances restent listées", dt.includes("+50,00") && dt.includes("+30,00") && dt.includes("+70,00"), true);
console.log("=== TEST SÉANCES PAR MOIS TERMINÉS ===");