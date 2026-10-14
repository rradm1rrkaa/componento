// Same-category product comparison with a responsive, data-driven table.
(function () {
  'use strict';
  const C = window.CMP;
  const catalog = window.COMPONENTO_CATALOG || [];
  const byId = id => catalog.find(product => product.id === id);
  const h = C.h;
  let ids = C.ls.get('comparison', []);
  if (!Array.isArray(ids)) ids = [];
  ids = [...new Set(ids.filter(id => byId(id)))].slice(0, 4);
  let hideSame = false;
  const save = () => C.ls.set('comparison', ids);

  function sync() {
    const count = document.getElementById('compareCount'); if (count) count.textContent = String(ids.length);
    const button = document.getElementById('compareBtn');
    if (button) button.onclick = open;
  }

  function toggle(id) {
    const product = byId(id); if (!product) return;
    if (ids.includes(id)) ids = ids.filter(item => item !== id);
    else {
      const first = ids.length ? byId(ids[0]) : null;
      if (first && first.cat !== product.cat) { C.toast(`Сравнивайте товары одной категории: ${first.cat}`); return; }
      if (ids.length >= 4) { C.toast('В сравнении может быть не больше четырёх товаров'); return; }
      ids.push(id);
    }
    save(); sync(); C.toast(ids.includes(id) ? 'Добавлено к сравнению' : 'Удалено из сравнения');
  }

  function flatten(product) {
    const result = {};
    Object.entries(product.specs || {}).forEach(([group, values]) => {
      Object.entries(values || {}).forEach(([key, value]) => { result[key] = String(value); });
    });
    return result;
  }

  function open() {
    const body = document.getElementById('mBody'); const modal = document.getElementById('modal');
    if (!body || !modal) return;
    modal.hidden = false; body.replaceChildren(h('p', 'eyebrow', 'СРАВНЕНИЕ'), h('h2', null, 'Сравнение товаров'));
    const products = ids.map(byId).filter(Boolean);
    if (products.length < 2) {
      body.append(h('p', 'muted', 'Добавьте минимум два товара одной категории кнопкой ⇄ в каталоге. Список сохранится в этом браузере.'));
      if (products.length) body.append(h('p', 'profile-line', `В сравнении: ${products[0].name}`));
      const browse = h('a', 'btn', 'Открыть каталог'); browse.href = 'shop.html'; body.append(browse);
      if (products.length) body.append(clearButton()); return;
    }

    const sameLabel = h('label', 'check-filter', 'Скрыть одинаковые характеристики');
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = hideSame;
    checkbox.onchange = () => { hideSame = checkbox.checked; open(); }; sameLabel.prepend(checkbox);
    body.append(h('p', 'muted', `${products[0].cat} · ${products.length} товара · отличающиеся значения подсвечены.`), sameLabel);
    const table = document.createElement('table'); table.className = 'cmp';
    const head = document.createElement('tr'); head.append(h('th', null, 'Характеристика'));
    products.forEach(product => {
      const cell = document.createElement('th');
      const title = h('button', 'text-button compare-product-title', product.name); title.onclick = () => C.openProduct(product.id);
      const price = h('strong', null, C.fmt(product.price));
      const actions = h('div', 'compare-actions');
      const add = h('button', 'btn', 'В корзину'); add.onclick = () => C.addCart(product.id);
      const remove = h('button', 'btn ghost', 'Убрать'); remove.onclick = () => { toggle(product.id); open(); };
      actions.append(add, remove); cell.append(title, price, actions); head.append(cell);
    });
    table.append(head);
    const flattened = products.map(flatten);
    const keys = [...new Set(flattened.flatMap(record => Object.keys(record)))];
    const appendRow = (label, values, highlight = true) => {
      const row = document.createElement('tr'); row.append(h('th', null, label));
      const same = values.every(value => value === values[0]);
      values.forEach(value => row.append(h('td', !same && highlight ? 'diff' : '', value)));
      if (!hideSame || !same) table.append(row);
    };
    appendRow('Цена', products.map(product => C.fmt(product.price)), false);
    appendRow('Локальные отзывы', products.map(product => C.ratingText ? C.ratingText(product.id) : 'Нет локальных отзывов'), false);
    keys.forEach(key => appendRow(key, flattened.map(record => record[key] || 'Не указано')));
    const scroll = h('div', 'scroll'); scroll.append(table); body.append(scroll);
    const analysis = h('section', 'compare-analysis'); analysis.append(h('h3', null, 'Как читать сравнение'));
    const cheapest = products.reduce((best, product) => product.price < best.price ? product : best);
    analysis.append(h('p', null, `Самая низкая демонстрационная цена в этой выборке — у «${cheapest.name}» (${C.fmt(cheapest.price)}).`),
      h('p', 'muted', 'Рейтинг учитывает только отзывы, сохранённые локально в этом браузере. Подтверждённых данных о надёжности, жалобах или частоте дефектов у прототипа нет.'));
    body.append(analysis, clearButton());
  }

  function clearButton() {
    const button = h('button', 'btn ghost', 'Очистить сравнение');
    button.onclick = () => { ids = []; save(); sync(); open(); };
    return button;
  }

  C.toggleCmp = toggle;
  C.openComparison = open;
  C.getComparison = () => ids.slice();
  sync();
})();
