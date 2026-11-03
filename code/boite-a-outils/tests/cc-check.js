/* Test : épargne + compte courant — solde réel, dépôts du mois nets, pas de carte retraits, héritage épargne. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("epargne");
const curKey = mkNow();
set("ep-date", curKey + "-02"); set("ep-type","depot"); set("ep-montant","100"); set("ep-account","epargne"); App.addOp(ev);
set("ep-date", curKey + "-03"); set("ep-type","depot"); set("ep-montant","500"); set("ep-account","courant"); App.addOp(ev);
set("ep-date", curKey + "-05"); set("ep-type","retrait"); set("ep-montant","50"); set("ep-account","courant"); App.addOp(ev);
renderEpargne();
const cards = $("ep-cards").innerHTML;
ok("solde compte courant = " + fmt(350) + " (500 − 50 − 100)", cards.includes("🏦 Solde compte courant") && cards.includes(fmt(350)), true);
ok("total épargné = " + fmt(100), cards.includes("Total épargné") && cards.includes(fmt(100)), true);
ok("dépôts du mois (net) = 500 − 100 = +" + fmt(400), cards.includes("+" + fmt(400)) && cards.includes("compte courant − épargne virée"), true);
ok("pas de carte « Retraits ce mois »", !cards.includes("Retraits ce mois"), true);
ok("pas de total « courant + épargne » (600)", !cards.includes(fmt(600)), true);

D.ops.push({ id:"legacy1", date: curKey + "-06", type:"depot", amount: 30, goalId: null, note: "ancienne" });
renderEpargne();
ok("op sans account → épargne (total 130)", $("ep-cards").innerHTML.includes("Total épargné") && $("ep-cards").innerHTML.includes(fmt(130)), true);
ok("solde recalculé : 500 − 50 − 130 = " + fmt(320), $("ep-cards").innerHTML.includes(fmt(320)), true);
console.log("=== TEST COMPTE COURANT TERMINÉS ===");