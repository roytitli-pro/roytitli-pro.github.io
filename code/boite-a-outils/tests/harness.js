/* ============================================================
   Harnais headless (gjs) pour tester mes-finances/index.html
   Stubs : DOM (getElementById/querySelectorAll/createElement),
   localStorage, confirm, Blob, URL, FileReader.
   ⚠️ Ne définit volontairement PAS `ev`, `set`, `ok`, `$` :
   ces noms sont utilisés/redéfinis par chaque fichier de test.
   Utilisation : gjs <(cat harness.js app.js un-test.js)
   ============================================================ */

const __els = new Map();

class FakeClassList {
  constructor(){ this.s = new Set(); }
  add(...c){ c.forEach(x => this.s.add(x)); }
  remove(...c){ c.forEach(x => this.s.delete(x)); }
  toggle(c, force){
    if (force === undefined){ this.s.has(c) ? this.s.delete(c) : this.s.add(c); }
    else if (force) this.s.add(c); else this.s.delete(c);
    return this.s.has(c);
  }
  contains(c){ return this.s.has(c); }
  toString(){ return [...this.s].join(" "); }
}

class FakeEl {
  constructor(id, tag){
    this.id = id || "";
    this.tagName = (tag || "div").toUpperCase();
    this.value = ""; this.checked = false; this.selectedIndex = 0;
    this.files = []; this.children = [];
    this.style = {}; this.dataset = {};
    this.classList = new FakeClassList();
    this._html = ""; this._text = "";
  }
  /* comme un vrai DOM : mettre du texte simple se lit dans les deux propriétés */
  get innerHTML(){ return this._html; }
  set innerHTML(v){
    this._html = String(v);
    this._text = this._html.indexOf("<") === -1 ? this._html : "";
  }
  get textContent(){ return this._text; }
  set textContent(v){
    this._text = String(v);
    this._html = this._text.indexOf("<") === -1 ? this._text : "";
  }
  click(){}
  appendChild(c){ this.children.push(c); return c; }
  removeChild(c){ this.children = this.children.filter(x => x !== c); return c; }
  setAttribute(k,v){ this[k] = v; }
  getAttribute(k){ return this[k]; }
  removeAttribute(k){ delete this[k]; }
  hasAttribute(k){ return this[k] !== undefined; }
  addEventListener(){}
  removeEventListener(){}
  focus(){}
  blur(){}
}

globalThis.document = {
  getElementById(id){
    if (!__els.has(id)) __els.set(id, new FakeEl(id));
    return __els.get(id);
  },
  querySelectorAll(sel){
    /* l'appli n'utilise que forEach + style/classList/dataset → peu importe le nombre */
    if (sel === ".page") return [new FakeEl("p1","section"), new FakeEl("p2","section"), new FakeEl("p3","section")];
    if (sel === ".nav button") return [new FakeEl("n1","button"), new FakeEl("n2","button"), new FakeEl("n3","button")];
    if (sel === "#work-seg button") return [new FakeEl("s1","button"), new FakeEl("s2","button"), new FakeEl("s3","button")];
    return [];
  },
  querySelector(sel){ return new FakeEl("q", sel); },
  createElement(tag){ return new FakeEl("", tag); },
  body: new FakeEl("body","body"),
  title: ""
};

const __store = new Map();
globalThis.localStorage = {
  getItem(k){ return __store.has(k) ? __store.get(k) : null; },
  setItem(k,v){ __store.set(k, String(v)); },
  removeItem(k){ __store.delete(k); }
};

globalThis.confirm = () => true;
globalThis.alert = () => {};

if (typeof globalThis.Blob === "undefined"){
  globalThis.Blob = class { constructor(parts, opts){ this.parts = parts; this.type = opts && opts.type; } };
}
if (typeof globalThis.URL === "undefined") globalThis.URL = {};
if (!globalThis.URL.createObjectURL) globalThis.URL.createObjectURL = () => "blob:fake";
if (!globalThis.URL.revokeObjectURL) globalThis.URL.revokeObjectURL = () => {};

if (typeof globalThis.FileReader === "undefined"){
  globalThis.FileReader = class {
    readAsText(){ this.result = "{}"; if (this.onload) this.onload(); }
  };
}

/* certaines pages utilisent `window` (le navigateur le fournit) */
globalThis.window = globalThis;
