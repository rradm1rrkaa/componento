// City selection uses a schematic, approximate map. It is not a navigation map.
(function () {
  'use strict';
  const C = window.CMP;
  const cities = [
    ['Астана', 58, 38], ['Алматы', 69, 72], ['Шымкент', 45, 78], ['Караганда', 55, 48],
    ['Актобе', 27, 46], ['Атырау', 15, 57], ['Актау', 9, 72], ['Павлодар', 68, 32],
    ['Усть-Каменогорск', 83, 42], ['Костанай', 40, 30], ['Кызылорда', 34, 67], ['Тараз', 53, 72],
    ['Петропавловск', 49, 19], ['Кокшетау', 51, 28], ['Туркестан', 41, 72], ['Семей', 76, 48],
    ['Уральск', 17, 42], ['Талдыкорган', 77, 66], ['Темиртау', 56, 45], ['Жезказган', 45, 55]
  ];
  const h = C.h;

  function openCity(change = false) {
    const body = document.getElementById('mBody');
    const modal = document.getElementById('modal');
    if (!body || !modal) return;
    const selected = C.ls.get('city', null);
    if (!change && !selected) {
      body.replaceChildren(h('p', 'eyebrow', 'ДОСТАВКА ПО КАЗАХСТАНУ'), h('h2', null, 'Ваш город — Астана, верно?'),
        h('p', 'muted', 'Выберите город, чтобы видеть подходящие демонстрационные условия получения. Реальная доставка не подключена.'));
      const actions = h('div', 'city-actions');
      const yes = h('button', 'btn', 'Да, верно'); yes.onclick = () => selectCity('Астана');
      const no = h('button', 'btn ghost', 'Нет, изменить'); no.onclick = () => renderPicker();
      actions.append(yes, no); body.append(actions);
    } else renderPicker();
    modal.hidden = false;
    const close = document.getElementById('mClose'); if (close) close.focus();
  }

  function renderPicker() {
    const body = document.getElementById('mBody');
    body.replaceChildren(h('p', 'eyebrow', 'ВАШ ГОРОД'), h('h2', null, 'Выберите город'),
      h('p', 'muted', 'Схематическая карта с примерным расположением городов. Это не точная карта для навигации.'));
    const searchLabel = h('label', 'filter-label', 'Поиск города');
    const search = document.createElement('input'); search.type = 'search'; search.placeholder = 'Например, Алматы'; search.setAttribute('aria-label', 'Поиск города');
    searchLabel.append(search); body.append(searchLabel);

    const mapWrap = h('div', 'kazakhstan-map-wrap');
    const map = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    map.setAttribute('viewBox', '0 0 600 360'); map.setAttribute('role', 'img'); map.setAttribute('aria-label', 'Схематическая карта Казахстана с городами');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M42 123 L76 93 L110 84 L135 56 L182 68 L211 48 L252 55 L279 35 L324 53 L363 46 L394 67 L433 64 L461 83 L497 88 L517 112 L546 119 L532 147 L548 171 L531 194 L515 212 L492 225 L477 251 L445 255 L426 278 L391 278 L370 302 L337 292 L308 313 L277 299 L249 309 L220 285 L188 285 L168 264 L137 262 L119 237 L90 229 L78 202 L56 185 L62 160 L42 145 Z');
    path.setAttribute('class', 'map-country'); map.append(path);
    cities.forEach(([name, x, y]) => {
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('class', 'map-pin' + (C.ls.get('city', 'Астана') === name ? ' active' : ''));
      group.setAttribute('role', 'button'); group.setAttribute('tabindex', '0'); group.setAttribute('aria-label', name);
      group.setAttribute('transform', `translate(${40 + x * 5.1},${25 + y * 3.25})`);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); circle.setAttribute('r', '7');
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title'); title.textContent = name;
      group.append(circle, title);
      const choose = () => selectCity(name);
      group.addEventListener('click', choose);
      group.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); } });
      map.append(group);
    });
    mapWrap.append(map); body.append(mapWrap);

    const list = h('div', 'city-list'); list.setAttribute('aria-label', 'Города');
    cities.forEach(([name]) => {
      const button = h('button', 'city-option' + (C.ls.get('city', 'Астана') === name ? ' selected' : ''), name);
      button.type = 'button'; button.dataset.cityName = name; button.onclick = () => selectCity(name); list.append(button);
    });
    search.oninput = () => {
      const query = search.value.trim().toLocaleLowerCase('ru');
      list.querySelectorAll('.city-option').forEach(button => { button.hidden = !button.dataset.cityName.toLocaleLowerCase('ru').includes(query); });
    };
    body.append(list);
  }

  function selectCity(name) {
    C.ls.set('city', name);
    const modal = document.getElementById('modal'); if (modal) modal.hidden = true;
    C.syncHeader && C.syncHeader();
    C.toast(`Город доставки: ${name}`);
    C.maybeOnboard && C.maybeOnboard();
  }

  C.openCity = openCity;
  C.selectCity = selectCity;
  C.cities = cities.map(([name]) => name);
})();
