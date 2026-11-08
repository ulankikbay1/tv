/* Лаунчер Smart TV. Только ES3/ES5, без библиотек, без fetch/Promise/let/const/стрелочных функций. */
(function () {
  var COLS = 4;
  var st = load();
  var editMode = false;
  var rows = [];          /* навигационная сетка: массив строк, в строке - элементы */

  function $(id) { return document.getElementById(id); }

  function load() {
    var d = { fav: [], custom: [], engine: 0 };
    try {
      var s = window.localStorage.getItem('stv1');
      if (s) { d = JSON.parse(s); }
    } catch (e) {}
    if (!d.fav) { d.fav = []; }
    if (!d.custom) { d.custom = []; }
    if (!d.engine || d.engine >= ENGINES.length) { d.engine = 0; }
    return d;
  }
  function save() {
    try { window.localStorage.setItem('stv1', JSON.stringify(st)); } catch (e) {}
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function host(u) {
    var m = /^[a-z]+:\/\/([^\/?#]+)/i.exec(u);
    return m ? m[1] : u;
  }
  function allItems() { return APPS.concat(st.custom); }
  function isFav(id) {
    for (var i = 0; i < st.fav.length; i++) { if (st.fav[i] === id) { return true; } }
    return false;
  }
  function toggleFav(id) {
    var out = [], found = false;
    for (var i = 0; i < st.fav.length; i++) {
      if (st.fav[i] === id) { found = true; } else { out.push(st.fav[i]); }
    }
    if (!found) { out.push(id); }
    st.fav = out;
    save();
  }

  function tileHtml(it) {
    var fav = isFav(it.id);
    return '<a class="tile" href="' + esc(it.url) + '" data-id="' + esc(it.id) + '">' +
      '<span class="ic" style="background:' + (it.color || '#456') + '">' +
      esc(it.name.charAt(0).toUpperCase()) + '</span>' +
      '<span class="nm">' + esc(it.name) + '</span>' +
      '<span class="hs">' + esc(host(it.url)) + '</span>' +
      (fav ? '<span class="st">&#9733;</span>' : '') + '</a>';
  }

  function section(title, items) {
    if (!items.length) { return ''; }
    var h = '<h2>' + title + '</h2>';
    for (var i = 0; i < items.length; i += COLS) {
      h += '<div class="row">';
      for (var j = i; j < i + COLS && j < items.length; j++) { h += tileHtml(items[j]); }
      h += '</div>';
    }
    return h;
  }

  function render() {
    var all = allItems(), favs = [], i, k;
    for (i = 0; i < st.fav.length; i++) {
      for (k = 0; k < all.length; k++) {
        if (all[k].id === st.fav[i]) { favs.push(all[k]); break; }
      }
    }
    $('favbox').innerHTML = section('Избранное', favs);
    $('appbox').innerHTML = section('Приложения и сайты', all);
    document.body.className = editMode ? 'editing' : '';
    $('edit').innerHTML = 'Править: ' + (editMode ? 'вкл' : 'выкл');
    $('eng').innerHTML = esc(ENGINES[st.engine].name);
    buildRows();
  }

  function buildRows() {
    rows = [[$('q'), $('eng')], [$('u'), $('add'), $('edit')]];
    var boxes = [$('favbox'), $('appbox')];
    for (var b = 0; b < boxes.length; b++) {
      var divs = boxes[b].getElementsByTagName('div');
      for (var d = 0; d < divs.length; d++) {
        if (divs[d].className !== 'row') { continue; }
        var links = divs[d].getElementsByTagName('a'), row = [];
        for (var l = 0; l < links.length; l++) { row.push(links[l]); }
        if (row.length) { rows.push(row); }
      }
    }
  }

  function where(el) {
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < rows[r].length; c++) { if (rows[r][c] === el) { return [r, c]; } }
    }
    return null;
  }

  function focusAt(r, c) {
    if (r < 0) { r = 0; }
    if (r >= rows.length) { r = rows.length - 1; }
    if (c >= rows[r].length) { c = rows[r].length - 1; }
    if (c < 0) { c = 0; }
    try { rows[r][c].focus(); } catch (e) {}
  }

  /* --- поиск и открытие адресов --- */
  function doSearch() {
    var q = $('q').value.replace(/^\s+|\s+$/g, '');
    if (!q) { return; }
    window.location.href = ENGINES[st.engine].url + encodeURIComponent(q);
  }
  function normUrl(s) {
    s = s.replace(/^\s+|\s+$/g, '');
    if (!s) { return ''; }
    if (/^[a-z][a-z0-9+.\-]*:\/\//i.test(s)) { return s; }
    if (/\s/.test(s) || s.indexOf('.') < 0) { return ''; }
    return 'http://' + s;   /* http:// - надёжнее для старых ТВ; сайт сам перенаправит на https */
  }
  function doOpen() {
    var u = normUrl($('u').value);
    if (u) { window.location.href = u; }
  }
  function doAdd() {
    var u = normUrl($('u').value);
    if (!u) { return; }
    var id = 'c:' + u, items = allItems();
    for (var i = 0; i < items.length; i++) { if (items[i].id === id) { return; } }
    var colors = ['#8e44ad', '#16a085', '#c0392b', '#2980b9', '#d35400', '#7f8c8d'];
    st.custom.push({ id: id, name: host(u).replace(/^www\./, ''), url: u,
      color: colors[st.custom.length % colors.length] });
    st.fav.push(id);
    save();
    $('u').value = '';
    render();
  }

  /* --- события --- */
  document.onkeydown = function (e) {
    e = e || window.event;
    var k = e.keyCode;
    var el = document.activeElement;
    if (k === 13 && el) {
      if (el.id === 'q') { doSearch(); return false; }
      if (el.id === 'u') { doOpen(); return false; }
    }
    if (k < 37 || k > 40) { return true; }

    /* внутри текстового поля Влево/Вправо сначала двигают курсор */
    if ((k === 37 || k === 39) && el && el.tagName === 'INPUT') {
      var p = el.selectionStart;
      if (typeof p === 'number') {
        if (k === 37 && p > 0) { return true; }
        if (k === 39 && p < el.value.length) { return true; }
      }
    }
    var pos = where(el);
    if (!pos) { focusAt(0, 0); return false; }
    var r = pos[0], c = pos[1];
    if (k === 37) { c--; }
    if (k === 39) { c++; }
    if (k === 38) { r--; }
    if (k === 40) { r++; }
    if (k === 37 || k === 39) {
      if (c < 0 || c >= rows[r].length) { return false; }
    }
    focusAt(r, c);
    return false;
  };

  document.onclick = function (e) {
    e = e || window.event;
    var t = e.target || e.srcElement;
    while (t && t.tagName !== 'A' && t.tagName !== 'BUTTON') { t = t.parentNode; }
    if (!t) { return true; }
    if (t.id === 'eng') {
      st.engine = (st.engine + 1) % ENGINES.length; save();
      $('eng').innerHTML = esc(ENGINES[st.engine].name);
      return false;
    }
    if (t.id === 'add') { doAdd(); return false; }
    if (t.id === 'edit') {
      editMode = !editMode; render(); focusAt(1, 2); return false;
    }
    if (t.className === 'tile' && editMode) {
      var id = t.getAttribute('data-id'), keep = where(t);
      toggleFav(id);
      render();
      if (keep) { focusAt(keep[0], keep[1]); }
      return false;
    }
    return true;   /* обычная ссылка - браузер откроет её сам */
  };

  render();
  focusAt(0, 0);
})();
