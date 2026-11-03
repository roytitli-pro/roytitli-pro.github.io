/* Test : barres de « 💸 Dépenses du mois » = part RÉELLE du total (plus de 100 % automatique
   pour la plus grosse catégorie). Exemple : maison 400 € · nourriture 100 € · transport 50 € → total 550 €. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("depenses");
const curKey = mkNow();
set("exp-date", curKey + "-03"); set("exp-cat","maison"); set("exp-montant","400"); App.addExpense(ev);
set("exp-date", curKey + "-10"); set("exp-cat","nourriture"); set("exp-montant","100"); App.addExpense(ev);
set("exp-date", curKey + "-15"); set("exp-cat","transport"); set("exp-montant","50"); App.addExpense(ev);
renderDepenses();
const sum = $("exp-summary").innerHTML;
ok("part maison = 73 % du mois", sum.includes("73 % du mois"), true);
ok("part nourriture = 18 % du mois", sum.includes("18 % du mois"), true);
ok("part transport = 9 % du mois", sum.includes("9 % du mois"), true);
ok("barre maison = width:73% (plus de width:100%)", sum.includes("width:73%") && !sum.includes("width:100%"), true);
ok("total affiché = " + fmt(550), $("exp-total").textContent.includes(fmt(550)), true);

App.setBudget({ value: "500", dataset: { cat: "maison" } });
renderDepenses();
const sum2 = $("exp-summary").innerHTML;
ok("budget maison 500 : 80 % du budget", sum2.includes("80 % du budget") && sum2.includes("budget " + fmt0(500)), true);
console.log("=== TEST BARRES DÉPENSES TERMINÉS ===");