/* Test : solde compte courant = tout ce qui est REÇU − tout ce qui est SORTI (dépenses + épargne virée + retraits),
   depuis le début. Scénario : reçu 412,50 (août, 200 de côté, 212,50 dépensés) puis reçu 612,41
   (septembre, 150 de côté, 422 dépensés) → il reste 40,41 €. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("epargne");
const cur = mkNow(), prev = mkAdd(cur, -1);
set("ep-date", prev + "-05"); set("ep-type","depot"); set("ep-montant","412,50"); set("ep-account","courant"); App.addOp(ev);
set("ep-date", prev + "-10"); set("ep-type","depot"); set("ep-montant","200"); set("ep-account","epargne"); App.addOp(ev);
set("ep-date", cur + "-01"); set("ep-type","depot"); set("ep-montant","612,41"); set("ep-account","courant"); App.addOp(ev);
set("ep-date", cur + "-02"); set("ep-type","depot"); set("ep-montant","150"); set("ep-account","epargne"); App.addOp(ev);
set("exp-date", prev + "-20"); set("exp-cat","nourriture"); set("exp-montant","212,50"); set("exp-note","courses"); App.addExpense(ev);
set("exp-date", cur + "-10"); set("exp-cat","maison"); set("exp-montant","422"); set("exp-note","loyer"); App.addExpense(ev);

renderEpargne();
const cards = $("ep-cards").innerHTML;
ok("solde compte courant = " + fmt(40.41), cards.includes("🏦 Solde compte courant") && cards.includes(fmt(40.41)), true);
ok("sous-titre : composition (reçu − dépenses − épargne virée)", cards.includes("reçu " + fmt(1024.91)) && cards.includes("dépenses " + fmt(634.5)) && cards.includes("épargne virée " + fmt(350)), true);
ok("dépôts ce mois (net) = 612,41 − 150 = +" + fmt(462.41), cards.includes("+" + fmt(462.41)), true);

App.go("accueil");
ok("Accueil 🏦 Compte courant (solde réel) = " + fmt(40.41), $("dash-epargne").innerHTML.includes(fmt(40.41)), true);

/* sans dépôt courant saisi → reconstitution depuis les heures déjà payées */
D.ops = []; D.expenses = []; D.sessions = [];
App.go("epargne");
set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev); App.selectJob(D.jobs[0].id);
const m2 = mkAdd(cur, -2);
set("ws-date", m2 + "-15"); set("ws-minutes","24"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", m2 + "-20"); set("ws-minutes","17,25"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", prev + "-03"); set("ws-minutes","24"); set("ws-mult","1"); App.addSession(ev);
set("ep-date", prev + "-08"); set("ep-type","depot"); set("ep-montant","150"); set("ep-account","epargne"); App.addOp(ev);
set("exp-date", prev + "-18"); set("exp-cat","nourriture"); set("exp-montant","200"); App.addExpense(ev);
renderEpargne();
ok("sans dépôts : heures payées 652,50 − 150 − 200 = " + fmt(302.5), $("ep-cards").innerHTML.includes(fmt(302.5)), true);
console.log("=== TEST SOLDE COMPTE COURANT TERMINÉS ===");