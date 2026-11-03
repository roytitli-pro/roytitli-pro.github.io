/* Test : « 🚌 Titre de transport » comme document à surveiller (demande à refaire chaque année). */
const ev = { preventDefault(){} };
function set(id, v){ document.getElementById(id).value = v; }
const ok = (n, got, want) => console.log((got === want ? "OK  " : "FAIL") + " " + n + (got === want ? "" : " : " + JSON.stringify(got) + " ≠ " + JSON.stringify(want)));
function joursApres(n){ const d = new Date(todayStr() + "T12:00:00"); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }

const t = DOC_TYPES.find(x => x.id === "titre-transport");
ok("type « titre-transport » présent (🚌)", !!t && t.ic === "🚌" && t.label.includes("Titre de transport"), true);

App.go("documents");
ok("option dans le sélecteur de type", $("doc-type").innerHTML.includes("Titre de transport") && $("doc-type").innerHTML.includes("🚌"), true);

App.docTypeChange("titre-transport");
const d1 = new Date(todayStr() + "T12:00:00"); d1.setFullYear(d1.getFullYear()+1);
const dansUnAn = d1.toISOString().slice(0,10);
ok("nom prérempli", $("doc-nom").value.includes("Titre de transport"), true);
ok("expiration préremplie à +1 an (" + dansUnAn + ")", $("doc-expiration").value === dansUnAn, true);
ok("rappel = 60 jours", $("doc-rappel").value === "60", true);
ok("astuce « chaque année » affichée", $("doc-type-hint").innerHTML.includes("chaque année"), true);

set("doc-type", "titre-transport");
set("doc-organisme", "Ville / RATP");
set("doc-notes", "Demande à refaire chaque année");
App.addDoc(ev);
const doc = D.docs[D.docs.length-1];
ok("document ajouté", !!doc && doc.type === "titre-transport" && doc.name.includes("Titre de transport"), true);
ok("expiration enregistrée = +1 an", doc.expiration === dansUnAn, true);
ok("rappel 60 jours enregistré", doc.alertDays === 60, true);

renderDocuments();
const l = $("doc-list").innerHTML;
ok("affiché dans « Mes documents »", l.includes("Titre de transport") && l.includes("🚌"), true);
ok("expiration + rappel affichés", l.includes(dansUnAn) && l.includes("Rappel 60 j avant"), true);
const a1 = docAlerts().find(x => x.doc.id === doc.id);
ok("encore valide (niveau ok)", !!a1 && a1.level === "ok", true);

doc.expiration = joursApres(50);
const a2 = docAlerts().find(x => x.doc.id === doc.id);
ok("alerte orange à 50 j avant (rappel 60 j)", !!a2 && a2.level === "orange", true);
renderRappels();
ok("présent dans Rappels → Documents à surveiller", $("rap-list").innerHTML.includes("Titre de transport"), true);

App.docTypeChange("passeport");
ok("astuce générique restaurée", $("doc-type-hint").innerHTML.includes("passeport"), true);
console.log("=== TEST TITRE DE TRANSPORT TERMINÉS ===");