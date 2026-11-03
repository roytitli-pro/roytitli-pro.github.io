/* Test : épargne « déjà sur le livret » (ajoutée directement) ≠ épargne « prise sur le compte courant ».
   Cas réel : 601 € + 364 € déjà dans le livret A (jamais transférés) → ne doivent PAS réduire
   le solde du compte courant. Scénario complet : reçu 1 024,91 €, 200 + 150 mis de côté,
   634,50 de dépenses, + 965 € déjà sur le livret → solde attendu 40,41 € (et non −916 €). */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));
const cur = mkNow(), prev = mkAdd(cur, -1);

App.go("epargne");
/* l'épargne déjà présente sur le livret A (ne vient PAS du compte courant) */
set("ep-date", "2025-06-15"); set("ep-type","depot"); set("ep-montant","601"); set("ep-account","epargne"); set("ep-origine","externe"); set("ep-note","Livret A déjà ouvert"); App.addOp(ev);
set("ep-date", "2025-11-02"); set("ep-type","depot"); set("ep-montant","364"); set("ep-account","epargne"); set("ep-origine","externe"); set("ep-note","Livret A"); App.addOp(ev);
ok("2 dépôts d'épargne enregistrés avec origine « déjà dans l'épargne »", D.ops.filter(o => o.from === "externe").length === 2, true);
ok("total épargné = 965 €", $("ep-cards").innerHTML.includes("Total épargné") && $("ep-cards").innerHTML.includes(fmt(965)), true);

/* les entrées de cette année : sorties du compte courant */
set("ep-date", prev + "-10"); set("ep-type","depot"); set("ep-montant","200"); set("ep-account","epargne"); set("ep-origine","courant"); App.addOp(ev);
set("ep-date", cur + "-02"); set("ep-type","depot"); set("ep-montant","150"); set("ep-account","epargne"); set("ep-origine","courant"); App.addOp(ev);
/* reçus sur le compte courant + dépenses */
set("ep-date", prev + "-05"); set("ep-type","depot"); set("ep-montant","412,50"); set("ep-account","courant"); App.addOp(ev);
set("ep-date", cur + "-01"); set("ep-type","depot"); set("ep-montant","612,41"); set("ep-account","courant"); App.addOp(ev);
set("exp-date", prev + "-20"); set("exp-cat","nourriture"); set("exp-montant","212,50"); App.addExpense(ev);
set("exp-date", cur + "-10"); set("exp-cat","maison"); set("exp-montant","422"); App.addExpense(ev);
/* un petit ajout direct dans le mois courant (pour vérifier la carte de l'Accueil) */
set("ep-date", cur + "-20"); set("ep-type","depot"); set("ep-montant","20"); set("ep-account","epargne"); set("ep-origine","externe"); App.addOp(ev);

renderEpargne();
const s = soldeCompteCourant();
/* 1 024,91 reçu − 350 (200 + 150 virés) − 634,50 dépenses = 40,41 · les 985 € du livret sont ignorés */
ok("solde compte courant = " + fmt(40.41) + " (et surtout pas −916)", Math.abs(s.solde - 40.41) < 0.01, true);
ok("épargne virée = 350 € seulement", s.epargne === 350, true);
ok("épargne directe signalée = 985 €", s.epargneDirecte === 985, true);
const cards = $("ep-cards").innerHTML;
ok("carte : 40,41 € affiché", cards.includes("🏦 Solde compte courant") && cards.includes(fmt(40.41)), true);
ok("carte : mention « déjà sur le livret »", cards.includes("déjà sur le livret (non décomptés)"), true);
ok("dépôts du mois (net) = 612,41 − 150", cards.includes("+" + fmt(462.41)), true);

/* reste du mois (Accueil) : l'épargne directe ne doit pas non plus la déduire */
D.ui.month = cur;
renderAccueil();
const c = $("dash-cards").innerHTML;
ok("Reste du mois = 612,41 − 422 − 150 = " + fmt(40.41), c.includes("Reste du mois") && c.includes(fmt(40.41)), true);
ok("Accueil : mention « dont 20 € déjà sur le livret »", $("dash-epargne").innerHTML.includes("déjà sur le livret"), true);

/* la liste des opérations montre le badge 🎁 + un bouton ✏️ */
const list = $("ep-list").innerHTML;
ok("badge 🎁 sur les dépôts du livret", list.includes("déjà sur le livret (ne sort pas du compte courant)"), true);
ok("bouton ✏️ pour modifier une opération", list.includes("App.editOp("), true);

/* ✏️ corriger une opération existante : passer 601 € en « pris sur le compte courant » */
const op601 = D.ops.find(o => o.amount === 601);
App.editOp(op601.id);
ok("formulaire rempli en mode édition", $("ep-montant").value === 601 && $("ep-origine").value === "externe", true);
ok("bouton en mode Enregistrer + annulation visible", $("ep-btn").textContent.includes("Enregistrer") && $("ep-cancel").style.display === "", true);
set("ep-origine", "courant");
App.addOp(ev);
ok("601 € repasse en éprise du compte courant", D.ops.find(o => o.amount === 601).from === "courant", true);
ok("solde recalculé : 40,41 − 601 = " + fmt(-560.59), Math.abs(soldeCompteCourant().solde - (-560.59)) < 0.01, true);
ok("plus d'édition en cours", D.ui.editingOp === null && $("ep-btn").textContent === "Ajouter", true);

/* annulation d'une modification */
const op364 = D.ops.find(o => o.amount === 364);
App.editOp(op364.id);
App.cancelEditOp();
ok("annulation : rien n'est changé (toujours « déjà dans l'épargne »)", D.ops.find(o => o.id === op364.id).from === "externe", true);
console.log("=== TEST ÉPARNE « DÉJÀ SUR LE LIVRET » TERMINÉS ===");