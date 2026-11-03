/* Test de fumée : tous les onglets se rendent sans erreur + conteneurs clés non vides. */
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));
const nonVide = id => (($(id).innerHTML || "") + ($(id).textContent || "")).trim().length > 0;

["accueil","depenses","epargne","travail","impots","documents","rappels","reglages"].forEach(p => { App.go(p); });
ok("les 8 onglets rendus", true, true);

App.go("accueil");
ok("Accueil : 5 cartes de trésorerie", $("dash-cards").innerHTML.includes("Heures de") && $("dash-cards").innerHTML.includes("Dispo ce mois") && $("dash-cards").innerHTML.includes("Dépenses") && $("dash-cards").innerHTML.includes("Épargne") && $("dash-cards").innerHTML.includes("Reste"), true);
ok("Accueil : compte courant réel + épargne", $("dash-epargne").innerHTML.includes("Compte courant (solde réel)") && $("dash-epargne").innerHTML.includes("Total épargné"), true);

App.go("depenses");
ok("Dépenses : total + résumé", nonVide("exp-total") && nonVide("exp-summary"), true);
App.go("epargne");
ok("Épargne : cartes + shift + dépôt", nonVide("ep-cards") && nonVide("ep-shift") && nonVide("ep-depot"), true);
App.go("travail");
ok("Travail : résumé + travaux + stats", nonVide("work-summary") && nonVide("work-jobs") && nonVide("work-sessions"), true);
App.go("documents");
ok("Documents : liste + bandeau", nonVide("doc-list") && nonVide("doc-banner"), true);
App.go("rappels");
ok("Rappels : documents + rappels perso", nonVide("rap-list"), true);
ok("Titre de page affiché", nonVide("page-title"), true);
console.log("=== TEST FUMÉE TERMINÉ ===");