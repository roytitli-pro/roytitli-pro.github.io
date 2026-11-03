/* Test : section « 🧾 De quoi est fait ton dépôt ? » — dépôt en compte courant = salaire
   (heures du mois précédent) + bénéfices en plus (aides, primes…). */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("epargne");
let dep = $("ep-depot").innerHTML;
ok("section présente", dep.includes("De quoi est fait ton dépôt") && dep.includes("Dépôt reçu"), true);
ok("message d'attente quand rien n'est saisi", dep.includes("Saisis un dépôt en compte courant"), true);

set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev);
const j = D.jobs[0]; App.selectJob(j.id);
const curKey = mkNow(), prevKey = mkAdd(curKey, -1);
set("ws-date", prevKey + "-03"); set("ws-minutes","15"); set("ws-mult","1"); App.addSession(ev);
set("ws-date", prevKey + "-10"); set("ws-minutes","15"); set("ws-mult","1"); App.addSession(ev);

set("ep-date", curKey + "-05"); set("ep-type","depot"); set("ep-montant","412,50"); set("ep-account","courant"); App.addOp(ev);
renderEpargne();
dep = $("ep-depot").innerHTML;
ok("dépôt reçu = " + fmt(412.5), dep.includes("Dépôt reçu") && dep.includes(fmt(412.5)), true);
ok("dont salaire = " + fmt(300) + " (heures du mois précédent)", dep.includes(fmt(300)), true);
ok("bénéfices en plus = +" + fmt(112.5), dep.includes("+" + fmt(112.5)), true);
ok("ligne du mois présent", dep.includes(mkLabel(curKey)), true);
ok("taux net moyen = " + fmt(10) + "/h", dep.includes(fmt(10) + "/h"), true);

const m2 = mkAdd(curKey, -1);
set("ws-date", mkAdd(m2,-1) + "-12"); set("ws-minutes","10"); set("ws-mult","1"); App.addSession(ev);
set("ep-date", m2 + "-03"); set("ep-type","depot"); set("ep-montant","100"); set("ep-account","courant"); App.addOp(ev);
renderEpargne();
dep = $("ep-depot").innerHTML;
ok("deux mois affichés + dépôt = salaire → bénéfice « — »", dep.includes(fmt(412.5)) && dep.includes(fmt(100)) && dep.includes("—"), true);
console.log("=== TEST DÉPÔT = SALAIRE + BÉNÉFICES TERMINÉS ===");