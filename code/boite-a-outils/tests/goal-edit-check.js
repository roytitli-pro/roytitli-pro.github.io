/* Test : édition des objectifs d'épargne (✏️ nom + montant cible) sans supprimer / re-ajouter. */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));

App.go("epargne");
set("goal-nom", "Fonds d'urgence"); set("goal-ciple", "1000"); set("goal-cible", "1000"); App.addGoal(ev);
const g = D.goals[0];
ok("objectif créé", !!g && g.name === "Fonds d'urgence" && g.target === 1000, true);
const id = g.id;

set("ep-date", todayStr()); set("ep-type","depot"); set("ep-montant","250"); set("ep-account","epargne"); set("ep-goal", id); App.addOp(ev);
renderEpargne();
ok("progression affichée " + fmt(250) + " / " + fmt(1000), $("goal-list").innerHTML.includes(fmt(250)) && $("goal-list").innerHTML.includes(fmt(1000)), true);

App.editGoal(id);
let l = $("goal-list").innerHTML;
ok("mode édition ouvert (champs nom + cible)", l.includes("goal-edit-nom") && l.includes("goal-edit-cible"), true);
ok("valeurs actuelles dans les champs", l.includes('value="Fonds d\'urgence"') && l.includes('value="1000"'), true);
ok("boutons 💾 / Annuler", l.includes("saveGoal") && l.includes("cancelEditGoal"), true);
ok("objectif toujours présent (pas de suppression)", D.goals.length === 1 && D.goals[0].id === id, true);

App.cancelEditGoal();
l = $("goal-list").innerHTML;
ok("annulation : retour à l'affichage normale", !l.includes("goal-edit-nom") && l.includes("Fonds d'urgence"), true);
ok("annulation : cible inchangée (1 000)", D.goals[0].target === 1000, true);

App.editGoal(id);
set("goal-edit-nom", "Fonds de sécurité"); set("goal-edit-cible", "1500");
App.saveGoal(id);
ok("nom modifié", D.goals[0].name === "Fonds de sécurité", true);
ok("cible modifiée (1 500)", D.goals[0].target === 1500, true);
ok("dépôts liés conservés (250)", D.ops.filter(o => o.goalId === id).reduce((s,o)=>s+o.amount,0) === 250, true);
ok("mode édition fermé", !$("goal-list").innerHTML.includes("goal-edit-nom"), true);
renderEpargne();
ok("nouvelle progression " + fmt(250) + " / " + fmt(1500), $("goal-list").innerHTML.includes(fmt(250)) && $("goal-list").innerHTML.includes(fmt(1500)), true);

App.editGoal(id);
set("goal-edit-nom", ""); set("goal-edit-cible", "2000");
App.saveGoal(id);
ok("nom vide refusé (nom conservé)", D.goals[0].name === "Fonds de sécurité", true);
App.editGoal(id);
set("goal-edit-nom", "Vacances"); set("goal-edit-cible", "0");
App.saveGoal(id);
ok("cible ≤ 0 refusée (1 500 conservé)", D.goals[0].target === 1500, true);
App.cancelEditGoal();
console.log("=== TEST ÉDITION OBJECTIFS TERMINÉS ===");