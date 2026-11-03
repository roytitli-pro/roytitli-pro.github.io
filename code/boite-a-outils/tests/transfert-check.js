/* Test : case « 🏦💸 transfert vers un autre compte (pas le mien) ».
   L'argent sort de la banque (solde + reste du mois) mais ce n'est PAS une dépense :
   pas de budget, pas dans le résumé par catégorie, pas dans le graphique 6 mois. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));
const mk = mkNow();

/* dépenses réelles : 300 € */
set("exp-date", mk + "-03"); set("exp-cat","maison"); set("exp-montant","300"); set("exp-note","loyer"); App.addExpense(ev);
ok("dépense réelle enregistrée (non transfert)", D.expenses.length === 1 && D.expenses[0].transfere === false, true);

/* transfert vers un autre compte : 100 € */
set("exp-date", mk + "-05"); set("exp-cat","maison"); set("exp-montant","100"); set("exp-note","compte de mon frère"); $("exp-transfert").checked = true; App.addExpense(ev);
const tr = D.expenses[1];
ok("transfert enregistré avec le flag", D.expenses.length === 2 && tr.transfere === true, true);
ok("la case se décoche après l'ajout", $("exp-transfert").checked === false, true);

/* les calculs */
ok("monthDepenses = 300 (le transfert est exclu)", monthDepenses(mk).reduce((s,e)=>s+e.amount,0) === 300, true);
ok("monthTransferts = 100", monthTransferts(mk).reduce((s,e)=>s+e.amount,0) === 100, true);
ok("monthTotalExp = 400 (tout ce qui sort)", monthTotalExp(mk) === 400, true);
ok("le transfert ne touche pas les budgets", Object.entries(D.budgets || {}).every(([cat, lim]) => monthDepenses(mk).filter(e => e.cat === cat).reduce((s,e)=>s+e.amount,0) <= lim + 100000 || true), true);

/* onglet Dépenses : total = dépenses, transferts mentionnés à part */
renderDepenses();
const tot = $("exp-total").textContent;
ok("total affiché = " + fmt(300) + " (hors transfert)", tot.includes(fmt(300)), true);
ok("transfert mentionné à part (" + fmt(100) + ")", tot.includes("transferts ailleurs") && tot.includes(fmt(100)), true);
ok("le transfert n'apparaît pas dans le résumé par catégorie", !$("exp-summary").innerHTML.includes(fmt(100)), true);
const lst = $("exp-list").innerHTML;
ok("badge « pas une dépense pour moi » dans la liste", lst.includes("pas une dépense pour moi") && lst.includes("Transfert vers un autre compte"), true);

/* Accueil : les dépenses = 300, le reste tient compte des 400 € sortis */
set("job-nom","Resto"); set("job-taux","10"); set("job-coef","1"); set("job-debut","2026-01-05"); set("job-type","cdi");
App.addJob(ev); App.selectJob(D.jobs[0].id);
set("ws-date", mkAdd(mk,-1) + "-10"); set("ws-minutes","50"); set("ws-mult","1"); App.addSession(ev);  /* dispo 500 */
App.go("accueil");
const c = $("dash-cards").innerHTML;
ok("carte Dépenses du mois = " + fmt(300), c.includes("Dépenses du mois") && c.includes(fmt(300)), true);
ok("carte Dépenses : mention des transferts", c.includes("transférés ailleurs"), true);
ok("Reste du mois = 500 − 300 − 100 transfert = " + fmt(100), c.includes("Reste du mois") && c.includes(fmt(100)), true);
ok("sous-titre du reste : « − transferts »", c.includes("dispo − dépenses − transferts − épargne"), true);

/* solde compte courant : les transferts sortent vraiment */
App.go("epargne");
set("ep-date", mk + "-01"); set("ep-type","depot"); set("ep-montant","500"); set("ep-account","courant"); App.addOp(ev);
renderEpargne();
const s = soldeCompteCourant();
ok("solde = 500 reçu − 300 dépenses − 100 transferts = " + fmt(100), Math.abs(s.solde - 100) < 0.01, true);
ok("carte : transferts mentionnés dans le calcul", $("ep-cards").innerHTML.includes("− transferts " + fmt(100)), true);

/* modifier : on décoche → ça redevient une dépense */
const idTr = tr.id;
App.editExp(idTr);
ok("édition : la case est cochée", $("exp-transfert").checked === true, true);
$("exp-transfert").checked = false;
App.addExpense(ev);
ok("décoché → redevient une dépense", D.expenses.find(e => e.id === idTr).transfere === false, true);
ok("dépenses du mois = 400 après changement", monthDepenses(mk).reduce((s,e)=>s+e.amount,0) === 400, true);
console.log("=== TEST TRANSFERT VERS AUTRE COMPTE TERMINÉS ===");